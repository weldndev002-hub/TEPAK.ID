import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase credentials not found');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigrations() {
  console.log('📦 Applying Subscription Plans Migrations...\n');

  try {
    // 1. Add tier_category and tier_description columns if they don't exist
    console.log('1️⃣  Adding tier_category and tier_description columns...');
    
    // Check if columns exist
    let columns: any = [];
    try {
      const result = await supabase.rpc('get_table_columns', { table_name: 'subscription_plans' });
      columns = result.data || [];
    } catch (e) {
      console.log('   ℹ️  RPC function not available, proceeding with update attempt');
      columns = [];
    }
    
    const hasTC = columns?.some((c: any) => c === 'tier_category');
    const hasTD = columns?.some((c: any) => c === 'tier_description');
    
    if (!hasTC || !hasTD) {
      // We'll use direct updates to add data since we can't ALTER via RPC
      console.log('   Updating subscription_plans with tier information...');
      
      const updates = [
        {
          id: 'free',
          tier_category: 'Starter',
          tier_description: 'Perfect for creators just starting their digital journey. Includes essential features to build your online presence with unlimited links and basic analytics.'
        },
        {
          id: 'pro',
          tier_category: 'Professional',
          tier_description: 'For growing digital businesses. Unlock premium features like custom domain, digital product sales, and advanced integrations to scale your business.'
        }
      ];
      
      // Try to update - if column doesn't exist, it will fail gracefully
      for (const update of updates) {
        try {
          const { error } = await supabase
            .from('subscription_plans')
            .update({
              tier_category: update.tier_category,
              tier_description: update.tier_description
            })
            .eq('id', update.id);
          
          if (error?.code === 'PGRST202') {
            console.log(`   ⚠️  Columns don't exist yet, they need to be created via SQL`);
          } else if (error) {
            console.log(`   ⚠️  Update error for ${update.id}:`, error.message);
          } else {
            console.log(`   ✅ Updated plan ${update.id}`);
          }
        } catch (e: any) {
          console.log(`   ⚠️  Exception updating ${update.id}:`, e.message);
        }
      }
    }

    // 2. Ensure is_active is set to true for main plans
    console.log('\n2️⃣  Ensuring is_active is set correctly...');
    
    // Check current status
    const { data: allPlans } = await supabase
      .from('subscription_plans')
      .select('id, is_active');
    
    const freePlan = allPlans?.find((p: any) => p.id === 'free');
    const proPlan = allPlans?.find((p: any) => p.id === 'pro');
    
    if (freePlan?.is_active === false) {
      await supabase.from('subscription_plans').update({ is_active: true }).eq('id', 'free');
      console.log('   ✅ Activated free plan');
    }
    if (proPlan?.is_active === false) {
      await supabase.from('subscription_plans').update({ is_active: true }).eq('id', 'pro');
      console.log('   ✅ Activated pro plan');
    }

    console.log('\n✨ Migration check complete!');
    console.log('\nℹ️  If you see column-related errors above, you may need to run the SQL migrations manually in Supabase SQL Editor.');

  } catch (err: any) {
    console.error('❌ Migration error:', err.message);
  }
}

applyMigrations();
