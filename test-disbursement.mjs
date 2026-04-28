/**
 * Test script untuk Duitku Disbursement API
 * Jalankan: node test-disbursement.mjs
 */

const USER_ID = 3551;
const SECRET_KEY = 'de56f832487bc1ce1de5ff2cfacf8d9486c61da69df6fd61d5537b6b7d6d354d';
const EMAIL = 'test@chakratechnology.com';

// SHA256 menggunakan Web Crypto API (Node 18+)
async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function testCheckBalance() {
    console.log('\n=== TEST 1: CHECK BALANCE ===');
    
    const timestamp = Date.now();
    const signatureData = `${EMAIL}${timestamp}${SECRET_KEY}`;
    const signature = await sha256(signatureData);
    
    const requestBody = {
        userId: USER_ID,
        email: EMAIL,
        timestamp: timestamp,
        signature: signature
    };
    
    console.log('Request:', JSON.stringify(requestBody, null, 2));
    console.log('Signature data:', signatureData);
    
    const url = 'https://sandbox.duitku.com/webapi/api/disbursement/checkbalance';
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });
        
        console.log('HTTP Status:', response.status);
        const text = await response.text();
        console.log('Raw Response:', text);
        
        try {
            const data = JSON.parse(text);
            console.log('Parsed Response:', JSON.stringify(data, null, 2));
        } catch {
            console.log('Response is not valid JSON');
        }
    } catch (err) {
        console.error('Fetch error:', err.message);
    }
}

async function testInquiry() {
    console.log('\n=== TEST 2: INQUIRY (Validasi Rekening BCA) ===');
    
    const timestamp = Date.now();
    const bankCode = '014'; // BCA
    const bankAccount = '8760673566'; // Test account dari dokumentasi
    const amountTransfer = 50000;
    const purpose = 'Test inquiry disbursement';
    
    const signatureData = `${EMAIL}${timestamp}${bankCode}${bankAccount}${amountTransfer}${purpose}${SECRET_KEY}`;
    const signature = await sha256(signatureData);
    
    const requestBody = {
        userId: USER_ID,
        amountTransfer: amountTransfer,
        bankAccount: bankAccount,
        bankCode: bankCode,
        email: EMAIL,
        purpose: purpose,
        timestamp: timestamp,
        signature: signature
    };
    
    console.log('Request:', JSON.stringify(requestBody, null, 2));
    
    const url = 'https://sandbox.duitku.com/webapi/api/disbursement/inquirysandbox';
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });
        
        console.log('HTTP Status:', response.status);
        const text = await response.text();
        console.log('Raw Response:', text);
        
        try {
            const data = JSON.parse(text);
            console.log('Parsed Response:', JSON.stringify(data, null, 2));
            return data;
        } catch {
            console.log('Response is not valid JSON');
            return null;
        }
    } catch (err) {
        console.error('Fetch error:', err.message);
        return null;
    }
}

async function testTransfer(inquiryData) {
    console.log('\n=== TEST 3: TRANSFER ===');
    
    if (!inquiryData || inquiryData.responseCode !== '00') {
        console.log('SKIP: Inquiry gagal, tidak bisa test transfer');
        return;
    }
    
    const timestamp = Date.now();
    const signatureData = `${EMAIL}${timestamp}${inquiryData.bankCode}${inquiryData.bankAccount}${inquiryData.accountName}${inquiryData.custRefNumber}${inquiryData.amountTransfer}Test Disbursement with duitku${inquiryData.disburseId}${SECRET_KEY}`;
    const signature = await sha256(signatureData);
    
    const requestBody = {
        disburseId: String(inquiryData.disburseId),
        userId: USER_ID,
        email: EMAIL,
        bankCode: inquiryData.bankCode,
        bankAccount: inquiryData.bankAccount,
        amountTransfer: inquiryData.amountTransfer,
        accountName: inquiryData.accountName,
        custRefNumber: inquiryData.custRefNumber,
        purpose: 'Test Disbursement with duitku',
        timestamp: timestamp,
        signature: signature
    };
    
    console.log('Request:', JSON.stringify(requestBody, null, 2));
    
    const url = 'https://sandbox.duitku.com/webapi/api/disbursement/transfersandbox';
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });
        
        console.log('HTTP Status:', response.status);
        const text = await response.text();
        console.log('Raw Response:', text);
        
        try {
            const data = JSON.parse(text);
            console.log('Parsed Response:', JSON.stringify(data, null, 2));
        } catch {
            console.log('Response is not valid JSON');
        }
    } catch (err) {
        console.error('Fetch error:', err.message);
    }
}

async function testListBank() {
    console.log('\n=== TEST 4: LIST BANK ===');
    
    const timestamp = Date.now();
    const signatureData = `${EMAIL}${timestamp}${SECRET_KEY}`;
    const signature = await sha256(signatureData);
    
    const requestBody = {
        userId: USER_ID,
        email: EMAIL,
        timestamp: timestamp,
        signature: signature
    };
    
    const url = 'https://sandbox.duitku.com/webapi/api/disbursement/listBank';
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });
        
        console.log('HTTP Status:', response.status);
        const text = await response.text();
        
        try {
            const data = JSON.parse(text);
            console.log('Banks count:', data.bankList?.length || 0);
            if (data.bankList) {
                // Tampilkan 5 bank pertama
                data.bankList.slice(0, 5).forEach(b => {
                    console.log(`  ${b.bankCode} - ${b.bankName} (${b.transferType})`);
                });
            }
        } catch {
            console.log('Raw Response:', text.substring(0, 500));
        }
    } catch (err) {
        console.error('Fetch error:', err.message);
    }
}

// Run all tests
async function main() {
    console.log('========================================');
    console.log('DUITKU DISBURSEMENT API TEST (SANDBOX)');
    console.log('========================================');
    console.log('UserId:', USER_ID);
    console.log('Email:', EMAIL);
    console.log('SecretKey:', SECRET_KEY.substring(0, 10) + '...');
    
    await testCheckBalance();
    const inquiryData = await testInquiry();
    await testTransfer(inquiryData);
    await testListBank();
    
    console.log('\n========================================');
    console.log('TEST SELESAI');
    console.log('========================================');
}

main().catch(console.error);
