
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function aggressiveClean() {
    console.log('Memulai pembersihan database...');
    
    // Ambil data yang bermasalah
    const { data } = await supabase
        .from('user_settings')
        .select('user_id, domain_name')
        .like('domain_name', '%weorbit.site%');

    if (data && data.length > 0) {
        for (const row of data) {
            const cleanName = row.domain_name.trim();
            console.log(`Membersihkan: "${row.domain_name}" -> "${cleanName}"`);
            
            const { error } = await supabase
                .from('user_settings')
                .update({ domain_name: cleanName })
                .eq('user_id', row.user_id);

            if (error) {
                console.error(`Gagal membersihkan user ${row.user_id}:`, error.message);
            } else {
                console.log(`✅ Berhasil membersihkan domain untuk user ${row.user_id}`);
            }
        }
    } else {
        console.log('Tidak ada domain yang perlu dibersihkan.');
    }
}

aggressiveClean();
