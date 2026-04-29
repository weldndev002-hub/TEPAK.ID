require('dotenv').config();
const { Client } = require('pg');

async function fix() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    await client.connect();

    try {
        // 1. Update subscription_history to SUCCESS for the paid order
        const histRes = await client.query(
            "UPDATE subscription_history SET status = 'SUCCESS', updated_at = NOW() WHERE invoice_id = 'SUB--2d52dfab-b1ca-47fe-839b-7e9de4f841a8--0790' AND status = 'PENDING' RETURNING *"
        );

        if (histRes.rows.length === 0) {
            console.log('No PENDING record found for that invoice. Already processed?');
            return;
        }

        const row = histRes.rows[0];
        console.log('Updated history:', row.invoice_id, 'plan_id:', row.plan_id, 'billing:', row.billing_period);

        const userId = row.user_id;
        const planId = row.plan_id;
        const billingPeriod = row.billing_period || 'monthly';

        // 2. Calculate expiry date
        const expiryDate = new Date();
        if (billingPeriod === 'yearly') {
            expiryDate.setFullYear(expiryDate.getFullYear() + 1);
        } else {
            expiryDate.setDate(expiryDate.getDate() + 30);
        }

        // 3. Update user_settings
        const settingsRes = await client.query(
            "UPDATE user_settings SET plan_status = $1, plan_expiry = $2, auto_renewal = true, billing_period = $3, updated_at = NOW() WHERE user_id = $4 RETURNING user_id, plan_status, plan_expiry, billing_period, auto_renewal",
            [planId, expiryDate.toISOString(), billingPeriod, userId]
        );

        console.log('Updated user_settings:', JSON.stringify(settingsRes.rows[0], null, 2));
        console.log('Plan upgraded to:', planId, 'expires at:', expiryDate.toISOString());

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await client.end();
    }
}

fix();
