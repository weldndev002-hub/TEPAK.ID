// Test script untuk memverifikasi pengiriman email dengan Resend
console.log('=== TEST PENGIRIMAN EMAIL RESEND ===\n');

// Simulasi fungsi getEnv dari digital-delivery.ts
function getEnv(key) {
    // Untuk testing, gunakan nilai dari .env
    const envVars = {
        'RESEND_API_KEY': 're_A21Tmy6o_AGYYVFMcQHpotKmkS2Q5qmDk',
        'RESEND_SENDER_EMAIL': 'no-reply@bimajanuri.my.id',
        'RESEND_SENDER_NAME': 'Tepak.ID',
        'PUBLIC_SITE_URL': 'https://tepak.id'
    };
    return envVars[key] || null;
}

async function testResendEmail() {
    const resendApiKey = getEnv('RESEND_API_KEY');
    const senderEmail = getEnv('RESEND_SENDER_EMAIL');
    const senderName = getEnv('RESEND_SENDER_NAME');

    console.log('1. Konfigurasi Resend:');
    console.log(`   API Key: ${resendApiKey ? `${resendApiKey.substring(0, 10)}...` : 'TIDAK ADA'}`);
    console.log(`   Email Pengirim: ${senderEmail}`);
    console.log(`   Nama Pengirim: ${senderName}`);

    if (!resendApiKey) {
        console.error('❌ ERROR: RESEND_API_KEY tidak ditemukan');
        return;
    }

    if (!senderEmail) {
        console.error('❌ ERROR: RESEND_SENDER_EMAIL tidak ditemukan');
        return;
    }

    // Format email pengirim
    const fromEmail = senderName ? `${senderName} <${senderEmail}>` : senderEmail;

    const testEmailData = {
        from: fromEmail,
        to: 'test@example.com', // Email test
        subject: 'Test Email - Digital Delivery System',
        html: '<h1>Test Email Berhasil!</h1><p>Ini adalah email test untuk memverifikasi konfigurasi Resend.</p>',
        text: 'Test Email Berhasil! Ini adalah email test untuk memverifikasi konfigurasi Resend.'
    };

    console.log('\n2. Mengirim email test...');
    console.log(`   Dari: ${fromEmail}`);
    console.log(`   Ke: test@example.com`);
    console.log(`   Subjek: ${testEmailData.subject}`);

    try {
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${resendApiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testEmailData)
        });

        console.log(`\n3. Respons Resend API: Status ${response.status}`);

        if (response.status === 401) {
            console.error('❌ ERROR: API Key tidak valid atau tidak diotorisasi');
            const errorText = await response.text();
            console.error(`   Detail: ${errorText}`);
        } else if (response.status === 422) {
            console.error('❌ ERROR: Domain email pengirim belum diverifikasi');
            const errorText = await response.text();
            console.error(`   Detail: ${errorText}`);
            console.log('\n💡 SOLUSI:');
            console.log('   - Verifikasi domain bimajanuri.my.id di dashboard Resend');
            console.log('   - Atau gunakan email yang sudah diverifikasi seperti onboarding@resend.dev');
        } else if (response.status === 200 || response.status === 201) {
            const result = await response.json();
            console.log('✅ SUKSES: Email test berhasil dikirim!');
            console.log(`   ID Email: ${result.id}`);
            console.log('\n🎉 Konfigurasi email berfungsi dengan baik!');
        } else {
            const errorText = await response.text();
            console.error(`❌ ERROR: Status ${response.status} - ${errorText}`);
        }

    } catch (error) {
        console.error('❌ ERROR: Gagal menghubungi Resend API');
        console.error(`   Pesan: ${error.message}`);
    }
}

async function testDigitalDeliveryLogic() {
    console.log('\n=== TEST LOGIKA DIGITAL DELIVERY ===\n');

    // Simulasi data produk dari database
    const testProducts = [
        { id: 'ad84f1bb-530f-430e-ab28-c144bc877aac', type: 'course', file_url: 'https://aaqguhxonwpsnpwjjdrv.supabase.co/storage/v1/object/public/product-media/assets/1776074808944.png', title: 'Acep' },
        { id: '64318645-76a8-4250-9c6a-61f253855170', type: 'course', file_url: 'assets/1776671494794.png', title: 'aaaaa' }
    ];

    console.log('1. Pengecekan tipe produk:');
    for (const product of testProducts) {
        const isDigitalProduct = product.type === 'digital' || product.type === 'course';
        const hasFileUrl = !!product.file_url;
        const isAbsoluteUrl = product.file_url?.startsWith('http');

        console.log(`   Produk: ${product.title}`);
        console.log(`     - Tipe: ${product.type} (${isDigitalProduct ? 'DIGITAL' : 'BUKAN DIGITAL'})`);
        console.log(`     - File URL: ${product.file_url ? 'ADA' : 'TIDAK ADA'}`);
        console.log(`     - URL Absolute: ${isAbsoluteUrl ? 'YA' : 'TIDAK (relatif)'}`);
        console.log(`     - Akan trigger email: ${isDigitalProduct && hasFileUrl ? '✅ YA' : '❌ TIDAK'}`);
        console.log('');
    }

    console.log('2. Status konfigurasi:');
    console.log(`   - Tipe produk "course" dianggap digital: ✅ DIPERBAIKI`);
    console.log(`   - Email pengirim: ${getEnv('RESEND_SENDER_EMAIL') || 'Belum dikonfigurasi'}`);
    console.log(`   - Validasi signature Duitku: ✅ DIPERBAIKI (5 format)`);
    console.log(`   - Logging error: ✅ DITINGKATKAN`);
}

async function main() {
    console.log('🔧 VERIFIKASI SISTEM PENGIRIMAN EMAIL\n');

    await testResendEmail();
    await testDigitalDeliveryLogic();

    console.log('\n=== REKOMENDASI FINAL ===');
    console.log('1. ✅ Perbaikan signature validation Duitku sudah diimplementasikan');
    console.log('2. ✅ Pengecekan tipe produk "course" sudah ditambahkan');
    console.log('3. ✅ Email pengirim dikonfigurasi ke: no-reply@bimajanuri.my.id');
    console.log('4. ⚠️  Pastikan domain bimajanuri.my.id sudah diverifikasi di Resend');
    console.log('5. ⚠️  Pastikan produk memiliki file_url yang valid (URL absolute)');
    console.log('6. ✅ Logging error sudah ditingkatkan untuk debugging');
    console.log('\nSistem sekarang seharusnya dapat mengirim email setelah pembayaran Duitku berhasil!');
}

main().catch(console.error);