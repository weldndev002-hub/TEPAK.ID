// Test script untuk memverifikasi digital delivery dan email sending
const { createClient } = require('@supabase/supabase-js');

// Konfigurasi dari .env
const supabaseUrl = 'https://aaqguhxonwpsnpwjjdrv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFhcWd1aHhvbndwc25wd2pqZHJ2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjA1OTIzNiwiZXhwIjoyMDkxNjM1MjM2fQ.wxk5XQG8Oq2q8v4E6DSYTVWymlmSSJQOa7p0CHNqBCs';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDatabaseConnection() {
    console.log('=== Testing Database Connection ===');
    try {
        // Test connection to digital_deliveries table
        const { data, error } = await supabase
            .from('digital_deliveries')
            .select('count')
            .limit(1);

        if (error) {
            console.error('❌ Error accessing digital_deliveries table:', error.message);
            console.error('Error details:', error.details);
            console.error('Error code:', error.code);

            // Check if table exists by trying to insert a test record
            console.log('Trying to insert test record...');
            const testData = {
                order_id: '00000000-0000-0000-0000-000000000000',
                token: 'test_token_' + Date.now(),
                file_url: 'https://example.com/test.pdf',
                signed_url: 'https://example.com/test.pdf',
                expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                accessed_email: 'test@example.com'
            };

            const { error: insertError } = await supabase
                .from('digital_deliveries')
                .insert(testData);

            if (insertError) {
                console.error('❌ Insert failed:', insertError.message);
                console.log('Possible RLS policy issue. Check migration SQL.');
            } else {
                console.log('✅ Test insert successful - table exists and RLS allows insert');
            }
        } else {
            console.log('✅ digital_deliveries table accessible');
        }
    } catch (err) {
        console.error('❌ Unexpected error:', err.message);
    }
}

async function checkRecentOrders() {
    console.log('\n=== Checking Recent Successful Orders ===');
    try {
        const { data: orders, error } = await supabase
            .from('orders')
            .select('id, invoice_id, status, customer_id, product_id, created_at')
            .eq('status', 'success')
            .order('created_at', { ascending: false })
            .limit(5);

        if (error) {
            console.error('Error fetching orders:', error.message);
            return;
        }

        console.log(`Found ${orders.length} successful orders`);

        for (const order of orders) {
            console.log(`\nOrder: ${order.invoice_id} (${order.id})`);
            console.log(`  Created: ${order.created_at}`);

            // Get customer email
            const { data: customer } = await supabase
                .from('customers')
                .select('email')
                .eq('id', order.customer_id)
                .single();

            // Get product details
            const { data: product } = await supabase
                .from('products')
                .select('type, file_url, name')
                .eq('id', order.product_id)
                .single();

            console.log(`  Customer: ${customer?.email || 'Unknown'}`);
            console.log(`  Product: ${product?.name || 'Unknown'} (${product?.type || 'Unknown'})`);
            console.log(`  File URL: ${product?.file_url ? 'Present' : 'Missing'}`);

            // Check for digital delivery
            const { data: delivery } = await supabase
                .from('digital_deliveries')
                .select('id, token, created_at')
                .eq('order_id', order.id)
                .limit(1);

            console.log(`  Digital deliveries: ${delivery?.length || 0}`);
        }
    } catch (err) {
        console.error('Error checking orders:', err.message);
    }
}

async function checkProducts() {
    console.log('\n=== Checking Digital Products ===');
    try {
        const { data: products, error } = await supabase
            .from('products')
            .select('id, name, type, file_url')
            .eq('type', 'digital')
            .limit(5);

        if (error) {
            console.error('Error fetching products:', error.message);
            return;
        }

        console.log(`Found ${products.length} digital products`);

        for (const product of products) {
            console.log(`\nProduct: ${product.name} (${product.id})`);
            console.log(`  File URL: ${product.file_url || 'MISSING'}`);

            if (!product.file_url) {
                console.log('  ⚠️  WARNING: Digital product missing file_url!');
            }
        }
    } catch (err) {
        console.error('Error checking products:', err.message);
    }
}

async function testEmailConfiguration() {
    console.log('\n=== Testing Email Configuration ===');

    // Check if Resend API key is configured
    const resendApiKey = 're_A21Tmy6o_AGYYVFMcQHpotKmkS2Q5qmDk';

    if (!resendApiKey) {
        console.error('❌ RESEND_API_KEY is not configured in environment');
        return;
    }

    console.log(`✅ Resend API Key: ${resendApiKey.substring(0, 10)}...`);
    console.log('  Note: Actual email sending requires valid domain verification in Resend');

    // Test Resend API connectivity
    try {
        const response = await fetch('https://api.resend.com/emails', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${resendApiKey}`,
            }
        });

        console.log(`Resend API GET test status: ${response.status}`);

        if (response.status === 401) {
            console.log('⚠️  Resend API key may be invalid or expired');
        } else if (response.status === 200 || response.status === 404) {
            console.log('✅ Resend API is reachable');
        }
    } catch (err) {
        console.error('❌ Cannot reach Resend API:', err.message);
    }
}

async function runAllTests() {
    console.log('🚀 Starting Digital Delivery System Tests\n');

    await testDatabaseConnection();
    await checkRecentOrders();
    await checkProducts();
    await testEmailConfiguration();

    console.log('\n=== Recommendations ===');
    console.log('1. Pastikan tabel digital_deliveries sudah dibuat dengan migration SQL');
    console.log('2. Verifikasi RLS policies mengizinkan insert dari service_role');
    console.log('3. Pastikan produk digital memiliki file_url yang valid');
    console.log('4. Verifikasi Resend API key dan domain no-reply@tepak.id');
    console.log('5. Test webhook dengan simulate_webhook.js di folder scratch');
    console.log('\nUntuk test email aktual, gunakan script simulate_webhook.js');
}

runAllTests().catch(console.error);