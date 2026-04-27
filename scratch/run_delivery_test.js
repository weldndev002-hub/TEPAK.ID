// Run this with: node scratch/run_delivery_test.js
import dotenv from 'dotenv';
dotenv.config();

// Mock cfEnv for the library
global.cfEnv = process.env;

async function runTest() {
    try {
        console.log('--- EXECUTING FINAL DIGITAL DELIVERY TEST ---');
        
        // Dynamic import of our library
        const { createDigitalDelivery } = await import('../src/lib/digital-delivery.js');
        
        // Use a REAL order ID from the database that belongs to acepali2253@gmail.com
        const orderId = 'b2528abb-b84b-483d-a8f2-3f851e62d202'; 
        const email = 'acepali2253@gmail.com';
        const fileUrl = 'https://aaqguhxonwpsnpwjjdrv.supabase.co/storage/v1/object/public/product/f1947a0b-f2af-4f67-80b4-e7724ab4618f/64318645-76a8-4250-9c6a-61f253855170/product.png';
        const siteBaseUrl = process.env.PUBLIC_SITE_URL || 'http://localhost:4321';

        console.log('Parameters:');
        console.log(' - Order ID:', orderId);
        console.log(' - Target Email:', email);
        console.log(' - Site URL:', siteBaseUrl);

        const result = await createDigitalDelivery(orderId, email, fileUrl, siteBaseUrl);

        console.log('\n--- RESULT ---');
        console.log(JSON.stringify(result, null, 2));
        
        if (result.success && result.emailSent) {
            console.log('\n✅ SUCCESS! Email should be arriving at ' + email);
            console.log('Download Token:', result.token);
        } else {
            console.log('\n❌ FAILED or Email not sent.');
            if (result.emailError) console.log('Email Error:', result.emailError);
        }

    } catch (err) {
        console.error('Critical Error in test script:', err);
    }
}

runTest();
