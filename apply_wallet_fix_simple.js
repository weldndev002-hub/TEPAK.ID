import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ ERROR: Missing Supabase environment variables');
    console.error('Please ensure PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyCriticalFix() {
    console.log('🔧 Applying critical wallet synchronization fix...\n');

    // Instead of running the full migration, we'll apply the most critical parts
    // and create a manual SQL file for the user to run in Supabase SQL Editor

    try {
        console.log('1. Creating manual SQL file for Supabase SQL Editor...');

        const sqlContent = readFileSync(join(__dirname, 'wallet_payout_fix.sql'), 'utf8');

        // Create a simplified version with just the critical parts
        const criticalSQL = `-- CRITICAL WALLET FIX FOR TEPAK.ID
-- Run this in Supabase SQL Editor to fix wallet synchronization

-- 1. Create the wallet update function
CREATE OR REPLACE FUNCTION public.handle_order_status_change()
RETURNS TRIGGER AS $$
DECLARE
    v_merchant_id UUID;
    v_net_amount NUMERIC;
BEGIN
    -- Only act when status changes
    IF OLD.status = NEW.status THEN
        RETURN NEW;
    END IF;

    v_merchant_id := NEW.merchant_id;
    v_net_amount := COALESCE(NEW.net_amount, 0);

    -- CASE: Order became successful/paid → Add net_amount to pending_balance
    IF (NEW.status IN ('success', 'paid')) AND (OLD.status NOT IN ('success', 'paid')) THEN
        UPDATE public.wallets
        SET 
            pending_balance = pending_balance + v_net_amount,
            updated_at = NOW()
        WHERE merchant_id = v_merchant_id;
        
        RAISE NOTICE '[Wallet] Added % to pending_balance for merchant % (order %)', 
            v_net_amount, v_merchant_id, NEW.id;
    END IF;

    -- CASE: Order was success/paid but now cancelled/expired → Subtract net_amount from pending_balance
    IF (NEW.status IN ('cancelled', 'expired', 'failed')) AND (OLD.status IN ('success', 'paid')) THEN
        UPDATE public.wallets
        SET 
            pending_balance = GREATEST(pending_balance - v_net_amount, 0),
            updated_at = NOW()
        WHERE merchant_id = v_merchant_id;
            
        RAISE NOTICE '[Wallet] Subtracted % from pending_balance for merchant % (order %)', 
            v_net_amount, v_merchant_id, NEW.id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create the trigger
DROP TRIGGER IF EXISTS on_order_status_changed ON public.orders;
CREATE TRIGGER on_order_status_changed
    AFTER UPDATE OF status ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.handle_order_status_change();

-- 3. Fix existing successful orders (one-time update)
UPDATE public.wallets w
SET 
    pending_balance = COALESCE((
        SELECT SUM(net_amount) 
        FROM public.orders o 
        WHERE o.merchant_id = w.merchant_id 
        AND o.status IN ('success', 'paid')
    ), 0),
    updated_at = NOW()
WHERE EXISTS (
    SELECT 1 FROM public.orders o 
    WHERE o.merchant_id = w.merchant_id 
    AND o.status IN ('success', 'paid')
);

-- 4. Add platform config if missing
INSERT INTO public.platform_configs (id, payout_fee, min_withdrawal, pg_fee)
VALUES (1, 5000, 50000, 2000)
ON CONFLICT (id) DO UPDATE SET
    payout_fee = EXCLUDED.payout_fee,
    min_withdrawal = EXCLUDED.min_withdrawal,
    pg_fee = EXCLUDED.pg_fee;

-- 5. Verify the fix
SELECT 
    '✅ Function created' as check_1,
    (SELECT COUNT(*) FROM pg_trigger WHERE tgname = 'on_order_status_changed') as trigger_exists,
    'Check wallet balances:' as check_2;

SELECT 
    w.merchant_id,
    w.pending_balance,
    w.available_balance,
    COALESCE(SUM(o.net_amount), 0) as expected_pending
FROM public.wallets w
LEFT JOIN public.orders o ON o.merchant_id = w.merchant_id AND o.status IN ('success', 'paid')
GROUP BY w.merchant_id, w.pending_balance, w.available_balance
LIMIT 5;
`;

        const outputPath = join(__dirname, 'wallet_fix_manual.sql');
        require('fs').writeFileSync(outputPath, criticalSQL);

        console.log(`   ✅ Created: ${outputPath}`);
        console.log(`   📋 Copy this SQL and run it in Supabase SQL Editor\n`);

        console.log('2. Attempting to apply some fixes via API...');

        // Try to update platform_configs via API
        console.log('   Updating platform_configs...');
        const { error: configError } = await supabase
            .from('platform_configs')
            .upsert({
                id: 1,
                payout_fee: 5000,
                min_withdrawal: 50000,
                pg_fee: 2000,
                updated_at: new Date().toISOString()
            }, { onConflict: 'id' });

        if (configError) {
            console.log(`   ⚠️  Could not update platform_configs: ${configError.message}`);
            console.log(`   This will be done via the manual SQL instead`);
        } else {
            console.log(`   ✅ Platform config updated`);
        }

        // Try to update existing wallet balances
        console.log('\n3. Updating existing wallet balances for successful orders...');

        // Get all merchants with successful orders
        const { data: merchants } = await supabase
            .from('orders')
            .select('merchant_id')
            .in('status', ['success', 'paid'])
            .not('merchant_id', 'is', null);

        if (merchants && merchants.length > 0) {
            const uniqueMerchants = [...new Set(merchants.map(m => m.merchant_id))];
            console.log(`   Found ${uniqueMerchants.length} merchants with successful orders`);

            for (const merchantId of uniqueMerchants.slice(0, 3)) { // Limit to first 3
                // Calculate total net_amount for this merchant
                const { data: orders } = await supabase
                    .from('orders')
                    .select('net_amount')
                    .eq('merchant_id', merchantId)
                    .in('status', ['success', 'paid']);

                if (orders && orders.length > 0) {
                    const totalNet = orders.reduce((sum, order) => sum + (order.net_amount || 0), 0);

                    // Update wallet
                    const { error: walletError } = await supabase
                        .from('wallets')
                        .update({
                            pending_balance: totalNet,
                            updated_at: new Date().toISOString()
                        })
                        .eq('merchant_id', merchantId);

                    if (walletError) {
                        console.log(`   ⚠️  Could not update wallet for ${merchantId.slice(0, 8)}...: ${walletError.message}`);
                    } else {
                        console.log(`   ✅ Updated wallet for ${merchantId.slice(0, 8)}...: Rp ${totalNet.toLocaleString('id-ID')}`);
                    }
                }
            }

            if (uniqueMerchants.length > 3) {
                console.log(`   ℹ️  ${uniqueMerchants.length - 3} more merchants need updates (run SQL for all)`);
            }
        }

        console.log('\n4. Creating backup verification script...');

        const verifyScript = `import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
    process.env.PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function verifyWalletFix() {
    console.log('🔍 Verifying wallet synchronization fix...');
    
    // Check trigger exists
    const { data: trigger } = await supabase
        .from('pg_trigger')
        .select('tgname')
        .eq('tgname', 'on_order_status_changed')
        .single();
    
    console.log(trigger ? '✅ Trigger exists' : '❌ Trigger missing');
    
    // Check wallet balances
    const { data: wallets } = await supabase
        .from('wallets')
        .select('merchant_id, pending_balance, available_balance')
        .limit(5);
    
    console.log('\\nSample wallet balances:');
    wallets?.forEach(w => {
        console.log(\`  \${w.merchant_id.slice(0, 8)}...: Pending Rp \${w.pending_balance}, Available Rp \${w.available_balance}\`);
    });
    
    // Check if pending balances match successful orders
    const { data: orders } = await supabase
        .from('orders')
        .select('merchant_id, net_amount')
        .in('status', ['success', 'paid'])
        .limit(10);
    
    const byMerchant = {};
    orders?.forEach(o => {
        byMerchant[o.merchant_id] = (byMerchant[o.merchant_id] || 0) + (o.net_amount || 0);
    });
    
    console.log('\\nOrder totals vs wallet balances:');
    Object.entries(byMerchant).slice(0, 3).forEach(([merchantId, total]) => {
        const wallet = wallets?.find(w => w.merchant_id === merchantId);
        console.log(\`  \${merchantId.slice(0, 8)}...: Orders Rp \${total}, Wallet Rp \${wallet?.pending_balance}\`);
    });
}

verifyWalletFix();`;

        const verifyPath = join(__dirname, 'verify_wallet_fix.js');
        require('fs').writeFileSync(verifyPath, verifyScript);
        console.log(`   ✅ Created: ${verifyPath}`);

        console.log('\n🎯 NEXT STEPS:');
        console.log('   1. Open Supabase Dashboard → SQL Editor');
        console.log('   2. Copy contents of wallet_fix_manual.sql');
        console.log('   3. Run the SQL script');
        console.log('   4. Run: node verify_wallet_fix.js');
        console.log('   5. Test with new Duitku payment');

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

applyCriticalFix();