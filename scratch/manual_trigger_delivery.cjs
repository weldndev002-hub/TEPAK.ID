
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config();

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const resendApiKey = process.env.RESEND_API_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function manualTrigger() {
    const orderId = 'efc2e671-b543-4e4a-bba6-1c303277d68e';
    const targetEmail = 'acepali2253@gmail.com';
    
    console.log('Manually triggering delivery for:', orderId);

    // 1. Get Product
    const { data: order } = await supabase.from('orders').select('product_id').eq('id', orderId).single();
    const { data: product } = await supabase.from('products').select('*').eq('id', order.product_id).single();
    
    const fileUrl = product.file_url;
    const token = 'dd_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // 2. Insert into DB
    const { error: insertError } = await supabase.from('digital_deliveries').insert({
        order_id: orderId,
        token,
        file_url: fileUrl,
        signed_url: fileUrl,
        expires_at: expiresAt.toISOString(),
        accessed_email: targetEmail
    });

    if (insertError) {
        console.error('DB Insert Error:', insertError);
        return;
    }
    console.log('DB Record Created with token:', token);

    // 3. Send Email
    const siteUrl = process.env.PUBLIC_SITE_URL || 'https://tepak.id';
    const downloadPageUrl = `${siteUrl}/digital-delivery/${token}`;

    const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            from: `"Tepak.ID" <${process.env.RESEND_SENDER_EMAIL}>`,
            to: targetEmail,
            subject: '📦 Tautan Unduhan Produk - Tepak.ID',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                  <h2 style="color: #667eea;">Terima kasih atas pesanan Anda!</h2>
                  <p>Produk digital Anda kini sudah siap untuk diunduh.</p>
                  <div style="margin: 30px 0;">
                    <a href="${downloadPageUrl}" style="background-color: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                      📥 Ambil Produk Di Sini
                    </a>
                  </div>
                  <p style="font-size: 14px; color: #666;">
                    <strong>Catatan:</strong><br>
                    - Gunakan email <b>${targetEmail}</b> untuk mengakses tautan ini.<br>
                    - Tautan berlaku selama 7 hari.
                  </p>
                  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                  <p style="font-size: 12px; color: #999; text-align: center;">&copy; Tepak.ID</p>
                </div>
            `
        }),
    });

    const result = await response.json();
    console.log('Email Status:', response.status);
    console.log('Email Result:', result);
}

manualTrigger();
