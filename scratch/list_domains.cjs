
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function listAll() {
    console.log(`Checking DB: ${process.env.PUBLIC_SUPABASE_URL}`);
    const { data, error } = await supabase.from('user_settings').select('domain_name, user_id, domain_verified');
    
    if (error) {
        console.error('Error:', error.message);
        return;
    }

    console.log('\n--- LIST SEMUA DOMAIN DI DATABASE INI ---');
    if (data.length === 0) {
        console.log('Tabel kosong (0 baris)');
    } else {
        data.forEach((row, i) => {
            console.log(`${i+1}. Domain: "${row.domain_name}" | Verified: ${row.domain_verified} | UserID: ${row.user_id}`);
        });
    }
}

listAll();
