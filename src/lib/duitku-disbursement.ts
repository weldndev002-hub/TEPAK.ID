/**
 * Duitku Disbursement API - Modul Penarikan Dana / Transfer Bank
 *
 * Referensi resmi: https://docs.duitku.com/disbursement/id/
 *
 * Perbedaan penting dengan Payment API:
 * - Menggunakan SHA256 (bukan MD5) untuk signature
 * - Timestamp dalam MILLISECONDS (bukan seconds)
 * - Production URL: passport.duitku.com (bukan api.duitku.com)
 * - Response menggunakan responseCode/responseDesc (bukan statusCode/statusMessage)
 * - Inquiry menghasilkan disburseId yang WAJIB dikirim ke transfer
 * - Transfer menghasilkan custRefNumber dari inquiry yang WAJIB dikirim kembali
 *
 * Mode Sandbox: Gunakan userId dari akun sandbox Duitku
 */

import md5 from 'md5';

// --- Types / Interfaces ---

export interface DisbursementConfig {
    userId: number;       // Duitku Disbursement User ID (integer, bukan string)
    apiKey: string;       // Duitku Disbursement Secret Key (untuk signature)
    email: string;        // Email akun Duitku (wajib untuk signature)
    isSandbox?: boolean;  // Override sandbox detection
}

export interface BalanceResponse {
    responseCode: string;     // '00' = sukses
    responseDesc: string;
    userId: number;
    email: string;
    balance: number;          // Saldo saat ini sebelum settlement
    effectiveBalance: number; // Saldo efektif yang bisa digunakan untuk disbursement
}

export interface InquiryResponse {
    responseCode: string;     // '00' = sukses
    responseDesc: string;
    userId: number;
    email: string;
    bankCode: string;
    bankAccount: string;
    amountTransfer: number;
    accountName: string;      // Nama pemilik rekening (dari bank)
    custRefNumber: string;    // 9 digit nomor referensi (WAJIB dikirim ke transfer)
    disburseId: string;       // Disbursement ID dari Duitku (WAJIB dikirim ke transfer)
    senderId: number;
    senderName: string;
    purpose: string;
}

export interface TransferResponse {
    responseCode: string;     // '00' = sukses
    responseDesc: string;
    email: string;
    bankCode: string;
    bankAccount: string;
    amountTransfer: number;
    accountName: string;
    custRefNumber: string;
}

export interface InquiryStatusResponse {
    responseCode: string;
    responseDesc: string;
    bankCode: string;
    bankAccount: string;
    amountTransfer: number;
    accountName: string;
    custRefNumber: string;
}

export interface BankListResponse {
    responseCode: string;
    responseDesc: string;
    banks: Array<{
        bankCode: string;
        bankName: string;
        transferType: string;
    }>;
}

export interface DisbursementWebhookPayload {
    disburseId: string;
    custRefNumber: string;
    responseCode: string;    // '00' = sukses
    responseDesc: string;
    amountTransfer: number;
    bankCode: string;
    bankAccount: string;
    accountName: string;
    signature: string;
}

// --- Helper: Environment Variable Getter ---

