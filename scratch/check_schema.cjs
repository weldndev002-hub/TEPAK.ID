const pg = require('pg');
require('dotenv').config();

const client = new pg.Client({ connectionString: process.env.DIRECT_URL });

async function check() {
    await client.connect();
    try {
        const { rows } = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'user_settings' 
            AND column_name = 'onboarding_completed'
        `);
        console.log('Result:', rows);
    } catch (e) {
        console.error(e);
    } finally {
        await client.end();
    }
}
check();
