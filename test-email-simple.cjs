#!/usr/bin/env node
/**
 * Simple Email Test - CommonJS version
 * Uses direct fetch to Resend API (bypassing app logic)
 * 
 * Usage:
 *   node test-email-simple.cjs
 */

const https = require('https');
const http = require('http');

// Read .env file manually (simple parser)
const fs = require('fs');
const path = require('path');

function loadEnv() {
    const envPath = path.join(__dirname, '.env');
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        envContent.split('\n').forEach(line => {
            const [key, ...valueParts] = line.split('=');
            if (key && valueParts.length > 0) {
                const value = valueParts.join('=').trim();
                if (value && !value.startsWith('#')) {
                    process.env[key.trim()] = value;
                }
            }
        });
    }
}

loadEnv();

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const SENDER_EMAIL = process.env.RESEND_SENDER_EMAIL || 'noreply@bimajanuri.my.id';
const SENDER_NAME = process.env.RESEND_SENDER_NAME || 'Tepak.ID';
const TEST_EMAIL = 'acepali2253@gmail.com';

console.log('╔════════════════════════════════════════════════╗');
console.log('║    TEST EMAIL DIGITAL DELIVERY (LOCAL)         ║');
console.log('╚════════════════════════════════════════════════╝\n');

// Validate
if (!RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY tidak ditemukan di .env');
    process.exit(1);
}

console.log('📧 Konfigurasi:');
console.log(`   From: ${SENDER_NAME} <${SENDER_EMAIL}>`);
console.log(`   To: ${TEST_EMAIL}`);
console.log(`   API Key: ${RESEND_API_KEY.substring(0, 15)}...\n`);

// Test URL for local
const testToken = 'dd_' + Date.now() + '_localtest';
const downloadUrl = `http://localhost:4321/digital-delivery/${testToken}?email=${encodeURIComponent(TEST_EMAIL)}`;

