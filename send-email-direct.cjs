#!/usr/bin/env node
/**
 * Direct Email Test - Send email immediately
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Load .env
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    content.split('\n').forEach(line => {
        const [k, ...v] = line.split('=');
        if (k && v.length) process.env[k.trim()] = v.join('=').trim();
    });
}

const API_KEY = process.env.RESEND_API_KEY;
const FROM = process.env.RESEND_SENDER_EMAIL || 'noreply@bimajanuri.my.id';
const TO = 'acepali2253@gmail.com';

console.log('╔══════════════════════════════════════════╗');
console.log('║  DIRECT EMAIL TEST                       ║');
console.log('╚══════════════════════════════════════════╝\n');

console.log('From:', FROM);
console.log('To:', TO);
console.log('API Key:', API_KEY ? API_KEY.substring(0, 15) + '...' : 'MISSING!');
console.log();

if (!API_KEY) {
    console.log('❌ RESEND_API_KEY not found!');
    process.exit(1);
}

const downloadUrl = `http://localhost:4321/digital-delivery/dd_${Date.now()}_test?email=${encodeURIComponent(TO)}`;

const html = `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px;">
        <h1>🎉 Test Email dari Tepak.ID</h1>
        <p>Ini adalah email test langsung</p>
    </div>
    <div style="padding: 30px; background: #f9f9f9; margin: 20px 0; border-radius: 10px;">
        <p>Halo,</p>
        <p>Email ini dikirim pada: <strong>${new Date().toLocaleString('id-ID')}</strong></p>
        <p>Jika Anda menerima email ini, konfigurasi email sudah benar!</p>
        <a href="${downloadUrl}" style="display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0;">🔗 Test Link Download</a>
    </div>
    <p style="color: #666; font-size: 12px; text-align: center;">Tepak.ID &copy; ${new Date().getFullYear()}</p>
</body>
</html>`;

const data = JSON.stringify({
    from: `Tepak.ID <${FROM}>`,
    to: TO,
    subject: `🧪 Test Email #${Date.now().toString().slice(-4)} - Tepak.ID`,
    html: html
});

console.log('Sending...\n');

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
        console.log('Status:', res.statusCode);
        try {
            const result = JSON.parse(body);
            console.log('Response:', JSON.stringify(result, null, 2));
            
            if (res.statusCode === 200 || res.statusCode === 201) {
                console.log('\n✅ SUCCESS!');
                console.log('Email ID:', result.id);
                console.log('\n📧 Cek inbox acepali2253@gmail.com');
                console.log('   (termasuk folder SPAM/PROMOSI)');
            } else {
                console.log('\n❌ FAILED:', result.message || body);
            }
        } catch (e) {
            console.log('Body:', body);
        }
    });
});

req.on('error', (e) => console.error('Error:', e.message));
req.write(data);
req.end();
