import crypto from 'crypto';

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
    paymentMethod?: string; // 'QRIS' untuk QRIS
    expiryPeriod?: number; // dalam menit
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
 * Menangani permintaan pembayaran, pembuatan tanda tangan, dan validasi webhook
 */
export class DuitkuService {
    private merchantCode: string;
    private merchantKey: string;
    private apiUrl: string = 'https://api.duitku.com';

    constructor(merchantCode: string, merchantKey: string) {
        this.merchantCode = merchantCode;
        this.merchantKey = merchantKey;
    }

    /**
     * Hasilkan tanda tangan MD5 untuk permintaan API DuitKu
     */
    private generateSignature(orderId: string, paymentAmount: number): string {
        const signatureData = `${this.merchantCode}${orderId}${paymentAmount}${this.merchantKey}`;
        return crypto.createHash('md5').update(signatureData).digest('hex');
    }

    /**
     * Periksa tanda tangan MD5 untuk validasi webhook
     */
    private validateWebhookSignature(
        merchantCode: string,
        orderId: string,
        paymentAmount: number,
        signature: string
    ): boolean {
        const expectedSignature = crypto
            .createHash('md5')
            .update(`${merchantCode}${orderId}${paymentAmount}${this.merchantKey}`)
            .digest('hex');
        return signature === expectedSignature;
    }

    /**
     * Buat permintaan pembayaran dengan DuitKu
     * Mengembalikan URL pembayaran untuk QRIS, Virtual Account, atau metode lainnya
     */
    async createPayment(payload: DuitkuPaymentRequest): Promise<DuitkuPaymentResponse> {
        const signature = this.generateSignature(payload.orderId, payload.paymentAmount);

        const requestBody = {
            merchantCode: this.merchantCode,
            paymentAmount: payload.paymentAmount,
            orderId: payload.orderId,
            productDetails: payload.productDetails,
            email: payload.customerEmail,
            phone: payload.customerPhone,
            customerName: payload.customerName,
            returnUrl: payload.returnUrl,
            callbackUrl: payload.callbackUrl,
            signature: signature,
            paymentMethod: payload.paymentMethod || 'QRIS',
            expiryPeriod: payload.expiryPeriod || 60, // Default 60 menit
        };

        try {
            const response = await fetch(`${this.apiUrl}/webapi/api/merchant/createinvoice`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                throw new Error(`Kesalahan API DuitKu: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            // Validasi respons
            if (data.statusCode !== '00') {
                throw new Error(`Kesalahan DuitKu: ${data.statusMessage || 'Kesalahan tidak diketahui'}`);
            }

            return {
                statusCode: data.statusCode,
                statusMessage: data.statusMessage,
                reference: data.reference,
                paymentUrl: data.paymentUrl,
                vaNumber: data.vaNumber,
                qrString: data.qrString,
                qrUrl: data.qrUrl,
            };
        } catch (error: any) {
            console.error('Kesalahan createPayment DuitKu:', error);
            throw error;
        }
    }

    /**
     * Periksa status pembayaran
     */
    async checkPaymentStatus(
        orderId: string,
        paymentAmount: number
    ): Promise<{
        statusCode: string;
        statusMessage: string;
        reference?: string;
        merchantCode?: string;
    }> {
        const signature = this.generateSignature(orderId, paymentAmount);

        const requestBody = {
            merchantCode: this.merchantCode,
            orderId: orderId,
            paymentAmount: paymentAmount,
            signature: signature,
        };

        try {
            const response = await fetch(`${this.apiUrl}/webapi/api/merchant/checkstatus`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                throw new Error(`Kesalahan API DuitKu: ${response.status}`);
            }

            return await response.json();
        } catch (error: any) {
            console.error('Kesalahan checkPaymentStatus DuitKu:', error);
            throw error;
        }
    }

    /**
     * Validasi muatan webhook DuitKu
     */
    validateWebhook(payload: DuitkuWebhookPayload): boolean {
        // Verifikasi kode merchant
        if (payload.merchantCode !== this.merchantCode) {
            console.warn('Kode merchant tidak valid di webhook');
            return false;
        }

        // Validasi tanda tangan
        const isValid = this.validateWebhookSignature(
            payload.merchantCode,
            payload.orderId,
            payload.amount,
            payload.signature
        );

        if (!isValid) {
            console.warn('Tanda tangan tidak valid di webhook');
            return false;
        }

        return true;
    }
}

/**
 * Hitung penghasilan bersih setelah biaya DuitKu (QRIS)
 */
export function calculateNetIncome(grossAmount: number, feePercentage: number = 0.7): number {
    const duitkuFee = Math.round(grossAmount * (feePercentage / 100));
    return grossAmount - duitkuFee;
}
