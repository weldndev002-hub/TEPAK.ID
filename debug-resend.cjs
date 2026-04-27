#!/usr/bin/env node
/**
 * Comprehensive Debug Script for Resend Email
 * Tests each component step by step
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Load .env
function loadEnv() {
    const envPath = path.join(__dirname, '.env');
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        envContent.split('\n').forEach(line => {
            const [key, ...valueParts] = line.split('=');
            if (key && valueParts.length > 0) {
                const value = valueParts.join('=').trim();
                if (value && !value.startsWith('#')) {
                    process.env[key.trim()] = value;
                }
            }
        });
    }
}

loadEnv();

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const SENDER_EMAIL = process.env.RESEND_SENDER_EMAIL;
const TEST_EMAIL = 'acepali2253@gmail.com';

console.log('╔════════════════════════════════════════════════════════╗');
console.log('║     DEBUG RESEND EMAIL CONFIGURATION                   ║');
console.log('╚════════════════════════════════════════════════════════╝\n');

// Step 1: Check Environment Variables
console.log('🔍 STEP 1: Checking Environment Variables\n');
console.log('   RESEND_API_KEY:', RESEND_API_KEY ? `✅ Present (${RESEND_API_KEY.substring(0, 10)}...)` : '❌ MISSING');
console.log('   RESEND_SENDER_EMAIL:', SENDER_EMAIL ? `✅ ${SENDER_EMAIL}` : '❌ MISSING');
console.log('   PUBLIC_SITE_URL:', process.env.PUBLIC_SITE_URL || '❌ MISSING');
console.log();

if (!RESEND_API_KEY || !SENDER_EMAIL) {
    console.log('❌ ERROR: Required environment variables are missing!');
    console.log('   Please check your .env file\n');
    process.exit(1);
}

// Step 2: Validate Email Format
console.log('🔍 STEP 2: Validating Email Format\n');
const isValidEmail = (email) => {
    if (typeof email !== 'string') return false;
    const atIndex = email.indexOf('@');
    if (atIndex === -1) return false;
    const domainPart = email.substring(atIndex + 1);
    return domainPart.includes('.') && domainPart.length > 2;
};

console.log(`   Sender: ${SENDER_EMAIL}`);
console.log(`   Valid: ${isValidEmail(SENDER_EMAIL) ? '✅' : '❌ INVALID'}`);
console.log(`   Recipient: ${TEST_EMAIL}`);
console.log(`   Valid: ${isValidEmail(TEST_EMAIL) ? '✅' : '❌ INVALID'}`);
console.log();

if (!isValidEmail(SENDER_EMAIL)) {
    console.log('❌ ERROR: Sender email is invalid!');
    console.log('   Current value:', SENDER_EMAIL);
    console.log('   Should be: noreply@bimajanuri.my.id or onboarding@resend.dev\n');
}

// Step 3: Test API Key with Resend
console.log('🔍 STEP 3: Testing API Key with Resend API\n');

function makeRequest(options, postData) {
    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, data: JSON.parse(data) });
                } catch (e) {
                    resolve({ status: res.statusCode, data: data });
                }
            });
        });
        req.on('error', reject);
        if (postData) req.write(postData);
        req.end();
    });
}

async function testResendAPI() {
    // First, let's try to get account info (if API supports it)
    // Since Resend doesn't have a simple /me endpoint, we'll try to send a minimal email
    
    const testPayload = {
        from: SENDER_EMAIL.includes('@') ? `Test <${SENDER_EMAIL}>` : SENDER_EMAIL,
        to: TEST_EMAIL,
        subject: 'Debug Test - Tepak.ID',
        html: '<p>This is a test email</p>'
    };
    
    console.log('   Sending test email with payload:');
    console.log('   From:', testPayload.from);
    console.log('   To:', testPayload.to);
    console.log();
    
    const postData = JSON.stringify(testPayload);
    
    const options = {
        hostname: 'api.resend.com',
        port: 443,
        path: '/emails',
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        }
    };
    
    try {
        const result = await makeRequest(options, postData);
        
        console.log('   Response Status:', result.status);
        console.log('   Response Data:', JSON.stringify(result.data, null, 2));
        console.log();
        
        if (result.status === 200 || result.status === 201) {
            console.log('✅ SUCCESS! Email was sent!');
            console.log(`   Email ID: ${result.data.id}`);
            console.log(`   Check inbox: ${TEST_EMAIL}\n`);
            return true;
        } else if (result.status === 422) {
            console.log('❌ ERROR 422: Validation Error\n');
            console.log('💡 Possible causes:');
            
            if (result.data && result.data.message) {
                console.log(`   Message: ${result.data.message}`);
            }
            
            // Check specific error patterns
            const errorStr = JSON.stringify(result.data);
            if (errorStr.includes('from') || errorStr.includes('sender')) {
                console.log('   1. Sender email is not verified in Resend');
                console.log('   2. Domain is not properly configured');
                console.log();
                console.log('🔧 SOLUTION:');
                console.log('   Option A: Use default Resend email (onboarding@resend.dev)');
                console.log('   Option B: Verify your domain in https://resend.com/domains');
                console.log();
                console.log('   To use Option A, change your .env to:');
                console.log('   RESEND_SENDER_EMAIL=onboarding@resend.dev');
            }
            
            if (errorStr.includes('to') || errorStr.includes('recipient')) {
                console.log('   3. Recipient email is invalid');
            }
            
            return false;
        } else if (result.status === 401) {
            console.log('❌ ERROR 401: Unauthorized\n');
            console.log('🔧 SOLUTION: Your API key is invalid');
            console.log('   1. Go to https://resend.com/api-keys');
            console.log('   2. Create a new API key');
            console.log('   3. Update .env file\n');
            return false;
        } else {
            console.log('❌ UNKNOWN ERROR\n');
            console.log('Full response:', result.data);
            return false;
        }
    } catch (err) {
        console.error('❌ Request failed:', err.message);
        return false;
    }
}

// Step 4: Test with onboarding@resend.dev if main test fails
async function testWithDefaultSender() {
    console.log('🔍 STEP 4: Testing with Default Resend Sender\n');
    console.log('   Trying with: onboarding@resend.dev\n');
    
    const testPayload = {
        from: 'Tepak.ID <onboarding@resend.dev>',
        to: TEST_EMAIL,
        subject: 'Debug Test - Default Sender',
        html: '<p>This is a test with default sender</p>'
    };
    
    const postData = JSON.stringify(testPayload);
    
    const options = {
        hostname: 'api.resend.com',
        port: 443,
        path: '/emails',
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        }
    };
    
    try {
        const result = await makeRequest(options, postData);
        
        if (result.status === 200 || result.status === 201) {
            console.log('✅ SUCCESS with default sender!');
            console.log('   This means your API key is working,');
            console.log('   but your custom domain needs verification.\n');
            console.log('💡 RECOMMENDATION:');
            console.log('   For immediate testing, update .env:');
            console.log('   RESEND_SENDER_EMAIL=onboarding@resend.dev\n');
            return true;
        } else {
            console.log('❌ FAILED with default sender too');
            console.log('   Status:', result.status);
            console.log('   Response:', result.data);
            return false;
        }
    } catch (err) {
        console.error('❌ Error:', err.message);
        return false;
    }
}

// Run tests
(async () => {
    const mainTest = await testResendAPI();
    
    if (!mainTest) {
        await testWithDefaultSender();
    }
    
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║                    SUMMARY                             ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');
    
    console.log('📋 Current Configuration:');
    console.log(`   API Key: ${RESEND_API_KEY ? '✅ Set' : '❌ Missing'}`);
    console.log(`   Sender: ${SENDER_EMAIL}`);
    console.log(`   Recipient: ${TEST_EMAIL}`);
    console.log();
    
    console.log('🔧 Quick Fixes to Try:');
    console.log('   1. If domain not verified, use: RESEND_SENDER_EMAIL=onboarding@resend.dev');
    console.log('   2. If API key invalid, create new at https://resend.com/api-keys');
    console.log('   3. Check spam folder in acepali2253@gmail.com');
    console.log();
})();
