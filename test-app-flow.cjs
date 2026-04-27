#!/usr/bin/env node
/**
 * Test Digital Delivery Flow (App Simulation)
 * Simulates what the app does when order is paid
 */

const fs = require('fs');
const path = require('path');

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

// Now import supabase
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { autoRefreshToken: false, persistSession: false }
});

const TEST_EMAIL = 'acepali2253@gmail.com';

async function testAppFlow() {
    console.log('🧪 Testing Digital Delivery App Flow\n');
    console.log('='.repeat(60));
    
    // Step 1: Find recent orders for this email
    console.log('\n1️⃣ Checking orders for acepali2253@gmail.com...\n');
    
    const { data: orders, error: orderError } = await supabase
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
        .eq('customers.email', TEST_EMAIL)
        .order('created_at', { ascending: false })
        .limit(5);
    
    if (orderError) {
        console.log('❌ Error:', orderError.message);
        return;
    }
    
    if (!orders || orders.length === 0) {
        console.log('❌ No orders found for this email!');
        console.log('\n💡 You need to create test data first:');
        console.log('   Run: node seed_digital_delivery.js\n');
        return;
    }
    
    console.log(`✅ Found ${orders.length} order(s)\n`);
    
    for (const order of orders) {
        console.log('─'.repeat(60));
        console.log(`Order: ${order.invoice_id}`);
        console.log(`Status: ${order.status}`);
        console.log(`Product: ${order.products?.title}`);
        console.log(`Type: ${order.products?.type}`);
        console.log(`Has File URL: ${order.products?.file_url ? 'Yes' : 'No'}`);
        console.log(`Customer: ${order.customers?.email}`);
        
        // Check if digital delivery exists
        const { data: delivery, error: deliveryError } = await supabase
            .from('digital_deliveries')
            .select('*')
            .eq('order_id', order.id)
            .maybeSingle();
        
        if (deliveryError) {
            console.log(`❌ Error checking delivery: ${deliveryError.message}`);
        } else if (delivery) {
            console.log(`\n📬 Digital Delivery:`);
            console.log(`   Token: ${delivery.token}`);
            console.log(`   Email: ${delivery.accessed_email}`);
            console.log(`   Expires: ${delivery.expires_at}`);
            console.log(`   Created: ${delivery.created_at}`);
            console.log(`   Access Count: ${delivery.access_count}`);
            
            const testUrl = `http://localhost:4321/digital-delivery/${delivery.token}?email=${encodeURIComponent(TEST_EMAIL)}`;
            console.log(`\n🔗 Test URL:`);
            console.log(`   ${testUrl}`);
        } else {
            console.log(`\n⚠️ No digital delivery record found!`);
            console.log(`   This means the webhook didn't trigger or failed.`);
        }
    }
    
    console.log('\n' + '='.repeat(60));
    
    // Step 2: Check webhook simulation
    console.log('\n2️⃣ Manual Test: Trigger Digital Delivery\n');
    console.log('To manually trigger and send email, run this in browser console');
    console.log('or use curl when dev server is running:\n');
    
    const recentOrder = orders[0];
    console.log(`curl -X POST http://localhost:4321/api/test/digital-delivery \\\n  -H "Content-Type: application/json" \\\n  -H "Cookie: sb-auth-token=YOUR_TOKEN" \\\n  -d '{\n    "orderId": "${recentOrder.id}",\n    "email": "${TEST_EMAIL}",\n    "fileUrl": "${recentOrder.products?.file_url || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'}"\n  }'`);
    
    console.log('\n' + '='.repeat(60));
}

testAppFlow();
