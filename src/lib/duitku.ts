// Gunakan lightweight MD5 untuk menghindari masalah node:crypto di environment Edge/Worker
import md5 from 'md5';

export interface DuitkuItemDetail {
    name: string;
    price: number;
    qty: number;
}

export interface DuitkuPaymentRequest {
    merchantCode: string;
    merchantKey: string;
    paymentAmount: number;
    orderId: string;
    productDetails: string;
    customerEmail: string;
    customerPhone: string;
    customerName: string;
    returnUrl: string;
    callbackUrl: string;
    paymentMethod?: string;
    expiryPeriod?: number;
    itemDetails?: DuitkuItemDetail[];
}

export interface DuitkuPaymentResponse {
    statusCode: string;
    statusMessage: string;
    reference: string;
    paymentUrl: string;
    vaNumber?: string;
    qrString?: string;
    qrUrl?: string;
}

export interface DuitkuWebhookPayload {
    merchantCode: string;
    amount: number;
    orderId: string;
    reference: string;
    statusCode: string;
    statusMessage: string;
    signature: string;
}

/**
 * Layanan Gateway Pembayaran DuitKu
 */
export class DuitkuService {
    private merchantKey: string;
    private merchantCode: string;
    private apiUrl: string = 'https://api.duitku.com';
    private isSandbox: boolean = false;

    constructor(merchantCode: string, merchantKey: string) {
        this.merchantCode = merchantCode;
        this.merchantKey = merchantKey;
        if (this.merchantCode && this.merchantCode.startsWith('DS')) {
            this.apiUrl = 'https://sandbox.duitku.com';
            this.isSandbox = true;
        } else {
            this.apiUrl = 'https://api.duitku.com';
            this.isSandbox = false;
        }
    }

    private generateSignature(orderId: string, paymentAmount: number): string {
        const signatureData = `${this.merchantCode}${orderId}${paymentAmount}${this.merchantKey}`;
        return md5(signatureData);
    }

    private validateWebhookSignature(
        merchantCode: string,
        orderId: string,
        paymentAmount: any,
        signature: string
    ): boolean {
        // Duitku mengharapkan amount tanpa desimal dalam signature
        const amount = Math.floor(Number(paymentAmount));

        // Versi A: MerchantCode + OrderId + Amount + Key (Format paling umum)
        const sigA = md5(`${merchantCode}${orderId}${amount}${this.merchantKey}`);

        // Versi B: MerchantCode + Amount + OrderId + Key (Sering digunakan di V2 Callback)
        const sigB = md5(`${merchantCode}${amount}${orderId}${this.merchantKey}`);

        // Versi C: Amount + MerchantCode + OrderId + Key (Format alternatif)
        const sigC = md5(`${amount}${merchantCode}${orderId}${this.merchantKey}`);

        // Versi D: OrderId + MerchantCode + Amount + Key (Format legacy)
        const sigD = md5(`${orderId}${merchantCode}${amount}${this.merchantKey}`);

        // Versi E: MerchantCode + OrderId + paymentAmount (string) + Key
        const sigE = md5(`${merchantCode}${orderId}${paymentAmount}${this.merchantKey}`);

        const matches = signature === sigA || signature === sigB || signature === sigC || signature === sigD || signature === sigE;

        console.log('[Duitku Webhook] Verifikasi Signature:', {
            merchantCode,
            orderId,
            amount,
            received_sig: signature,
            exp_A: sigA,
            exp_B: sigB,
            exp_C: sigC,
            exp_D: sigD,
            exp_E: sigE,
            match: matches,
            matching_format: matches ?
                (signature === sigA ? 'A' :
                    signature === sigB ? 'B' :
                        signature === sigC ? 'C' :
                            signature === sigD ? 'D' : 'E') : 'NONE'
        });

        return matches;
    }

    async createPayment(payload: DuitkuPaymentRequest): Promise<DuitkuPaymentResponse> {
        // KEMBALI KE V2 karena V1 terbukti tidak stabil (Error 500) di Sandbox
        const endpoint = '/webapi/api/merchant/v2/inquiry';
        const fullUrl = `${this.apiUrl}${endpoint}`;

        const orderId = payload.orderId;

        // V2 Signature: MD5(merchantCode + orderId + amount + merchantKey)
        const signature = md5(this.merchantCode + orderId + payload.paymentAmount + this.merchantKey);

        // Gunakan method dari payload, jika kosong gunakan 'SP' (ShopeePay) karena paling stabil di Sandbox Anda
        const selectedMethod = payload.paymentMethod || (this.isSandbox ? 'SP' : 'QRIS');

        const safeVaName = (payload.customerName || 'Customer')
            .replace(/[^a-zA-Z0-9 ]/g, '')
            .substring(0, 20)
            .trim();

        const requestBodyV2: any = {
            merchantCode: this.merchantCode,
            paymentAmount: payload.paymentAmount,
            merchantOrderId: orderId,
            productDetails: payload.productDetails,
            customerName: payload.customerName,
            customerVaName: safeVaName,
            email: payload.customerEmail,
            phoneNumber: payload.customerPhone || '08123456789',
            callbackUrl: payload.callbackUrl,
            returnUrl: payload.returnUrl,
            signature: signature,
            expiryPeriod: 60,
            paymentMethod: selectedMethod
        };

        // Tambahkan itemDetails jika disediakan (informasi paket yang lebih detail)
        if (payload.itemDetails && payload.itemDetails.length > 0) {
            requestBodyV2.itemDetails = payload.itemDetails;
        }

        console.log(`[Duitku] ${this.isSandbox ? 'SANDBOX' : 'PROD'} V2 Request (${selectedMethod}):`, fullUrl);

        try {
            const response = await fetch(fullUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(requestBodyV2)
            });

            const data: any = await response.json();

            if (data.statusCode === '00' || data.paymentUrl) {
                return {
                    statusCode: data.statusCode || '00',
                    statusMessage: data.statusMessage || 'SUCCESS',
                    reference: data.reference,
                    paymentUrl: data.paymentUrl,
                    vaNumber: data.vaNumber,
                    qrString: data.qrString,
                    qrUrl: data.qrUrl,
                };
            }

            const errorMsg = data.statusMessage || data.Message || JSON.stringify(data);
            throw new Error(errorMsg);

        } catch (error: any) {
            console.error('Kesalahan createPayment DuitKu V2:', error.message);
            throw new Error(`DuitKu: ${error.message}`);
        }
    }

    async checkPaymentStatus(orderId: string, paymentAmount: number) {
        return { statusCode: '01', statusMessage: 'PENDING' };
    }

    validateWebhook(body: any): boolean {
        // Duitku mengirim 'merchantOrderId' dan 'amount' (atau 'paymentAmount')
        const merchantCode = body.merchantCode;
        const merchantOrderId = body.merchantOrderId;
        const amount = body.amount || body.paymentAmount;
        const signature = body.signature;

        return this.validateWebhookSignature(merchantCode, merchantOrderId, amount, signature);
    }
}

export function calculateNetIncome(grossAmount: number, feePercentage: number = 0.7): number {
    const duitkuFee = Math.round(grossAmount * (feePercentage / 100));
    return grossAmount - duitkuFee;
}
