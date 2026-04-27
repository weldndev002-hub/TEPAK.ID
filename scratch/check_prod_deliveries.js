// Run with: npx tsx scratch/check_prod_deliveries.js
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    console.log('--- CHECKING RECENT DIGITAL DELIVERIES ---');
    
    const { data, error } = await supabase
        .from('digital_deliveries')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

    if (error) {
        console.error('Error fetching deliveries:', error);
        if (error.code === '42P01') {
            console.error('CRITICAL: Table "digital_deliveries" DOES NOT EXIST!');
        }
        return;
    }

    if (!data || data.length === 0) {
        console.log('No digital deliveries found in the table.');
    } else {
        console.log(`Found ${data.length} recent deliveries:`);
        data.forEach(d => {
            console.log(`- Token: ${d.token}, Email: ${d.accessed_email}, Created: ${d.created_at}`);
        });
    }
}

check();
