import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

const merchantCode = process.env.PUBLIC_DUITKU_MERCHANT_CODE;
const merchantKey = process.env.PUBLIC_DUITKU_MERCHANT_KEY;
const userId = '7caba80a-90e7-4f97-abfb-d6d8862b859d'; // Real test user ID
const orderId = `SUB--${userId}--${Date.now()}`;
const amount = 50000;

// Signature formula for webhook: md5(merchantCode + amount + orderId + merchantKey)
const signature = crypto.createHash('md5').update(`${merchantCode}${amount}${orderId}${merchantKey}`).digest('hex');

const payload = {
    merchantCode,
    amount,
    orderId,
    reference: 'REF123456',
    statusCode: '00',
    statusMessage: 'SUCCESS',
    signature
};

async function test() {
    console.log('Testing Webhook with payload:', payload);
    const response = await fetch('http://localhost:4321/api/payments/duitku/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    
    const result = await response.json();
    console.log('Response:', result);
    
    if (result.success) {
        console.log('Webhook simulation successful!');
    } else {
        console.log('Webhook simulation failed.');
    }
}

test();