const getEnv = (key: string): string | null => {
    const clean = (v: any, isUrl = false) => {
        if (typeof v !== 'string') return v;
        let cleaned = v.trim().replace(/^["']|["']$/g, '');
        if (isUrl) cleaned = cleaned.replace(/\/+$/, '');
        return cleaned;
    };

    // 1. Cloudflare Workers runtime env
    if (typeof cfEnv !== 'undefined' && cfEnv && cfEnv[key]) return clean(cfEnv[key], key.includes('URL'));

    // 2. Vite / Astro build-time
    if (typeof import.meta !== 'undefined' && import.meta.env && (import.meta.env as any)[key]) {
        return clean((import.meta.env as any)[key], key.includes('URL'));
    }

    // 3. Process env (local Node.js)
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
        return clean(process.env[key], key.includes('URL'));
    }

    // 4. Global fallback (Cloudflare Workers standard)
    if (typeof globalThis !== 'undefined') {
        const val = (globalThis as any)[key];
        if (val) return clean(val, key.includes('URL'));
        if ((globalThis as any).env && (globalThis as any).env[key]) {
            return clean((globalThis as any).env[key], key.includes('URL'));
        }
    }

    return null;
};

declare const cfEnv: any;

// --- SHA256 Helper ---
// Duitku Disbursement menggunakan SHA256 untuk signature (bukan MD5 seperti Payment API)
async function sha256(message: string): Promise<string> {
    try {
        // Web Crypto API (tersedia di Edge/Workers/Browser)
        const msgBuffer = new TextEncoder().encode(message);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch {
        // Fallback: gunakan md5 sebagai hash sederhana (TIDAK AMAN untuk production)
        // Ini hanya fallback untuk environment yang tidak mendukung Web Crypto
        console.warn('[Duitku Disbursement] Web Crypto not available, using fallback hash');
        return md5(message);
    }
}

// --- Duitku Disbursement Service ---

export class DuitkuDisbursementService {
    private userId: number;
    private apiKey: string;
    private email: string;
    private isSandbox: boolean;

    // URL berbeda dari Payment API!
    // Sandbox: sandbox.duitku.com
    // Production: passport.duitku.com (BUKAN api.duitku.com)
    private get inquiryUrl(): string {
        return this.isSandbox
            ? 'https://sandbox.duitku.com/webapi/api/disbursement/inquirysandbox'
            : 'https://passport.duitku.com/webapi/api/disbursement/inquiry';
    }

    private get transferUrl(): string {
        return this.isSandbox
            ? 'https://sandbox.duitku.com/webapi/api/disbursement/transfersandbox'
            : 'https://passport.duitku.com/webapi/api/disbursement/transfer';
    }

    private get checkBalanceUrl(): string {
        return this.isSandbox
            ? 'https://sandbox.duitku.com/webapi/api/disbursement/checkbalance'
            : 'https://passport.duitku.com/webapi/api/disbursement/checkbalance';
    }

    private get inquiryStatusUrl(): string {
        return this.isSandbox
            ? 'https://sandbox.duitku.com/webapi/api/disbursement/inquirystatus'
            : 'https://passport.duitku.com/webapi/api/disbursement/inquirystatus';
    }

    private get listBankUrl(): string {
        return this.isSandbox
            ? 'https://sandbox.duitku.com/webapi/api/disbursement/listBank'
            : 'https://passport.duitku.com/webapi/api/disbursement/listBank';
    }

    constructor(config?: Partial<DisbursementConfig>) {
        // Ambil dari env jika tidak disediakan secara eksplisit
        const envUserId = getEnv('DUITKU_DISBURSEMENT_USER_ID');
        this.userId = config?.userId || (envUserId ? Number(envUserId) : 0);
        this.apiKey = config?.apiKey || getEnv('DUITKU_DISBURSEMENT_KEY') || '';
        this.email = config?.email || getEnv('DUITKU_DISBURSEMENT_EMAIL') || '';

        // Deteksi sandbox dari env flag
        const envFlag = getEnv('DUITKU_ENVIRONMENT');
        if (config?.isSandbox !== undefined) {
            this.isSandbox = config.isSandbox;
        } else {
            this.isSandbox = envFlag === 'sandbox';
        }

        console.log(`[Duitku Disbursement] Mode: ${this.isSandbox ? 'SANDBOX' : 'PRODUCTION'}`);
        console.log(`[Duitku Disbursement] UserId: ${this.userId}, Email: ${this.email ? '***' : 'MISSING'}`);
    }

    /**
     * Generate signature untuk Check Balance / List Bank
     * Format: SHA256(email + timestamp + secretKey)
     */
    private async generateBalanceSignature(timestamp: number): Promise<string> {
        const data = `${this.email}${timestamp}${this.apiKey}`;
        return sha256(data);
    }

    /**
     * Generate signature untuk Inquiry Request
     * Format: SHA256(email + timestamp + bankCode + bankAccount + amountTransfer + purpose + secretKey)
     */
    private async generateInquirySignature(
        timestamp: number,
        bankCode: string,
        bankAccount: string,
        amountTransfer: number,
        purpose: string
    ): Promise<string> {
        const data = `${this.email}${timestamp}${bankCode}${bankAccount}${amountTransfer}${purpose}${this.apiKey}`;
        return sha256(data);
    }

    /**
     * Generate signature untuk Transfer Request
     * Format: SHA256(email + timestamp + bankCode + bankAccount + accountName + custRefNumber + amountTransfer + purpose + disburseId + secretKey)
     */
    private async generateTransferSignature(
        timestamp: number,
        bankCode: string,
        bankAccount: string,
        accountName: string,
        custRefNumber: string,
        amountTransfer: number,
        purpose: string,
        disburseId: string
    ): Promise<string> {
        const data = `${this.email}${timestamp}${bankCode}${bankAccount}${accountName}${custRefNumber}${amountTransfer}${purpose}${disburseId}${this.apiKey}`;
        return sha256(data);
    }

    /**
     * Generate signature untuk Inquiry Status
     * Format: SHA256(email + timestamp + disburseId + secretKey)
     */
    private async generateStatusSignature(timestamp: number, disburseId: string): Promise<string> {
        const data = `${this.email}${timestamp}${disburseId}${this.apiKey}`;
        return sha256(data);
    }

    /**
     * Generate signature untuk webhook callback verification
     * Format: SHA256(disburseId + responseCode + responseDesc + bankCode + bankAccount + amountTransfer + secretKey)
     * Note: Format ini perlu dikonfirmasi dengan Duitku, karena tidak terdokumentasi secara eksplisit
     */
    async generateWebhookSignature(payload: DisbursementWebhookPayload): Promise<string> {
        const data = `${payload.disburseId}${payload.responseCode}${payload.responseDesc}${payload.bankCode}${payload.bankAccount}${payload.amountTransfer}${this.apiKey}`;
        return sha256(data);
    }

    /**
     * Validasi webhook callback dari Duitku
     */
    async validateWebhook(payload: DisbursementWebhookPayload): Promise<boolean> {
        const expectedSig = await this.generateWebhookSignature(payload);
        const isValid = payload.signature === expectedSig;

        console.log('[Duitku Disbursement Webhook] Signature validation:', {
            disburseId: payload.disburseId,
            expected: expectedSig,
            received: payload.signature,
            isValid
        });

        return isValid;
    }

    /**
     * Cek saldo akun Duitku
     * Method: HTTP POST
     * Signature: SHA256(email + timestamp + secretKey)
     */
    async checkBalance(): Promise<BalanceResponse> {
        // Timestamp dalam MILLISECONDS
        const timestamp = Date.now();
        const signature = await this.generateBalanceSignature(timestamp);

        const requestBody = {
            userId: this.userId,
            email: this.email,
            timestamp: timestamp,
            signature: signature
        };

        console.log(`[Duitku Disbursement] Checking balance...`);

        try {
            const response = await fetch(this.checkBalanceUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            const responseText = await response.text();
            console.log(`[Duitku Disbursement] checkBalance raw response: ${responseText}`);

            let data: any;
            try {
                data = JSON.parse(responseText);
            } catch {
                throw new Error(`Response bukan JSON valid: ${responseText.substring(0, 200)}`);
            }

            if (data.responseCode === '00') {
                console.log(`[Duitku Disbursement] Balance: Rp ${Number(data.effectiveBalance || data.balance).toLocaleString('id-ID')}`);
                return {
                    responseCode: data.responseCode,
                    responseDesc: data.responseDesc || 'Success',
                    userId: data.userId || this.userId,
                    email: data.email || this.email,
                    balance: Number(data.balance || 0),
                    effectiveBalance: Number(data.effectiveBalance || 0)
                };
            }

            throw new Error(data.responseDesc || `Gagal cek saldo (code: ${data.responseCode})`);
        } catch (error: any) {
            console.error('[Duitku Disbursement] checkBalance error:', error.message);
            throw new Error(`Duitku Disbursement checkBalance: ${error.message}`);
        }
    }

    /**
     * Inquiry / Validasi nomor rekening bank
     * Method: HTTP POST
     * Signature: SHA256(email + timestamp + bankCode + bankAccount + amountTransfer + purpose + secretKey)
     *
     * Mengembalikan disburseId dan custRefNumber yang WAJIB dikirim ke transfer request.
     */
    async inquiryAccount(
        bankCode: string,
        bankAccount: string,
        amountTransfer: number,
        purpose: string = 'Disbursement Tepak.ID',
        senderId?: number,
        senderName?: string
    ): Promise<InquiryResponse> {
        // Timestamp dalam MILLISECONDS
        const timestamp = Date.now();
        const signature = await this.generateInquirySignature(
            timestamp, bankCode, bankAccount, amountTransfer, purpose
        );

        const requestBody: any = {
            userId: this.userId,
            amountTransfer: amountTransfer,
            bankAccount: bankAccount,
            bankCode: bankCode,
            email: this.email,
            purpose: purpose,
            timestamp: timestamp,
            signature: signature
        };

        // Optional fields
        if (senderId) requestBody.senderId = senderId;
        if (senderName) requestBody.senderName = senderName;

        console.log(`[Duitku Disbursement] Inquiry: bank=${bankCode}, account=${bankAccount}, amount=${amountTransfer}`);

        try {
            const response = await fetch(this.inquiryUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            const responseText = await response.text();
            console.log(`[Duitku Disbursement] inquiry raw response: ${responseText}`);

            let data: any;
            try {
                data = JSON.parse(responseText);
            } catch {
                throw new Error(`Response bukan JSON valid: ${responseText.substring(0, 200)}`);
            }

            if (data.responseCode === '00') {
                console.log(`[Duitku Disbursement] Inquiry success: ${data.accountName}, disburseId: ${data.disburseId}`);
                return {
                    responseCode: data.responseCode,
                    responseDesc: data.responseDesc || 'Success',
                    userId: data.userId || this.userId,
                    email: data.email || this.email,
                    bankCode: data.bankCode || bankCode,
                    bankAccount: data.bankAccount || bankAccount,
                    amountTransfer: Number(data.amountTransfer || amountTransfer),
                    accountName: data.accountName || '',
                    custRefNumber: data.custRefNumber || '',
                    disburseId: String(data.disburseId || ''),
                    senderId: data.senderId || 0,
                    senderName: data.senderName || '',
                    purpose: data.purpose || purpose
                };
            }

            throw new Error(data.responseDesc || `Inquiry gagal (code: ${data.responseCode})`);
        } catch (error: any) {
            console.error('[Duitku Disbursement] inquiryAccount error:', error.message);
            throw new Error(`Duitku Disbursement inquiry: ${error.message}`);
        }
    }

    /**
     * Eksekusi transfer dana ke rekening bank
     * Method: HTTP POST
     * Signature: SHA256(email + timestamp + bankCode + bankAccount + accountName + custRefNumber + amountTransfer + purpose + disburseId + secretKey)
     *
     * WAJIB menggunakan data dari inquiry response (disburseId, custRefNumber, accountName).
     */
    async requestTransfer(inquiryResult: InquiryResponse): Promise<TransferResponse> {
        if (!inquiryResult.disburseId) {
            throw new Error('disburseId dari inquiry wajib diisi. Jalankan inquiryAccount() terlebih dahulu.');
        }
        if (!inquiryResult.custRefNumber) {
            throw new Error('custRefNumber dari inquiry wajib diisi. Jalankan inquiryAccount() terlebih dahulu.');
        }

        // Timestamp dalam MILLISECONDS
        const timestamp = Date.now();
        const signature = await this.generateTransferSignature(
            timestamp,
            inquiryResult.bankCode,
            inquiryResult.bankAccount,
            inquiryResult.accountName,
            inquiryResult.custRefNumber,
            inquiryResult.amountTransfer,
            inquiryResult.purpose || 'Disbursement Tepak.ID',
            inquiryResult.disburseId
        );

        const requestBody = {
            disburseId: inquiryResult.disburseId,
            userId: this.userId,
            email: this.email,
            bankCode: inquiryResult.bankCode,
            bankAccount: inquiryResult.bankAccount,
            amountTransfer: inquiryResult.amountTransfer,
            accountName: inquiryResult.accountName,
            custRefNumber: inquiryResult.custRefNumber,
            purpose: inquiryResult.purpose || 'Disbursement Tepak.ID',
            timestamp: timestamp,
            signature: signature
        };

        console.log(`[Duitku Disbursement] Transfer: disburseId=${inquiryResult.disburseId}, amount=${inquiryResult.amountTransfer}`);

        try {
            const response = await fetch(this.transferUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            const responseText = await response.text();
            console.log(`[Duitku Disbursement] transfer raw response: ${responseText}`);

            let data: any;
            try {
                data = JSON.parse(responseText);
            } catch {
                throw new Error(`Response bukan JSON valid: ${responseText.substring(0, 200)}`);
            }

            if (data.responseCode === '00') {
                console.log(`[Duitku Disbursement] Transfer SUCCESS: disburseId=${inquiryResult.disburseId}`);
            } else {
                console.warn(`[Duitku Disbursement] Transfer response: code=${data.responseCode}, desc=${data.responseDesc}`);
            }

            return {
                responseCode: data.responseCode || '',
                responseDesc: data.responseDesc || '',
                email: data.email || this.email,
                bankCode: data.bankCode || inquiryResult.bankCode,
                bankAccount: data.bankAccount || inquiryResult.bankAccount,
                amountTransfer: Number(data.amountTransfer || inquiryResult.amountTransfer),
                accountName: data.accountName || inquiryResult.accountName,
                custRefNumber: data.custRefNumber || inquiryResult.custRefNumber
            };
        } catch (error: any) {
            console.error('[Duitku Disbursement] requestTransfer error:', error.message);
            throw new Error(`Duitku Disbursement transfer: ${error.message}`);
        }
    }

    /**
     * Cek status transfer yang sudah dilakukan
     * Method: HTTP POST
     * Signature: SHA256(email + timestamp + disburseId + secretKey)
     */
    async checkTransferStatus(disburseId: string): Promise<InquiryStatusResponse> {
        const timestamp = Date.now();
        const signature = await this.generateStatusSignature(timestamp, disburseId);

        const requestBody = {
            disburseId: disburseId,
            userId: this.userId,
            email: this.email,
            timestamp: timestamp,
            signature: signature
        };

        console.log(`[Duitku Disbursement] Checking status: disburseId=${disburseId}`);

        try {
            const response = await fetch(this.inquiryStatusUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            const responseText = await response.text();
            console.log(`[Duitku Disbursement] checkStatus raw response: ${responseText}`);

            let data: any;
            try {
                data = JSON.parse(responseText);
            } catch {
                throw new Error(`Response bukan JSON valid: ${responseText.substring(0, 200)}`);
            }

            return {
                responseCode: data.responseCode || '',
                responseDesc: data.responseDesc || '',
                bankCode: data.bankCode || '',
                bankAccount: data.bankAccount || '',
                amountTransfer: Number(data.amountTransfer || 0),
                accountName: data.accountName || '',
                custRefNumber: data.custRefNumber || ''
            };
        } catch (error: any) {
            console.error('[Duitku Disbursement] checkTransferStatus error:', error.message);
            throw new Error(`Duitku Disbursement checkStatus: ${error.message}`);
        }
    }

    /**
     * Get daftar bank yang tersedia untuk disbursement
     * Method: HTTP POST
     * Signature: SHA256(email + timestamp + secretKey)
     */
    async getBankList(): Promise<BankListResponse> {
        const timestamp = Date.now();
        const signature = await this.generateBalanceSignature(timestamp);

        const requestBody = {
            userId: this.userId,
            email: this.email,
            timestamp: timestamp,
            signature: signature
        };

        console.log(`[Duitku Disbursement] Fetching bank list...`);

        try {
            const response = await fetch(this.listBankUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            const responseText = await response.text();
            console.log(`[Duitku Disbursement] bankList raw response: ${responseText.substring(0, 500)}`);

            let data: any;
            try {
                data = JSON.parse(responseText);
            } catch {
                throw new Error(`Response bukan JSON valid: ${responseText.substring(0, 200)}`);
            }

            if (data.responseCode === '00' || data.bankList) {
                console.log(`[Duitku Disbursement] Bank list: ${(data.bankList || []).length} banks`);
                return {
                    responseCode: data.responseCode || '00',
                    responseDesc: data.responseDesc || 'Success',
                    banks: data.bankList || []
                };
            }

            throw new Error(data.responseDesc || 'Gagal mengambil daftar bank');
        } catch (error: any) {
            console.error('[Duitku Disbursement] getBankList error:', error.message);
            throw new Error(`Duitku Disbursement bankList: ${error.message}`);
        }
    }
}

// --- Convenience Functions (singleton pattern) ---

let _disbursementService: DuitkuDisbursementService | null = null;

function getDisbursementService(): DuitkuDisbursementService {
    if (!_disbursementService) {
        _disbursementService = new DuitkuDisbursementService();
    }
    return _disbursementService;
}

/**
 * Cek saldo akun Duitku (convenience function)
 */
export async function checkBalance(): Promise<BalanceResponse> {
    return getDisbursementService().checkBalance();
}

/**
 * Validasi nomor rekening & dapatkan nama pemilik (convenience function)
 */
export async function inquiryAccount(
    bankCode: string,
    bankAccount: string,
    amountTransfer: number,
    purpose?: string
): Promise<InquiryResponse> {
    return getDisbursementService().inquiryAccount(bankCode, bankAccount, amountTransfer, purpose);
}

/**
 * Eksekusi transfer dana (convenience function)
 * WAJIB menggunakan data dari inquiry response
 */
export async function requestTransfer(inquiryResult: InquiryResponse): Promise<TransferResponse> {
    return getDisbursementService().requestTransfer(inquiryResult);
}

/**
 * Cek status transfer (convenience function)
 */
export async function checkTransferStatus(disburseId: string): Promise<InquiryStatusResponse> {
    return getDisbursementService().checkTransferStatus(disburseId);
}

/**
 * Daftar bank tersedia (convenience function)
 */
export async function getBankList(): Promise<BankListResponse> {
    return getDisbursementService().getBankList();
}
