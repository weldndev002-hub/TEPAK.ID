#!/usr/bin/env node
/**
 * Fix Digital Delivery and Resend Email
 * Uses customer's actual email from order
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

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const API_KEY = process.env.RESEND_API_KEY;
const FROM = process.env.RESEND_SENDER_EMAIL || 'noreply@bimajanuri.my.id';
const SITE_URL = process.env.PUBLIC_SITE_URL || 'http://localhost:4321';

if (!supabaseUrl || !supabaseKey || !API_KEY) {
    console.error('❌ Missing credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { autoRefreshToken: false, persistSession: false }
});

// Use verified email for testing (Resend restriction)
const CUSTOMER_EMAIL = 'acepali2253@gmail.com';  // Actual buyer email
const VERIFIED_EMAIL = 'mail@bimajanuri.my.id';  // For Resend testing

function generateToken() {
    return 'dd_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15);
}

function sendEmail(to, subject, html) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({
            from: `Tepak.ID <${FROM}>`,
            to,
            subject,
            html
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
                    resolve({ status: res.statusCode, data: JSON.parse(body) });
                } catch (e) {
                    resolve({ status: res.statusCode, data: body });
                }
            });
        });
        req.on('error', reject);
        req.write(data);
        req.end();
    });
}

async function main() {
    console.log('🔧 Fixing Digital Delivery & Resending Email\n');
    console.log('=' .repeat(60));
    
    // Find customer
    const { data: customer } = await supabase
        .from('customers')
        .select('id, email, name, merchant_id')
        .eq('email', CUSTOMER_EMAIL)
        .maybeSingle();
    
    if (!customer) {
        console.log('❌ Customer not found:', CUSTOMER_EMAIL);
        return;
    }
    
    console.log('Customer:', customer.name, `(${customer.email})`);
    
    // Find paid order
    const { data: order } = await supabase
        .from('orders')
        .select('*, products(title, file_url, type)')
        .eq('customer_id', customer.id)
        .eq('status', 'success')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
    
    if (!order) {
        console.log('❌ No paid order found');
        return;
    }
    
    console.log('Order:', order.invoice_id);
    console.log('Product:', order.products?.title);
    
    // Delete old deliveries for this order
    const { error: deleteError } = await supabase
        .from('digital_deliveries')
        .delete()
        .eq('order_id', order.id);
    
    if (deleteError) {
        console.log('Warning: Could not delete old deliveries:', deleteError.message);
    }
    
    // Create new delivery
    const token = generateToken();
    const fileUrl = order.products?.file_url;
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    
    // IMPORTANT: Store the ACTUAL customer email (acepali2253@gmail.com)
    // This is what will be checked when accessing the download page
    const { data: delivery, error: deliveryError } = await supabase
        .from('digital_deliveries')
        .insert({
            order_id: order.id,
            token: token,
            file_url: fileUrl,
            signed_url: fileUrl,
            expires_at: expiresAt,
            accessed_email: CUSTOMER_EMAIL,  // Store actual buyer email
            access_count: 0,
            created_at: new Date().toISOString()
        })
        .select()
        .single();
    
    if (deliveryError) {
        console.log('❌ Failed to create delivery:', deliveryError.message);
        return;
    }
    
    console.log('\n✅ Created delivery:', token);
    
    // Generate download URL with ACTUAL customer email
    const downloadUrl = `${SITE_URL}/digital-delivery/${token}?email=${encodeURIComponent(CUSTOMER_EMAIL)}`;
    
    // Send email to VERIFIED email (Resend restriction)
    // But include the actual customer email in the content
    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; }
        .content { padding: 40px 30px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
        .info-box { background: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; }
        .warning { background: #fff3cd; border: 1px solid #ffeaa7; color: #856404; padding: 15px; border-radius: 8px; margin: 20px 0; }
        code { background: #e9ecef; padding: 3px 8px; border-radius: 4px; font-family: monospace; word-break: break-all; }
        .footer { background: #f8f9fa; padding: 30px; text-align: center; font-size: 14px; color: #666; border-top: 1px solid #eee; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Pembayaran Berhasil!</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Produk digital Anda siap diunduh</p>
        </div>
        <div class="content">
            <h2>Halo ${customer.name},</h2>
            <p>Terima kasih telah melakukan pembelian <strong>${order.products?.title}</strong> di <strong>Tepak.ID</strong>.</p>
            
            <div class="warning">
                <strong>📧 Info:</strong> Email ini dikirim ke alamat verified untuk testing. <br>
                Email customer asli: <code>${CUSTOMER_EMAIL}</code>
            </div>
            
            <div style="text-align: center;">
                <a href="${downloadUrl}" class="button">📥 Unduh Produk Sekarang</a>
            </div>
            
            <div class="info-box">
                <p><strong>Detail Pengunduhan:</strong></p>
                <ul style="margin: 10px 0; padding-left: 20px;">
                    <li>Tautan berlaku selama <strong>7 hari</strong></li>
                    <li>Tautan hanya dapat diakses dengan email: <code>${CUSTOMER_EMAIL}</code></li>
                    <li>Jika tombol tidak berfungsi, salin URL ini:</li>
                </ul>
                <code style="display: block; margin-top: 10px; padding: 10px; background: #e9ecef; border-radius: 4px; font-size: 12px;">${downloadUrl}</code>
            </div>
            
            <p style="margin-top: 30px;">Jika mengalami masalah, silakan hubungi support kami.</p>
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Tepak.ID. Semua hak dilindungi undang-undang.</p>
        </div>
    </div>
</body>
</html>`;
    
    console.log('\n📧 Sending email to verified address:', VERIFIED_EMAIL);
    console.log('   (Resend testing mode - can only send to verified domain)');
    console.log('   Customer email stored in DB:', CUSTOMER_EMAIL);
    
    try {
        const result = await sendEmail(VERIFIED_EMAIL, '📥 Tautan Unduhan Produk Digital - Tepak.ID', html);
        
        if (result.status === 200 || result.status === 201) {
            console.log('\n✅ SUCCESS! Email ID:', result.data.id);
        } else {
            console.log('\n❌ Failed:', result.data.message || result.data);
        }
    } catch (err) {
        console.log('\n❌ Error:', err.message);
    }
    
    console.log('\n' + '=' .repeat(60));
    console.log('\n🔗 Download URL (dengan email customer):');
    console.log('   ' + downloadUrl);
    console.log('\n📋 Catatan:');
    console.log('   • Buka link di atas untuk test download');
    console.log('   • Email harus cocok: ' + CUSTOMER_EMAIL);
    console.log('   • Kalau ganti email di URL, akan redirect ke error page');
    console.log('   • Check inbox: ' + VERIFIED_EMAIL);
}

main();
