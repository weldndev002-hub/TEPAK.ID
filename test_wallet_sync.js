const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testWalletSync() {
    console.log('🧪 TESTING WALLET SYNCHRONIZATION\n');

    try {
        // 1. Cari merchant dengan order sukses
        console.log('1. Mencari merchant dengan order sukses...');
        const { data: orders, error: ordersError } = await supabase
            .from('orders')
            .select('merchant_id, status, net_amount, invoice_id')
            .in('status', ['success', 'paid'])
            .limit(5);

        if (ordersError) {
            console.error('   ❌ Error:', ordersError.message);
            return;
        }

        if (!orders || orders.length === 0) {
            console.log('   ℹ️  Tidak ada order sukses ditemukan');
        } else {
            console.log(`   ✅ Ditemukan ${orders.length} order sukses`);

            const merchantId = orders[0].merchant_id;
            console.log(`   Menggunakan merchant: ${merchantId.substring(0, 8)}...\n`);

            // 2. Cek wallet merchant
            console.log('2. Mengecek saldo wallet...');
            const { data: wallet, error: walletError } = await supabase
                .from('wallets')
                .select('pending_balance, available_balance')
                .eq('merchant_id', merchantId)
                .single();

            if (walletError) {
                console.error('   ❌ Error:', walletError.message);
            } else {
                console.log(`   Saldo pending: Rp ${wallet.pending_balance?.toLocaleString('id-ID') || 0}`);
                console.log(`   Saldo available: Rp ${wallet.available_balance?.toLocaleString('id-ID') || 0}\n`);
            }

            // 3. Hitung total order sukses untuk merchant ini
            console.log('3. Menghitung total order sukses...');
            const { data: merchantOrders, error: moError } = await supabase
                .from('orders')
                .select('net_amount')
                .eq('merchant_id', merchantId)
                .in('status', ['success', 'paid']);

            if (!moError && merchantOrders) {
                const totalSuccess = merchantOrders.reduce((sum, o) => sum + (o.net_amount || 0), 0);
                console.log(`   Total order sukses: Rp ${totalSuccess.toLocaleString('id-ID')}\n`);
            }
        }

        // 4. Cek trigger status
        console.log('4. Memeriksa status trigger...');
        try {
            const { data: triggerCheck, error: triggerError } = await supabase
                .rpc('check_trigger_exists', { trigger_name: 'on_order_status_changed' })
                .catch(() => ({ data: null, error: 'Function not available' }));

            if (triggerError) {
                console.log('   ⚠️  Tidak bisa cek trigger via RPC');
                console.log('   ℹ️  Jalankan query manual di SQL Editor:\n');
                console.log('   SELECT tgname FROM pg_trigger WHERE tgname = \'on_order_status_changed\';');
            } else {
                console.log(`   ${triggerCheck ? '✅ Trigger ditemukan' : '❌ Trigger tidak ditemukan'}`);
            }
        } catch (e) {
            console.log('   ⚠️  Error checking trigger:', e.message);
        }

        // 5. Cek platform config
        console.log('\n5. Memeriksa platform config...');
        const { data: config, error: configError } = await supabase
            .from('platform_configs')
            .select('*')
            .eq('id', 1)
            .single();

        if (configError) {
            console.log('   ❌ Platform config tidak ditemukan');
            console.log('   Jalankan bagian 4 di wallet_fix_manual.sql\n');
        } else {
            console.log('   ✅ Platform config ditemukan:');
            console.log(`     - Payout fee: Rp ${config.payout_fee?.toLocaleString('id-ID')}`);
            console.log(`     - Min withdrawal: Rp ${config.min_withdrawal?.toLocaleString('id-ID')}`);
            console.log(`     - PG fee: Rp ${config.pg_fee?.toLocaleString('id-ID')}`);
            console.log(`     - Platform fee: ${config.platform_fee_percent || config.platform_fee || 5}%\n`);
        }

        // 6. Simulasi update order (jika ada order pending)
        console.log('6. Mencari order pending untuk testing...');
        const { data: pendingOrder, error: pendingError } = await supabase
            .from('orders')
            .select('id, invoice_id, merchant_id, amount, net_amount')
            .eq('status', 'pending')
            .limit(1)
            .single();

        if (pendingError || !pendingOrder) {
            console.log('   ℹ️  Tidak ada order pending ditemukan');
            console.log('   Buat order baru untuk testing sinkronisasi\n');
        } else {
            console.log(`   ✅ Order pending ditemukan: ${pendingOrder.invoice_id}`);
            console.log(`     Merchant: ${pendingOrder.merchant_id?.substring(0, 8)}...`);
            console.log(`     Amount: Rp ${pendingOrder.amount?.toLocaleString('id-ID')}`);
            console.log(`     Net amount: Rp ${pendingOrder.net_amount?.toLocaleString('id-ID') || 'belum dihitung'}`);
            console.log('\n   💡 Untuk testing:');
            console.log(`     1. Update status order ${pendingOrder.id} ke 'success'`);
            console.log(`     2. Trigger akan otomatis update wallet`);
            console.log(`     3. Cek saldo wallet merchant\n`);
        }

        // 7. Summary
        console.log('📊 SUMMARY:');
        console.log('------------');
        console.log('Jika semua komponen berfungsi:');
        console.log('✅ Trigger on_order_status_changed aktif');
        console.log('✅ Platform config terisi');
        console.log('✅ Saldo wallet sinkron dengan order sukses');
        console.log('✅ Order baru akan otomatis update wallet\n');

        console.log('🔧 TROUBLESHOOTING:');
        console.log('-------------------');
        console.log('1. Jika trigger tidak ada:');
        console.log('   - Jalankan wallet_fix_manual.sql di Supabase SQL Editor');
        console.log('2. Jika saldo tidak sinkron:');
        console.log('   - Bagian 3 di SQL akan update existing orders');
        console.log('3. Jika platform config kosong:');
        console.log('   - Bagian 4 di SQL akan insert config');
        console.log('\n🎯 Testing akhir: Buat order baru dan bayar via Duitku sandbox');

    } catch (error) {
        console.error('❌ Error dalam testing:', error.message);
        console.error('Stack:', error.stack);
    }
}

// Jalankan testing
testWalletSync().then(() => {
    console.log('\n✅ Testing selesai. Periksa output di atas.');
    console.log('📋 Lihat WALLET_FIX_GUIDE.md untuk panduan lengkap.');
}).catch(error => {
    console.error('❌ Testing gagal:', error);
});