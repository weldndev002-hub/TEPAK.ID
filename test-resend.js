#!/usr/bin/env node
/**
 * Test Resend Email Configuration
 * 
 * Usage:
 *   node test-resend.js
 * 
 * Make sure these env vars are set:
 *   - RESEND_API_KEY
 *   - RESEND_SENDER_EMAIL
 *   - PUBLIC_SITE_URL
 */

import fetch from 'node-fetch';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const SENDER_EMAIL = process.env.RESEND_SENDER_EMAIL || 'noreply@bimajanuri.my.id';
const TEST_EMAIL = 'acepali2253@gmail.com';

console.log('🔧 Testing Resend Email Configuration\n');
console.log('=' .repeat(50));

// Check 1: API Key
console.log('\n1️⃣ Checking RESEND_API_KEY...');
if (!RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY is NOT set!');
    console.log('\n💡 Set it with:');
    console.log('   $env:RESEND_API_KEY="re_xxxxxxxxxx" (PowerShell)');
    console.log('   export RESEND_API_KEY=re_xxxxxxxxxx (Bash)');
    process.exit(1);
} else {
    console.log('✅ RESEND_API_KEY is set');
    console.log(`   Format: ${RESEND_API_KEY.substring(0, 10)}...`);
}

// Check 2: Sender Email
console.log('\n2️⃣ Checking RESEND_SENDER_EMAIL...');
console.log(`   Sender: ${SENDER_EMAIL}`);
if (!SENDER_EMAIL.includes('@')) {
    console.error('❌ Invalid sender email format!');
    process.exit(1);
} else {
    console.log('✅ Sender email format looks valid');
}

// Check 3: Send Test Email
console.log('\n3️⃣ Sending test email...');
console.log(`   To: ${TEST_EMAIL}`);
console.log(`   From: Tepak.ID <${SENDER_EMAIL}>`);

async function sendTestEmail() {
    try {
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${RESEND_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from: `Tepak.ID <${SENDER_EMAIL}>`,
                to: TEST_EMAIL,
                subject: 'Test Email dari Tepak.ID',
                html: `
                    <h1>🎉 Test Email Berhasil!</h1>
                    <p>Ini adalah email test dari sistem Tepak.ID.</p>
                    <p>Jika Anda menerima email ini, berarti konfigurasi Resend sudah benar!</p>
                    <hr>
                    <p><strong>Waktu:</strong> ${new Date().toLocaleString('id-ID')}</p>
                `,
            }),
        });

        const result = await response.json();

        if (response.ok) {
            console.log('\n✅ SUCCESS! Email sent');
            console.log(`   Email ID: ${result.id}`);
            console.log(`   Check inbox: ${TEST_EMAIL}`);
        } else {
            console.error('\n❌ FAILED to send email');
            console.error(`   Status: ${response.status}`);
            console.error(`   Error: ${result.message || JSON.stringify(result)}`);
            
            if (response.status === 422) {
                console.log('\n💡 Error 422 usually means:');
                console.log('   - Sender email is not verified in Resend');
                console.log('   - Domain is not verified');
                console.log('   - Invalid email format');
                console.log('\n   Go to https://resend.com/domains to verify your domain');
            }
            
            if (response.status === 401) {
                console.log('\n💡 Error 401 means:');
                console.log('   - API key is invalid or expired');
                console.log('   - Get new API key from https://resend.com/api-keys');
            }
        }
    } catch (err) {
        console.error('\n❌ Error:', err.message);
    }
}

sendTestEmail();
