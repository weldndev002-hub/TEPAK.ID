import md5 from 'md5';

const config = {
    merchantCode: "DS29376",
    merchantKey: "61c51a77ea664c53be0e6e02ce6ddbbe",
    amount: 50000,
    orderId: "DIAG" + Date.now(),
    productDetails: "Test Upgrade PRO",
    email: "acepali2253@gmail.com",
    phoneNumber: "08123456789",
    customerName: "Acep Diagnostics",
    callbackUrl: "https://google.com",
    returnUrl: "https://google.com"
};

const signature = md5(config.merchantCode + config.orderId + config.amount + config.merchantKey);

async function testV2() {
    console.log("\n--- Testing V2 Inquiry (QRIS) ---");
    try {
        const res = await fetch("https://sandbox.duitku.com/webapi/api/merchant/v2/inquiry", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...config,
                merchantOrderId: config.orderId,
                paymentAmount: config.amount,
                customerDetail: config.customerName,
                paymentMethod: "QRIS",
                signature
            })
        });
        const data = await res.json();
        console.log("Status:", res.status, "Message:", data.statusMessage || data.Message || "No Message");
        if (data.paymentUrl) console.log("✅ SUCCESS!");
    } catch (e) { console.log("Fail:", e.message); }
}

async function testV1JSON() {
    console.log("\n--- Testing V1 CreateInvoice (JSON) ---");
    try {
        const res = await fetch("https://sandbox.duitku.com/webapi/api/merchant/createinvoice", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...config,
                merchantOrderId: config.orderId,
                paymentAmount: config.amount,
                customerDetail: config.customerName,
                paymentMethod: "",
                signature
            })
        });
        const data = await res.json();
        console.log("Status:", res.status, "Message:", data.statusMessage || data.Message || "No Message");
        if (data.paymentUrl) console.log("✅ SUCCESS!");
    } catch (e) { console.log("Fail:", e.message); }
}

async function run() {
    await testV2();
    await testV1JSON();
}

run();
