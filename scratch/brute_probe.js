import md5 from 'md5';

const config = {
    merchantCode: "DS29376",
    merchantKey: "61c51a77ea664c53be0e6e02ce6ddbbe",
    amount: 10000, // Coba angka kecil dulu
    orderId: "PROBE" + Date.now(),
    productDetails: "Probe Method",
    email: "acepali2253@gmail.com",
    phoneNumber: "08123456789",
    customerName: "Acep Probe",
    callbackUrl: "https://google.com",
    returnUrl: "https://google.com"
};

const methods = ["QRIS", "VC", "VA", "BT", "B1", "A1", "SP", "DA", "OV", "FT", "LA"];

async function probe() {
    console.log("--- Probing Active Channels ---");
    for (const method of methods) {
        const orderId = "CH" + method + Date.now();
        const signature = md5(config.merchantCode + orderId + config.amount + config.merchantKey);
        
        try {
            const res = await fetch("https://sandbox.duitku.com/webapi/api/merchant/v2/inquiry", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    merchantCode: config.merchantCode,
                    paymentAmount: config.amount,
                    merchantOrderId: orderId,
                    productDetails: config.productDetails,
                    email: config.email,
                    phoneNumber: config.phoneNumber,
                    customerName: config.customerName,
                    returnUrl: config.returnUrl,
                    callbackUrl: config.callbackUrl,
                    signature: signature,
                    paymentMethod: method
                })
            });
            const data = await res.json();
            if (data.paymentUrl) {
                console.log(`✅ [${method}] SUCCESS! URL: ${data.paymentUrl}`);
            } else {
                console.log(`❌ [${method}] FAILED: ${data.statusMessage || data.Message}`);
            }
        } catch (e) {
            console.log(`⚠️ [${method}] ERROR: ${e.message}`);
        }
    }
}

probe();
