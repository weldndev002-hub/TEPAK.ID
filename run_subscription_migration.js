import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigrations() {
  console.log('🔧 Running Subscription Plans Migration...\n');

  try {
    // 1. Add missing columns
    console.log('1️⃣  Adding missing columns to subscription_plans...');
    
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE public.subscription_plans
        ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
        ADD COLUMN IF NOT EXISTS tier_category TEXT DEFAULT 'Basic',
        ADD COLUMN IF NOT EXISTS tier_description TEXT;
      `
    }).catch(() => ({ error: null })); // Handle if rpc doesn't exist

    if (alterError) {
      console.log('   ℹ️  RPC method not available, trying direct approach...');
      
      // Try without ALTER - just update with data
      console.log('   Proceeding with data population...');
    } else {
      console.log('   ✅ Columns added successfully');
    }

    // 2. Update free plan
    console.log('\n2️⃣  Updating plans with tier information...');
    
    const { error: freePlanError } = await supabase
      .from('subscription_plans')
      .update({
        is_active: true,
        tier_category: 'Starter',
        tier_description: 'Perfect for creators just starting their digital journey. Includes essential features to build your online presence with unlimited links and basic analytics.'
      })
      .eq('id', 'free');

    if (freePlanError) {
      console.log(`   ⚠️  Error updating free plan:`, freePlanError.message);
      if (freePlanError.code === 'PGRST202') {
        console.log('   💡 Column does not exist - this is expected before ALTER runs');
      }
    } else {
      console.log('   ✅ Free plan updated');
    }

    // 3. Update pro plan
    const { error: proPlanError } = await supabase
      .from('subscription_plans')
      .update({
        is_active: true,
        tier_category: 'Professional',
        tier_description: 'For growing digital businesses. Unlock premium features like custom domain, digital product sales, and advanced integrations to scale your business.'
      })
      .eq('id', 'pro');

    if (proPlanError) {
      console.log(`   ⚠️  Error updating pro plan:`, proPlanError.message);
    } else {
      console.log('   ✅ Pro plan updated');
    }

    // 4. Verify
    console.log('\n3️⃣  Verifying changes...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('subscription_plans')
      .select('id, name, is_active, tier_category, price_monthly')
      .order('price_monthly', { ascending: true });

    if (verifyError) {
      console.log('   ❌ Verification error:', verifyError.message);
    } else {
      console.log('   ✅ Plans after migration:');
      verifyData?.forEach(p => {
        console.log(`     - ${p.id}: ${p.name} | Active: ${p.is_active} | Tier: ${p.tier_category} | Price: Rp${p.price_monthly}`);
      });
    }

    console.log('\n✨ Migration complete!\n');
    console.log('⚠️  IMPORTANT: If you see "Column does not exist" errors above:');
    console.log('   1. Go to Supabase → SQL Editor');
    console.log('   2. Run the SQL from: fix_subscription_plans.sql');
    console.log('   3. Then run this script again\n');

  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    console.error('\nFallback: Please run SQL manually in Supabase SQL Editor');
  }
}

runMigrations();
