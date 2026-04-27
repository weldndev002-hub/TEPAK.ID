# 🔍 Debugging: Email Digital Delivery Tidak Terkirim

## 🚨 Checklist Penyebab Umum

### 1. **Environment Variables Belum Di-set di Cloudflare**

Ini penyebab #1 paling sering!

**Cek di Cloudflare Workers Dashboard:**
1. Buka https://dash.cloudflare.com
2. Workers & Pages → Your Worker
3. Settings → Variables and Secrets

**Pastikan sudah ada:**
```
RESEND_API_KEY=re_xxxxxxxxxxxxx
RESEND_SENDER_EMAIL=noreply@bimajanuri.my.id
PUBLIC_SITE_URL=https://tepak.id
```

> ⚠️ **PENTING:** .env file lokal TIDAK akan terbawa ke Cloudflare! Harus set manual di dashboard.

---

### 2. **Cek Logs di Cloudflare Workers**

Cara melihat error:

```bash
# Install wrangler CLI jika belum
npm install -g wrangler

# Login
wrangler login

# Lihat real-time logs
wrangler tail
```

Atau di Dashboard:
1. Workers → Your Worker
2. Tab "Logs"
3. Lihat pesanan terbaru

**Cari log ini:**
- ✅ `[Webhook DuitKu] ✅ Email sent successfully to: acepali2253@gmail.com`
- ❌ `[Digital Delivery Email] ❌ RESEND_API_KEY is required`
- ❌ `[Digital Delivery Email] Error sending email: ...`

---

### 3. **Cek Status Order di Database**

Order harus status "success" (bukan "paid"):

```sql
SELECT 
    o.id, 
    o.invoice_id, 
    o.status,
    o.customer_id,
    c.email,
    p.type,
    p.file_url
FROM orders o
JOIN customers c ON c.id = o.customer_id
JOIN products p ON p.id = o.product_id
WHERE c.email = 'acepali2253@gmail.com'
ORDER BY o.created_at DESC
LIMIT 5;
```

**Hasil yang benar:**
- `status` = `success`
- `type` = `digital` atau `course`
- `file_url` tidak NULL

---

### 4. **Cek Digital Deliveries Record**

```sql
SELECT 
    dd.token,
    dd.accessed_email,
    dd.created_at,
    o.invoice_id,
    o.status
FROM digital_deliveries dd
JOIN orders o ON o.id = dd.order_id
WHERE dd.accessed_email = 'acepali2253@gmail.com'
ORDER BY dd.created_at DESC;
```

Kalau tidak ada record, berarti webhook tidak jalan.

---

### 5. **Test Manual Trigger (Tanpa Webhook)**

Buat file test trigger:

```javascript
// test-email-manual.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    'https://your-project.supabase.co',
    'your-service-role-key'
);

const { createDigitalDelivery } = await import('./src/lib/digital-delivery.ts');

// Get order data
const { data: order } = await supabase
    .from('orders')
    .select('*, customers(email), products(file_url)')
    .eq('invoice_id', 'INV-XXXXX')  // Ganti dengan invoice ID Anda
    .single();

if (order) {
    const result = await createDigitalDelivery(
        order.id,
        order.customers.email,
        order.products.file_url,
        'https://tepak.id'
    );
    
    console.log('Result:', result);
}
```

---

## 🔧 Fix Langsung

### Fix 1: Set Environment Variables

```bash
# Set di Cloudflare (bukan di .env lokal!)
wrangler secret put RESEND_API_KEY
# Input: re_xxxxxxxxxx

wrangler secret put RESEND_SENDER_EMAIL  
# Input: noreply@bimajanuri.my.id

wrangler secret put PUBLIC_SITE_URL
# Input: https://tepak.id
```

### Fix 2: Cek Duitku Webhook URL

Di Duitku Dashboard, pastikan callback URL:
```
https://tepak.id/api/payments/duitku/webhook
```

Bukan http atau localhost!

### Fix 3: Force Resend Test

Bikin endpoint test baru di `[...path].ts`:

```typescript
// Tambahin di [...path].ts untuk test
app.post('/test/send-email', async (c) => {
  const { to, subject, html } = await c.req.json();
  
  const resendApiKey = getEnv('RESEND_API_KEY');
  
  console.log('Testing email with key:', resendApiKey ? 'Present' : 'MISSING');
  
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Tepak.ID <noreply@bimajanuri.my.id>',
      to: to || 'acepali2253@gmail.com',
      subject: subject || 'Test Email',
      html: html || '<h1>Test</h1>',
    }),
  });
  
  const result = await response.text();
  return c.json({ 
    status: response.status, 
    result,
    keyPresent: !!resendApiKey 
  });
});
```

Coba pake curl:
```bash
curl -X POST https://tepak.id/api/test/send-email \
  -H "Content-Type: application/json" \
  -d '{"to":"acepali2253@gmail.com"}'
```

---

## 📧 Alternatif Sementara (Kalau Email Masih Gagal)

Sementara kita bisa kasih buyer link manual:

```sql
-- Cari token untuk email acepali2253@gmail.com
SELECT 
    dd.token,
    dd.accessed_email,
    dd.expires_at
FROM digital_deliveries dd
JOIN orders o ON o.id = dd.order_id
JOIN customers c ON c.id = o.customer_id
WHERE c.email = 'acepali2253@gmail.com'
ORDER BY dd.created_at DESC
LIMIT 1;
```

Kirim manual link:
```
https://tepak.id/digital-delivery/{token}?email=acepali2253@gmail.com
```

---

## 🎯 Ringkasan

| Check | Status |
|-------|--------|
| RESEND_API_KEY di Cloudflare? | ⬜ |
| RESEND_SENDER_EMAIL di Cloudflare? | ⬜ |
| PUBLIC_SITE_URL di Cloudflare? | ⬜ |
| Order status = "success"? | ⬜ |
| Product type = "digital"/"course"? | ⬜ |
| Duitku webhook URL = https? | ⬜ |
| Logs menunjukkan error? | ⬜ |

**Coba cek dulu logs di Cloudflare Workers!** Pasti ada error message-nya.
