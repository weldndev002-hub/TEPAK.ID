#!/usr/bin/env node
/**
 * Send test email to verified domain owner
 * Resend only allows sending to your own email until domain is verified
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
const FROM = process.env.RESEND_SENDER_EMAIL || 'noreply@bimajanuri.my.id';

// Sesuaikan dengan email owner domain di Resend
const TO = 'mail@bimajanuri.my.id';  // Ganti dengan email Anda yang terdaftar di Resend

console.log('╔════════════════════════════════════════════════╗');
console.log('║  SEND TO VERIFIED EMAIL (Resend Testing Mode) ║');
console.log('╚════════════════════════════════════════════════╝\n');

console.log('From:', FROM);
console.log('To:', TO, '(must be verified domain owner)');
console.log();

if (!API_KEY) {
    console.log('❌ No API key!');
    process.exit(1);
}

const data = JSON.stringify({
    from: `Tepak.ID <${FROM}>`,
    to: TO,
    subject: `🧪 TEST EMAIL - Tepak.ID Digital Delivery`,
    html: `
<!DOCTYPE html>
<html>
<body style="font-family: Arial; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px;">
        <h1>🎉 Email Test Berhasil!</h1>
        <p>Ini adalah email test dari Tepak.ID</p>
    </div>
    <div style="padding: 30px; background: #f9f9f9; margin: 20px 0; border-radius: 10px;">
        <p>Halo,</p>
        <p><strong>Waktu:</strong> ${new Date().toLocaleString('id-ID')}</p>
        <p><strong>Status:</strong> Testing Mode</p>
        <p>Ini adalah test email dari sistem digital delivery Tepak.ID.</p>
        <p>Jika Anda menerima ini, konfigurasi email sudah benar!</p>
        <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <strong>⚠️ Catatan Penting:</strong><br>
            Akun Resend Anda masih dalam mode testing. Untuk mengirim email ke customer (seperti acepali2253@gmail.com), Anda perlu:<br><br>
            1. Verifikasi domain di https://resend.com/domains<br>
            2. Tambahkan DNS records (SPF, DKIM, MX)<br>
            3. Tunggu status menjadi "Verified"r>
        </div>
    </div>
    <p style="color: #666; font-size: 12px; text-align: center;">Tepak.ID &copy; ${new Date().getFullYear()}</p>
</body>
</html>`
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
        try {
            const result = JSON.parse(body);
            console.log('Status:', res.statusCode);
            console.log('Response:', JSON.stringify(result, null, 2));
            
            if (res.statusCode === 200 || res.statusCode === 201) {
                console.log('\n✅ SUCCESS! Email sent to verified address');
                console.log('Email ID:', result.id);
                console.log('\n📧 Check inbox:', TO);
                console.log('\n⚠️  IMPORTANT:');
                console.log('   Resend is in TESTING mode.');
                console.log('   You can ONLY send to your own verified email.');
                console.log('   To send to customers, verify domain at:');
                console.log('   https://resend.com/domains\n');
            } else {
                console.log('\n❌ FAILED:', result.message || body);
            }
        } catch (e) {
            console.log('Body:', body);
        }
    });
});

req.on('error', e => console.error('Error:', e.message));
req.write(data);
req.end();
