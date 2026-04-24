import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
    process.env.PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.PUBLIC_SUPABASE_ANON_KEY
);

async function check() {
    console.log('Checking subscription_plans table...');
    // 1. Fetch all columns
    const { data: columns, error: colError } = await supabase
        .from('subscription_plans')
        .select('*')
        .limit(1);
    if (colError) {
        console.error('Error fetching sample:', colError);
    } else if (columns && columns.length > 0) {
        console.log('Sample row keys:', Object.keys(columns[0]));
    }
    // 2. Fetch with is_active = true
    const { data: activePlans, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('price_monthly', { ascending: true });
    if (error) {
        console.error('Error fetching active plans:', error);
    } else {
        console.log('Active plans count:', activePlans?.length);
        console.log('Active plans:', activePlans);
    }
    // 3. Fetch all plans without filter
    const { data: allPlans } = await supabase
        .from('subscription_plans')
        .select('*');
    console.log('All plans count:', allPlans?.length);
    console.log('All plans:', allPlans);
}

check().catch(console.error);