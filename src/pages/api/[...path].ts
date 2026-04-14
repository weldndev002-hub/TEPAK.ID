import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { APIRoute } from 'astro';
import { createServerClient, parseCookieHeader } from '@supabase/ssr';

// Helper to safely get environment variables
const getEnv = (key: string) => {
    if (import.meta.env && import.meta.env[key]) return import.meta.env[key];
    try {
        // @ts-ignore
        if (typeof env !== 'undefined' && (env as any)[key]) return (env as any)[key];
    } catch (e) {}
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

// UPGRADE SUBSCRIPTION (Simulated Activation)
app.post('/subscription/upgrade', async (c) => {
    const { supabase, user } = await getAuthContext(c);
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    try {
        const now = new Date();
        const expiry = new Date();
        expiry.setDate(now.getDate() + 30); // Exactly 30 days from now

        const { data, error } = await supabase
            .from('user_settings')
            .update({
                plan_status: 'pro',
                plan_activated_at: now.toISOString(),
                plan_expiry: expiry.toISOString(),
                auto_renewal: true
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

// CANCEL SUBSCRIPTION (Disable Auto-Renewal)
app.post('/subscription/cancel', async (c) => {
    const { supabase, user } = await getAuthContext(c);
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    try {
        const { data, error } = await supabase
            .from('user_settings')
            .update({ auto_renewal: false })
            .eq('user_id', user.id)
            .select()
            .single();

        if (error) throw error;
        return c.json(data);
    } catch (err: any) {
        return c.json({ error: err.message }, 500);
    }
});

// UPDATE CURRENT USER PROFILE
app.put('/profile', async (c) => {
  const { supabase, user } = await getAuthContext(c);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);

  try {
    const body = await c.req.json();
    
    const { data, error } = await supabase
      .from('profiles')
      .update(body)
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;
    return c.json(data);
  } catch (err: any) {
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

app.get('/analytics/dashboard', async (c) => {
  console.log('[API] Analytics Dashboard requested');
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
      return c.json({ error: 'Event Fetch Failed', details: eventError }, 500);
    }

    // 2. Fetch sales from orders
    const { data: orders, error: orderError } = await supabase
      .from('orders')
      .select('amount, status, created_at')
      .eq('merchant_id', user.id)
      .gte('created_at', startDateStr);

    if (orderError) {
        console.error('[Analytics API] Order fetch error:', orderError);
        return c.json({ error: 'Order Fetch Failed', details: orderError }, 500);
    }

    const eventList = events || [];
    const orderList = orders || [];

    // Aggregate Stats
    const totalViews = eventList.filter(e => e.event_type === 'view').length;
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
    for (let i = 0; i < days; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        timeSeries[dateStr] = { views: 0, clicks: 0, sales: 0 };
    }

    eventList.forEach(e => {
        const dateStr = new Date(e.created_at).toISOString().split('T')[0];
        if (timeSeries[dateStr]) {
            if (e.event_type === 'view') timeSeries[dateStr].views++;
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
        if (e.event_type === 'view') linkCounts[path].views++;
        if (e.event_type === 'click') linkCounts[path].clicks++;
    });
    const top_links = Object.values(linkCounts).sort((a, b) => b.views - a.views).slice(0, 5);

    return c.json({
      totalViews,
      totalClicks,
      avgCTR: avgCtr,
      devices,
      browsers,
      sales: {
          total_revenue: orderList.filter(o => o.status === 'success' || o.status === 'paid').reduce((sum, o) => sum + Number(o.amount), 0),
          order_count: orderList.length
      },
      time_series,
      top_links
    });
  } catch (err: any) {
    console.error('[Analytics API] Global error:', err);
    return c.json({ error: err.message }, 500);
  }
});

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

    // Get order stats for this product
    const { data: orders, error: orderError } = await supabase
        .from('orders')
        .select(`
            *,
            customers (name, email)
        `)
        .eq('product_id', id)
        .eq('merchant_id', user.id);

    if (orderError) return c.json({ error: orderError.message }, 500);

    const totalSold = orders.filter(o => o.status === 'success' || o.status === 'paid').length;
    const totalRevenue = orders
        .filter(o => o.status === 'success' || o.status === 'paid')
        .reduce((sum, o) => sum + Number(o.amount), 0);
    
    return c.json({
        total_sold: totalSold,
        total_revenue: totalRevenue,
        recent_buyers: orders.slice(0, 5) // Last 5 buyers
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
    const { supabase, user } = await getAuthContext(c);
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('merchant_id', user.id)
        .order('created_at', { ascending: false });

    if (error) return c.json({ error: error.message }, 500);
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
    const { supabase } = await getAuthContext(c.req.raw);
    const body = c.req.valid('json');

    // 1. Upsert Customer
    const { data: customer, error: custError } = await supabase
      .from('customers')
      .upsert({ 
        merchant_id: body.merchant_id,
        email: body.buyer_email,
        name: body.buyer_name,
        phone: body.buyer_phone,
        updated_at: new Date().toISOString()
      }, { onConflict: 'merchant_id, email' })
      .select()
      .single();

    if (custError) return c.json({ error: custError.message }, 500);

    // 2. Create Order
    const invoiceId = `TPK-${Math.floor(Math.random() * 1000000)}`;
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        invoice_id: invoiceId,
        customer_id: customer.id,
        product_id: body.product_id,
        merchant_id: body.merchant_id,
        amount: body.amount,
        status: body.status,
        payment_method: body.payment_method
      })
      .select()
      .single();

    if (orderError) return c.json({ error: orderError.message }, 500);

    return c.json(order, 201);
  }
);

/**
 * PROFILE & USER SETTINGS ENDPOINTS
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
    const { supabase } = await getAuthContext(c.req.raw);
    const body = c.req.valid('json');

    // Basic IP Hashing for uniqueness (optional/simulation)
    const ip = c.req.header('x-forwarded-for') || '127.0.0.1';
    
    const { error } = await supabase
      .from('analytics_events')
      .insert({
        ...body,
        ip_hash: ip // In production, hash this
      });

    if (error) return c.json({ error: error.message }, 500);
    return c.json({ success: true }, 201);
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
    const totalViews = eventList.filter(e => e.event_type === 'view').length;
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
            if (e.event_type === 'view') timeSeries[dateStr].views++;
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
        if (e.event_type === 'view') linkCounts[path].views++;
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
    const { supabase } = await getAuthContext(c.req.raw);

    const { data, error } = await supabase
        .from('products')
        .select('id, title, price, description, cover_url, merchant_id, status')
        .eq('id', id)
        .eq('status', 'published')
        .single();

    if (error) return c.json({ error: 'Produk tidak ditemukan atau tidak tersedia' }, 404);
    return c.json(data);
});

// --- ADMIN ROUTES (SUPER ADMIN ONLY) ---

const checkAdmin = async (supabase: any, user: any) => {
  try {
    if (!user) return false;
    
    // Super Admin Whitelist (Owner)
    const ownerEmail = 'acepali2253@gmail.com';
    if (user.email === ownerEmail) return true;

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
  const isAdmin = await checkAdmin(supabase, user);
  if (!isAdmin) return c.json({ error: 'Forbidden' }, 403);

  try {
    const { data: users, error } = await supabase
      .from('profiles')
      .select('*, settings:user_settings(*)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Map data to match Admin Dashboard structure
    const formattedUsers = users.map(u => ({
        id: u.id,
        name: u.full_name || u.username || 'Anonymous',
        email: u.username + '@tepak.id', 
        username: u.username,
        plan: u.settings?.plan_status?.toUpperCase() || 'FREE',
        planExpiry: u.settings?.plan_expiry || 'N/A',
        status: u.settings?.plan_status === 'banned' ? 'Banned' : 'Active',
        is_banned: u.settings?.plan_status === 'banned',
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
  const isAdmin = await checkAdmin(supabase, user);
  if (!isAdmin) return c.json({ error: 'Forbidden' }, 403);

  try {
    const { userId, isBanned } = await c.req.json();
    const plan_status = isBanned ? 'banned' : 'free';
    
    const { data, error } = await supabase
      .from('user_settings')
      .update({ plan_status })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return c.json(data);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// 3. Tutorial Management (Admin)
app.get('/admin/tutorials', async (c) => {
  try {
    const { supabase, user } = await getAuthContext(c);
    const isAdmin = await checkAdmin(supabase, user);
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
    const isAdmin = await checkAdmin(supabase, user);
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
    const isAdmin = await checkAdmin(supabase, user);
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
  const isAdmin = await checkAdmin(supabase, user);
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
  const isAdmin = await checkAdmin(supabase, user);
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
    const { supabase, user: adminUser } = await getAuthContext(c.req.raw);
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
    const isAdmin = await checkAdmin(supabase, user);
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
    const isAdmin = await checkAdmin(supabase, user);
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
    const isAdmin = await checkAdmin(supabase, user);
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
