/**
 * Migration: Add missing `is_active` column to subscription_plans table
 * 
 * Root cause: /api/plans returns 500 because the query uses .eq('is_active', true)
 * but the column `is_active` doesn't exist in the database.
 * 
 * This script connects directly to PostgreSQL via DIRECT_URL and adds the column.
 */
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Parse .env file manually (avoid dotenv dependency issues)
function loadEnv() {
    const envPath = path.join(__dirname, '.env');
    if (!fs.existsSync(envPath)) {
        console.error('❌ .env file not found');
        process.exit(1);
    }

    const envContent = fs.readFileSync(envPath, 'utf8');
    const env = {};

    for (const line of envContent.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIndex = trimmed.indexOf('=');
        if (eqIndex === -1) continue;
        const key = trimmed.substring(0, eqIndex).trim();
        let value = trimmed.substring(eqIndex + 1).trim();
        // Remove surrounding quotes
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
        }
        env[key] = value;
    }

    return env;
}

async function migrate() {
    console.log('🔧 Migration: Adding is_active column to subscription_plans\n');

    const env = loadEnv();

    // Use DIRECT_URL for DDL operations (not pgbouncer)
    let connectionString = env.DIRECT_URL || env.DATABASE_URL;

    if (!connectionString) {
        console.error('❌ No DATABASE_URL or DIRECT_URL found in .env');
        process.exit(1);
    }

    // URL decode the password (Supabase URLs have encoded special chars)
    // The connection string may contain URL-encoded characters
    console.log('📡 Connecting to database...');

    const client = new Client({ connectionString });

    try {
        await client.connect();
        console.log('✅ Connected to database\n');

        // Step 1: Check current table structure
        console.log('1️⃣  Checking current subscription_plans columns...');
        const { rows: columns } = await client.query(`
      SELECT column_name, data_type, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'subscription_plans' AND table_schema = 'public'
      ORDER BY ordinal_position
    `);

        console.log('   Current columns:');
        for (const col of columns) {
            console.log(`   - ${col.column_name} (${col.data_type}) DEFAULT: ${col.column_default || 'none'}`);
        }

        const hasIsActive = columns.some(c => c.column_name === 'is_active');
        const hasTierCategory = columns.some(c => c.column_name === 'tier_category');
        const hasTierDescription = columns.some(c => c.column_name === 'tier_description');

        // Step 2: Add is_active column if missing
        if (hasIsActive) {
            console.log('\n2️⃣  Column is_active already exists ✅');
        } else {
            console.log('\n2️⃣  Adding is_active column...');
            await client.query(`
        ALTER TABLE public.subscription_plans 
        ADD COLUMN is_active BOOLEAN DEFAULT true
      `);
            console.log('   ✅ Column is_active added successfully');
        }

        // Step 3: Add tier_category if missing
        if (hasTierCategory) {
            console.log('\n3️⃣  Column tier_category already exists ✅');
        } else {
            console.log('\n3️⃣  Adding tier_category column...');
            await client.query(`
        ALTER TABLE public.subscription_plans 
        ADD COLUMN tier_category TEXT DEFAULT 'Basic'
      `);
            console.log('   ✅ Column tier_category added successfully');
        }

        // Step 4: Add tier_description if missing
        if (hasTierDescription) {
            console.log('\n4️⃣  Column tier_description already exists ✅');
        } else {
            console.log('\n4️⃣  Adding tier_description column...');
            await client.query(`
        ALTER TABLE public.subscription_plans 
        ADD COLUMN tier_description TEXT
      `);
            console.log('   ✅ Column tier_description added successfully');
        }

        // Step 5: Set is_active = true for existing plans
        console.log('\n5️⃣  Setting is_active = true for all existing plans...');
        const { rowCount } = await client.query(`
      UPDATE public.subscription_plans 
      SET is_active = true 
      WHERE is_active IS NULL OR is_active = false
    `);
        console.log(`   ✅ Updated ${rowCount} plan(s)`);

        // Step 6: Update tier information
        console.log('\n6️⃣  Updating tier information...');
        await client.query(`
      UPDATE public.subscription_plans 
      SET tier_category = 'Starter',
          tier_description = 'Perfect for creators just starting their digital journey. Includes essential features to build your online presence with unlimited links and basic analytics.'
      WHERE id = 'free'
    `);
        await client.query(`
      UPDATE public.subscription_plans 
      SET tier_category = 'Professional',
          tier_description = 'For growing digital businesses. Unlock premium features like custom domain, digital product sales, and advanced integrations to scale your business.'
      WHERE id = 'pro'
    `);
        console.log('   ✅ Tier information updated');

        // Step 7: Verify
        console.log('\n7️⃣  Verifying changes...');
        const { rows: plans } = await client.query(`
      SELECT id, name, is_active, tier_category, price_monthly 
      FROM public.subscription_plans 
      ORDER BY price_monthly ASC
    `);

        console.log('   Current plans:');
        for (const plan of plans) {
            console.log(`   - ${plan.id}: ${plan.name} | is_active=${plan.is_active} | tier=${plan.tier_category} | price=${plan.price_monthly}`);
        }

        console.log('\n🎉 Migration completed successfully!');
        console.log('   The /api/plans endpoint should now return 200.');

    } catch (err) {
        console.error('\n❌ Migration failed:', err.message);
        console.error(err.stack);
        process.exit(1);
    } finally {
        await client.end();
    }
}

migrate();
