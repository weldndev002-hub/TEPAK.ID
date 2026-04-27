import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

export const GET: APIRoute = async ({ request, url }) => {
    const token = url.searchParams.get('token');
    const email = url.searchParams.get('email');
    
    if (!token) {
        return new Response(JSON.stringify({ error: 'Token required' }), { status: 400 });
    }
    
    const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
    const supabaseKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY || import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    try {
        // Get delivery record
        const { data: delivery, error } = await supabase
            .from('digital_deliveries')
            .select('*, orders!inner(id, customer_id, customers!inner(email, name))')
            .eq('token', token)
            .single();
        
        if (error || !delivery) {
            return new Response(JSON.stringify({
                exists: false,
                error: 'Token not found',
                details: error?.message
            }), { status: 404 });
        }
        
        const dbEmail = delivery.orders?.customers?.email;
        const urlEmail = email;
        const match = dbEmail?.toLowerCase() === urlEmail?.toLowerCase();
        
        return new Response(JSON.stringify({
            exists: true,
            token: delivery.token,
            expires_at: delivery.expires_at,
            db_email: dbEmail,
            url_email: urlEmail,
            emails_match: match,
            access_count: delivery.access_count,
            file_url: delivery.file_url,
            is_expired: new Date(delivery.expires_at) < new Date()
        }, null, 2), { status: 200 });
        
    } catch (err: any) {
        return new Response(JSON.stringify({
            error: 'Internal error',
            message: err.message
        }), { status: 500 });
    }
};
