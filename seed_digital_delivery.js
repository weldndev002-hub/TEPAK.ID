#!/usr/bin/env node
/**
 * Seed Test Data for Digital Delivery Testing
 * 
 * Usage:
 *   node seed_digital_delivery.js
 * 
 * Make sure to set environment variables:
 *   - PUBLIC_SUPABASE_URL
 *   - SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

// Get env vars
const supabaseUrl = process.env.PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseKey || supabaseKey === 'your-service-role-key') {
    console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY is required');
    console.error('Please set it in your environment or .env file');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

const TEST_EMAIL = 'acepali2253@gmail.com';
const TEST_FILE_URL = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';

async function seedTestData() {
    console.log('🌱 Seeding test data for digital delivery...\n');
    
    try {
        // ======================================================================
        // Step 1: Find or create merchant
        // ======================================================================
        console.log('Step 1: Finding merchant...');
        const { data: existingUser, error: userError } = await supabase
            .from('profiles')
            .select('id, full_name')
            .limit(1)
            .single();
        
        if (userError || !existingUser) {
            console.error('❌ No user found. Please sign up/create a user first.');
            process.exit(1);
        }
        
        const merchantId = existingUser.id;
        console.log(`   ✓ Found merchant: ${existingUser.full_name} (${merchantId})`);
        
        // ======================================================================
        // Step 2: Create test product
        // ======================================================================
        console.log('\nStep 2: Creating test digital product...');
        const productId = randomUUID();
        
        const { error: productError } = await supabase
            .from('products')
            .insert({
                id: productId,
                merchant_id: merchantId,
                title: 'E-Book: Panduan Digital Marketing',
                description: 'E-book premium dengan 100+ halaman panduan lengkap.',
                price: 50000,
                type: 'digital',
                status: 'published',
                file_url: TEST_FILE_URL,
                cover_url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=400&fit=crop',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            });
        
        if (productError) {
            console.error('   ✗ Error creating product:', productError.message);
            process.exit(1);
        }
        console.log(`   ✓ Created product: ${productId}`);
        
        // ======================================================================
        // Step 3: Create test customer
        // ======================================================================
        console.log('\nStep 3: Creating test customer...');
        const customerId = randomUUID();
        
        const { error: customerError } = await supabase
            .from('customers')
            .insert({
                id: customerId,
                merchant_id: merchantId,
                email: TEST_EMAIL,
                name: 'Test Buyer',
                phone: '081234567890',
                created_at: new Date().toISOString()
            });
        
        if (customerError) {
            console.error('   ✗ Error creating customer:', customerError.message);
            process.exit(1);
        }
        console.log(`   ✓ Created customer: ${customerId}`);
        
        // ======================================================================
        // Step 4: Create test order (paid status)
        // ======================================================================
        console.log('\nStep 4: Creating test order (paid)...');
        const orderId = randomUUID();
        const invoiceId = `INV-TEST-${Date.now()}`;
        
        const { error: orderError } = await supabase
            .from('orders')
            .insert({
                id: orderId,
                invoice_id: invoiceId,
                merchant_id: merchantId,
                customer_id: customerId,
                product_id: productId,
                amount: 50000,
                platform_fee: 2500,
                net_amount: 47500,
                status: 'success',
                payment_method: 'test_payment',
                paid_at: new Date().toISOString(),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            });
        
        if (orderError) {
            console.error('   ✗ Error creating order:', orderError.message);
            process.exit(1);
        }
        console.log(`   ✓ Created order: ${orderId}`);
        console.log(`   ✓ Invoice ID: ${invoiceId}`);
        
        // ======================================================================
        // Step 5: Create digital delivery record
        // ======================================================================
        console.log('\nStep 5: Creating digital delivery record...');
        const token = `dd_${Date.now()}_test123`;
        
        // Clean up old test with same token
        await supabase
            .from('digital_deliveries')
            .delete()
            .eq('token', token);
        
        const { error: deliveryError } = await supabase
            .from('digital_deliveries')
            .insert({
                order_id: orderId,
                token: token,
                file_url: TEST_FILE_URL,
                signed_url: TEST_FILE_URL,
                expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                accessed_email: TEST_EMAIL,
                access_count: 0,
                created_at: new Date().toISOString()
            });
        
        if (deliveryError) {
            console.error('   ✗ Error creating delivery:', deliveryError.message);
            process.exit(1);
        }
        console.log(`   ✓ Created delivery with token: ${token}`);
        
        // ======================================================================
        // Output URLs
        // ======================================================================
        console.log('\n' + '='.repeat(60));
        console.log('✅ TEST DATA CREATED SUCCESSFULLY!');
        console.log('='.repeat(60));
        console.log('\n📧 Test Email:', TEST_EMAIL);
        console.log('🔑 Token:', token);
        console.log('\n🔗 LOCAL TEST URL:');
        console.log(`   http://localhost:4321/digital-delivery/${token}?email=${encodeURIComponent(TEST_EMAIL)}`);
        console.log('\n🔗 PRODUCTION TEST URL:');
        console.log(`   https://tepak.id/digital-delivery/${token}?email=${encodeURIComponent(TEST_EMAIL)}`);
        console.log('\n🔗 ALTERNATIVE (with localhost):');
        console.log(`   http://127.0.0.1:4321/digital-delivery/${token}?email=${encodeURIComponent(TEST_EMAIL)}`);
        console.log('\n' + '='.repeat(60));
        
        // Test variations
        console.log('\n🧪 TEST SCENARIOS:');
        console.log('-'.repeat(40));
        console.log('1. ✅ CORRECT EMAIL:');
        console.log(`   http://localhost:4321/digital-delivery/${token}?email=${encodeURIComponent(TEST_EMAIL)}`);
        console.log('\n2. ❌ WRONG EMAIL (should show error page):');
        console.log(`   http://localhost:4321/digital-delivery/${token}?email=wrong@email.com`);
        console.log('\n3. ❌ MISSING EMAIL (should redirect to error):');
        console.log(`   http://localhost:4321/digital-delivery/${token}`);
        console.log('\n4. ❌ INVALID TOKEN (should show error):');
        console.log(`   http://localhost:4321/digital-delivery/invalid_token?email=${encodeURIComponent(TEST_EMAIL)}`);
        console.log('\n' + '='.repeat(60));
        
    } catch (err) {
        console.error('\n❌ Unexpected error:', err);
        process.exit(1);
    }
}

// Run
seedTestData();
