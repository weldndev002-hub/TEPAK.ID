#!/usr/bin/env node
/**
 * Fix File URL for Digital Delivery
 * Ensures file_url is a valid accessible URL
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

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { autoRefreshToken: false, persistSession: false }
});

const CUSTOMER_EMAIL = 'acepali2253@gmail.com';

async function main() {
    console.log('🔧 Fixing File URL for Digital Delivery\n');
    console.log('=' .repeat(60));
    
    // Find latest delivery for this customer
    const { data: delivery, error } = await supabase
        .from('digital_deliveries')
        .select('*, orders(product_id, products(file_url, title))')
        .eq('accessed_email', CUSTOMER_EMAIL)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
    
    if (error || !delivery) {
        console.log('❌ No delivery found');
        return;
    }
    
    console.log('Delivery ID:', delivery.id);
    console.log('Token:', delivery.token);
    console.log('Current file_url:', delivery.file_url);
    console.log('Product:', delivery.orders?.products?.title);
    console.log();
    
    // Check if file_url is valid
    const fileUrl = delivery.file_url;
    
    if (!fileUrl) {
        console.log('❌ File URL is empty!');
        console.log('Need to upload file to Supabase Storage and update database.');
        return;
    }
    
    // Test if URL is accessible
    console.log('Testing file accessibility...\n');
    
    // If it's a relative path, construct full URL
    let testUrl = fileUrl;
    if (fileUrl.startsWith('assets/') || !fileUrl.startsWith('http')) {
        // This is a relative path - need to convert
        console.log('⚠️  File URL is relative:', fileUrl);
        console.log('   Trying to construct Supabase Storage URL...\n');
        
        // Try to find in Supabase Storage
        const bucket = 'products';  // or your bucket name
        const path = fileUrl.replace(/^assets\//, '');
        
        // Generate signed URL
        const { data: signedData, error: signError } = await supabase
            .storage
            .from(bucket)
            .createSignedUrl(path, 3600);  // 1 hour
        
        if (signError) {
            console.log('❌ Failed to generate signed URL:', signError.message);
            console.log('\n🔧 SOLUTION: Upload file manually to Supabase Storage');
            console.log('   Then update products.file_url with full URL');
            return;
        }
        
        testUrl = signedData.signedUrl;
        console.log('✅ Generated signed URL:', testUrl.substring(0, 100) + '...\n');
        
        // Update delivery with signed URL
        const { error: updateError } = await supabase
            .from('digital_deliveries')
            .update({ signed_url: testUrl })
            .eq('id', delivery.id);
        
        if (updateError) {
            console.log('❌ Failed to update delivery:', updateError.message);
        } else {
            console.log('✅ Updated delivery with signed URL\n');
        }
    } else if (fileUrl.includes('supabase.co')) {
        // It's a Supabase URL - generate fresh signed URL
        console.log('✅ Detected Supabase Storage URL');
        
        // Extract bucket and path
        try {
            const url = new URL(fileUrl);
            const pathParts = url.pathname.split('/');
            const objectIndex = pathParts.indexOf('object');
            
            if (objectIndex !== -1 && pathParts[objectIndex + 2]) {
                const bucket = pathParts[objectIndex + 2];
                const filePath = pathParts.slice(objectIndex + 3).join('/');
                
                console.log('   Bucket:', bucket);
                console.log('   Path:', filePath);
                
                const { data: signedData, error: signError } = await supabase
                    .storage
                    .from(bucket)
                    .createSignedUrl(filePath, 3600);
                
                if (!signError && signedData) {
                    console.log('✅ Generated fresh signed URL\n');
                    
                    // Update delivery
                    await supabase
                        .from('digital_deliveries')
                        .update({ signed_url: signedData.signedUrl })
                        .eq('id', delivery.id);
                    
                    testUrl = signedData.signedUrl;
                }
            }
        } catch (e) {
            console.log('❌ Error parsing URL:', e.message);
        }
    }
    
    // Final download URL for testing
    const downloadUrl = `${process.env.PUBLIC_SITE_URL || 'http://localhost:4321'}/digital-delivery/${delivery.token}?email=${encodeURIComponent(CUSTOMER_EMAIL)}`;
    
    console.log('=' .repeat(60));
    console.log('\n📋 Summary:');
    console.log('   Token:', delivery.token);
    console.log('   File URL:', fileUrl.substring(0, 50) + '...');
    console.log('   Test URL:', downloadUrl);
    console.log();
    console.log('⚠️  If download still fails:');
    console.log('   1. Check if file exists in Supabase Storage');
    console.log('   2. Verify bucket permissions are public');
    console.log('   3. Or use a test file with public URL');
    console.log();
}

main();
