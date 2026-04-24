const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testWithdrawal() {
    console.log('🧪 Testing Withdrawal Functionality\n');

    try {
        // 1. Find merchant with available balance
        console.log('1. Finding merchant with available balance...');
        const { data: wallets, error: walletsError } = await supabase
            .from('wallets')
            .select('merchant_id, available_balance, pending_balance')
            .gt('available_balance', 0)
            .limit(1);

        if (walletsError) {
            console.error('Error fetching wallets:', walletsError.message);
            return;
        }

        if (!wallets || wallets.length === 0) {
            console.log('   ❌ No merchant with available balance found');
            console.log('   Need to first clear pending balances');
            return;
        }

        const merchant = wallets[0];
        console.log(`   ✅ Found merchant ${merchant.merchant_id.substring(0, 8)}...`);
        console.log(`   Available balance: Rp ${merchant.available_balance?.toLocaleString('id-ID')}`);
        console.log(`   Pending balance: Rp ${merchant.pending_balance?.toLocaleString('id-ID')}`);

        // 2. Check if merchant has bank account
        console.log('\n2. Checking bank accounts...');
        const { data: bankAccounts, error: bankError } = await supabase
            .from('bank_accounts')
            .select('*')
            .eq('merchant_id', merchant.merchant_id)
            .limit(1);

        if (bankError) {
            console.error('Error fetching bank accounts:', bankError.message);
        }

        let bankAccountId = null;
        if (!bankAccounts || bankAccounts.length === 0) {
            console.log('   ⚠️ No bank account found, creating test bank account...');

            // Create a test bank account
            const { data: newBank, error: createError } = await supabase
                .from('bank_accounts')
                .insert({
                    merchant_id: merchant.merchant_id,
                    bank_name: 'BCA (Test)',
                    account_number: '1234567890',
                    account_name: 'Test Account',
                    is_primary: true
                })
                .select('id')
                .single();

            if (createError) {
                console.error('   Error creating bank account:', createError.message);
                console.log('   Cannot proceed with withdrawal test');
                return;
            }

            bankAccountId = newBank.id;
            console.log(`   ✅ Created test bank account with ID: ${bankAccountId}`);
        } else {
            bankAccountId = bankAccounts[0].id;
            console.log(`   ✅ Found bank account: ${bankAccounts[0].bank_name} - ${bankAccounts[0].account_number}`);
        }

        // 3. Test withdrawal amount (min Rp 50,000)
        const withdrawalAmount = 100000; // Rp 100,000
        if (merchant.available_balance < withdrawalAmount) {
            console.log(`\n   ❌ Insufficient balance for withdrawal`);
            console.log(`   Available: Rp ${merchant.available_balance?.toLocaleString('id-ID')}`);
            console.log(`   Required: Rp ${withdrawalAmount.toLocaleString('id-ID')}`);
            return;
        }

        console.log(`\n3. Testing withdrawal of Rp ${withdrawalAmount.toLocaleString('id-ID')}...`);

        // 4. Check if initiate_withdrawal function exists
        console.log('   Checking initiate_withdrawal function...');
        try {
            // Try to call the function
            const { data: withdrawalResult, error: initError } = await supabase.rpc('initiate_withdrawal', {
                p_merchant_id: merchant.merchant_id,
                p_amount: withdrawalAmount,
                p_bank_account_id: bankAccountId
            });

            if (initError) {
                if (initError.code === '42883') {
                    console.log('   ❌ Function initiate_withdrawal does not exist');
                    console.log('   Need to create the function first');
                    await createWithdrawalFunction();
                    return;
                } else {
                    console.error('   Error calling initiate_withdrawal:', initError.message);
                    console.log('   Trying alternative approach...');
                    await manualWithdrawal(merchant.merchant_id, withdrawalAmount, bankAccountId);
                }
            } else {
                console.log(`   ✅ Withdrawal initiated successfully!`);
                console.log(`   Withdrawal ID: ${withdrawalResult}`);

                // 5. Check updated wallet balance
                const { data: updatedWallet } = await supabase
                    .from('wallets')
                    .select('available_balance, pending_balance')
                    .eq('merchant_id', merchant.merchant_id)
                    .single();

                console.log(`\n4. Updated wallet balance:`);
                console.log(`   Available: Rp ${updatedWallet.available_balance?.toLocaleString('id-ID')}`);
                console.log(`   Pending: Rp ${updatedWallet.pending_balance?.toLocaleString('id-ID')}`);

                // 6. Check withdrawal record
                const { data: withdrawalRecord } = await supabase
                    .from('withdrawals')
                    .select('*')
                    .eq('merchant_id', merchant.merchant_id)
                    .order('requested_at', { ascending: false })
                    .limit(1);

                if (withdrawalRecord && withdrawalRecord.length > 0) {
                    console.log(`\n5. Withdrawal record created:`);
                    console.log(`   ID: ${withdrawalRecord[0].id}`);
                    console.log(`   Amount: Rp ${withdrawalRecord[0].amount?.toLocaleString('id-ID')}`);
                    console.log(`   Status: ${withdrawalRecord[0].status}`);
                    console.log(`   Requested: ${withdrawalRecord[0].requested_at}`);
                }
            }
        } catch (e) {
            console.error('   Exception:', e.message);
            await manualWithdrawal(merchant.merchant_id, withdrawalAmount, bankAccountId);
        }

    } catch (error) {
        console.error('Unexpected error:', error);
    }
}

