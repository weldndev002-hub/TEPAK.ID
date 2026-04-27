// Run with: npx tsx scratch/check_user_id.js
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const email = 'acepali2253@gmail.com';
    console.log(`--- CHECKING USER ID FOR ${email} ---`);
    
    const { data: users, error } = await supabase.auth.admin.listUsers();

    if (error) {
        console.error('Error listing users:', error);
        return;
    }

    const user = users.users.find(u => u.email === email);
    if (user) {
        console.log(`User ID for ${email}: ${user.id}`);
    } else {
        console.log(`User ${email} not found.`);
        // Try mail@bimajanuri.my.id too
        const user2 = users.users.find(u => u.email === 'mail@bimajanuri.my.id');
        if (user2) console.log(`User ID for mail@bimajanuri.my.id: ${user2.id}`);
    }
}

check();
