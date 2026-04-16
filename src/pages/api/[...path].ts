import { Hono } from 'hono';
import { getCookie } from 'hono/cookie';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { APIRoute } from 'astro';
import { createServerClient, parseCookieHeader } from '@supabase/ssr';

// Get environment from Cloudflare v6 standard if available
let cfEnv: any = {};
try {
    // @ts-ignore
    const cf = await import('cloudflare:workers');
    cfEnv = cf.env;
} catch (e) {
    // Fail silently for non-CF environments
}

// Helper to safely get environment variables
const getEnv = (key: string) => {
    // 1. Try passed runtime env (Cloudflare v6+)
    if (cfEnv && cfEnv[key]) return cfEnv[key];

    // 2. Vite / Astro Build-time (PUBLIC_ vars)
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
        return import.meta.env[key];
    }

    // 3. Process ENV fallback (Local Node.js)
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
        return process.env[key];
    }

    return null;
};

const supabaseUrl = getEnv('PUBLIC_SUPABASE_URL');
const supabaseAnonKey = getEnv('PUBLIC_SUPABASE_ANON_KEY');


const app = new Hono().basePath('/api');

// Global Error Handler
app.onError((err, c) => {
  console.error(`[Global Error] ${c.req.method} ${c.req.url}:`, err);
  return c.json({ 
    error: 'Internal Server Error', 
    message: err.message, 
    stack: err.stack,
    note: 'Caught by Global Handler'
  }, 500);
});

// --- DOMAIN SETTINGS ROUTES ---

