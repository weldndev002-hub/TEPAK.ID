import { createClient } from '@supabase/supabase-js';

// Helper to get env vars (copied from API pattern)
const getEnv = (key: string) => {
    const clean = (v: any, isUrl = false) => {
        if (typeof v !== 'string') return v;
        let cleaned = v.trim().replace(/^["']|["']$/g, '');
        if (isUrl) cleaned = cleaned.replace(/\/+$/, '');
        return cleaned;
    };

    // 1. Try passed runtime env (Cloudflare v6+)
    if (typeof cfEnv !== 'undefined' && cfEnv && cfEnv[key]) return clean(cfEnv[key], key.includes('URL'));

    // 2. Vite / Astro Build-time (PUBLIC_ vars)
    if (typeof import.meta !== 'undefined' && import.meta.env && (import.meta.env as any)[key]) {
        return clean((import.meta.env as any)[key], key.includes('URL'));
    }

    // 3. Process ENV fallback (Local Node.js)
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
        return clean(process.env[key], key.includes('URL'));
    }

    // 4. Global Fallback (Cloudflare Workers Standard)
    if (typeof globalThis !== 'undefined') {
        const val = (globalThis as any)[key];
        if (val) return clean(val, key.includes('URL'));
        if ((globalThis as any).env && (globalThis as any).env[key]) {
            return clean((globalThis as any).env[key], key.includes('URL'));
        }
    }

    return null;
};

// Global cfEnv reference (matching API pattern)
declare const cfEnv: any;

// Simple token generator (alternative to uuid)
function generateToken(): string {
    return 'dd_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

/**
 * Generate a signed URL for a file in Supabase Storage
 * Note: This requires the file to be in a private bucket
 */
async function generateSignedUrl(filePath: string, expiresInSeconds = 7 * 24 * 60 * 60): Promise<string | null> {
    try {
        const supabaseUrl = getEnv('PUBLIC_SUPABASE_URL') || '';
        const supabaseKey = getEnv('SUPABASE_SERVICE_ROLE_KEY') || getEnv('PUBLIC_SUPABASE_ANON_KEY') || '';

        if (!supabaseUrl || !supabaseKey) {
            console.error('Missing Supabase credentials for signed URL generation');
            return null;
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        // Extract bucket and path from file_url
        // Assuming format: https://[project].supabase.co/storage/v1/object/public/bucket/path/to/file.pdf
        // For private bucket, we need to use signed URLs
        const url = new URL(filePath);
        const pathParts = url.pathname.split('/');
        const bucket = pathParts[4]; // after /storage/v1/object/public/
        const fileKey = pathParts.slice(5).join('/');

        const { data, error } = await supabase.storage
            .from(bucket)
            .createSignedUrl(fileKey, expiresInSeconds);

        if (error) {
            console.error('Error generating signed URL:', error);
            return null;
        }

        return data.signedUrl;
    } catch (error) {
        console.error('Exception in generateSignedUrl:', error);
        return null;
    }
}

/**
 * Create a digital delivery record and send email
 */
export async function createDigitalDelivery(
    orderId: string,
    customerEmail: string,
    fileUrl: string,
    siteBaseUrl?: string
): Promise<{ success: boolean; token?: string; error?: string }> {
    try {
        const supabaseUrl = getEnv('PUBLIC_SUPABASE_URL') || '';
        const supabaseKey = getEnv('SUPABASE_SERVICE_ROLE_KEY') || '';

        const token = generateToken();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        // Try to generate signed URL, but fall back to original URL if it fails
        // (This handles both private buckets and public file URLs)
        let signedUrl: string | null = null;
        try {
            signedUrl = await generateSignedUrl(fileUrl);
        } catch (e) {
            console.warn('[Digital Delivery] Could not generate signed URL, using original file URL:', e);
        }
        // For public buckets/URLs, just use the original file URL directly
        const downloadUrl = signedUrl || fileUrl;

        // Try to insert into digital_deliveries table (optional - email still sent if this fails)
        if (supabaseUrl && supabaseKey) {
            try {
                const supabase = createClient(supabaseUrl, supabaseKey);
                const { error: insertError } = await supabase
                    .from('digital_deliveries')
                    .insert({
                        order_id: orderId,
                        token,
                        file_url: fileUrl,
                        signed_url: downloadUrl,
                        expires_at: expiresAt.toISOString(),
                        accessed_email: customerEmail,
                    });

                if (insertError) {
                    // Log the error but DO NOT stop email from being sent
                    console.error('[Digital Delivery] DB insert error (non-fatal):', insertError.message);
                    console.warn('[Digital Delivery] ⚠️ TABLE "digital_deliveries" may not exist yet. Run the migration SQL in Supabase!');
                }
            } catch (dbError) {
                console.error('[Digital Delivery] DB error (non-fatal):', dbError);
            }
        }

        // ALWAYS send the email regardless of DB status
        await sendDigitalDeliveryEmail(customerEmail, token, downloadUrl, siteBaseUrl);

        return { success: true, token };
    } catch (error: any) {
        console.error('Error in createDigitalDelivery:', error);
        return { success: false, error: error.message };
    }
}


/**
 * Send email with download link using Resend API
 */
async function sendDigitalDeliveryEmail(
    toEmail: string,
    token: string,
    downloadUrl: string,
    siteBaseUrl?: string
): Promise<void> {
    try {
        console.log(`[Digital Delivery Email] To: ${toEmail}`);
        console.log(`[Digital Delivery Email] Token: ${token}`);

        // Get Resend API key from environment only
        const resendApiKey = getEnv('RESEND_API_KEY');

        if (!resendApiKey) {
            console.error('[Digital Delivery Email] RESEND_API_KEY is required but not set in environment');
            throw new Error('RESEND_API_KEY is not configured');
        }

        // Create a user-friendly download page URL
        const siteUrl = siteBaseUrl || getEnv('PUBLIC_SITE_URL') || 'https://tepak.id';
        const downloadPageUrl = `${siteUrl}/digital-delivery/${token}?email=${encodeURIComponent(toEmail)}`;

        const emailData = {
            from: 'Tepak.ID <no-reply@tepak.id>',
            to: toEmail,
            subject: 'Tautan Unduhan Produk Digital Anda - Tepak.ID',
            html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Unduhan Produk Digital</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Pembayaran Berhasil!</h1>
              <p>Produk digital Anda siap diunduh</p>
            </div>
            <div class="content">
              <h2>Halo Pembeli,</h2>
              <p>Terima kasih telah melakukan pembelian di Tepak.ID. Produk digital yang Anda beli telah siap untuk diunduh.</p>
              
              <p style="margin: 25px 0; text-align: center;">
                <a href="${downloadPageUrl}" class="button">📥 Unduh Produk Sekarang</a>
              </p>
              
              <p><strong>Detail Pengunduhan:</strong></p>
              <ul>
                <li>Tautan unduhan hanya berlaku selama 7 hari</li>
                <li>Tautan hanya dapat diakses dengan email ini: <strong>${toEmail}</strong></li>
                <li>Jika tautan tidak berfungsi, salin dan tempel URL berikut di browser:<br>
                  <code style="background: #eee; padding: 5px; border-radius: 3px; word-break: break-all;">${downloadPageUrl}</code>
                </li>
              </ul>
              
              <p>Jika Anda mengalami masalah dengan pengunduhan, silakan hubungi kreator produk atau tim support kami.</p>
              
              <div class="footer">
                <p>&copy; ${new Date().getFullYear()} Tepak.ID. Semua hak dilindungi undang-undang.</p>
                <p>Email ini dikirim secara otomatis, mohon tidak membalas email ini.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
            text: `Pembayaran berhasil! Produk digital Anda siap diunduh. Klik tautan berikut untuk mengunduh: ${downloadPageUrl}\n\nTautan hanya berlaku 7 hari dan hanya dapat diakses dengan email: ${toEmail}\n\nJika mengalami masalah, hubungi support@tepak.id`
        };

        // Send email using Resend API directly
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${resendApiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(emailData),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[Digital Delivery Email] Resend API error:', response.status, errorText);
            return;
        }

        const result = await response.json();
        console.log('[Digital Delivery Email] Email sent successfully:', result.id);
    } catch (error) {
        console.error('Error sending email:', error);
    }
}

/**
 * Verify token and check access
 */
export async function verifyTokenAccess(
    token: string,
    accessingEmail: string
): Promise<{
    valid: boolean;
    error?: string;
    fileUrl?: string;
    signedUrl?: string;
}> {
    try {
        const supabaseUrl = getEnv('PUBLIC_SUPABASE_URL') || '';
        const supabaseKey = getEnv('SUPABASE_SERVICE_ROLE_KEY') || '';

        if (!supabaseUrl || !supabaseKey) {
            return { valid: false, error: 'Server configuration error' };
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        // Get digital delivery record
        const { data: delivery, error } = await supabase
            .from('digital_deliveries')
            .select('*')
            .eq('token', token)
            .single();

        if (error || !delivery) {
            return { valid: false, error: 'Invalid or expired token' };
        }

        // Check expiry
        const now = new Date();
        const expiresAt = new Date(delivery.expires_at);
        if (now > expiresAt) {
            return { valid: false, error: 'Token has expired' };
        }

        // Check email match
        if (delivery.accessed_email.toLowerCase() !== accessingEmail.toLowerCase()) {
            // Update access count for tracking
            await supabase
                .from('digital_deliveries')
                .update({
                    access_count: delivery.access_count + 1,
                    last_accessed_at: now.toISOString(),
                })
                .eq('id', delivery.id);

            return { valid: false, error: 'EMAIL_MISMATCH' };
        }

        // Valid access - update stats
        await supabase
            .from('digital_deliveries')
            .update({
                access_count: delivery.access_count + 1,
                last_accessed_at: now.toISOString(),
            })
            .eq('id', delivery.id);

        return {
            valid: true,
            fileUrl: delivery.file_url,
            signedUrl: delivery.signed_url
        };
    } catch (error: any) {
        console.error('Error in verifyTokenAccess:', error);
        return { valid: false, error: error.message };
    }
}