#!/usr/bin/env node
/**
 * Test Email Digital Delivery - LOCAL TESTING
 * 
 * Usage:
 *   node test-email-local.js
 * 
 * This will:
 *   1. Create a test order in database
 *   2. Create a test customer with acepali2253@gmail.com
 *   3. Create a digital product
 *   4. Trigger digital delivery and send email
 * 
 * Make sure .env file has:
 *   - PUBLIC_SUPABASE_URL
 *   - SUPABASE_SERVICE_ROLE_KEY
 *   - RESEND_API_KEY
 *   - RESEND_SENDER_EMAIL
 *   - PUBLIC_SITE_URL=http://localhost:4321
 */

import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

// Load .env file
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Error: PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY wajib di-set di .env');
    process.exit(1);
}

if (!process.env.RESEND_API_KEY) {
    console.error('❌ Error: RESEND_API_KEY wajib di-set di .env');
    process.exit(1);
}

console.log('🔧 Konfigurasi:');
console.log(`   Supabase URL: ${supabaseUrl}`);
console.log(`   RESEND_API_KEY: ${process.env.RESEND_API_KEY.substring(0, 10)}...`);
console.log(`   SENDER_EMAIL: ${process.env.RESEND_SENDER_EMAIL}`);
console.log(`   PUBLIC_SITE_URL: ${process.env.PUBLIC_SITE_URL}`);
console.log();

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { autoRefreshToken: false, persistSession: false }
});

const TEST_EMAIL = 'acepali2253@gmail.com';
const TEST_FILE_URL = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';

async function testEmailDelivery() {
    console.log('🌱 Membuat test data...\n');
    
    try {
        // Step 1: Find merchant
        console.log('1️⃣ Mencari merchant...');
        const { data: merchant, error: merchantError } = await supabase
            .from('profiles')
            .select('id, full_name, username')
            .limit(1)
            .single();
        
        if (merchantError || !merchant) {
            console.error('❌ Tidak ada user di database. Silakan signup dulu.');
            process.exit(1);
        }
        console.log(`   ✅ Merchant: ${merchant.full_name} (${merchant.id})\n`);
        
        // Step 2: Create product
        console.log('2️⃣ Membuat produk digital...');
        const productId = randomUUID();
        const { error: productError } = await supabase
            .from('products')
            .insert({
                id: productId,
                merchant_id: merchant.id,
                title: 'E-Book: Test Digital Marketing',
                description: 'E-book test untuk pengiriman email.',
                price: 10000,
                type: 'digital',
                status: 'published',
                file_url: TEST_FILE_URL,
                cover_url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=400&fit=crop',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            });
        
        if (productError) throw productError;
        console.log(`   ✅ Product ID: ${productId}\n`);
        
        // Step 3: Create customer
        console.log('3️⃣ Membuat customer test...');
        const customerId = randomUUID();
        const { error: customerError } = await supabase
            .from('customers')
            .insert({
                id: customerId,
                merchant_id: merchant.id,
                email: TEST_EMAIL,
                name: 'Acep Ali',
                phone: '081234567890',
                created_at: new Date().toISOString()
            });
        
        if (customerError) throw customerError;
        console.log(`   ✅ Customer: ${TEST_EMAIL} (${customerId})\n`);
        
        // Step 4: Create order (paid)
        console.log('4️⃣ Membuat order (status: success)...');
        const orderId = randomUUID();
        const invoiceId = `TEST-${Date.now()}`;
        
        const { error: orderError } = await supabase
            .from('orders')
            .insert({
                id: orderId,
                invoice_id: invoiceId,
                merchant_id: merchant.id,
                customer_id: customerId,
                product_id: productId,
                amount: 10000,
                platform_fee: 500,
                net_amount: 9500,
                status: 'success',
                payment_method: 'test',
                paid_at: new Date().toISOString(),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            });
        
        if (orderError) throw orderError;
        console.log(`   ✅ Order ID: ${orderId}`);
        console.log(`   ✅ Invoice: ${invoiceId}\n`);
        
        // Step 5: Import and call digital-delivery.ts
        console.log('5️⃣ Mengirim email digital delivery...\n');
        
        try {
            // Dynamic import untuk TypeScript module
            const { createDigitalDelivery } = await import('./src/lib/digital-delivery.ts');
            
            const siteUrl = process.env.PUBLIC_SITE_URL || 'http://localhost:4321';
            
            console.log('   📧 Mengirim ke:', TEST_EMAIL);
            console.log('   🔗 Site URL:', siteUrl);
            console.log('   📄 File:', TEST_FILE_URL);
            console.log();
            
            const result = await createDigitalDelivery(
                orderId,
                TEST_EMAIL,
                TEST_FILE_URL,
                siteUrl
            );
            
            console.log('📬 Hasil:');
            console.log('   Success:', result.success);
            console.log('   Token:', result.token);
            console.log('   Email Sent:', result.emailSent);
            
            if (result.emailError) {
                console.log('   ❌ Email Error:', result.emailError);
            }
            
            if (result.token) {
                console.log('\n🔗 Link Download (buka di browser):');
                console.log(`${siteUrl}/digital-delivery/${result.token}?email=${encodeURIComponent(TEST_EMAIL)}`);
            }
            
            console.log('\n' + '='.repeat(60));
            if (result.success && result.emailSent) {
                console.log('✅ BERHASIL! Email sudah dikirim ke acepali2253@gmail.com');
                console.log('   Silakan cek inbox (termasuk folder spam/promosi)');
            } else {
                console.log('❌ GAGAL! Email tidak terkirim.');
                console.log('   Error:', result.error || result.emailError);
            }
            console.log('='.repeat(60));
            
        } catch (importErr) {
            console.error('❌ Error importing digital-delivery module:', importErr.message);
            console.log('\n💡 Coba cara manual dengan curl:');
            console.log('   1. Jalankan: npm run dev');
            console.log('   2. Login ke aplikasi');
            console.log('   3. Buka browser dev tools → Application → Cookies');
            console.log('   4. Copy auth token');
            console.log('   5. Jalankan curl (lihat di test-email-local-curl.md)');
        }
        
        // Cleanup option
        console.log('\n🧹 Cleanup (hapus test data):');
        console.log(`   DELETE FROM orders WHERE id = '${orderId}';`);
        console.log(`   DELETE FROM customers WHERE id = '${customerId}';`);
        console.log(`   DELETE FROM products WHERE id = '${productId}';`);
        
    } catch (err) {
        console.error('\n❌ Error:', err);
        process.exit(1);
    }
}

testEmailDelivery();
