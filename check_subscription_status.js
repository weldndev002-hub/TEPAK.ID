/**
 * Script untuk debug status subscription
 * Jalankan: node check_subscription_status.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase credentials not found in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSubscriptionStatus() {
  console.log('🔍 Checking Subscription System Status...\n');

  try {
    // 1. Check if columns exist in user_settings
    console.log('1️⃣  Checking user_settings table structure...');
    const { data: columns, error: colError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'user_settings');

    if (colError) {
      console.log('   Using alternative method to check columns...');
      // Try another way - fetch a user_settings record and see what's available
      const { data: settings, error: settingsError } = await supabase
        .from('user_settings')
        .select('*')
        .limit(1);

      if (!settingsError && settings && settings.length > 0) {
        console.log('   ✅ Columns found in user_settings:', Object.keys(settings[0]));
      }
    } else {
      console.log('   ✅ Columns:', columns?.map(c => c.column_name));
    }

    // 2. Check subscription_plans
    console.log('\n2️⃣  Checking subscription_plans...');
    const { data: plans, error: plansError } = await supabase
      .from('subscription_plans')
      .select('*');

    if (plansError) {
      console.log('   ❌ Error fetching plans:', plansError.message);
    } else {
      console.log('   ✅ Plans found:', plans?.length || 0);
      plans?.forEach(p => {
        console.log(`     - ${p.id}: Rp ${p.price_monthly}`);
      });
    }

    // 3. Check subscription_history
    console.log('\n3️⃣  Checking subscription_history...');
    const { data: history, error: histError } = await supabase
      .from('subscription_history')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (histError) {
      console.log('   ❌ Error fetching history:', histError.message);
    } else {
      console.log('   ✅ Recent transactions:', history?.length || 0);
      history?.forEach(h => {
        console.log(`     - ${h.invoice_id}: ${h.status} (${h.plan_id})`);
      });
    }

    // 4. Sample user settings
    console.log('\n4️⃣  Sample user_settings records...');
    const { data: users, error: usersError } = await supabase
      .from('user_settings')
      .select('*')
      .limit(3);

    if (usersError) {
      console.log('   ❌ Error fetching user_settings:', usersError.message);
    } else {
      console.log('   ✅ User settings:');
      users?.forEach(u => {
        console.log(`     - ${u.user_id}:`);
        console.log(`       plan_status: ${u.plan_status || 'MISSING COLUMN'}`);
        console.log(`       plan_expiry: ${u.plan_expiry || 'MISSING/NULL'}`);
        console.log(`       auto_renewal: ${u.auto_renewal !== undefined ? u.auto_renewal : 'MISSING COLUMN'}`);
      });
    }

    console.log('\n✨ Debug complete!\n');

  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

checkSubscriptionStatus();