// Email payload
const emailData = {
    from: `${SENDER_NAME} <${SENDER_EMAIL}>`,
    to: TEST_EMAIL,
    subject: '📥 Tautan Unduhan Produk Digital Anda - Tepak.ID',
    html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Unduhan Produk Digital</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            line-height: 1.6; 
            color: #333;
            background: #f5f5f5;
            margin: 0;
            padding: 20px;
        }
        .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }
        .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            color: white; 
            padding: 40px 30px; 
            text-align: center; 
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
        }
        .content { 
            padding: 40px 30px;
        }
        .button { 
            display: inline-block; 
            background: #667eea; 
            color: white; 
            padding: 16px 32px; 
            text-decoration: none; 
            border-radius: 8px; 
            font-weight: 600;
            margin: 20px 0;
        }
        .button:hover {
            background: #5a6fd6;
        }
        .info-box {
            background: #f8f9fa;
            border-left: 4px solid #667eea;
            padding: 20px;
            margin: 20px 0;
            border-radius: 0 8px 8px 0;
        }
        .footer { 
            background: #f8f9fa;
            margin-top: 30px;
            padding: 30px;
            text-align: center;
            font-size: 14px;
            color: #666;
            border-top: 1px solid #eee;
        }
        .warning {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            color: #856404;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
        }
        code {
            background: #e9ecef;
            padding: 3px 8px;
            border-radius: 4px;
            font-family: monospace;
            font-size: 14px;
            word-break: break-all;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Pembayaran Berhasil!</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Produk digital Anda siap diunduh</p>
        </div>
        
        <div class="content">
            <h2>Halo,</h2>
            <p>Terima kasih telah melakukan pembelian di <strong>Tepak.ID</strong>. Produk digital yang Anda beli telah siap untuk diunduh.</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="${downloadUrl}" class="button">📥 Unduh Produk Sekarang</a>
            </div>
            
            <div class="info-box">
                <p><strong>Detail Pengunduhan:</strong></p>
                <ul style="margin: 10px 0; padding-left: 20px;">
                    <li>Tautan unduhan hanya berlaku selama <strong>7 hari</strong></li>
                    <li>Tautan hanya dapat diakses dengan email: <code>${TEST_EMAIL}</code></li>
                    <li>Jika tombol tidak berfungsi, salin URL ini ke browser:</li>
                </ul>
                <code style="display: block; margin-top: 10px; padding: 10px; background: #e9ecef; border-radius: 4px;">${downloadUrl}</code>
            </div>
            
            <div class="warning">
                <strong>⚠️ Penting:</strong> Jangan bagikan tautan ini ke orang lain. Tautan ini terkait dengan email Anda dan dilindungi sistem keamanan kami.
            </div>
            
            <p style="margin-top: 30px;">Jika Anda mengalami masalah dengan pengunduhan, silakan balas email ini atau hubungi support kami.</p>
        </div>
        
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Tepak.ID. Semua hak dilindungi undang-undang.</p>
            <p style="font-size: 12px; margin-top: 10px;">Email ini dikirim secara otomatis, mohon tidak membalas email ini.</p>
        </div>
    </div>
</body>
</html>
    `,
    text: `Pembayaran Berhasil!

Produk digital Anda siap diunduh.

Klik tautan berikut untuk mengunduh:
${downloadUrl}

Detail:
- Tautan berlaku 7 hari
- Hanya dapat diakses dengan email: ${TEST_EMAIL}
- Jangan bagikan tautan ini

Terima kasih,
Tepak.ID Team
`
};

// Send request to Resend
console.log('📤 Mengirim request ke Resend API...\n');

const postData = JSON.stringify(emailData);

const options = {
    hostname: 'api.resend.com',
    port: 443,
    path: '/emails',
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
    }
};

const req = https.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
        data += chunk;
    });
    
    res.on('end', () => {
        const result = JSON.parse(data);
        
        console.log('📬 Response dari Resend:');
        console.log(`   Status: ${res.statusCode}`);
        console.log(`   Response: ${JSON.stringify(result, null, 2)}\n`);
        
        if (res.statusCode === 200 || res.statusCode === 201) {
            console.log('╔════════════════════════════════════════════════╗');
            console.log('║         ✅ EMAIL BERHASIL DIKIRIM!              ║');
            console.log('╚════════════════════════════════════════════════╝\n');
            
            console.log('📧 Detail:');
            console.log(`   Email ID: ${result.id}`);
            console.log(`   Dikirim ke: ${TEST_EMAIL}`);
            console.log(`   Dari: ${SENDER_EMAIL}`);
            console.log(`   Subject: ${emailData.subject}\n`);
            
            console.log('🔗 Link Test (buka setelah jalankan npm run dev):');
            console.log(`   ${downloadUrl}\n`);
            
            console.log('💡 Catatan:');
            console.log('   • Cek inbox acepali2253@gmail.com (termasuk spam/promosi)');
            console.log('   • Token test ini tidak tersimpan di database');
            console.log('   • Untuk test end-to-end, gunakan webhook atau order asli');
            
        } else if (res.statusCode === 422) {
            console.log('╔════════════════════════════════════════════════╗');
            console.log('║    ❌ ERROR 422 - Validation Error              ║');
            console.log('╚════════════════════════════════════════════════╝\n');
            
            console.log('💡 Penyebab umum:');
            console.log('   1. Sender email belum terverifikasi di Resend');
            console.log('   2. Domain belum dikonfigurasi dengan benar');
            console.log('   3. Format email tidak valid\n');
            
            console.log('🔧 Solusi:');
            console.log('   1. Buka https://resend.com/domains');
            console.log('   2. Pastikan domain bimajanuri.my.id sudah verified');
            console.log('   3. Kalau belum, tambahkan DNS records yang diminta');
            console.log('   4. Tunggu 5-10 menit lalu coba lagi\n');
            
        } else if (res.statusCode === 401) {
            console.log('╔════════════════════════════════════════════════╗');
            console.log('║    ❌ ERROR 401 - Unauthorized                  ║');
            console.log('╚════════════════════════════════════════════════╝\n');
            
            console.log('💡 Penyebab: API Key tidak valid\n');
            console.log('🔧 Solusi:');
            console.log('   1. Buka https://resend.com/api-keys');
            console.log('   2. Buat API key baru');
            console.log('   3. Update di .env file\n');
            
        } else {
            console.log(`╔════════════════════════════════════════════════╗`);
            console.log(`║    ❌ ERROR ${res.statusCode} - Unknown Error                  ║`);
            console.log(`╚════════════════════════════════════════════════╝\n`);
        }
    });
});

req.on('error', (e) => {
    console.error(`❌ Request error: ${e.message}`);
});

req.write(postData);
req.end();
