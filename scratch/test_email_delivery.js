import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

async function testEmail() {
    console.log('--- TESTING EMAIL DELIVERY SYSTEM ---');
    
    // We'll call our own API endpoint
    // Note: Since this requires admin auth, we'll use a secret internal trigger if possible
    // or just call the Resend API directly to verify the key.
    
    // But better to test the ACTUAL flow.
    // I'll use the API route /api/test/digital-delivery
    
    const apiUrl = 'http://localhost:4321/api/test/digital-delivery';
    const payload = {
        orderId: 'ORDER-TEST-' + Date.now(),
        email: 'acepali2253@gmail.com',
        fileUrl: 'https://aaqguhxonwpsnpwjjdrv.supabase.co/storage/v1/object/public/product/f1947a0b-f2af-4f67-80b4-e7724ab4618f/64318645-76a8-4250-9c6a-61f253855170/product.png'
    };

    console.log('Sending request to:', apiUrl);
    
    // Since we are running locally and the endpoint checks for 'user' (auth)
    // We might need to bypass it or provide a cookie.
    // However, I can also just run the logic directly via a script.
    
    console.log('Payload:', JSON.stringify(payload, null, 2));
    
    console.log('\nInstead of HTTP, I will run the logic directly via node to bypass Auth for this test...');
}

testEmail();
