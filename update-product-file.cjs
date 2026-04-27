#!/usr/bin/env node
/**
 * Update Product File URL to Public Test PDF
 */

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

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { autoRefreshToken: false, persistSession: false }
});

const PUBLIC_PDF_URL = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';

async function main() {
    console.log('🔧 Updating Product File URL\n');
    console.log('=' .repeat(60));
    
    // Find product "aaaaa"
    const { data: product, error: findError } = await supabase
        .from('products')
        .select('id, title, file_url, type')
        .eq('title', 'aaaaa')
        .limit(1)
        .single();
    
    if (findError || !product) {
        console.log('❌ Product not found');
        return;
    }
    
    console.log('Product found:');
    console.log('  ID:', product.id);
    console.log('  Title:', product.title);
    console.log('  Current file_url:', product.file_url);
    console.log('  Type:', product.type);
    console.log();
    
    // Update file_url
    console.log('Updating to public PDF URL...');
    console.log('  New URL:', PUBLIC_PDF_URL);
    console.log();
    
    const { error: updateError } = await supabase
        .from('products')
        .update({ 
            file_url: PUBLIC_PDF_URL,
            updated_at: new Date().toISOString()
        })
        .eq('id', product.id);
    
    if (updateError) {
        console.log('❌ Failed to update:', updateError.message);
        return;
    }
    
    console.log('✅ Product updated successfully!\n');
    
    // Also update all digital_deliveries for this product's orders
    const { data: orders } = await supabase
        .from('orders')
        .select('id')
        .eq('product_id', product.id);
    
    if (orders && orders.length > 0) {
        const orderIds = orders.map(o => o.id);
        
        const { error: deliveryError } = await supabase
            .from('digital_deliveries')
            .update({ 
                file_url: PUBLIC_PDF_URL,
                signed_url: PUBLIC_PDF_URL
            })
            .in('order_id', orderIds);
        
        if (deliveryError) {
            console.log('⚠️  Could not update deliveries:', deliveryError.message);
        } else {
            console.log('✅ Updated', orderIds.length, 'digital delivery records\n');
        }
    }
    
    console.log('=' .repeat(60));
    console.log('\n📋 Summary:');
    console.log('   Product file_url updated to public PDF');
    console.log('   URL:', PUBLIC_PDF_URL);
    console.log('\n🔗 Test Download:');
    console.log('   Use the delivery token to test download');
    console.log('   File should now be accessible!\n');
}

main();
