
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkExactValue() {
    const { data, error } = await supabase
        .from('user_settings')
        .select('domain_name')
        .like('domain_name', '%weorbit.site%');

    if (error) {
        console.error('Error:', error.message);
        return;
    }

    if (data.length === 0) {
        console.log('Domain tidak ditemukan sama sekali di database!');
    } else {
        data.forEach(row => {
            console.log(`Domain di DB: "${row.domain_name}"`);
            console.log(`Panjang karakter: ${row.domain_name.length}`);
            if (row.domain_name.includes('\n') || row.domain_name.includes('\r')) {
                console.log('⚠️ PERINGATAN: Masih ada karakter NEWLINE (Enter) di dalam data!');
            } else if (row.domain_name.trim() !== row.domain_name) {
                console.log('⚠️ PERINGATAN: Masih ada SPASI di depan/belakang data!');
            } else {
                console.log('✅ Data sudah BERSIH (tidak ada spasi/enter).');
            }
        });
    }
}

checkExactValue();
