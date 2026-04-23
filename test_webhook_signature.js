/**
 * Script untuk test webhook signature validation
 * Jalankan: node simulate_webhook.js
 */

import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const merchantCode = process.env.PUBLIC_DUITKU_MERCHANT_CODE;
const merchantKey = process.env.PUBLIC_DUITKU_MERCHANT_KEY;

if (!merchantCode || !merchantKey) {
  console.error('❌ Duitku credentials not found!');
  console.log('   Pastikan PUBLIC_DUITKU_MERCHANT_CODE dan PUBLIC_DUITKU_MERCHANT_KEY ada di .env');
  process.exit(1);
}

console.log('🔧 Testing Duitku Webhook Signature...\n');
console.log('Merchant Code:', merchantCode);
console.log('Merchant Key:', merchantKey.substring(0, 10) + '...\n');

// Sample webhook payload (hasil dari Duitku)
const userId = 'f1947a0b-f2af-4f67-80b4-e7724ab4618f';
const orderId = `SUB--${userId}--4394`;
const amount = 45000;

// Test multiple signature formats (Duitku pake berbagai kombinasi)
const formats = {
  'Format A: merchantCode + orderId + amount + key': `${merchantCode}${orderId}${amount}${merchantKey}`,
  'Format B: merchantCode + amount + orderId + key': `${merchantCode}${amount}${orderId}${merchantKey}`,
  'Format C: amount + orderId + merchantCode + key': `${amount}${orderId}${merchantCode}${merchantKey}`,
};

console.log(`Testing OrderId: ${orderId}`);
console.log(`Amount: ${amount}\n`);

Object.entries(formats).forEach(([name, data]) => {
  const sig = crypto.createHash('md5').update(data).digest('hex');
  console.log(`${name}`);
  console.log(`  Data: ${data.substring(0, 50)}...`);
  console.log(`  Signature: ${sig}\n`);
});

// Now test webhook POST
console.log('\n' + '='.repeat(60));
console.log('📤 Sending webhook simulation...\n');

async function sendWebhook() {
  // Gunakan Format B (paling umum di Duitku V2)
  const signature = crypto.createHash('md5')
    .update(`${merchantCode}${amount}${orderId}${merchantKey}`)
    .digest('hex');

  const payload = {
    merchantCode,
    merchantOrderId: orderId,
    amount,
    reference: 'REF-TEST-' + Math.random().toString(36).substring(7),
    resultCode: '00', // 00 = SUCCESS
    statusMessage: 'SUCCESS',
    signature
  };

  console.log('Payload:', JSON.stringify(payload, null, 2));

  try {
    const response = await fetch('http://localhost:4321/api/payments/duitku/webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    console.log('\n✅ Response:', JSON.stringify(result, null, 2));

    if (result.success) {
      console.log('\n🎉 Webhook processed successfully!');
      console.log('   Cek database untuk verify user status sudah berubah ke PRO');
    } else {
      console.log('\n❌ Webhook processing failed');
    }
  } catch (err) {
    console.error('❌ Fetch error:', err.message);
    console.log('\n💡 Tip: Pastikan aplikasi running di http://localhost:4321');
  }
}

sendWebhook();
