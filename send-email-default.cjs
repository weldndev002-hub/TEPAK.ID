#!/usr/bin/env node
/**
 * Test with Resend Default Sender
 * This uses onboarding@resend.dev which is always verified
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    content.split('\n').forEach(line => {
        const [k, ...v] = line.split('=');
        if (k && v.length) process.env[k.trim()] = v.join('=').trim();
    });
}

const API_KEY = process.env.RESEND_API_KEY;
const TO = 'acepali2253@gmail.com';

if (!API_KEY) {
    console.log('❌ No API key found!');
    process.exit(1);
}

console.log('Sending with DEFAULT Resend sender (onboarding@resend.dev)...\n');

const data = JSON.stringify({
    from: 'Tepak.ID <onboarding@resend.dev>',
    to: TO,
    subject: `🧪 TEST #${Date.now().toString().slice(-4)} - Tepak.ID Digital Delivery`,
    html: `
<div style="font-family: Arial; max-width: 500px; margin: auto;">
    <h2 style="color: #667eea;">🎉 Pembayaran Berhasil!</h2>
    <p>Produk digital Anda siap diunduh.</p>
    <p><strong>Email test:</strong> ${new Date().toLocaleString('id-ID')}</p>
    <p><strong>Order:</strong> TEST-001</p>
    <p><strong>Produk:</strong> E-Book Digital Marketing</p>
    <a href="http://localhost:4321" style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px 0;">📥 Download Sekarang</a>
    <p style="color: #666; font-size: 12px; margin-top: 20px;">Tautan ini hanya berlaku 7 hari dan hanya dapat diakses dengan email terdaftar.</p>
</div>`
});

const req = https.request({
    hostname: 'api.resend.com',
    port: 443,
    path: '/emails',
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
    }
}, (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
        const result = JSON.parse(body);
        console.log('Status:', res.statusCode);
        console.log('Response:', result);
        
        if (res.statusCode === 200 || res.statusCode === 201) {
            console.log('\n✅ SUCCESS! Email ID:', result.id);
            console.log('\n📧 Check inbox acepali2253@gmail.com');
            console.log('   Look in: INBOX, SPAM, and PROMOTIONS folders');
            console.log('\n⚠️  Note: Using onboarding@resend.dev sender');
            console.log('   (Resend\'s verified default domain)');
        } else {
            console.log('\n❌ FAILED:', result.message);
        }
    });
});

req.on('error', e => console.error('Error:', e.message));
req.write(data);
req.end();
