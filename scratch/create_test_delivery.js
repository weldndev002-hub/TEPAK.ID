import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestDelivery() {
    const email = 'acepali2253@gmail.com';
    const productId = '64318645-76a8-4250-9c6a-61f253855170'; // ID for "aaaaa"
    
    // 1. Get product file URL
    const { data: product } = await supabase
        .from('products')
        .select('file_url')
        .eq('id', productId)
        .single();
    
    if (!product || !product.file_url) {
        console.log('Product or file_url not found');
        return;
    }

    console.log('Product file_url:', product.file_url);

    // 2. Create a dummy order if none exists (required for RLS or joins)
    // Actually, we'll try to insert directly if possible
    
    const token = 'dd_' + Date.now() + '_test';
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const { data: delivery, error } = await supabase
        .from('digital_deliveries')
        .insert({
            token,
            file_url: product.file_url,
            accessed_email: email,
            expires_at: expiresAt.toISOString(),
            access_count: 0
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating delivery:', error);
        return;
    }

    console.log('\n--- TEST DELIVERY CREATED ---');
    console.log('Email:', email);
    console.log('Token:', token);
    console.log('Download URL: http://localhost:4321/digital-delivery/' + token + '?email=' + email);
    console.log('-----------------------------\n');
}

createTestDelivery();