async function createWithdrawalFunction() {
    console.log('\n   Creating initiate_withdrawal function...');
    console.log('   Copy and run this SQL in Supabase SQL Editor:');

    const sql = `
        CREATE OR REPLACE FUNCTION public.initiate_withdrawal(
            p_merchant_id UUID,
            p_amount NUMERIC,
            p_bank_account_id UUID
        ) RETURNS UUID AS $$
        DECLARE
            v_withdrawal_id UUID;
            v_available_balance NUMERIC;
        BEGIN
            -- Lock the wallet row for this merchant and retrieve current balance
            SELECT available_balance INTO v_available_balance
            FROM public.wallets
            WHERE merchant_id = p_merchant_id
            FOR UPDATE;

            IF NOT FOUND THEN
                RAISE EXCEPTION 'Wallet not found';
            END IF;

            IF v_available_balance < p_amount THEN
                RAISE EXCEPTION 'Insufficient balance';
            END IF;

            -- Create withdrawal record
            INSERT INTO public.withdrawals (merchant_id, amount, bank_account_id, status)
            VALUES (p_merchant_id, p_amount, p_bank_account_id, 'pending')
            RETURNING id INTO v_withdrawal_id;

            -- Update wallet (same row already locked)
            UPDATE public.wallets
            SET
                available_balance = available_balance - p_amount,
                pending_balance = pending_balance + p_amount,
                updated_at = NOW()
            WHERE merchant_id = p_merchant_id;

            RETURN v_withdrawal_id;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
    `;

    console.log(sql);
}

async function manualWithdrawal(merchantId, amount, bankAccountId) {
    console.log('\n   Performing manual withdrawal...');

    try {
        // 1. Create withdrawal record
        const { data: withdrawal, error: insertError } = await supabase
            .from('withdrawals')
            .insert({
                merchant_id: merchantId,
                amount: amount,
                bank_account_id: bankAccountId,
                status: 'pending'
            })
            .select('id')
            .single();

        if (insertError) {
            console.error('   Error creating withdrawal record:', insertError.message);
            return;
        }

        console.log(`   ✅ Created withdrawal record: ${withdrawal.id}`);

        // 2. Update wallet manually
        const { error: updateError } = await supabase
            .from('wallets')
            .update({
                available_balance: supabase.rpc('decrement', { x: 'available_balance', val: amount }),
                pending_balance: supabase.rpc('increment', { x: 'pending_balance', val: amount }),
                updated_at: new Date().toISOString()
            })
            .eq('merchant_id', merchantId);

        if (updateError) {
            console.error('   Error updating wallet:', updateError.message);

            // Try direct update
            const { data: currentWallet } = await supabase
                .from('wallets')
                .select('available_balance, pending_balance')
                .eq('merchant_id', merchantId)
                .single();

            if (currentWallet) {
                const { error: directError } = await supabase
                    .from('wallets')
                    .update({
                        available_balance: currentWallet.available_balance - amount,
                        pending_balance: currentWallet.pending_balance + amount,
                        updated_at: new Date().toISOString()
                    })
                    .eq('merchant_id', merchantId);

                if (directError) {
                    console.error('   Direct update also failed:', directError.message);
                } else {
                    console.log('   ✅ Wallet updated successfully');
                }
            }
        } else {
            console.log('   ✅ Wallet updated successfully');
        }

        // 3. Verify
        const { data: finalWallet } = await supabase
            .from('wallets')
            .select('available_balance, pending_balance')
            .eq('merchant_id', merchantId)
            .single();

        console.log(`\n   Final wallet balance:`);
        console.log(`     Available: Rp ${finalWallet.available_balance?.toLocaleString('id-ID')}`);
        console.log(`     Pending: Rp ${finalWallet.pending_balance?.toLocaleString('id-ID')}`);

    } catch (e) {
        console.error('   Manual withdrawal failed:', e.message);
    }
}

// Execute
testWithdrawal().catch(console.error);