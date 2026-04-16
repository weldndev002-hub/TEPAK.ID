import md5 from 'md5';

const merchantCode = "DS29376";
const merchantKey = "61c51a77ea664c53be0e6e02ce6ddbbe";
const orderId = "TEST-" + Date.now();
const amount = 50000;

const signature = md5(merchantCode + orderId + amount + merchantKey);

const requestBody = {
    merchantCode,
    paymentAmount: amount,
    merchantOrderId: orderId,
    productDetails: "Test Product",
    email: "test@example.com",
    phoneNumber: "08123456789",
    customerName: "Test User",
    returnUrl: "https://google.com",
    callbackUrl: "https://google.com",
    signature: signature,
    paymentMethod: "QRIS"
};

async function test() {
    console.log("Mencoba kirim ke Duitku Sandbox...");
    try {
        const res = await fetch("https://sandbox.duitku.com/webapi/api/merchant/v2/inquiry", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });
        const data = await res.json();
        console.log("Hasil:", data);
    } catch (err) {
        console.error("Koneksi gagal:", err.message);
    }
}

test();
