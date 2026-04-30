import { createClient } from '@supabase/supabase-js';

// Helper to get env vars (copied from API pattern)
const getEnv = (key: string, env?: any) => {
    const clean = (v: any, isUrl = false) => {
        if (typeof v !== 'string') return v;
        let cleaned = v.trim().replace(/^["']|["']$/g, '');
        if (isUrl) cleaned = cleaned.replace(/\/+$/, '');
        return cleaned;
    };

    // 1. Try passed runtime env (Cloudflare v6+)
    if (env && env[key]) return clean(env[key], key.includes('URL'));
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
 * For public buckets (like 'product'), returns the original URL
 */
async function generateSignedUrl(filePath: string, env?: any, expiresInSeconds = 7 * 24 * 60 * 60): Promise<string | null> {
    try {
        const supabaseUrl = getEnv('PUBLIC_SUPABASE_URL', env) || '';
        const supabaseKey = getEnv('SUPABASE_SERVICE_ROLE_KEY', env) || getEnv('PUBLIC_SUPABASE_ANON_KEY', env) || '';

        if (!supabaseUrl || !supabaseKey) {
            console.error('Missing Supabase credentials for signed URL generation');
            return null;
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        // Extract bucket and path from file_url
        // Assuming format: https://[project].supabase.co/storage/v1/object/public/bucket/path/to/file.pdf
        const url = new URL(filePath);
        const pathParts = url.pathname.split('/');

        // Check if this is a Supabase Storage URL
        if (pathParts.length < 5 || !pathParts.includes('storage')) {
            console.warn('[Digital Delivery] Not a Supabase Storage URL, returning original:', filePath);
            return filePath;
        }

        const bucketIndex = pathParts.indexOf('object') + 1;
        if (bucketIndex >= pathParts.length) {
            console.warn('[Digital Delivery] Invalid storage URL format:', filePath);
            return filePath;
        }

        const bucket = pathParts[bucketIndex];
        const fileKey = pathParts.slice(bucketIndex + 1).join('/');

        console.log('[Digital Delivery] Extracted bucket:', bucket, 'fileKey:', fileKey);

        // For public buckets like 'product', return original URL (no signed URL needed)
        if (bucket === 'product') {
            console.log('[Digital Delivery] Public bucket detected, using original URL');
            return filePath;
        }

        // For private buckets, generate signed URL
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
        // Return original URL if signed URL generation fails
        console.warn('[Digital Delivery] Falling back to original URL due to error');
        return filePath;
    }
}

/**
 * Create a digital delivery record and send email
 */
export async function createDigitalDelivery(
    orderId: string,
    customerEmail: string,
    fileUrl: string,
    siteBaseUrl?: string,
    env?: any,
    expiryType: string = 'forever'
): Promise<{ success: boolean; token?: string; emailSent?: boolean; emailError?: string; error?: string }> {
    console.log('[Digital Delivery] Starting digital delivery process:', {
        orderId,
        customerEmail: customerEmail ? `${customerEmail.substring(0, 3)}...` : 'MISSING',
        fileUrl: fileUrl ? `${fileUrl.substring(0, 50)}...` : 'MISSING',
        siteBaseUrl
    });

    // Validate file URL
    if (!fileUrl || typeof fileUrl !== 'string') {
        console.error('[Digital Delivery] ❌ Invalid file URL:', fileUrl);
        return { success: false, error: 'File URL is required and must be a valid string' };
    }

    // Check if file URL is absolute or relative
    let finalFileUrl = fileUrl;
    const isAbsoluteUrl = fileUrl.startsWith('http://') || fileUrl.startsWith('https://');
    if (!isAbsoluteUrl) {
        console.warn('[Digital Delivery] ⚠️ File URL is relative, not absolute:', fileUrl);
        console.warn('[Digital Delivery] Relative URLs may not work for digital delivery');
        // Try to construct absolute URL if siteBaseUrl is provided
        if (siteBaseUrl) {
            finalFileUrl = fileUrl.startsWith('/') ? `${siteBaseUrl}${fileUrl}` : `${siteBaseUrl}/${fileUrl}`;
            console.log('[Digital Delivery] Constructed absolute URL:', finalFileUrl);
        } else {
            console.error('[Digital Delivery] ❌ Cannot construct absolute URL - siteBaseUrl not provided');
            return { success: false, error: 'File URL is relative but siteBaseUrl not provided' };
        }
    }

    try {
        const supabaseUrl = getEnv('PUBLIC_SUPABASE_URL', env) || '';
        const supabaseKey = getEnv('SUPABASE_SERVICE_ROLE_KEY', env) || '';

        console.log('[Digital Delivery] Supabase config:', {
            hasUrl: !!supabaseUrl,
            hasKey: !!supabaseKey,
            urlLength: supabaseUrl.length,
            keyLength: supabaseKey.length
        });

        const token = generateToken();
        const expiresAt = new Date();
        
        // Logika masa berlaku fleksibel
        if (expiryType === '24h') {
            expiresAt.setHours(expiresAt.getHours() + 24);
        } else if (expiryType === '7d') {
            expiresAt.setDate(expiresAt.getDate() + 7);
        } else if (expiryType === '30d') {
            expiresAt.setDate(expiresAt.getDate() + 30);
        } else {
            // Default: Selamanya (100 tahun)
            expiresAt.setFullYear(expiresAt.getFullYear() + 100);
        }

        console.log(`[Digital Delivery] Generated token: ${token} with expiry: ${expiryType} (${expiresAt.toISOString()})`);

        // Try to generate signed URL, but fall back to original URL if it fails
        // (This handles both private buckets and public file URLs)
        let signedUrl: string | null = null;
        try {
            console.log('[Digital Delivery] Attempting to generate signed URL for:', finalFileUrl);
            signedUrl = await generateSignedUrl(finalFileUrl, env);
            console.log('[Digital Delivery] Signed URL generated:', signedUrl ? 'Yes' : 'No');
        } catch (e: any) {
            console.warn('[Digital Delivery] Could not generate signed URL, using original file URL:', e.message);
        }
        // For public buckets/URLs, just use the original file URL directly
        const downloadUrl = signedUrl || finalFileUrl;
        console.log('[Digital Delivery] Final download URL:', downloadUrl);

        // Try to insert into digital_deliveries table (optional - email still sent if this fails)
        if (supabaseUrl && supabaseKey) {
            try {
                console.log('[Digital Delivery] Attempting to insert into digital_deliveries table...');
                const supabase = createClient(supabaseUrl, supabaseKey);
                const { error: insertError } = await supabase
                    .from('digital_deliveries')
                    .insert({
                        order_id: orderId,
                        token,
                        file_url: finalFileUrl,
                        signed_url: downloadUrl,
                        expires_at: expiresAt.toISOString(),
                        accessed_email: customerEmail,
                    });

                if (insertError) {
                    // Log the error but DO NOT stop email from being sent
                    console.error('[Digital Delivery] DB insert error (non-fatal):', insertError.message);
                    console.error('[Digital Delivery] Error details:', insertError.details);
                    console.error('[Digital Delivery] Error code:', insertError.code);
                    console.warn('[Digital Delivery] ⚠️ TABLE "digital_deliveries" may have RLS issues or not exist.');
                } else {
                    console.log('[Digital Delivery] ✅ Successfully inserted into digital_deliveries table');
                }
            } catch (dbError: any) {
                console.error('[Digital Delivery] DB error (non-fatal):', dbError.message);
                console.error('[Digital Delivery] DB error stack:', dbError.stack);
            }
        } else {
            console.warn('[Digital Delivery] Skipping DB insert - missing Supabase credentials');
        }

        // ALWAYS send the email regardless of DB status
        console.log('[Digital Delivery] Preparing to send email to:', customerEmail);
        let emailSent = false;
        let emailError = null;

        try {
            await sendDigitalDeliveryEmail(customerEmail, token, downloadUrl, siteBaseUrl, env);
            emailSent = true;
            console.log('[Digital Delivery] ✅ Email sent successfully');
        } catch (emailErr: any) {
            emailError = emailErr.message;
            console.error('[Digital Delivery] ⚠️ Email sending failed:', emailErr.message);
            // Don't fail the whole process - we still created the digital delivery record
        }

        return {
            success: true,
            token,
            emailSent,
            emailError: emailError || undefined
        };
    } catch (error: any) {
        console.error('[Digital Delivery] ❌ Error in createDigitalDelivery:', error.message);
        console.error('[Digital Delivery] Error stack:', error.stack);
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
    siteBaseUrl?: string,
    env?: any
): Promise<void> {
    console.log(`[Digital Delivery Email] Starting email send process to: ${toEmail}`);

    try {
        console.log(`[Digital Delivery Email] To: ${toEmail}`);
        console.log(`[Digital Delivery Email] Token: ${token}`);
        console.log(`[Digital Delivery Email] Download URL (truncated): ${downloadUrl.substring(0, 100)}...`);
        console.log(`[Digital Delivery Email] Site Base URL: ${siteBaseUrl || 'Not provided'}`);

        // Get Resend API key from environment
        const resendApiKey = getEnv('RESEND_API_KEY', env);
        const isCloudflareWorker = typeof WebSocketPair !== 'undefined' || (typeof globalThis !== 'undefined' && (globalThis as any).WebSocketPair);

        console.log(`[Digital Delivery Email] Environment check:`);
        console.log(`  - Resend API Key present: ${!!resendApiKey}`);
        console.log(`  - Running in Cloudflare Worker: ${isCloudflareWorker}`);
        console.log(`  - Available env keys: ${Object.keys(env || {}).filter(k => !k.includes('KEY') && !k.includes('SECRET')).join(', ') || 'N/A'}`);

        if (!resendApiKey) {
            console.error('[Digital Delivery Email] ❌ RESEND_API_KEY is required but not set in environment');
            console.error('[Digital Delivery Email] Please set RESEND_API_KEY in your Cloudflare Workers environment variables or .env file');
            throw new Error('RESEND_API_KEY is not configured. Email cannot be sent without API key.');
        }

        // Create a user-friendly download page URL
        const siteUrl = siteBaseUrl || getEnv('PUBLIC_SITE_URL', env);
        if (!siteUrl) {
            console.error('[Digital Delivery Email] ❌ PUBLIC_SITE_URL is not configured');
            throw new Error('PUBLIC_SITE_URL environment variable is required');
        }
        const downloadPageUrl = `${siteUrl}/digital-delivery/${token}`;
        console.log(`[Digital Delivery Email] Download page URL: ${downloadPageUrl}`);

        // Use configured sender email or fallback
        const senderEmailFromEnv = getEnv('RESEND_SENDER_EMAIL', env);
        const senderNameFromEnv = getEnv('RESEND_SENDER_NAME', env) || 'Tepak.ID';

        // Validate email format (must contain @ and domain)
        const isValidEmail = (email: string): boolean => {
            if (typeof email !== 'string') return false;
            // Basic validation: must contain @ and at least one . after @
            const atIndex = email.indexOf('@');
            if (atIndex === -1) return false;
            const domainPart = email.substring(atIndex + 1);
            return domainPart.includes('.') && domainPart.length > 2;
        };

        let finalSenderEmail = senderEmailFromEnv;

        // If sender email from env is not valid, use fallback to Resend's verified domain
        if (!finalSenderEmail || !isValidEmail(finalSenderEmail)) {
            console.warn(`[Digital Delivery Email] ⚠️ RESEND_SENDER_EMAIL is invalid (${senderEmailFromEnv}) or not set, using Resend verified domain`);
            finalSenderEmail = 'onboarding@resend.dev';
        }

        // Check if using custom domain (not Resend's verified domain)
        // Custom domains need to be verified in Resend dashboard before use
        const isCustomDomain = !finalSenderEmail.includes('@resend.dev');
        if (isCustomDomain) {
            console.warn('[Digital Delivery Email] ⚠️ Using custom domain email: ' + finalSenderEmail);
            console.warn('[Digital Delivery Email] If email fails with 422 error, the domain is not verified in Resend dashboard');
            console.warn('[Digital Delivery Email] Verify domain at: https://resend.com/domains');
        }

        // Validate fallback is also correct
        if (!isValidEmail(finalSenderEmail)) {
            console.error('[Digital Delivery Email] ❌ Fallback email is also invalid, using last resort default');
            finalSenderEmail = 'noreply@resend.dev';
        }

        // Construct final sender format: "Name" <email@domain.com>
        // Quotes are important if the name contains dots or special characters (like "Tepak.ID")
        const senderEmail = `"${senderNameFromEnv.replace(/"/g, '')}" <${finalSenderEmail}>`;

        console.log(`[Digital Delivery Email] Using sender: ${senderEmail}`);
        console.log(`[Digital Delivery Email] Final sender email validated: ${finalSenderEmail}`);

        const emailData = {
            from: senderEmail,
            to: toEmail,
            subject: '📦 Tautan Unduhan Produk - Tepak.ID',
            html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h2 style="color: #667eea;">Terima kasih atas pesanan Anda!</h2>
          <p>Produk digital Anda kini sudah siap untuk diunduh.</p>
          
          <div style="margin: 30px 0;">
            <a href="${downloadPageUrl}" style="background-color: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              📥 Ambil Produk Di Sini
            </a>
          </div>
          
          <p style="font-size: 14px; color: #666;">
            <strong>Catatan:</strong><br>
            - Gunakan email <b>${toEmail}</b> untuk mengakses tautan ini.<br>
            - Tautan ini dapat diakses kapan saja.
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="font-size: 12px; color: #999; text-align: center;">&copy; Tepak.ID</p>
        </div>
      `,
            text: `Terima kasih atas pesanan Anda! Produk digital Anda siap diunduh di sini: ${downloadPageUrl}`
        };

        console.log('[Digital Delivery Email] Sending request to Resend API...');

        // Send email using Resend API directly
        let response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${resendApiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(emailData),
        });

        console.log(`[Digital Delivery Email] Resend API response status: ${response.status}`);

        // RETRY LOGIC: If custom domain fails with 422 (Verification Error), fallback to Resend domain
        if (!response.ok && response.status === 422 && isCustomDomain) {
            console.warn('[Digital Delivery Email] ⚠️ Custom domain sending failed (likely verification issue). Retrying with Resend verified domain...');
            
            const fallbackEmailData = {
                ...emailData,
                from: `"${senderNameFromEnv.replace(/"/g, '')}" <onboarding@resend.dev>`
            };
            
            console.log(`[Digital Delivery Email] Retry sender: ${fallbackEmailData.from}`);
            
            response = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${resendApiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(fallbackEmailData),
            });
            
            console.log(`[Digital Delivery Email] Retry response status: ${response.status}`);
        }

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[Digital Delivery Email] ❌ Resend API error:', response.status, errorText);
            console.error('[Digital Delivery Email] Request data:', {
                from: emailData.from,
                to: emailData.to,
                subject: emailData.subject,
                bodySize: JSON.stringify(emailData).length
            });
            throw new Error(`Resend API error ${response.status}: ${errorText}`);
        }

        const result = await response.json();
        console.log('[Digital Delivery Email] ✅ Email sent successfully:', result.id);
        console.log('[Digital Delivery Email] Resend API result:', result);
    } catch (error: any) {
        console.error('[Digital Delivery Email] ❌ Error sending email:', error.message);
        console.error('[Digital Delivery Email] Error stack:', error.stack);
        throw error; // Re-throw so caller knows email failed
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