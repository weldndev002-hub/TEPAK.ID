/**
 * Migration: Add theme + onboarding_completed columns to user_settings
 * Also reloads PostgREST schema cache so Supabase REST API recognizes the new columns
 */
const pg = require('pg');
require('dotenv').config();

const DIRECT_URL = process.env.DIRECT_URL;
if (!DIRECT_URL) {
    console.error('ERROR: DIRECT_URL not found in .env');
    process.exit(1);
}

async function run() {
    const client = new pg.Client({ connectionString: DIRECT_URL });
    await client.connect();

    try {
        console.log('🔍 Checking current columns in user_settings...');
        const { rows: existingCols } = await client.query(`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'user_settings'
      ORDER BY ordinal_position;
    `);
        console.table(existingCols);

        const hasTheme = existingCols.some(c => c.column_name === 'theme');
        const hasOnboarding = existingCols.some(c => c.column_name === 'onboarding_completed');

        if (hasTheme && hasOnboarding) {
            console.log('✅ Both theme and onboarding_completed columns already exist. No migration needed.');
        } else {
            if (!hasTheme) {
                console.log('➕ Adding theme column...');
                await client.query(`
          ALTER TABLE public.user_settings
          ADD COLUMN IF NOT EXISTS theme TEXT DEFAULT 'atelier-dark';
        `);
                console.log('✅ theme column added');
            }

            if (!hasOnboarding) {
                console.log('➕ Adding onboarding_completed column...');
                await client.query(`
          ALTER TABLE public.user_settings
          ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;
        `);
                console.log('✅ onboarding_completed column added');
            }

            // Backfill: Set onboarding_completed = true for users who already have a domain
            console.log('🔄 Backfilling onboarding_completed for existing users with domains...');
            const { rowCount } = await client.query(`
        UPDATE public.user_settings
        SET onboarding_completed = true
        WHERE domain_name IS NOT NULL AND domain_name != '' AND onboarding_completed = false;
      `);
            console.log(`✅ Backfilled ${rowCount} rows`);
        }

        // Reload PostgREST schema cache
        console.log('🔄 Reloading PostgREST schema cache...');
        try {
            await client.query(`NOTIFY pgrst, 'reload schema'`);
            console.log('✅ PostgREST schema cache reload notified');
        } catch (notifyErr) {
            console.warn('⚠️ Could not send NOTIFY pgrst (this is normal for pooled connections):', notifyErr.message);
            console.log('💡 You may need to reload schema manually via Supabase Dashboard → Database → Reload Schema');
        }

        // Verify columns exist after migration
        console.log('\n🔍 Verifying final schema...');
        const { rows: finalCols } = await client.query(`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'user_settings'
        AND column_name IN ('theme', 'onboarding_completed');
    `);
        console.table(finalCols);

        if (finalCols.length === 2) {
            console.log('\n🎉 Migration complete! Both columns exist in user_settings.');
        } else {
            console.error('\n❌ Migration may have failed — expected 2 columns, found:', finalCols.length);
        }

    } catch (err) {
        console.error('❌ Migration error:', err);
        process.exit(1);
    } finally {
        await client.end();
    }
}

run();
