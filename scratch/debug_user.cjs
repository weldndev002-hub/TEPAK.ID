
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config();

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function debug() {
    const target = 'weorbit.site';
    console.log(`Checking for: ${target}`);

    // 1. Check Profiles
    const { data: profile, error: pErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', target)
        .maybeSingle();
    
    console.log('--- PROFILE SEARCH ---');
    if (pErr) console.error('Error profile:', pErr);
    console.log('Result:', profile ? `Found! ID: ${profile.id}` : 'Not found in profiles');

    // 2. Check User Settings
    const { data: settings, error: sErr } = await supabase
        .from('user_settings')
        .select('*')
        .eq('domain_name', target)
        .maybeSingle();

    console.log('\n--- SETTINGS SEARCH ---');
    if (sErr) console.error('Error settings:', sErr);
    console.log('Result:', settings ? `Found! UserID: ${settings.user_id}, Verified: ${settings.domain_verified}` : 'Not found in user_settings');

    if (profile || settings) {
        const userId = profile?.id || settings?.user_id;
        const { data: combined } = await supabase
            .from('profiles')
            .select('*, user_settings(*)')
            .eq('id', userId)
            .single();
        console.log('\n--- COMBINED DATA ---');
        console.log(JSON.stringify(combined, null, 2));
    }
}

debug();
