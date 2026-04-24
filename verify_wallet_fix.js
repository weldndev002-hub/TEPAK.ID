import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const supabase = createClient(
    process.env.PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.PUBLIC_SUPABASE_ANON_KEY
);

async function verifyWalletFix() {
    console.log('🔍 VERIFIKASI PERBAIKAN WALLET SYNCHRONIZATION\n');

    try {
        console.log('1. Memeriksa trigger handle_order_status_change...');

        // Try to check if function exists via query to information_schema
        const { data: functions, error: funcError } = await supabase
            .from('information_schema.routines')
            .select('routine_name')
            .eq('routine_schema', 'public')
            .eq('routine_name', 'handle_order_status_change')
            .limit(1);

        if (funcError) {
            console.log(`   ⚠️  Tidak bisa query information_schema: ${funcError.message}`);
        } else if (functions && functions.length > 0) {
            console.log(`   ✅ Fungsi handle_order_status_change ADA di database`);
        } else {
            console.log(`   ❌ Fungsi handle_order_status_change TIDAK DITEMUKAN`);
            console.log(`   Jalankan wallet_fix_manual.sql di Supabase SQL Editor`);
        }

        console.log('\n2. Memeriksa saldo wallet vs order sukses...');

        // Get sample of merchants with successful orders
        const { data: sampleOrders } = await supabase
            .from('orders')
            .select('merchant_id, net_amount, status')
            .in('status', ['success', 'paid'])
            .limit(10);

        if (sampleOrders && sampleOrders.length > 0) {
            // Group by merchant
            const merchantTotals = {};
            sampleOrders.forEach(order => {
                if (!merchantTotals[order.merchant_id]) {
                    merchantTotals[order.merchant_id] = 0;
                }
                merchantTotals[order.merchant_id] += order.net_amount || 0;
            });

            // Check each merchant's wallet
            for (const [merchantId, expectedTotal] of Object.entries(merchantTotals).slice(0, 3)) {
                const { data: wallet } = await supabase
                    .from('wallets')
                    .select('pending_balance, available_balance')
                    .eq('merchant_id', merchantId)
                    .single();

                if (wallet) {
                    console.log(`\n   Merchant ${merchantId.slice(0, 8)}...:`);
                    console.log(`     Total order sukses: Rp ${expectedTotal.toLocaleString('id-ID')}`);
                    console.log(`     Saldo pending: Rp ${wallet.pending_balance.toLocaleString('id-ID')}`);
                    console.log(`     Saldo available: Rp ${wallet.available_balance.toLocaleString('id-ID')}`);

                    const diff = Math.abs(wallet.pending_balance - expectedTotal);
                    if (diff < 100) {
                        console.log(`     ✅ SALDO SESUAI (selisih: Rp ${diff})`);
                    } else {
                        console.log(`     ⚠️  SELISIH: Rp ${diff.toLocaleString('id-ID')}`);
                        console.log(`     Perlu jalankan wallet_fix_manual.sql untuk sync existing orders`);
                    }
                }
            }
        }

        console.log('\n3. Memeriksa platform_configs...');

        const { data: config } = await supabase
            .from('platform_configs')
            .select('payout_fee, min_withdrawal, pg_fee, platform_fee_percent')
            .limit(1)
            .single();

        if (config) {
            console.log(`   ✅ Konfigurasi platform ditemukan:`);
            console.log(`     Fee payout: Rp ${config.payout_fee || 0}`);
            console.log(`     Min withdrawal: Rp ${config.min_withdrawal || 0}`);
            console.log(`     Fee payment gateway: Rp ${config.pg_fee || 0}`);
            console.log(`     Platform fee: ${config.platform_fee_percent || 0}%`);
        } else {
            console.log(`   ❌ Konfigurasi platform tidak ditemukan`);
            console.log(`   Jalankan bagian 4 di wallet_fix_manual.sql`);
        }

        console.log('\n4. Testing dengan order baru (simulasi)...');

        // Find a pending order to simulate
        const { data: pendingOrder } = await supabase
            .from('orders')
            .select('id, invoice_id, merchant_id, status, net_amount')
            .eq('status', 'pending')
            .limit(1)
            .single();

        if (pendingOrder) {
            console.log(`   Order pending ditemukan: ${pendingOrder.invoice_id}`);
            console.log(`   Merchant: ${pendingOrder.merchant_id?.slice(0, 8)}...`);
            console.log(`   Net amount: Rp ${pendingOrder.net_amount?.toLocaleString('id-ID') || 0}`);
            console.log(`\n   [SIMULASI] Jika order ini berhasil:`);
            console.log(`     - Trigger akan otomatis tambah Rp ${pendingOrder.net_amount} ke pending_balance`);
            console.log(`     - Webhook Duitku akan update status ke 'success'`);
            console.log(`     - Wallet merchant akan bertambah secara otomatis`);
        } else {
            console.log(`   Tidak ada order pending untuk testing`);
        }

        console.log('\n📊 STATUS AKHIR:');
        console.log('   Jika semua checklist hijau ✅, sistem sudah sinkron');
        console.log('   Jika ada merah ❌, jalankan wallet_fix_manual.sql di Supabase');
        console.log('\n🔧 Untuk testing:');
        console.log('   1. Buat order baru (checkout produk)');
        console.log('   2. Bayar via Duitku (sandbox/prod)');
        console.log('   3. Cek wallet dashboard setelah webhook diterima');
        console.log('   4. Saldo harus otomatis bertambah');

    } catch (error) {
        console.error('❌ Error verifikasi:', error);
    }
}

verifyWalletFix();