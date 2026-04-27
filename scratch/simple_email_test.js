import dotenv from 'dotenv';
dotenv.config();

async function simpleTest() {
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.RESEND_SENDER_EMAIL || 'noreply@bimajanuri.my.id';
    const to = 'acepali2253@gmail.com';

    console.log(`Sending simple test from ${from} to ${to}...`);

    const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            from: `Tepak.ID <${from}>`,
            to: [to],
            subject: 'Test Email Sederhana',
            text: 'Ini adalah pesan pengetesan sederhana untuk memastikan pengiriman email ke Gmail berhasil.',
        }),
    });

    const result = await response.json();
    console.log('Status:', response.status);
    console.log('Result:', result);
}

simpleTest();
