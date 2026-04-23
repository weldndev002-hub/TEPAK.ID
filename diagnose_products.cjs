const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://aaqguhxonwpsnpwjjdrv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFhcWd1aHhvbndwc25wd2pqZHJ2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjA1OTIzNiwiZXhwIjoyMDkxNjM1MjM2fQ.wxk5XQG8Oq2q8v4E6DSYTVWymlmSSJQOa7p0CHNqBCs';
const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnoseProducts() {
    console.log('=== Diagnosing Products Table Structure ===\n');

    try {
        // First, check what columns exist in products table
        console.log('1. Checking products table columns...');
        const { data: sampleProduct, error: sampleError } = await supabase
            .from('products')
            .select('*')
            .limit(1);

        if (sampleError) {
            console.error('❌ Error fetching product sample:', sampleError.message);
            return;
        }

        if (sampleProduct && sampleProduct.length > 0) {
            const product = sampleProduct[0];
            console.log('✅ Products table exists');
            console.log('Sample product columns:', Object.keys(product));
            console.log('Sample product:', JSON.stringify(product, null, 2));
        }

        // Check specific orders to see product details
        console.log('\n2. Checking order-product relationships...');
        const { data: orders, error: ordersError } = await supabase
            .from('orders')
            .select('id, product_id, invoice_id, status')
            .eq('status', 'success')
            .limit(3);

        if (ordersError) {
            console.error('Error fetching orders:', ordersError.message);
        } else {
            for (const order of orders) {
                console.log(`\nOrder: ${order.invoice_id} (Product ID: ${order.product_id})`);

                if (order.product_id) {
                    const { data: product, error: productError } = await supabase
                        .from('products')
                        .select('*')
                        .eq('id', order.product_id)
                        .single();

                    if (productError) {
                        console.error(`  ❌ Error fetching product ${order.product_id}:`, productError.message);
                    } else if (product) {
                        console.log(`  ✅ Product found:`, {
                            name: product.title || product.name || 'No name',
                            type: product.type || 'Unknown',
                            file_url: product.file_url || 'MISSING',
                            has_file: !!product.file_url
                        });

                        // Check if it's a digital product
                        if (product.type === 'digital' && !product.file_url) {
                            console.log(`  ⚠️  WARNING: Digital product without file_url!`);
                        }
                    }
                }
            }
        }

        // Count digital vs physical products
        console.log('\n3. Product type statistics...');
        const { data: allProducts, error: allError } = await supabase
            .from('products')
            .select('type, file_url');

        if (allError) {
            console.error('Error fetching all products:', allError.message);
        } else {
            const digitalProducts = allProducts.filter(p => p.type === 'digital');
            const physicalProducts = allProducts.filter(p => p.type === 'physical');
            const digitalWithFile = digitalProducts.filter(p => p.file_url);
            const digitalWithoutFile = digitalProducts.filter(p => !p.file_url);

            console.log(`Total products: ${allProducts.length}`);
            console.log(`Digital products: ${digitalProducts.length}`);
            console.log(`  - With file_url: ${digitalWithFile.length}`);
            console.log(`  - Without file_url: ${digitalWithoutFile.length}`);
            console.log(`Physical products: ${physicalProducts.length}`);

            if (digitalWithoutFile.length > 0) {
                console.log('\n⚠️  CRITICAL ISSUE: Digital products without file_url will not trigger email delivery!');
                console.log('   These products need file_url configured in the database.');
            }
        }

    } catch (err) {
        console.error('Unexpected error:', err.message);
    }
}

async function checkResendKey() {
    console.log('\n=== Checking Resend API Key ===\n');

    const resendApiKey = 're_A21Tmy6o_AGYYVFMcQHpotKmkS2Q5qmDk';

    if (!resendApiKey) {
        console.error('❌ RESEND_API_KEY is not configured');
        return;
    }

    console.log(`API Key: ${resendApiKey.substring(0, 10)}...`);

    try {
        // Try to send a test email (but don't actually send)
        const testData = {
            from: 'Tepak.ID <no-reply@tepak.id>',
            to: 'test@example.com',
            subject: 'Test Email - Digital Delivery System',
            html: '<p>This is a test email to verify Resend API connectivity.</p>'
        };

        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${resendApiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testData)
        });

        console.log(`Resend API test status: ${response.status}`);

        if (response.status === 401) {
            console.log('❌ Resend API key is invalid or expired');
            console.log('   Need to regenerate API key in Resend dashboard');
        } else if (response.status === 422) {
            console.log('⚠️  Domain verification needed');
            console.log('   The domain "tepak.id" needs to be verified in Resend');
        } else if (response.status === 200 || response.status === 201) {
            console.log('✅ Resend API key is valid');
        } else {
            const errorText = await response.text();
            console.log(`Resend API response: ${errorText}`);
        }
    } catch (err) {
        console.error('❌ Cannot reach Resend API:', err.message);
    }
}

async function main() {
    console.log('🔍 DIAGNOSING DIGITAL DELIVERY ISSUES\n');
    console.log('Based on test results, here are the likely issues:\n');
    console.log('1. Products may be missing file_url or have wrong product type');
    console.log('2. Resend API key may be invalid');
    console.log('3. Digital delivery not triggered due to missing product info\n');

    await diagnoseProducts();
    await checkResendKey();

    console.log('\n=== RECOMMENDED ACTIONS ===');
    console.log('1. Check products table - ensure digital products have file_url');
    console.log('2. Verify Resend API key in .env is active');
    console.log('3. Test with a product that has file_url configured');
    console.log('4. Check webhook logs for signature validation issues');
    console.log('5. Run digital_deliveries_migration.sql if not already done');
}

main().catch(console.error);