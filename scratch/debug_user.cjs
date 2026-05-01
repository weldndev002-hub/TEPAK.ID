
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config();

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function testAccess() {
    const target = 'weorbit.site';
    console.log(`URL: ${supabaseUrl}`);
    console.log(`Target Domain: ${target}\n`);

    // 1. Test as Admin (Service Role)
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);
    const { data: adminData, error: adminErr } = await adminClient
        .from('user_settings')
        .select('*')
        .eq('domain_name', target)
        .maybeSingle();

    console.log('--- TEST AS ADMIN (SERVICE ROLE) ---');
    if (adminErr) console.error('Admin Error:', adminErr.message);
    console.log('Result:', adminData ? 'DATA FOUND' : 'DATA NOT FOUND');

    // 2. Test as Public (Anon Key)
    const anonClient = createClient(supabaseUrl, supabaseAnonKey);
    const { data: anonData, error: anonErr } = await anonClient
        .from('user_settings')
        .select('*')
        .eq('domain_name', target)
        .maybeSingle();

    console.log('\n--- TEST AS PUBLIC (ANON KEY) ---');
    if (anonErr) console.error('Anon Error:', anonErr.message);
    console.log('Result:', anonData ? 'DATA FOUND (RLS OK)' : 'DATA NOT FOUND (RLS BLOCKED OR NO DATA)');

    if (adminData && !anonData) {
        console.log('\nKESIMPULAN: Data ada di database, tapi RLS masih memblokir akses publik!');
    } else if (!adminData) {
        console.log('\nKESIMPULAN: Data MEMANG TIDAK ADA di database ini. Pastikan PUBLIC_SUPABASE_URL di .env sudah benar.');
    } else {
        console.log('\nKESIMPULAN: Akses sudah OK. Jika masih blank, kemungkinan masalah di sinkronisasi hostname.');
    }
}

testAccess();