// Get domain status
app.get('/settings/domain', async (c) => {
  const { supabase, user } = await getAuthContext(c);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);

  try {
    const { data, error } = await supabase
      .from('user_settings')
      .select('domain_name, domain_verified')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return c.json(data || { domain_name: null, domain_verified: false });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// Update/Save domain (Auto-verify per user request)
app.put('/settings/domain', zValidator('json', z.object({ domain_name: z.string().min(1) })), async (c) => {
  const { supabase, user } = await getAuthContext(c);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);

  const { domain_name } = c.req.valid('json');

  try {
    const { data, error } = await supabase
      .from('user_settings')
      .update({
        domain_name,
        domain_verified: true, // Auto-verify per user request
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return c.json(data);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// Delete/Remove domain
app.delete('/settings/domain', async (c) => {
  const { supabase, user } = await getAuthContext(c);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);

  try {
    const { data, error } = await supabase
      .from('user_settings')
      .update({
        domain_name: null,
        domain_verified: false,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return c.json({ success: true, data });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// Helper untuk mendapatkan Supabase Client & User (Robust Cloudflare Compatibility)
const getAuthContext = async (c: any) => {
  try {
    // Prioritize global Cloudflare env from context if available
    const url = getEnv('PUBLIC_SUPABASE_URL') || supabaseUrl;
    const key = getEnv('PUBLIC_SUPABASE_ANON_KEY') || supabaseAnonKey;

    if (!url || !key) {
        throw new Error('Supabase configuration missing (URL/Key)');
    }

    const supabase = createServerClient(url, key, {
      cookies: {
        getAll() {
          return parseCookieHeader(c.req.header('Cookie') ?? '');
        },
      },
    });
    
    const { data, error: authError } = await supabase.auth.getUser();
    if (authError) {
        console.warn('[getAuthContext] Auth error:', authError.message);
    }
    
    const user = data?.user || null;
    return { supabase, user };
  } catch (err: any) {
    console.error('[getAuthContext] Fatal Error:', err.message);
    throw err;
  }
};

// Middleware untuk logs
app.use('*', async (c, next) => {
  console.log(`[Hono] Request: ${c.req.method} ${c.req.url}`);
  await next();
});

// --- DEBUG / LIVENESS ---
app.get('/hello', (c) => {
  return c.json({
    message: 'Hello from Hono on Astro Edge!',
    timestamp: new Date().toISOString()
  });
});

// --- ORDERS ROUTES (TO THE TOP FOR PRIORITY) ---

// --- WALLET & WITHDRAWAL ROUTES ---

// Get wallet balances
app.get('/wallet/stats', async (c) => {
  const { supabase, user } = await getAuthContext(c);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);

  try {
    // 1. Get balance from wallet table
    const { data: wallet, error: walletError } = await supabase
      .from('wallets')
      .select('*')
      .eq('merchant_id', user.id)
      .single();

    if (walletError && walletError.code !== 'PGRST116') throw walletError;

    // 2. Get total net revenue from successful orders
    const { data: orders, error: orderError } = await supabase
      .from('orders')
      .select('amount, status')
      .eq('merchant_id', user.id)
      .in('status', ['success', 'paid']);

    if (orderError) throw orderError;

    const totalRevenue = orders?.reduce((sum, o) => sum + Number(o.amount), 0) || 0;
    const totalNet = Math.floor(totalRevenue * 0.95); // 5% platform fee

    return c.json({
      available: wallet?.available_balance || 0,
      pending: wallet?.pending_balance || 0,
      total_net: totalNet
    });
  } catch (err: any) {
    console.error('[Wallet Stats API] error:', err);
    return c.json({ error: err.message }, 500);
  }
});

// Get withdrawal history
app.get('/withdrawals', async (c) => {
  const { supabase, user } = await getAuthContext(c);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);

  try {
    const { data, error } = await supabase
      .from('withdrawals')
      .select(`
        *,
        bank_accounts (*)
      `)
      .eq('merchant_id', user.id)
      .order('requested_at', { ascending: false });

    if (error) throw error;
    return c.json(data || []);
  } catch (err: any) {
    console.error('[Withdrawals API] error:', err);
    return c.json({ error: err.message }, 500);
  }
});

// Request new withdrawal
app.post('/wallet/withdraw', async (c) => {
    const { supabase, user } = await getAuthContext(c);
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    try {
        const { amount, bankAccountId } = await c.req.json();
        if (!amount || amount <= 0) throw new Error('Invalid amount');
        if (!bankAccountId) throw new Error('Bank account is required');

        // Use RPC for atomic transaction: check balance + subtract + create record
        const { data: withdrawalId, error } = await supabase.rpc('initiate_withdrawal', {
            p_merchant_id: user.id,
            p_amount: Number(amount),
            p_bank_account_id: bankAccountId
        });

        if (error) throw error;
        return c.json({ success: true, withdrawalId });
    } catch (err: any) {
        console.error('[Withdraw Request API] error:', err);
        return c.json({ error: err.message }, 500);
    }
});

// Check bank account status
app.get('/bank-accounts', async (c) => {
  const { supabase, user } = await getAuthContext(c);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);

  try {
    const { data, error } = await supabase
        .from('bank_accounts')
        .select('*')
        .eq('merchant_id', user.id)
        .eq('is_primary', true)
        .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return c.json({ exists: !!data, details: data || null });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// Get all orders for the merchant
app.get('/orders', async (c) => {
  console.log('[API] Orders List requested');
  const { supabase, user } = await getAuthContext(c);
  if (!user) {
    console.log('[API] Orders List - Unauthorized');
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        products (*),
        customers (*)
      `)
      .eq('merchant_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    console.log(`[API] Orders List - Success (${data?.length || 0} orders)`);
    return c.json(data || []);
  } catch (err: any) {
    console.error('[Orders API] Fetch error:', err);
    return c.json({ error: err.message }, 500);
  }
});

// Get order statistics for the dashboard cards
app.get('/orders/stats', async (c) => {
  console.log('[API] Order Stats requested');
  const { supabase, user } = await getAuthContext(c);
  if (!user) {
    console.log('[API] Order Stats - Unauthorized');
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('amount, status')
      .eq('merchant_id', user.id);

    if (error) throw error;

    const stats = {
      total_orders: orders?.length || 0,
      successful_orders: orders?.filter(o => o.status === 'success' || o.status === 'paid').length || 0,
      pending_orders: orders?.filter(o => o.status === 'pending').length || 0,
      total_revenue: orders
          ?.filter(o => o.status === 'success' || o.status === 'paid')
          .reduce((sum, o) => sum + Number(o.amount), 0) || 0
    };

    console.log('[API] Order Stats - Success');
    return c.json(stats);
  } catch (err: any) {
    console.error('[Order Stats API] error:', err);
    return c.json({ error: err.message }, 500);
  }
});

// GET SINGLE ORDER DETAIL
app.get('/orders/:id', async (c) => {
  const id = c.req.param('id');
  const { supabase, user } = await getAuthContext(c);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);

  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        products (*),
        customers (*)
      `)
      .eq('id', id)
      .eq('merchant_id', user.id)
      .single();

    if (error) throw error;
    return c.json(data);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// GET SINGLE WITHDRAWAL DETAIL
app.get('/withdrawals/:id', async (c) => {
  const id = c.req.param('id');
  const { supabase, user } = await getAuthContext(c);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);

  try {
    const { data, error } = await supabase
      .from('withdrawals')
      .select(`
        *,
        bank_accounts (*)
      `)
      .eq('id', id)
      .eq('merchant_id', user.id)
      .single();

    if (error) throw error;
    return c.json(data);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// GET SINGLE CUSTOMER DETAIL
app.get('/customers/:id', async (c) => {
  const id = c.req.param('id');
  const { supabase, user } = await getAuthContext(c);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);

  try {
    const { data, error } = await supabase
      .from('customers')
      .select(`
        *,
        orders (*, products (*))
      `)
      .eq('id', id)
      .eq('merchant_id', user.id)
      .single();

    if (error) throw error;
    return c.json(data);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// UPDATE CUSTOMER DETAIL
app.put('/customers/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const { supabase, user } = await getAuthContext(c);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);

  try {
    const { data, error } = await supabase
      .from('customers')
      .update(body)
      .eq('id', id)
      .eq('merchant_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return c.json(data);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// GET CURRENT USER PROFILE & SETTINGS (Enhanced with Expiry Check)
app.get('/profile', async (c) => {
  const { supabase, user } = await getAuthContext(c);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);

  try {
    // 1. Fetch profile & settings
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    const { data: settings } = await supabase.from('user_settings').select('*').eq('user_id', user.id).single();

    let currentSettings = settings;

    // 2. Auto-revert if expired
    if (settings?.plan_status && settings.plan_status !== 'free' && settings.plan_expiry) {
        const expiryDate = new Date(settings.plan_expiry);
        const now = new Date();

        if (now > expiryDate) {
            console.log(`[Subscription] Plan expired for user ${user.id}. Reverting to free.`);
            const { data: updatedSettings } = await supabase
                .from('user_settings')
                .update({ 
                    plan_status: 'free',
                    auto_renewal: false 
                })
                .eq('user_id', user.id)
                .select()
                .single();
            
            currentSettings = updatedSettings;
        }
    }

    return c.json({
      ...profile,
      settings: currentSettings || null
    });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// Endpoints /subscription/upgrade dan /subscription/cancel lama telah dihapus
// karena sudah digulirkan ke integrasi Duitku yang sesungguhnya di bagian bawah file ini.


// UPLOAD AVATAR - Server-side using admin client to bypass storage RLS
app.post('/profile/avatar', async (c) => {
  const { user } = await getAuthContext(c);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);

  try {
    const formData = await c.req.formData();
    const file = formData.get('avatar') as File | null;
    if (!file) return c.json({ error: 'No file provided' }, 400);

    const BUCKET = 'user-avatars';
    const fileExt = file.name.split('.').pop() || 'jpg';
    const filePath = `${user.id}-${Date.now()}.${fileExt}`;
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = new Uint8Array(arrayBuffer);

    // Build an admin Supabase client (service_role key bypasses RLS)
    const supabaseUrl = getEnv('PUBLIC_SUPABASE_URL') || '';
    const serviceKey = getEnv('SUPABASE_SERVICE_ROLE_KEY') || '';
    const anonKey = getEnv('PUBLIC_SUPABASE_ANON_KEY') || '';

    // Helper to check if a string looks like a valid Supabase key (JWT or new publishable format)
    const isValidKey = (k: string) => k && k.length > 20 && (k.startsWith('eyJ') || k.startsWith('sb_'));

    const { createClient } = await import('@supabase/supabase-js');
    
    // Choose the best client for upload:
    // 1. Admin client if valid service key exists
    // 2. Fallback to a new client with anon key if valid
    // 3. Last resort: use the cookie-authenticated client from context
    let uploadClient = (isValidKey(serviceKey))
      ? createClient(supabaseUrl, serviceKey)
      : (isValidKey(anonKey)) 
        ? createClient(supabaseUrl, anonKey)
        : (await getAuthContext(c)).supabase;

    // Auto-create bucket if not exists (only attempted if we have a service key)
    if (isValidKey(serviceKey)) {
      const { error: bErr } = await uploadClient.storage.createBucket(BUCKET, { public: true });
      if (bErr && !bErr.message?.includes('already exists')) {
        console.warn('[Avatar] Bucket create warning:', bErr.message);
      }
    }

    // Upload file
    const { error: uploadError } = await uploadClient.storage
      .from(BUCKET)
      .upload(filePath, fileBuffer, { contentType: file.type || 'image/jpeg', upsert: true });

    if (uploadError) {
      console.error('[Avatar Upload] Storage error:', uploadError.message);
      if (uploadError.message?.toLowerCase().includes('row-level security') || uploadError.message?.toLowerCase().includes('rls') || uploadError.message?.toLowerCase().includes('bucket not found')) {
        return c.json({ error: 'Storage RLS error. Tambahkan SUPABASE_SERVICE_ROLE_KEY ke .env atau buat storage policy di Supabase dashboard.' }, 500);
      }
      throw uploadError;
    }

    const { data: { publicUrl } } = uploadClient.storage.from(BUCKET).getPublicUrl(filePath);

    // Save avatar_url to profiles table (use admin client to bypass profiles RLS too)
    const { error: updateError } = await uploadClient
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', user.id);

    if (updateError) {
      console.error('[Avatar Upload] DB update error:', updateError.message);
      throw updateError;
    }

    return c.json({ avatar_url: publicUrl });
  } catch (err: any) {
    console.error('[Avatar Upload] Error:', err.message);
    return c.json({ error: err.message }, 500);
  }
});

// UPDATE CURRENT USER PROFILE
app.put('/profile', async (c) => {
  const { supabase, user } = await getAuthContext(c);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);

  try {
    const body = await c.req.json();

    // Only pass columns that are GUARANTEED to exist in the profiles table
    const allowedFields = [
      'full_name', 'bio', 'avatar_url', 'username',
      'instagram_url', 'twitter_url', 'youtube_url', 'tiktok_url', 'blocks',
      'phone', 'address_text', 'city', 'postcode', 'onboarding_completed'
    ];
    const updatePayload: Record<string, any> = {};
    for (const field of allowedFields) {
      if (field in body) updatePayload[field] = body[field];
    }

    if (Object.keys(updatePayload).length === 0) {
      return c.json({ error: 'No valid fields to update' }, 400);
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(updatePayload)
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      console.error('[PUT /profile] Supabase error:', error);
      throw error;
    }
    return c.json(data);
  } catch (err: any) {
    console.error('[PUT /profile] Error:', err.message);
    return c.json({ error: err.message }, 500);
  }
});

// --- ANALYTICS ROUTES (HIGH PRIORITY) ---

// GET ALL PUBLISHED TUTORIALS
app.get('/tutorials', async (c) => {
  const { supabase } = await getAuthContext(c);
  
  try {
    const { data, error } = await supabase
      .from('tutorials')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return c.json(data || []);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// Removed duplicate dashboard route - logic is handled below.

/**
 * PRODUCT CRUD ENDPOINTS (SUPABASE VERSION)
 */

// 1. List Products
app.get('/products', async (c) => {
  const { supabase, user } = await getAuthContext(c);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);

  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .eq('merchant_id', user.id)
    .order('created_at', { ascending: false });

  if (error) return c.json({ error: error.message }, 500);

  // Get sold counts for all products
  const { data: orders } = await supabase
    .from('orders')
    .select('product_id, status')
    .eq('merchant_id', user.id)
    .in('status', ['success', 'paid']);

  const productsWithStats = products.map(p => {
    const soldCount = orders?.filter(o => o.product_id === p.id).length || 0;
    return { ...p, sold_count: soldCount };
  });

  return c.json(productsWithStats);
});

// 2. Create Product
app.post(
  '/products',
  zValidator(
    'json',
    z.object({
      title: z.string().min(1),
      description: z.string().optional(),
      price: z.number().min(0),
      type: z.string().optional().default('digital'),
      status: z.string().optional().default('draft'),
      cover_url: z.string().optional(),
      file_url: z.string().optional(),
      preview_urls: z.array(z.string()).optional().default([]),
    })
  ),
  async (c) => {
    const { supabase, user } = await getAuthContext(c);
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    const body = c.req.valid('json');

    const { data, error } = await supabase
      .from('products')
      .insert({
        ...body,
        merchant_id: user.id,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase Insert Error:', error);
      return c.json({ error: error.message, details: error.details, hint: error.hint }, 500);
    }
    return c.json(data, 201);
  }
);

// 3. Get One Product
app.get('/products/:id', async (c) => {
  const { supabase, user } = await getAuthContext(c);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);

  const id = c.req.param('id');

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .eq('merchant_id', user.id)
    .single();
    
  if (error) return c.json({ error: error.message }, 404);

  // If the file is in our private bucket (internal path without http), generate a signed URL for the merchant to preview
  if (data.file_url && !data.file_url.startsWith('http')) {
      const { data: signed } = await supabase.storage.from('media-produk-private').createSignedUrl(data.file_url, 60 * 60);
      data.admin_download_url = signed?.signedUrl || data.file_url;
  }

  return c.json(data);
});

// 4. Update Product
app.put(
  '/products/:id',
  zValidator(
    'json',
    z.object({
      title: z.string().min(1).optional(),
      description: z.string().optional(),
      price: z.number().min(0).optional(),
      type: z.string().optional(),
      status: z.string().optional(),
      cover_url: z.string().optional(),
      file_url: z.string().optional(),
      preview_urls: z.array(z.string()).optional(),
    })
  ),
  async (c) => {
    const { supabase, user } = await getAuthContext(c);
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    const id = c.req.param('id');
    const body = c.req.valid('json');

    const { data, error } = await supabase
      .from('products')
      .update({
        ...body,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('merchant_id', user.id)
      .select()
      .single();

    if (error) return c.json({ error: error.message }, 500);
    return c.json(data);
  }
);

// 4.1 Product Detail with Analytics (Enhanced)
app.get('/products/:id/stats', async (c) => {
    const { supabase, user } = await getAuthContext(c);
    if (!user) return c.json({ error: 'Unauthorized' }, 401);
    const id = c.req.param('id');

    // Fetch all in parallel for performance
    const [ordersResult, analyticsResult] = await Promise.all([
        supabase
            .from('orders')
            .select('*, customers (name, email)')
            .eq('product_id', id)
            .eq('merchant_id', user.id),
        supabase
            .from('analytics_events')
            .select('event_type, created_at')
            .eq('merchant_id', user.id)
            .in('event_type', ['view', 'page_view', 'click'])
    ]);

    if (ordersResult.error) return c.json({ error: ordersResult.error.message }, 500);

    const orders = ordersResult.data || [];
    const events = analyticsResult.data || [];

    const totalSold = orders.filter(o => o.status === 'success' || o.status === 'paid').length;
    const totalRevenue = orders
        .filter(o => o.status === 'success' || o.status === 'paid')
        .reduce((sum, o) => sum + Number(o.amount), 0);

    // View count from analytics events
    const totalViews = events.filter(e => e.event_type === 'view' || e.event_type === 'page_view').length;
    const totalClicks = events.filter(e => e.event_type === 'click').length;

    // Conversion rate: sold / views * 100
    const conversionRate = totalViews > 0
        ? ((totalSold / totalViews) * 100).toFixed(1)
        : '0.0';

    return c.json({
        total_sold: totalSold,
        total_revenue: totalRevenue,
        total_views: totalViews,
        total_clicks: totalClicks,
        conversion_rate: conversionRate,
        recent_buyers: orders
            .filter(o => o.status === 'success' || o.status === 'paid')
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 5)
    });
});

// 5. Delete Product
app.delete('/products/:id', async (c) => {
  const { supabase, user } = await getAuthContext(c);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);

  const id = c.req.param('id');

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)
    .eq('merchant_id', user.id);

  if (error) return c.json({ error: error.message }, 500);
  return c.json({ success: true });
});

/**
 * ORDER MANAGEMENT ENDPOINTS
 */

// 1. List Orders
app.get('/orders', async (c) => {
  const { supabase, user } = await getAuthContext(c);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);

  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      customers (name, email),
      products (title, cover_url, type)
    `)
    .eq('merchant_id', user.id)
    .order('created_at', { ascending: false });

  if (error) return c.json({ error: error.message }, 500);
  return c.json(data);
});

// 1.1 Get Specific Order (Enhanced)
app.get('/orders/:id', async (c) => {
    const { supabase, user } = await getAuthContext(c);
    if (!user) return c.json({ error: 'Unauthorized' }, 401);
    const id = c.req.param('id');

    const { data, error } = await supabase
        .from('orders')
        .select(`
            *,
            customers (*),
            products (*)
        `)
        .eq('id', id)
        .eq('merchant_id', user.id)
        .single();

    if (error) return c.json({ error: error.message }, 404);
    return c.json(data);
});

// 2. Order Statistics
app.get('/orders/stats', async (c) => {
  const { supabase, user } = await getAuthContext(c);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);

  // Fetch all orders to calculate stats manually (easier for small sets)
  const { data: orders, error } = await supabase
    .from('orders')
    .select('amount, status')
    .eq('merchant_id', user.id);

  if (error) return c.json({ error: error.message }, 500);

  const totalOrders = orders.length;
  const successfulOrders = orders.filter(o => o.status === 'success' || o.status === 'paid').length;
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  
  // Calculate Revenue (Success only)
  // Deducting 5% fee as per simulation logic
  const totalRevenue = orders
    .filter(o => o.status === 'success' || o.status === 'paid')
    .reduce((sum, o) => sum + (Number(o.amount) * 0.95), 0);

  return c.json({
    total_orders: totalOrders,
    successful_orders: successfulOrders,
    pending_orders: pendingOrders,
    total_revenue: totalRevenue
  });
});

/**
 * CUSTOMER MANAGEMENT ENDPOINTS
 */

// 1. List Customers
app.get('/customers', async (c) => {
    const { user } = await getAuthContext(c);
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    console.log(`[API] Fetching customers for merchant_id: ${user.id}`);
    const { getSupabaseAdmin } = await import('../../lib/supabase');
    const supabase = getSupabaseAdmin(cfEnv);

    const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('merchant_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('[API] Error fetching customers:', error);
        return c.json({ error: error.message }, 500);
    }
    
    console.log(`[API] Found ${data?.length || 0} customers for ${user.id}`);
    return c.json(data);
});

// 2. Customer Detail (with Order History)
app.get('/customers/:id', async (c) => {
    const { supabase, user } = await getAuthContext(c);
    if (!user) return c.json({ error: 'Unauthorized' }, 401);
    const id = c.req.param('id');

    // 1. Get Profile
    const { data: customer, error: custError } = await supabase
        .from('customers')
        .select('*')
        .eq('id', id)
        .eq('merchant_id', user.id)
        .single();

    if (custError) return c.json({ error: custError.message }, 404);

    // 2. Get Order History
    const { data: orders, error: orderError } = await supabase
        .from('orders')
        .select(`
            *,
            products (title, type, cover_url)
        `)
        .eq('customer_id', id)
        .order('created_at', { ascending: false });

    return c.json({
        ...customer,
        orders: orders || []
    });
});

// 2.1 Update Customer
app.put(
    '/customers/:id',
    zValidator(
        'json',
        z.object({
            name: z.string().optional(),
            email: z.string().email().optional(),
            phone: z.string().optional(),
            notes: z.string().optional(),
            address_text: z.string().optional(),
        })
    ),
    async (c) => {
        const { supabase, user } = await getAuthContext(c);
        if (!user) return c.json({ error: 'Unauthorized' }, 401);

        const id = c.req.param('id');
        const body = c.req.valid('json');

        const { data, error } = await supabase
            .from('customers')
            .update({
                name: body.name,
                email: body.email,
                phone: body.phone,
                notes: body.notes,
                address_text: body.address_text,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .eq('merchant_id', user.id)
            .select()
            .single();

        if (error) return c.json({ error: error.message }, 500);
        return c.json(data);
    }
);

// 2.2 Delete Customer
app.delete('/customers/:id', async (c) => {
    const { supabase, user } = await getAuthContext(c);
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    const id = c.req.param('id');

    const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id)
        .eq('merchant_id', user.id);

    if (error) return c.json({ error: error.message }, 500);
    return c.json({ success: true });
});

// 3. Create Order (Internal/Public for Checkout)
app.post(
  '/orders',
  zValidator(
    'json',
    z.object({
      product_id: z.string().uuid(),
      merchant_id: z.string().uuid(),
      amount: z.number().min(0),
      buyer_name: z.string(),
      buyer_email: z.string().email(),
      buyer_phone: z.string().optional(),
      payment_method: z.string().optional().default('QRIS'),
      status: z.string().optional().default('pending')
    })
  ),
  async (c) => {
    // Gunakan Admin Client untuk checkout publik agar bypass RLS
    const { getSupabaseAdmin } = await import('../../lib/supabase');
    const supabase = getSupabaseAdmin(cfEnv);
    const body = c.req.valid('json');

    // 1. Upsert Customer
    const { data: customer, error: custError } = await supabase
      .from('customers')
      .upsert({ 
        merchant_id: body.merchant_id,
        email: body.buyer_email,
        name: body.buyer_name,
        phone: body.buyer_phone
      }, { onConflict: 'merchant_id, email' })
      .select()
      .single();

    if (custError) return c.json({ error: custError.message }, 500);

    // 2. Create Order (Status Pending)
    const invoiceId = `TPK-${Math.floor(Math.random() * 1000000)}`;
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        invoice_id: invoiceId,
        customer_id: customer.id,
        product_id: body.product_id,
        merchant_id: body.merchant_id,
        amount: body.amount,
        status: 'pending', // Awalnya pending
        payment_method: body.payment_method
      })
      .select()
      .single();

    if (orderError) return c.json({ error: orderError.message }, 500);

    // 3. Inisialisasi Pembayaran Duitku
    try {
        const merchantCode = getEnv('PUBLIC_DUITKU_MERCHANT_CODE') || '';
        const merchantKey = getEnv('PUBLIC_DUITKU_MERCHANT_KEY') || '';
        const callbackUrl = getEnv('DUITKU_CALLBACK_URL') || '';

        if (!merchantCode || !merchantKey) {
            console.warn('[Orders] Duitku config missing, returning order only');
            return c.json(order, 201);
        }

        const { DuitkuService } = await import('../../lib/duitku');
        const duitkuService = new DuitkuService(merchantCode, merchantKey);

        const paymentResponse = await duitkuService.createPayment({
            merchantCode,
            merchantKey,
            paymentAmount: body.amount,
            orderId: invoiceId,
            productDetails: `Pesanan ${invoiceId}`,
            customerEmail: body.buyer_email,
            customerPhone: body.buyer_phone || '',
            customerName: body.buyer_name,
            returnUrl: `${new URL(c.req.url).origin}/checkout/success?id=${invoiceId}&merchant=${body.merchant_id}`,
            callbackUrl: callbackUrl || `${new URL(c.req.url).origin}/api/payments/duitku/webhook`,
            paymentMethod: body.payment_method,
        });

        console.log(`[Orders] Duitku created for ${invoiceId}:`, paymentResponse.reference);

        return c.json({
            ...order,
            payment: paymentResponse
        }, 201);
    } catch (duitkuErr: any) {
        console.error('[Orders] Duitku Init Error:', duitkuErr);
        // Tetap kembalikan order meskipun duitku gagal (fallback)
        return c.json(order, 201);
    }
  }
);

/**
 * SUBSCRIPTION & PLAN MANAGEMENT
 */

// 1. Get Subscription Status
app.get('/subscription/status', async (c) => {
  const { supabase, user } = await getAuthContext(c);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);

  const { data, error } = await supabase
    .from('user_settings')
    .select('plan_status, plan_expiry, auto_renewal')
    .eq('user_id', user.id)
    .single();

  if (error && error.code !== 'PGRST116') return c.json({ error: error.message }, 500);
  return c.json(data || { plan_status: 'free', plan_expiry: null, auto_renewal: false });
});

// 2. Upgrade to PRO (Create Duitku Invoice)
app.post('/subscription/upgrade', async (c) => {
  console.log('[Subscription Upgrade] Request received');
  const { supabase, user } = await getAuthContext(c);
  
  if (!user) {
    console.warn('[Subscription Upgrade] Unauthorized access attempt');
    return c.json({ error: 'Unauthorized' }, 401);
  }

  console.log('[Subscription Upgrade] User authenticated:', user.email);

  try {
    const merchantCode = getEnv('PUBLIC_DUITKU_MERCHANT_CODE') || '';
    const merchantKey = getEnv('PUBLIC_DUITKU_MERCHANT_KEY') || '';
    const callbackUrl = getEnv('DUITKU_CALLBACK_URL') || '';
    
    console.log('[Subscription Upgrade] Config check:', { merchantCode: !!merchantCode, merchantKey: !!merchantKey, callbackUrl });

    // Ambil pilihan metode pembayaran dari body (SP, OV, BT, dll)
    let body: any = {};
    try {
        body = await c.req.json();
    } catch (e) {
        // Fallback jika tidak ada body JSON
    }
    
    const selectedMethod = body.method || 'SP'; // Default ShopeePay untuk Sandbox jika tidak pilih

    if (!merchantCode || !merchantKey) {
        throw new Error(`Konfigurasi Duitku tidak ditemukan. Code: ${!!merchantCode}, Key: ${!!merchantKey}`);
    }

    const { DuitkuService } = await import('../../lib/duitku');
    const duitkuService = new DuitkuService(merchantCode, merchantKey);

    // Shorten orderId to fit Duitku limit (max 50 chars)
    // Format: S-{uid8}-{timestamp}
    // Duitku punya limit max 50 karakter untuk orderId.
    // UUID (36) + SUB-- (5) + -- (2) + shortTime (4) = 47 karakter (AMAN)
    const orderId = `SUB--${user.id}--${Date.now().toString().slice(-4)}`;
    const amount = 50000; // Harga Paket PRO
    
    console.log('[Subscription Upgrade] Creating payment for:', user.email, orderId);

    const paymentResponse = await duitkuService.createPayment({
      merchantCode,
      merchantKey,
      paymentAmount: amount,
      orderId: orderId,
      productDetails: 'Orbit Site PRO Subscription (1 Month)',
      customerEmail: user.email || '',
      customerPhone: '',
      customerName: user.user_metadata?.full_name || 'Creator',
      returnUrl: `${new URL(c.req.url).origin}/plan-info?status=pending`,
      callbackUrl: callbackUrl || 'https://tepak-id.weldn-ai-000.workers.dev/api/payments/duitku/webhook',
      paymentMethod: selectedMethod,
    });

    console.log('[Subscription Upgrade] Duitku response:', paymentResponse);

    return c.json(paymentResponse);
  } catch (err: any) {
    console.error('[Subscription Upgrade] FATAL ERROR:', err);
    return c.json({ 
      error: 'Internal Server Error', 
      message: err.message, 
      stack: err.stack 
    }, 500);
  }
});

/**
 * ENDPOINT GATEWAY PEMBAYARAN DUITKU
 */

// 1. Buat Permintaan Pembayaran DuitKu
app.post(
  '/payments/duitku/create',
  zValidator(
    'json',
    z.object({
      orderId: z.string(),
      amount: z.number().min(1),
      productDetails: z.string(),
      customerEmail: z.string().email(),
      customerPhone: z.string(),
      customerName: z.string(),
      merchantCode: z.string(),
      merchantKey: z.string(),
      paymentMethod: z.string().default('QRIS'),
      returnUrl: z.string().url(),
      callbackUrl: z.string().url(),
      expiryPeriod: z.number().optional().default(60),
    })
  ),
  async (c) => {
    const body = c.req.valid('json');

    try {
      // Import DuitkuService
      const { DuitkuService } = await import('../../lib/duitku');
      const duitkuService = new DuitkuService(body.merchantCode, body.merchantKey);

      // Buat permintaan pembayaran
      const paymentResponse = await duitkuService.createPayment({
        merchantCode: body.merchantCode,
        merchantKey: body.merchantKey,
        paymentAmount: body.amount,
        orderId: body.orderId,
        productDetails: body.productDetails,
        customerEmail: body.customerEmail,
        customerPhone: body.customerPhone,
        customerName: body.customerName,
        returnUrl: body.returnUrl,
        callbackUrl: body.callbackUrl,
        paymentMethod: body.paymentMethod,
        expiryPeriod: body.expiryPeriod,
      });

      return c.json(paymentResponse, 200);
    } catch (error: any) {
      console.error('Kesalahan pembuatan pembayaran DuitKu:', error);
      return c.json({ error: error.message }, 400);
    }
  }
);

// 2. Handler Webhook DuitKu (untuk notifikasi pembayaran)
app.post('/payments/duitku/webhook', async (c) => {
  // Duitku bisa mengirim JSON atau Form-UrlEncoded. Kita gunakan parseBody() yang mendukung keduanya.
  const body = await c.req.parseBody();
  console.log('[Webhook DuitKu] Request Received (Parsed):', JSON.stringify(body, null, 2));

  try {
    // Webhook dipanggil oleh server Duitku, tidak ada session user.
    // Kita harus menggunakan supabase secara langsung.
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseUrl = getEnv('PUBLIC_SUPABASE_URL') || '';
    const supabaseKey = getEnv('SUPABASE_SERVICE_ROLE_KEY') || getEnv('PUBLIC_SUPABASE_ANON_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Validasi tanda tangan webhook
    const { DuitkuService } = await import('../../lib/duitku');
    
    // Dapatkan kunci merchant dari pengaturan pengguna - untuk produksi, query dari database
    const merchantKey = getEnv('PUBLIC_DUITKU_MERCHANT_KEY') || '';
    const duitkuService = new DuitkuService(body.merchantCode, merchantKey);

    if (!duitkuService.validateWebhook(body)) {
      return c.json({ error: 'Tanda tangan webhook tidak valid' }, 401);
    }

    // Duitku Callback V2 mengirim 'merchantOrderId' dan 'resultCode'
    const merchantOrderId = (body.merchantOrderId || body.orderId || '') as string;
    const resultCode = (body.resultCode || body.statusCode || '') as string;

    console.log('[Webhook DuitKu] Processing Order:', merchantOrderId, 'Result:', resultCode);

    // 1. KASUS LANGGANAN (SUB--)
    if (merchantOrderId.startsWith('SUB--')) {
        const parts = merchantOrderId.split('--');
        const targetUserId = parts[1];
        
        if (resultCode === '00' && targetUserId) {
            console.log(`[Webhook DuitKu] UPGRADING USER ${targetUserId} TO PRO...`);
            
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + 30);

            const { error: subError } = await supabase
                .from('user_settings')
                .update({
                    plan_status: 'pro',
                    plan_expiry: expiryDate.toISOString(),
                    auto_renewal: true,
                    updated_at: new Date().toISOString()
                })
                .eq('user_id', targetUserId);
            
            if (subError) {
                console.error('[Webhook DuitKu] Database Update Error (Sub):', subError);
                return c.json({ error: 'Gagal update database langganan' }, 500);
            }

            console.log(`[Webhook DuitKu] BERHASIL! User ${targetUserId} sekarang PRO.`);
            return c.json({ success: true, message: 'Subscription upgraded successfully' });
        }
    }

    // 2. KASUS PESURAN PRODUK (Invoice Biasa)
    // Perbarui status pesanan berdasarkan respons DuitKu
    const statusMap: Record<string, string> = {
      '00': 'success',    // Pembayaran berhasil
      '01': 'pending',   // Tertunda
      '02': 'cancelled', // Dibatalkan
      '03': 'expired',   // Kedaluwarsa
    };

    const orderStatus = statusMap[resultCode] || 'pending';

    console.log(`[Webhook DuitKu] Updating Order ${merchantOrderId} to status: ${orderStatus}`);

    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: orderStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('invoice_id', merchantOrderId);

    if (updateError) {
        console.error('[Webhook DuitKu] Database Update Error (Order):', updateError);
        return c.json({ error: 'Gagal update database pesanan' }, 500);
    }

    console.log(`[Webhook DuitKu] Pesanan ${merchantOrderId} -> ${orderStatus} (Ref: ${body.reference})`);
    return c.json({ success: true, status: orderStatus });
  } catch (error: any) {
    console.error('Kesalahan webhook DuitKu:', error);
    return c.json({ error: error.message }, 500);
  }
});

// 3. Periksa Status Pembayaran DuitKu
app.post(
  '/payments/duitku/status',
  zValidator(
    'json',
    z.object({
      orderId: z.string(),
      amount: z.number(),
      merchantCode: z.string(),
      merchantKey: z.string(),
    })
  ),
  async (c) => {
    const body = c.req.valid('json');

    try {
      const { DuitkuService } = await import('../../lib/duitku');
      const duitkuService = new DuitkuService(body.merchantCode, body.merchantKey);

      const status = await duitkuService.checkPaymentStatus(body.orderId, body.amount);

      return c.json(status);
    } catch (error: any) {
      console.error('Kesalahan pemeriksaan status DuitKu:', error);
      return c.json({ error: error.message }, 400);
    }
  }
);

/**
 * ENDPOINT PROFIL & PENGATURAN PENGGUNA
 */

// 1. Get My Profile (with Settings)
app.get('/profile/me', async (c) => {
    const { supabase, user } = await getAuthContext(c);
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    const { data: profile, error } = await supabase
        .from('profiles')
        .select(`
            *,
            user_settings (*)
        `)
        .eq('id', user.id)
        .single();

    if (error) return c.json({ error: error.message }, 500);
    return c.json(profile);
});

// 2. Update My Profile & Settings
app.put(
    '/profile/me',
    zValidator(
        'json',
        z.object({
            full_name: z.string().optional(),
            username: z.string().optional(),
            bio: z.string().optional(),
            avatar_url: z.string().optional(),
            domain_name: z.string().optional(),
            seo_title: z.string().optional(),
            seo_description: z.string().optional(),
            instagram_url: z.string().optional(),
            tiktok_url: z.string().optional(),
            twitter_url: z.string().optional(),
            youtube_url: z.string().optional(),
            phone: z.string().optional(),
            address_text: z.string().optional(),
            city: z.string().optional(),
            postcode: z.string().optional(),
            blocks: z.array(z.any()).optional(),
        })
    ),
    async (c) => {
        const { supabase, user } = await getAuthContext(c);
        if (!user) return c.json({ error: 'Unauthorized' }, 401);

        const body = c.req.valid('json');

        // Split body into profile and settings fields
        const profileFields = {
            full_name: body.full_name,
            username: body.username,
            bio: body.bio,
            avatar_url: body.avatar_url,
            instagram_url: body.instagram_url,
            tiktok_url: body.tiktok_url,
            twitter_url: body.twitter_url,
            youtube_url: body.youtube_url,
            phone: body.phone,
            address_text: body.address_text,
            city: body.city,
            postcode: body.postcode,
            blocks: body.blocks,
            updated_at: new Date().toISOString()
        };
        
        const settingsFields = {
            domain_name: body.domain_name,
            seo_title: body.seo_title,
            seo_description: body.seo_description,
            updated_at: new Date().toISOString()
        };

        // 1. Update Profile
        const { error: profileError } = await supabase
            .from('profiles')
            .update(Object.fromEntries(Object.entries(profileFields).filter(([_, v]) => v !== undefined)))
            .eq('id', user.id);

        if (profileError) return c.json({ error: profileError.message }, 500);

        // 2. Update Settings
        const { error: settingsError } = await supabase
            .from('user_settings')
            .update(Object.fromEntries(Object.entries(settingsFields).filter(([_, v]) => v !== undefined)))
            .eq('user_id', user.id);

        if (settingsError) return c.json({ error: settingsError.message }, 500);

        return c.json({ success: true });
    }
);

// (Orders & Analytics moved to top)

// 1. Track Event (Public)
app.post(
  '/analytics/track',
  zValidator(
    'json',
    z.object({
      merchant_id: z.string().uuid(),
      product_id: z.string().uuid().optional(),
      event_type: z.string().default('view'),
      path: z.string().optional(),
      browser: z.string().optional(),
      os: z.string().optional(),
      device_type: z.string().optional(),
    })
  ),
  async (c) => {
    try {
      const { getSupabaseAdmin } = await import('../../lib/supabase');
      const supabase = getSupabaseAdmin(cfEnv);

      const body = await c.req.json();

      const mid = String(body.merchant_id || '');
      if (!mid || mid === 'undefined' || mid === 'null' || mid.length < 10) {
          console.log('[analytics/track] Skipping: Invalid merchant_id:', mid);
          return c.json({ success: true, message: 'Skipped: Invalid merchant_id' }, 200);
      }

      // Filter and map to actual DB columns (Lowercased to avoid check constraint violations)
      const insertData = {
          merchant_id: body.merchant_id,
          event_type: String(body.event_type || 'page_view').toLowerCase() === 'view' ? 'page_view' : String(body.event_type || 'page_view').toLowerCase(),
          traffic_source: String(body.traffic_source || 'direct').toLowerCase(),
          device_type: String(body.device_type || 'desktop').toLowerCase(),
          browser: String(body.browser || 'unknown').toLowerCase(),
          country: String(body.country || 'id').toLowerCase(),
          city: String(body.city || 'unknown').toLowerCase(),
          session_id: body.session_id || `sess_${Date.now()}`,
          referrer: body.referrer || '',
          visitor_ip: c.req.header('x-forwarded-for') || '127.0.0.1'
      };

      const { error } = await supabase
        .from('analytics_events')
        .insert(insertData);

      if (error) {
          console.error('[analytics/track] Supabase Error:', error);
          return c.json({ error: error.message, details: error }, 500);
      }
      return c.json({ success: true }, 201);
    } catch (err: any) {
      console.error('[analytics/track] Global Catch:', err);
      return c.json({ error: 'Internal server error', message: err.message }, 500);
    }
  }
);

// 2. Get Dashboard Stats
app.get('/analytics/dashboard', async (c) => {
  try {
    const { supabase, user } = await getAuthContext(c);
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    const range = c.req.query('range') || '7d';
    let days = 7;
    if (range === '24h') days = 1;
    else if (range === '30d') days = 30;
    else if (range === '90d') days = 90;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString();

    // 1. Fetch total events
    const { data: events, error: eventError } = await supabase
      .from('analytics_events')
      .select('*')
      .eq('merchant_id', user.id)
      .gte('created_at', startDateStr);

    if (eventError) {
      console.error('[Analytics API] Event fetch error:', eventError);
      return c.json({ 
        error: 'Event Fetch Failed', 
        details: eventError,
        hint: 'Check if analytics_events table exists and RLS is correct.'
      }, 500);
    }

    // 2. Fetch sales from orders
    const { data: orders, error: orderError } = await supabase
      .from('orders')
      .select('amount, status, created_at')
      .eq('merchant_id', user.id)
      .gte('created_at', startDateStr);

    if (orderError) {
        console.error('[Analytics API] Order fetch error:', orderError);
        return c.json({ 
          error: 'Order Fetch Failed', 
          details: orderError 
        }, 500);
    }

    const eventList = events || [];
    const orderList = orders || [];

    // Aggregate Stats
    const totalViews = eventList.filter(e => e.event_type === 'view' || e.event_type === 'page_view').length;
    const totalClicks = eventList.filter(e => e.event_type === 'click').length;
    const avgCtr = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) + '%' : '0%';

    // Device Segmentation
    const deviceCounts: Record<string, number> = {};
    eventList.forEach(e => {
      const dt = e.device_type || 'Unknown';
      deviceCounts[dt] = (deviceCounts[dt] || 0) + 1;
    });
    const devices = Object.entries(deviceCounts).map(([type, count]) => ({
      type,
      percentage: Math.round((count / (eventList.length || 1)) * 100)
    })).sort((a, b) => b.percentage - a.percentage);

    // Browser Ranking
    const browserCounts: Record<string, number> = {};
    eventList.forEach(e => {
      const b = e.browser || 'Unknown';
      browserCounts[b] = (browserCounts[b] || 0) + 1;
    });
    const browsers = Object.entries(browserCounts).map(([name, percentage]) => ({
      name,
      percentage: Math.round((percentage / (eventList.length || 1)) * 100),
      icon: name === 'Chrome' ? '🌐' : name === 'Safari' ? '🍎' : name === 'Firefox' ? '🦊' : '📁'
    })).sort((a, b) => b.percentage - a.percentage).slice(0, 3);

    // 3. Time Series aggregation
    const timeSeries: Record<string, { views: number, clicks: number, sales: number }> = {};
    
    // Initialize the last X days with 0s to avoid gaps in chart
    for (let i = 0; i < days; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        timeSeries[dateStr] = { views: 0, clicks: 0, sales: 0 };
    }

    eventList.forEach(e => {
        const dateStr = new Date(e.created_at).toISOString().split('T')[0];
        if (timeSeries[dateStr]) {
            if (e.event_type === 'view' || e.event_type === 'page_view') timeSeries[dateStr].views++;
            if (e.event_type === 'click') timeSeries[dateStr].clicks++;
        }
    });

    orderList.forEach(o => {
        const dateStr = new Date(o.created_at).toISOString().split('T')[0];
        if (timeSeries[dateStr] && (o.status === 'success' || o.status === 'paid')) {
            timeSeries[dateStr].sales += Number(o.amount);
        }
    });

    const sortedDates = Object.keys(timeSeries).sort();
    const time_series = {
        labels: sortedDates.map(d => {
            const date = new Date(d);
            return date.toLocaleDateString('id-ID', { month: 'short', day: '2-digit' }).toUpperCase();
        }),
        views: sortedDates.map(d => timeSeries[d].views),
        clicks: sortedDates.map(d => timeSeries[d].clicks),
        sales: sortedDates.map(d => timeSeries[d].sales)
    };

    // 4. Top Links aggregation
    const linkCounts: Record<string, { views: number, clicks: number, path: string }> = {};
    eventList.forEach(e => {
        const path = e.path || '/';
        if (!linkCounts[path]) linkCounts[path] = { views: 0, clicks: 0, path };
        if (e.event_type === 'view' || e.event_type === 'page_view') linkCounts[path].views++;
        if (e.event_type === 'click') linkCounts[path].clicks++;
    });
    const top_links = Object.values(linkCounts)
        .sort((a, b) => b.views - a.views)
        .slice(0, 5);

    return c.json({
      totalViews,
      totalClicks,
      avgCTR: avgCtr,
      devices: devices.length > 0 ? devices : [
          { type: 'Mobile', percentage: 0 },
          { type: 'Desktop', percentage: 0 }
      ],
      browsers: browsers.length > 0 ? browsers : [
          { name: 'N/A', percentage: 0, icon: '❓' }
      ],
      sales: {
          total_revenue: orderList.filter(o => o.status === 'success' || o.status === 'paid').reduce((sum, o) => sum + Number(o.amount), 0),
          order_count: orderList.length
      },
      time_series,
      top_links
    });
  } catch (err: any) {
    console.error('[Analytics API] Global catch:', err);
    return c.json({ 
      error: 'Global Exception', 
      message: err.message,
      stack: err.stack
    }, 500);
  }
});

// 3. Get Public Product Detail (for Checkout)
app.get('/public/products/:id', async (c) => {
    const id = c.req.param('id');
    const url = getEnv('PUBLIC_SUPABASE_URL') || supabaseUrl;
    const key = getEnv('PUBLIC_SUPABASE_ANON_KEY') || supabaseAnonKey;

    if (!url || !key) {
        return c.json({ error: 'Configuration missing' }, 500);
    }

    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(url, key);

    const { data, error } = await supabase
        .from('products')
        .select('id, title, price, description, cover_url, merchant_id, status')
        .eq('id', id)
        .eq('status', 'published')
        .single();

    if (error) return c.json({ error: 'Produk tidak ditemukan atau tidak tersedia' }, 404);
    return c.json(data);
});

// 4. Get Public Profile Detail (for Creator Landing Page Link)
app.get('/public/profiles/:id', async (c) => {
    const id = c.req.param('id');
    console.log(`[API] GET /public/profiles/${id}`);
    
    const url = getEnv('PUBLIC_SUPABASE_URL') || supabaseUrl;
    const key = getEnv('PUBLIC_SUPABASE_ANON_KEY') || supabaseAnonKey;

    if (!url || !key) {
        return c.json({ error: 'Configuration missing' }, 500);
    }

    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(url, key);

    const { data, error } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url')
        .eq('id', id)
        .single();

    if (error) {
        console.error(`[API] Profile ${id} not found:`, error);
        return c.json({ error: 'Profile tidak ditemukan' }, 404);
    }
    
    console.log(`[API] Profile found:`, data);
    return c.json(data);
});

// --- ADMIN ROUTES (SUPER ADMIN ONLY) ---

const checkAdmin = async (supabase: any, user: any, c?: any) => {
  try {
    // 1. MASTER PASSCODE BYPASS (Bebas Akun)
    const MASTER_PASSCODE = getEnv('ADMIN_PASSCODE') || 'admin123';
    if (c) {
        const adminToken = getCookie(c, 'admin_access_token');
        if (adminToken === MASTER_PASSCODE) return true;
    }

    if (!user) return false;
    
    // Check role from profiles table
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    
    if (error) {
        console.error('[checkAdmin] Error fetching profile:', error);
        return false;
    }
    
    return profile?.role === 'admin';
  } catch (err) {
    console.error('[checkAdmin] Global Exception:', err);
    return false;
  }
};

// 1. Get All Users (Admin)
app.get('/admin/users', async (c) => {
  const { supabase, user } = await getAuthContext(c);
  const isAdmin = await checkAdmin(supabase, user, c);
  if (!isAdmin) return c.json({ error: 'Forbidden' }, 403);

  try {
    // Use Admin Client for fetching all users to bypass RLS/Visibility issues
    const { getSupabaseAdmin } = await import('../../lib/supabase');
    const adminSupabase = getSupabaseAdmin(cfEnv);

    const { data: profiles, error: pError } = await adminSupabase
      .from('profiles')
      .select('*, settings:user_settings(*)')
      .order('created_at', { ascending: false });

    if (pError) throw pError;

    // Fetch real emails from auth.users
    const { data: { users: authUsers }, error: aError } = await adminSupabase.auth.admin.listUsers();
    
    // Map emails by ID for fast lookup
    const emailMap = new Map(authUsers?.map(au => [au.id, au.email]) || []);
    
    // Map data to match Admin Dashboard structure
    const formattedUsers = (profiles || []).map(u => ({
        id: u.id,
        name: u.full_name || u.username || 'Anonymous',
        email: emailMap.get(u.id) || (u.username ? `${u.username}@tepak.id` : 'no-email@tepak.id'), 
        username: u.username,
        plan: u.settings?.plan_status?.toUpperCase() || 'FREE',
        planExpiry: u.settings?.plan_expiry || 'N/A',
        status: (u.is_banned || u.settings?.plan_status === 'banned') ? 'Banned' : 'Active',
        is_banned: u.is_banned || u.settings?.plan_status === 'banned',
        joined: new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        total: 'Rp 0' // Placeholder for transaction sum
    }));

    return c.json(formattedUsers);
  } catch (err: any) {
    console.error('[Admin Users API] Error:', err);
    return c.json({ error: err.message, details: 'Check server logs for stack trace' }, 500);
  }
});

// 2. Ban/Unban User (Admin)
app.post('/admin/users/ban', async (c) => {
  const { supabase, user } = await getAuthContext(c);
  const isAdmin = await checkAdmin(supabase, user, c);
  if (!isAdmin) return c.json({ error: 'Forbidden' }, 403);

  try {
    const { userId, isBanned } = await c.req.json();
    
    if (!userId) {
        return c.json({ error: 'User ID is required' }, 400);
    }

    const plan_status = isBanned ? 'banned' : 'free';
    
    // Use Administrative Client (Bypasses RLS)
    const { getSupabaseAdmin } = await import('../../lib/supabase');
    const adminSupabase = getSupabaseAdmin(cfEnv);

    // 1. Update Profile Flag (Source of Truth for Banning)
    const { data: pData, error: profileError } = await adminSupabase
      .from('profiles')
      .update({ 
        is_banned: isBanned,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select();

    if (profileError) {
        console.error('[Admin API] Profile Update Error:', profileError);
        throw profileError;
    }

    // 2. Ensure user_settings record exists (use 'free' for new, don't change status for existing)
    // We don't use 'banned' status because it violates DB check constraints
    const { data: sData, error: settingsError } = await adminSupabase
      .from('user_settings')
      .upsert({ 
          user_id: userId, 
          // If we are banning, we don't change the status, just the profile flag
          // If we must provide a status for a NEW row, we use 'free'
          updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' })
      .select()
      .single();

    if (settingsError) {
        console.error('[Admin API] Settings Upsert Error:', settingsError);
        throw settingsError;
    }

    return c.json({ success: true, isBanned: pData?.[0]?.is_banned });
  } catch (err: any) {
    console.error('[Admin API] Ban Exception:', err);
    return c.json({ error: err.message || 'Internal Server Error', details: err }, 500);
  }
});

// 3. Platform Settings (Admin)
app.get('/admin/settings', async (c) => {
  const { supabase, user } = await getAuthContext(c);
  const isAdmin = await checkAdmin(supabase, user, c);
  if (!isAdmin) return c.json({ error: 'Forbidden' }, 403);

  try {
    const { data, error } = await supabase
      .from('platform_configs')
      .select('*')
      .eq('id', 1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    
    // If not found, return default-like object or the record created in migration
    return c.json(data || { id: 1 });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

app.put('/admin/settings', async (c) => {
  const { supabase, user } = await getAuthContext(c);
  const isAdmin = await checkAdmin(supabase, user, c);
  if (!isAdmin) return c.json({ error: 'Forbidden' }, 403);

  try {
    const body = await c.req.json();
    
    // Only allow specific fields to be updated
    const allowedFields = [
      'site_name', 'site_tagline', 'logo_url', 'favicon_url', 
      'primary_color', 'support_email', 'whatsapp_number', 
      'office_address', 'platform_fee', 'maintenance_mode', 
      'registration_enabled', 'payouts_enabled', 'seo_description'
    ];

    const updateData: any = {};
    allowedFields.forEach(field => {
      if (body[field] !== undefined) updateData[field] = body[field];
    });

    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('platform_configs')
      .update(updateData)
      .eq('id', 1)
      .select()
      .single();

    if (error) throw error;
    return c.json(data);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// 4. Tutorial Management (Admin)
app.get('/admin/tutorials', async (c) => {
  try {
    const { supabase, user } = await getAuthContext(c);
    const isAdmin = await checkAdmin(supabase, user, c);
    if (!isAdmin) return c.json({ error: 'Forbidden' }, 403);

    const { data: tutorials, error } = await supabase
      .from('tutorials')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return c.json(tutorials);
  } catch (err: any) {
    console.error('[Admin Tutorials GET] Error:', err);
    return c.json({ error: err.message, stack: err.stack, note: 'DEBUG MODE ACTIVE' }, 500);
  }
});

app.post('/admin/tutorials', async (c) => {
  try {
    const { supabase, user } = await getAuthContext(c);
    const isAdmin = await checkAdmin(supabase, user, c);
    if (!isAdmin) return c.json({ error: 'Forbidden' }, 403);

    const body = await c.req.json();
    const { id, ...data } = body;

    // Auto-generate YouTube Thumbnail if URL provided
    if (data.video_url && data.video_url.includes('youtube.com')) {
        const videoId = data.video_url.split('v=')[1]?.split('&')[0];
        if (videoId && !data.thumbnail_url) {
            data.thumbnail_url = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
        }
    } else if (data.video_url && data.video_url.includes('youtu.be')) {
        const videoId = data.video_url.split('/').pop()?.split('?')[0];
        if (videoId && !data.thumbnail_url) {
            data.thumbnail_url = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
        }
    }

    let res;
    // Prepare the data for Database (Mapping description to content_html for compatibility)
    const dbData = {
        title: data.title,
        category: data.category,
        video_url: data.video_url,
        thumbnail_url: data.thumbnail_url,
        content_html: data.description || data.content_html, 
        status: data.status || 'published',
        duration: data.duration || '0:00'
    };

    // Check if it's an update or insert
    if (id && typeof id === 'string' && id.length > 20) {
        const { data: updated, error } = await supabase
            .from('tutorials')
            .update({
                ...dbData,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        res = updated;
    } else {
        const { data: inserted, error } = await supabase
            .from('tutorials')
            .insert({
                ...dbData,
                platform: data.video_url?.includes('youtube.com') || data.video_url?.includes('youtu.be') ? 'YouTube' : 'Other'
            })
            .select()
            .single();
        if (error) throw error;
        res = inserted;
    }
    return c.json(res);
  } catch (err: any) {
    console.error('[Admin Tutorials POST] Error:', err);
    return c.json({ error: err.message, stack: err.stack, note: 'DEBUG MODE ACTIVE' }, 500);
  }
});

app.delete('/admin/tutorials/:id', async (c) => {
    const { supabase, user } = await getAuthContext(c);
    const isAdmin = await checkAdmin(supabase, user, c);
    if (!isAdmin) return c.json({ error: 'Forbidden' }, 403);

    try {
        const id = c.req.param('id');
        const { error } = await supabase.from('tutorials').delete().eq('id', id);
        if (error) throw error;
        return c.json({ success: true });
    } catch (err: any) {
        return c.json({ error: err.message }, 500);
    }
});

// 4. Global Overview Stats (Admin)
app.get('/admin/overview', async (c) => {
  const { supabase, user } = await getAuthContext(c);
  const isAdmin = await checkAdmin(supabase, user, c);
  if (!isAdmin) return c.json({ error: 'Forbidden' }, 403);

  try {
    // Parallel fetch for global metrics
    const [
        { count: totalUsers },
        { count: proUsers },
        { data: gmvData },
        { count: pendingPayouts },
        { data: latestProfiles },
        { data: latestWithdrawals }
    ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('user_settings').select('*', { count: 'exact', head: true }).eq('plan_status', 'pro'),
        supabase.from('orders').select('amount').eq('status', 'success'),
        supabase.from('withdrawals').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('profiles').select('full_name, username, created_at').order('created_at', { ascending: false }).limit(5),
        supabase.from('withdrawals').select('amount, status, requested_at, profiles(full_name, username)').order('requested_at', { ascending: false }).limit(5)
    ]);

    const totalGMV = gmvData?.reduce((sum, o) => sum + Number(o.amount), 0) || 0;

    // Registration Growth (last 7 days grouped by name)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const { data: growthResult } = await supabase
        .from('profiles')
        .select('created_at')
        .gte('created_at', sevenDaysAgo.toISOString());

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const growthMap: Record<string, number> = {};
    
    // Pre-fill to ensure no gaps in chart
    for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        growthMap[dayNames[d.getDay()]] = 0;
    }

    growthResult?.forEach(p => {
        const day = dayNames[new Date(p.created_at).getDay()];
        if (growthMap[day] !== undefined) growthMap[day]++;
    });

    const growthData = dayNames.map(day => ({ 
        label: day, 
        count: growthMap[day] || 0 
    })).filter(d => growthMap[d.label] !== undefined);

    // Activity Feed Aggregation
    const activity: any[] = [];
    latestProfiles?.forEach(p => {
        activity.push({
            type: 'registration',
            title: 'New creator registered',
            desc: `${p.full_name || p.username} joined Tepak.ID.`,
            time: p.created_at
        });
    });
    latestWithdrawals?.forEach((w: any) => {
        activity.push({
            type: 'payout',
            title: 'Payout requested',
            desc: `Withdrawal for Rp ${Number(w.amount).toLocaleString('id-ID')} by ${w.profiles?.full_name || w.profiles?.username}.`,
            time: w.requested_at
        });
    });
    activity.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

    return c.json({
        totalUsers: totalUsers || 0,
        proUsers: proUsers || 0,
        totalGMV,
        pendingPayouts: pendingPayouts || 0,
        growthData,
        recentActivity: activity.slice(0, 10)
    });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// 5. Payout Management (Admin)
app.get('/admin/payouts', async (c) => {
  const { supabase, user } = await getAuthContext(c);
  const isAdmin = await checkAdmin(supabase, user, c);
  if (!isAdmin) return c.json({ error: 'Forbidden' }, 403);

  try {
    const { data, error } = await supabase
      .from('withdrawals')
      .select(`
        *,
        profiles (full_name, username, avatar_url),
        bank_accounts (*)
      `)
      .order('requested_at', { ascending: false });

    if (error) throw error;
    return c.json(data);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

app.post('/admin/payouts/update-status', async (c) => {
    const { supabase, user: adminUser } = await getAuthContext(c);
    const isAdmin = await checkAdmin(supabase, adminUser);
    if (!isAdmin) return c.json({ error: 'Forbidden' }, 403);

    try {
        const { id, status, notes } = await c.req.json();
        
        // 1. Get the withdrawal record
        const { data: withdrawal, error: fetchErr } = await supabase
            .from('withdrawals')
            .select('*')
            .eq('id', id)
            .single();
        
        if (fetchErr || !withdrawal) throw new Error('Withdrawal record not found');
        if (withdrawal.status !== 'pending') throw new Error('Withdrawal is already processed');

        const creatorId = withdrawal.merchant_id;
        const amount = Number(withdrawal.amount);

        // 2. Process status change
        if (status === 'completed') {
            const { error: updateErr } = await supabase
                .from('withdrawals')
                .update({ 
                    status: 'completed', 
                    processed_at: new Date().toISOString(),
                    notes 
                })
                .eq('id', id);
            if (updateErr) throw updateErr;

            // Reduce pending balance (already reserved when requested)
            const { error: walletErr } = await supabase.rpc('update_wallet_payout_success', {
                p_merchant_id: creatorId,
                p_amount: amount
            });
            if (walletErr) throw walletErr;

        } else if (status === 'rejected') {
            const { error: updateErr } = await supabase
                .from('withdrawals')
                .update({ 
                    status: 'rejected', 
                    processed_at: new Date().toISOString(),
                    notes: `Rejected: ${notes}`
                })
                .eq('id', id);
            if (updateErr) throw updateErr;

            // Refund from pending back to available
            const { error: walletErr } = await supabase.rpc('update_wallet_payout_reject', {
                p_merchant_id: creatorId,
                p_amount: amount
            });
            if (walletErr) throw walletErr;
        }

        return c.json({ success: true });
    } catch (err: any) {
        return c.json({ error: err.message }, 500);
    }
});

/**
 * SUBSCRIPTION PLAN MANAGEMENT (ADMIN)
 */

// List all plans
app.get('/admin/plans', async (c) => {
    const { supabase, user } = await getAuthContext(c);
    const isAdmin = await checkAdmin(supabase, user, c);
    if (!isAdmin) return c.json({ error: 'Unauthorized' }, 403);

    try {
        const { data, error } = await supabase
            .from('subscription_plans')
            .select('*')
            .order('price_monthly', { ascending: true });

        if (error) throw error;
        return c.json(data || []);
    } catch (err: any) {
        console.error('[Admin Plans API] Error:', err);
        return c.json({ error: err.message, stack: err.stack, note: 'DEBUG MODE ACTIVE' }, 500);
    }
});

// Update plan configuration
app.post('/admin/plans/update', async (c) => {
    const { supabase, user } = await getAuthContext(c);
    const isAdmin = await checkAdmin(supabase, user, c);
    if (!isAdmin) return c.json({ error: 'Unauthorized' }, 403);

    try {
        const plans = await c.req.json();
        if (!Array.isArray(plans)) throw new Error('Invalid data format');

        for (const plan of plans) {
            const { error } = await supabase
                .from('subscription_plans')
                .update({
                    name: plan.name,
                    badge: plan.badge,
                    price_monthly: Number(plan.price_monthly),
                    price_yearly: Number(plan.price_yearly),
                    features: plan.features,
                    config: plan.config,
                    updated_at: new Date().toISOString()
                })
                .eq('id', plan.id);
            
            if (error) throw error;
        }

        return c.json({ success: true });
    } catch (err: any) {
        console.error('[Admin Plans Update API] error:', err);
        return c.json({ error: err.message }, 500);
    }
});

// Get subscription stats
app.get('/admin/subscriptions', async (c) => {
    const { supabase, user } = await getAuthContext(c);
    const isAdmin = await checkAdmin(supabase, user, c);
    if (!isAdmin) return c.json({ error: 'Unauthorized' }, 403);

    try {
        const { data, error } = await supabase
            .from('user_settings')
            .select('plan_status');

        if (error) throw error;

        // Group by plan
        const stats = data.reduce((acc: any, curr: any) => {
            const status = curr.plan_status || 'free';
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, { free: 0, pro: 0, enterprise: 0 });

        return c.json(stats);
    } catch (err: any) {
        console.error('[Admin Subscriptions API] error:', err);
        return c.json({ error: err.message }, 500);
    }
});

// --- PRO PERFORMANCE INSIGHTS ENDPOINTS ---

// 1. Traffic Sources Analytics
app.get('/analytics/traffic-sources', async (c) => {
  try {
    const { supabase, user } = await getAuthContext(c);
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    const range = c.req.query('range') || '30d';
    let days = 30;
    if (range === '7d') days = 7;
    else if (range === '90d') days = 90;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString();

    // Fetch analytics events grouped by traffic source
    const { data: events, error } = await supabase
      .from('analytics_events')
      .select('traffic_source')
      .eq('merchant_id', user.id)
      .gte('created_at', startDateStr);

    if (error) throw error;

    // Count by traffic source
    const sourceCount: Record<string, number> = {
      direct: 0,
      social: 0,
      search: 0,
      referral: 0,
    };

    const eventList = events || [];
    eventList.forEach(e => {
      const source = e.traffic_source || 'direct';
      if (source in sourceCount) sourceCount[source]++;
    });

    const total = eventList.length || 1;
    const sources = [
      { name: 'Direct Traffic', value: Math.round((sourceCount.direct / total) * 100), color: 'bg-primary', subtext: 'Direct URL, Bookmarks' },
      { name: 'Social Media', value: Math.round((sourceCount.social / total) * 100), color: 'bg-secondary', subtext: 'Instagram, TikTok, Twitter' },
      { name: 'Search Engines', value: Math.round((sourceCount.search / total) * 100), color: 'bg-emerald-500', subtext: 'Google, Bing, DuckDuckGo' },
      { name: 'Referrals', value: Math.round((sourceCount.referral / total) * 100), color: 'bg-indigo-500', subtext: 'External blogs, Affiliates' },
    ];

    return c.json({ sources, totalEvents: total });
  } catch (err: any) {
    console.error('[Traffic Sources API] error:', err);
    return c.json({ error: err.message }, 500);
  }
});

// 2. Conversion Funnel
app.get('/analytics/conversion-funnel', async (c) => {
  try {
    const { supabase, user } = await getAuthContext(c);
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    const range = c.req.query('range') || '30d';
    let days = 30;
    if (range === '7d') days = 7;
    else if (range === '90d') days = 90;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString();

    // Count events by type for funnel
    const { data: events, error: eventError } = await supabase
      .from('analytics_events')
      .select('event_type')
      .eq('merchant_id', user.id)
      .gte('created_at', startDateStr);

    if (eventError) throw eventError;

    const eventList = events || [];
    const totalVisits = eventList.length;
    const productViews = eventList.filter(e => e.event_type === 'page_view').length;
    const addToCart = eventList.filter(e => e.event_type === 'add_to_cart').length;

    // Get actual purchased orders
    const { data: orders, error: orderError } = await supabase
      .from('orders')
      .select('id')
      .eq('merchant_id', user.id)
      .eq('status', 'success')
      .gte('created_at', startDateStr);

    if (orderError) throw orderError;

    const purchased = (orders || []).length;

    const funnelSteps = [
      { label: 'Total Visits', value: totalVisits.toLocaleString(), percent: 100, color: 'bg-primary' },
      { label: 'Product Views', value: productViews.toLocaleString(), percent: totalVisits > 0 ? Math.round((productViews / totalVisits) * 100) : 0, color: 'bg-primary/80' },
      { label: 'Added to Cart', value: addToCart.toLocaleString(), percent: totalVisits > 0 ? Math.round((addToCart / totalVisits) * 100) : 0, color: 'bg-primary/60' },
      { label: 'Purchased', value: purchased.toLocaleString(), percent: totalVisits > 0 ? (purchased / totalVisits * 100) : 0, color: 'bg-emerald-500' },
    ];

    const conversionRate = totalVisits > 0 ? (purchased / totalVisits * 100).toFixed(2) : '0.00';

    return c.json({ 
      funnelSteps, 
      conversionRate: parseFloat(conversionRate),
      improvement: 14 // Demo improvement percentage
    });
  } catch (err: any) {
    console.error('[Conversion Funnel API] error:', err);
    return c.json({ error: err.message }, 500);
  }
});

// 3. Geographic Analytics
app.get('/analytics/geo', async (c) => {
  try {
    const { supabase, user } = await getAuthContext(c);
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    const range = c.req.query('range') || '30d';
    let days = 30;
    if (range === '7d') days = 7;
    else if (range === '90d') days = 90;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString();

    // Count by country
    const { data: events, error } = await supabase
      .from('analytics_events')
      .select('country')
      .eq('merchant_id', user.id)
      .gte('created_at', startDateStr);

    if (error) throw error;

    const eventList = events || [];
    const countryCount: Record<string, number> = {};

    eventList.forEach(e => {
      const country = e.country || 'ID';
      countryCount[country] = (countryCount[country] || 0) + 1;
    });

    const total = eventList.length || 1;

    // Top countries
    const countryData = Object.entries(countryCount)
      .map(([code, count]) => ({
        code,
        count,
        percentage: Math.round((count / total) * 100)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const locations = [
      { country: 'Indonesia', flag: '🇮🇩', sessions: countryData.find(c => c.code === 'ID')?.count.toLocaleString() || '0', share: countryData.find(c => c.code === 'ID')?.percentage || 0, trend: '+12%' },
      { country: 'Malaysia', flag: '🇲🇾', sessions: countryData.find(c => c.code === 'MY')?.count.toLocaleString() || '0', share: countryData.find(c => c.code === 'MY')?.percentage || 0, trend: '+5%' },
      { country: 'Singapore', flag: '🇸🇬', sessions: countryData.find(c => c.code === 'SG')?.count.toLocaleString() || '0', share: countryData.find(c => c.code === 'SG')?.percentage || 0, trend: '-2%' },
      { country: 'United States', flag: '🇺🇸', sessions: countryData.find(c => c.code === 'US')?.count.toLocaleString() || '0', share: countryData.find(c => c.code === 'US')?.percentage || 0, trend: '+20%' },
      { country: 'Others', flag: '🌐', sessions: eventList.length.toLocaleString(), share: 100, trend: '+1%' },
    ];

    return c.json({ locations, totalSessions: total });
  } catch (err: any) {
    console.error('[Geo Analytics API] error:', err);
    return c.json({ error: err.message }, 500);
  }
});

// Health check with Database Diagnostics
app.get('/health', async (c) => {
  const { supabase } = await getAuthContext(c);
  
  const [profilesRes, tutorialsRes] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }).limit(1),
    supabase.from('tutorials').select('id', { count: 'exact', head: true }).limit(1)
  ]);

  return c.json({ 
    status: 'ok', 
    environment: 'edge',
    diagnostics: {
        profiles_table: profilesRes.error ? `Error: ${profilesRes.error.message}` : 'Healthy',
        tutorials_table: tutorialsRes.error ? `Error: ${tutorialsRes.error.message}` : 'Healthy',
        auth: 'active'
    }
  });
});

// Export handler for Astro
export const ALL: APIRoute = ({ request }) => app.fetch(request);
