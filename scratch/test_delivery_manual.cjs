
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config();

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDelivery() {
    const orderId = 'efc2e671-b543-4e4a-bba6-1c303277d68e';
    console.log('Testing delivery for order:', orderId);

    // 1. Get order
    const { data: orderData } = await supabase.from('orders').select('*').eq('id', orderId).single();
    if (!orderData) return console.error('Order not found');

    // 2. Get customer
    const { data: customerData } = await supabase.from('customers').select('email').eq('id', orderData.customer_id).single();
    if (!customerData) return console.error('Customer not found');

    // 3. Get product
    const { data: productData } = await supabase.from('products').select('*').eq('id', orderData.product_id).single();
    if (!productData) return console.error('Product not found');

    console.log('Product Type:', productData.type);
    console.log('File URL:', productData.file_url);
    console.log('Customer Email:', customerData.email);

    // This is where we would call createDigitalDelivery
    // But since it's an ESM module, we'll just check if the env vars are there
    console.log('RESEND_API_KEY present:', !!process.env.RESEND_API_KEY);
    console.log('PUBLIC_SITE_URL:', process.env.PUBLIC_SITE_URL);
}

testDelivery();
