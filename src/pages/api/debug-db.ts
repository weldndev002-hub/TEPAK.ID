
import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

export const GET: APIRoute = async ({ request, locals }) => {
  const supabaseUrl = process.env.PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Check subscription_history
    const { data: history, error: historyError } = await supabase
      .from('subscription_history')
      .select('*')
      .limit(10);

    // Check orders
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .limit(10);

    // Check subscription_plans
    const { data: plans, error: plansError } = await supabase
      .from('subscription_plans')
      .select('*');

    return new Response(JSON.stringify({
      history,
      historyError,
      orders,
      ordersError,
      plans,
      plansError
    }, null, 2), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
