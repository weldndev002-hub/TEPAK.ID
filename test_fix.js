import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
    process.env.PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.PUBLIC_SUPABASE_ANON_KEY
);

async function test() {
    let plans = [];
    try {
        const { data: pData, error } = await supabase
            .from('subscription_plans')
            .select('*')
            .eq('is_active', true)
            .order('price_monthly', { ascending: true });
        if (error) {
            console.warn('Active plans fetch failed, falling back to all plans:', error.message);
            // fallback: fetch all plans
            const { data: allData } = await supabase
                .from('subscription_plans')
                .select('*')
                .order('price_monthly', { ascending: true });
            plans = allData || [];
        } else {
            plans = pData || [];
        }
        console.log('Plans fetched:', plans.length);
        console.log(plans.map(p => ({ id: p.id, name: p.name, price: p.price_monthly })));
    } catch (e) {
        console.error('Plans Fetch Error:', e);
        const { data: allData } = await supabase
            .from('subscription_plans')
            .select('*')
            .order('price_monthly', { ascending: true });
        plans = allData || [];
    }
    console.log('Final plans count:', plans.length);
}

test().catch(console.error);