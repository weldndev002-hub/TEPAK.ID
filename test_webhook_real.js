/**
 * Test webhook dengan data real dari database
 * Jalankan: node test_webhook_real.js
 */

import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.PUBLIC_SUPABASE_ANON_KEY;
const merchantCode = process.env.PUBLIC_DUITKU_MERCHANT_CODE;
const merchantKey = process.env.PUBLIC_DUITKU_MERCHANT_KEY;

if (!supabaseUrl || !supabaseKey || !merchantCode || !merchantKey) {
  console.error('❌ Missing environment variables!');
  console.error('  - PUBLIC_SUPABASE_URL:', !!supabaseUrl);
  console.error('  - SUPABASE_SERVICE_ROLE_KEY:', !!supabaseKey);
  console.error('  - PUBLIC_DUITKU_MERCHANT_CODE:', !!merchantCode);
  console.error('  - PUBLIC_DUITKU_MERCHANT_KEY:', !!merchantKey);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testWebhook() {
  console.log('🧪 Testing Webhook with REAL DATABASE data...\n');

  try {
    // 1. Get first PENDING subscription transaction
    console.log('1️⃣  Fetching PENDING transactions...');
    const { data: pending, error: pendingError } = await supabase
      .from('subscription_history')
      .select('*')
      .eq('status', 'PENDING')
      .eq('plan_id', 'pro')
      .limit(1)
      .single();

    if (pendingError || !pending) {
      console.error('❌ No pending transactions found!');
      console.error('   Error:', pendingError?.message);
      process.exit(1);
    }

    console.log('✅ Found pending transaction:');
    console.log(`   Invoice: ${pending.invoice_id}`);
    console.log(`   User: ${pending.user_id}`);
    console.log(`   Amount: ${pending.amount}`);
    console.log(`\n2️⃣  Generating webhook signature...`);

    // Extract data from invoice
    const invoiceId = pending.invoice_id;
    const amount = Math.floor(pending.amount);

    // Generate signature (Format B: merchantCode + amount + orderId + merchantKey)
    const signature = crypto
      .createHash('md5')
      .update(`${merchantCode}${amount}${invoiceId}${merchantKey}`)
      .digest('hex');

    console.log(`   Merchant: ${merchantCode}`);
    console.log(`   Amount: ${amount}`);
    console.log(`   OrderId: ${invoiceId}`);
    console.log(`   Signature: ${signature.substring(0, 16)}...`);

    // 3. Build webhook payload
    const payload = {
      merchantCode,
      merchantOrderId: invoiceId,
      amount,
      reference: `REF-AUTO-${Date.now()}`,
      resultCode: '00', // SUCCESS
      statusMessage: 'SUCCESS',
      signature,
    };

    console.log(`\n3️⃣  Sending webhook request...`);
    console.log(`   To: http://localhost:4321/api/payments/duitku/webhook`);

    const response = await fetch('http://localhost:4321/api/payments/duitku/webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    
    console.log(`\n4️⃣  Webhook Response:`);
    console.log(`   Status: ${response.status}`);
    console.log(`   Body:`, JSON.stringify(result, null, 2));

    if (result.success) {
      console.log('\n✅ Webhook processed successfully!');

      // 5. Verify update in database
      console.log(`\n5️⃣  Verifying database update...`);
      
      const { data: history, error: histError } = await supabase
        .from('subscription_history')
        .select('status')
        .eq('invoice_id', invoiceId)
        .single();

      const { data: userSettings, error: userError } = await supabase
        .from('user_settings')
        .select('plan_status, plan_expiry')
        .eq('user_id', pending.user_id)
        .single();

      console.log(`   subscription_history[${invoiceId}].status: ${history?.status || 'NOT FOUND'}`);
      console.log(`   user_settings[${pending.user_id}].plan_status: ${userSettings?.plan_status || 'NOT FOUND'}`);
      console.log(`   user_settings[${pending.user_id}].plan_expiry: ${userSettings?.plan_expiry || 'NULL'}`);

      if (history?.status === 'SUCCESS' && userSettings?.plan_status === 'pro') {
        console.log('\n🎉 SUCCESS! User is now PRO!');
      } else {
        console.log('\n⚠️  Webhook completed but database not fully updated. Check logs.');
      }
    } else {
      console.log('\n❌ Webhook failed!');
      console.log('   Error:', result.error);
    }
  } catch (err) {
    console.error('❌ Test failed:', err.message);
    console.error('\n💡 Is your app running on http://localhost:4321?');
    console.error('   Run: npm run dev');
  }
}

testWebhook();
