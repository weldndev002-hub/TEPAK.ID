#!/usr/bin/env node
/**
 * Fix Missing Digital Delivery Emails
 * Creates digital delivery records and sends emails for existing paid orders
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Load .env
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

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const SENDER_EMAIL = process.env.RESEND_SENDER_EMAIL;
const SITE_URL = process.env.PUBLIC_SITE_URL || 'http://localhost:4321';

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials');
    process.exit(1);
}

if (!RESEND_API_KEY || !SENDER_EMAIL) {
    console.error('❌ Missing Resend credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { autoRefreshToken: false, persistSession: false }
});

const TEST_EMAIL = 'acepali2253@gmail.com';

// Generate token
function generateToken() {
    return 'dd_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15);
}

// Send email via Resend
function sendEmail(to, subject, html, text) {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify({
            from: `Tepak.ID <${SENDER_EMAIL}>`,
            to,
            subject,
            html,
            text
        });
        
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
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    resolve({ status: res.statusCode, result });
                } catch (e) {
                    resolve({ status: res.statusCode, result: data });
                }
            });
        });
        req.on('error', reject);
        req.write(postData);
        req.end();
    });
}

async function fixMissingDeliveries() {
    console.log('🔧 Fixing Missing Digital Delivery Emails\n');
    console.log('='.repeat(60));
    
    // Find paid orders without digital deliveries
    console.log('\n1️⃣ Finding paid orders without digital deliveries...\n');
    
    // First get the customer
    const { data: customer } = await supabase
        .from('customers')
        .select('id')
        .eq('email', TEST_EMAIL)
        .maybeSingle();
    
    if (!customer) {
        console.log('❌ No customer found with this email');
        return;
    }
    
    // Get all orders for this customer with products
    const { data: orders, error } = await supabase
        .from('orders')
        .select(`
            id,
            invoice_id,
            status,
            customer_id,
            product_id,
            created_at,
            customers!inner(email, name),
            products!inner(type, file_url, title)
        `)
        .eq('customer_id', customer.id)
        .eq('status', 'success')
        .order('created_at', { ascending: false });
    
    if (error) {
        console.log('❌ Error:', error.message);
        return;
    }
    
    if (!orders || orders.length === 0) {
        console.log('❌ No paid orders found for this email');
        return;
    }
    
    console.log(`✅ Found ${orders.length} paid order(s)\n`);
    
    for (const order of orders) {
        console.log('─'.repeat(60));
        console.log(`Order: ${order.invoice_id}`);
        console.log(`Product: ${order.products?.title}`);
        console.log(`Customer: ${order.customers?.email}`);
        
        // Check if already has delivery
        const { data: existing } = await supabase
            .from('digital_deliveries')
            .select('id, token, created_at')
            .eq('order_id', order.id)
            .maybeSingle();
        
        if (existing) {
            console.log(`\n✅ Already has digital delivery (created: ${existing.created_at})`);
            console.log(`   Token: ${existing.token}`);
            console.log(`   URL: ${SITE_URL}/digital-delivery/${existing.token}?email=${encodeURIComponent(TEST_EMAIL)}`);
            continue;
        }
        
        // Create digital delivery
        console.log('\n2️⃣ Creating digital delivery record...');
        
        const token = generateToken();
        const fileUrl = order.products?.file_url;
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        
        const { data: delivery, error: deliveryError } = await supabase
            .from('digital_deliveries')
            .insert({
                order_id: order.id,
                token: token,
                file_url: fileUrl,
                signed_url: fileUrl, // In production, this would be a fresh signed URL
                expires_at: expiresAt.toISOString(),
                accessed_email: TEST_EMAIL,
                access_count: 0,
                created_at: new Date().toISOString()
            })
            .select()
            .single();
        
        if (deliveryError) {
            console.log(`❌ Failed to create delivery: ${deliveryError.message}`);
            continue;
        }
        
        console.log(`✅ Created delivery with token: ${token}`);
        
        // Send email
        console.log('\n3️⃣ Sending email...');
        
        const downloadUrl = `${SITE_URL}/digital-delivery/${token}?email=${encodeURIComponent(TEST_EMAIL)}`;
        
        const emailHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; }
        .content { padding: 40px 30px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
        .info-box { background: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; }
        .footer { background: #f8f9fa; padding: 30px; text-align: center; font-size: 14px; color: #666; border-top: 1px solid #eee; }
        code { background: #e9ecef; padding: 3px 8px; border-radius: 4px; font-family: monospace; word-break: break-all; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Pembayaran Berhasil!</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Produk digital Anda siap diunduh</p>
        </div>
        <div class="content">
            <h2>Halo ${order.customers?.name || ''},</h2>
            <p>Terima kasih telah melakukan pembelian <strong>${order.products?.title}</strong> di <strong>Tepak.ID</strong>.</p>
            <div style="text-align: center;">
                <a href="${downloadUrl}" class="button">📥 Unduh Produk Sekarang</a>
            </div>
            <div class="info-box">
                <p><strong>Detail:</strong></p>
                <ul>
                    <li>Tautan berlaku <strong>7 hari</strong></li>
                    <li>Hanya untuk email: <code>${TEST_EMAIL}</code></li>
                </ul>
                <code style="display: block; margin-top: 10px; padding: 10px;">${downloadUrl}</code>
            </div>
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Tepak.ID</p>
        </div>
    </div>
</body>
</html>`;
        
        const emailText = `Pembayaran Berhasil!\n\nProduk: ${order.products?.title}\n\nDownload: ${downloadUrl}\n\nBerlaku 7 hari untuk email: ${TEST_EMAIL}`;
        
        try {
            const emailResult = await sendEmail(
                TEST_EMAIL,
                '📥 Tautan Unduhan Produk Digital - Tepak.ID',
                emailHtml,
                emailText
            );
            
            if (emailResult.status === 200 || emailResult.status === 201) {
                console.log(`✅ Email sent! ID: ${emailResult.result.id}`);
            } else {
                console.log(`❌ Email failed: ${emailResult.status}`);
                console.log(`   ${JSON.stringify(emailResult.result)}`);
            }
        } catch (err) {
            console.log(`❌ Email error: ${err.message}`);
        }
        
        console.log(`\n🔗 Download URL:`);
        console.log(`   ${downloadUrl}`);
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('\n✅ Done! Check your email inbox.');
    console.log('   If not in inbox, check spam/promotions folder.\n');
}

fixMissingDeliveries();
