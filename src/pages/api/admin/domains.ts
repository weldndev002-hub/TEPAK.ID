import type { APIRoute } from 'astro';
import { getSupabaseAdmin } from '../../../lib/supabase';

export const GET: APIRoute = async ({ request }) => {
  const supabase = getSupabaseAdmin();
  if (!supabase) return new Response(JSON.stringify({ error: 'Supabase admin not initialized' }), { status: 500 });

  const { data: domains, error } = await supabase
    .from('user_settings')
    .select('user_id, domain_name, domain_verified, profiles(username, full_name)')
    .not('domain_name', 'is', null)
    .not('domain_name', 'ilike', '%.tepak.id') // Filter out subdomains if needed, or show all
    .order('updated_at', { ascending: false });

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });

  // Map to a more friendly format
  const formattedDomains = (domains || []).map((d: any) => ({
    id: d.user_id,
    username: d.profiles?.username || 'unknown',
    custom_domain: d.domain_name,
    custom_domain_status: d.domain_verified ? 'active' : 'pending'
  }));

  return new Response(JSON.stringify(formattedDomains), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) return new Response(JSON.stringify({ error: 'Supabase admin not initialized' }), { status: 500 });

    const { userId, status } = await request.json();

    if (!userId || !status) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }

    const isVerified = status === 'active';

    const { error } = await supabase
      .from('user_settings')
      .update({ domain_verified: isVerified })
      .eq('user_id', userId);

    if (error) throw error;

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};
