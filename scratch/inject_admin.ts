import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const url = process.env.PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey || serviceKey.startsWith('http')) {
    console.error('❌ Error: Valid Supabase URL and Service Role Key required in .env');
    process.exit(1);
}

const supabase = createClient(url, serviceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

const targetEmail = 'carx2254@gmail.com';
const targetPassword = 'Test1234.';

async function injectAdmin() {
    console.log(`🚀 Starting Admin Injection for: ${targetEmail}`);

    // 1. Check if user exists in auth
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) throw listError;

    let user = users.find(u => u.email === targetEmail);

    if (!user) {
        console.log(`➕ User not found. Creating new user...`);
        const { data: { user: newUser }, error: createError } = await supabase.auth.admin.createUser({
            email: targetEmail,
            password: targetPassword,
            email_confirm: true
        });
        if (createError) throw createError;
        user = newUser;
        console.log(`✅ User created successfully: ${user.id}`);
    } else {
        console.log(`ℹ️ User already exists with ID: ${user.id}. Updating password...`);
        const { error: updateAuthError } = await supabase.auth.admin.updateUserById(user.id, {
            password: targetPassword,
            email_confirm: true
        });
        if (updateAuthError) throw updateAuthError;
    }

    // 2. Ensure profile exists and has admin role
    console.log(`🛠️ Injecting Admin role into profiles...`);
    const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
            id: user.id,
            role: 'admin',
            full_name: 'Admin Assistant',
            username: 'carx_admin',
            updated_at: new Date().toISOString()
        }, { onConflict: 'id' });

    if (profileError) throw profileError;

    console.log(`🎊 SUCCESS! ${targetEmail} is now a Master Admin.`);
}

injectAdmin().catch(console.error);
