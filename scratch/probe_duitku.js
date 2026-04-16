import md5 from 'md5';

const merchantCode = "DS29376";
const merchantKey = "61c51a77ea664c53be0e6e02ce6ddbbe";
const datetime = new Date().toISOString().slice(0, 19).replace('T', ' '); // Format YYYY-MM-DD HH:mm:ss

// Signature untuk list payment method: MD5(merchantCode + datetime + merchantKey)
const signature = md5(merchantCode + datetime + merchantKey);

async function probeMethods() {
    console.log("--- Probing Available Payment Methods ---");
    console.log("Merchant:", merchantCode);
    console.log("Time:", datetime);
    
    try {
        const res = await fetch("https://sandbox.duitku.com/webapi/api/merchant/paymentmethod/getpaymentmethod", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                merchantCode,
                datetime,
                signature
            })
        });
        
        const data = await res.json();
        if (data.paymentFee) {
            console.log("\n✅ BERHASIL! Daftar Metode Pembayaran Aktif:");
            data.paymentFee.forEach(m => {
                console.log(`- [${m.paymentMethod}] ${m.paymentName} (Fee: ${m.totalFee})`);
            });
        } else {
            console.log("\n❌ GAGAL mengambil list:", data);
        }
    } catch (err) {
        console.error("Koneksi gagal:", err.message);
    }
}

probeMethods();
