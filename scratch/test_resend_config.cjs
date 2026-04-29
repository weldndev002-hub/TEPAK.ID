
const dotenv = require('dotenv');
dotenv.config();

const resendApiKey = process.env.RESEND_API_KEY;
const senderEmail = process.env.RESEND_SENDER_EMAIL || 'onboarding@resend.dev';
const senderName = process.env.RESEND_SENDER_NAME || 'Tepak.ID';

async function testResend() {
    console.log('Testing Resend Email...');
    console.log('API Key present:', !!resendApiKey);
    console.log('Sender:', `"${senderName}" <${senderEmail}>`);
    
    if (!resendApiKey) {
        console.error('Missing RESEND_API_KEY');
        return;
    }

    try {
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${resendApiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from: `"${senderName}" <${senderEmail}>`,
                to: 'acepali2253@gmail.com',
                subject: 'Test Email from Tepak.ID',
                html: '<p>This is a test email to verify Resend configuration.</p>'
            }),
        });

        const result = await response.json();
        console.log('Status:', response.status);
        console.log('Result:', result);
    } catch (err) {
        console.error('Error:', err);
    }
}

testResend();
