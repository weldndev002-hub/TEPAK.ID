import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestDelivery() {
    // 1. Get a real order ID first
    const { data: order } = await supabase.from('orders').select('id').limit(1).single();
    
    if (!order) {
        console.error('Tidak ada order di database. Harap buat satu order dulu.');
        return;
    }

    const token = 'dd_preview_weldn';
    const email = 'weldn.dev.002@gmail.com';
    const pdfUrl = 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf';
    
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    console.log('--- Mencoba mendaftarkan akses preview dengan Order ID:', order.id, '---');
    
    const { data, error } = await supabase
        .from('digital_deliveries')
        .upsert({
            token: token,
            accessed_email: email,
            file_url: pdfUrl,
            signed_url: pdfUrl,
            expires_at: expiresAt.toISOString(),
            order_id: order.id
        }, { onConflict: 'token' });

    if (error) {
        console.error('Gagal mendaftarkan:', error.message);
    } else {
        console.log('✅ BERHASIL! Email weldn.dev.002@gmail.com telah terdaftar.');
        console.log('URL Preview: http://localhost:4321/digital-delivery/' + token);
    }
}

createTestDelivery();
