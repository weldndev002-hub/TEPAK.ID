import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.PUBLIC_SUPABASE_ANON_KEY
);

const { data, error } = await supabase
  .from('subscription_plans')
  .select('*')
  .order('price_monthly', { ascending: true });

if (error) {
  console.error('Error:', error.message);
} else {
  console.log('\n=== All Subscription Plans ===\n');
  data?.forEach((plan, idx) => {
    console.log(`[${idx}] ID: ${plan.id}`);
    console.log(`    Name: ${plan.name}`);
    console.log(`    Badge: ${plan.badge}`);
    console.log(`    Active: ${plan.is_active}`);
    console.log(`    Price: Rp ${plan.price_monthly}/month, Rp ${plan.price_yearly}/year`);
    console.log(`    Description: ${plan.description}`);
    console.log(`    Features: ${JSON.stringify(plan.features)}`);
    console.log(`    Tier Category: ${plan.tier_category}`);
    console.log(`    Tier Description: ${plan.tier_description}`);
    console.log('');
  });
}
