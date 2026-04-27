import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function findDelivery() {
    // 1. Find the product ID for "aaaaa"
    const { data: product } = await supabase
        .from('products')
        .select('id, title')
        .ilike('title', '%aaaaa%')
        .single();

    if (!product) {
        console.log('Product "aaaaa" not found');
        return;
    }

    console.log('Found Product ID:', product.id);

    // 2. Find delivery record for this product and email
    // Note: We need to join with orders to find the right product
    const { data: deliveries, error } = await supabase
        .from('digital_deliveries')
        .select(`
            token, 
            accessed_email,
            orders!inner (
                order_items!inner (
                    product_id
                )
            )
        `)
        .eq('accessed_email', 'acepali2253@gmail.com')
        .eq('orders.order_items.product_id', product.id)
        .order('created_at', { ascending: false })
        .limit(1);

    if (deliveries && deliveries.length > 0) {
        const d = deliveries[0];
        console.log('\n--- REAL PRODUCT TOKEN FOUND ---');
        console.log('Product:', product.title);
        console.log('Token:', d.token);
        console.log('Download URL: http://localhost:4321/digital-delivery/' + d.token + '?email=acepali2253@gmail.com');
        console.log('-------------------\n');
    } else {
        console.log('No delivery found for product "aaaaa" and email acepali2253@gmail.com');
        console.log('Please make a test purchase first or manually create a delivery record.');
    }
}

findDelivery();
