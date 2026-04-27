# 🧪 Testing Digital Delivery - Local Development

## ✅ Quick Start (3 Langkah)

### Langkah 1: Pastikan .env Sudah Benar

Buka file `.env` dan pastikan ini ada:

```env
# Resend Email Configuration
RESEND_API_KEY=re_A21Tmy6o_AGYYVFMcQHpotKmkS2Q5qmDk
RESEND_SENDER_EMAIL=noreply@bimajanuri.my.id
RESEND_SENDER_NAME=Tepak.ID
PUBLIC_SITE_URL=http://localhost:4321
```

> ⚠️ **PENTING:** `PUBLIC_SITE_URL` harus `http://localhost:4321` untuk local!

### Langkah 2: Install Dependencies

```bash
npm install dotenv  # Kalau belum ada
```

### Langkah 3: Run Test Email

**Pilih salah satu cara:**

#### Cara A: Test Langsung ke Resend (Tanpa App)
```bash
node test-email-simple.cjs
```

Ini akan:
- ✅ Kirim email langsung ke acepali2253@gmail.com
- ✅ Tidak perlu database
- ✅ Tidak perlu jalankan npm run dev
- ✅ Langsung test konfigurasi Resend

#### Cara B: Test via API (Perlu jalankan dev server)
```bash
# Terminal 1: Jalankan dev server
npm run dev

# Terminal 2: Run seeding
node seed_digital_delivery.js

# Terminal 3: Trigger webhook manual (atau tunggu Duitku sandbox)
```

---

## 📧 Cara A: Test Langsung (Recommended untuk Cek Email)

```bash
node test-email-simple.cjs
```

**Hasil yang diharapkan:**
```
╔════════════════════════════════════════════════╗
║         ✅ EMAIL BERHASIL DIKIRIM!              ║
╚════════════════════════════════════════════════╝

📧 Detail:
   Email ID: em_xxxxxxxxxx
   Dikirim ke: acepali2253@gmail.com
   Dari: noreply@bimajanuri.my.id

💡 Catatan:
   • Cek inbox acepali2253@gmail.com (termasuk spam/promosi)
   • Token test ini tidak tersimpan di database
```

### Kalau Error 422

```
╔════════════════════════════════════════════════╗
║    ❌ ERROR 422 - Validation Error              ║
╚════════════════════════════════════════════════╝

💡 Penyebab umum:
   1. Sender email belum terverifikasi di Resend
   2. Domain belum dikonfigurasi dengan benar
```

**Solusi:**
1. Buka https://resend.com/domains
2. Tambahkan domain `bimajanuri.my.id`
3. Tambahkan DNS records yang diminta (SPF, DKIM, etc.)
4. Tunggu 5-10 menit sampai status jadi "Verified"
5. Coba lagi

### Kalau Error 401

```
╔════════════════════════════════════════════════╗
║    ❌ ERROR 401 - Unauthorized                  ║
╚════════════════════════════════════════════════╝
```

**Solusi:**
1. Buka https://resend.com/api-keys
2. Buat API key baru
3. Update di `.env`

---

## 🔄 Cara B: Test End-to-End (via Webhook)

### Step 1: Jalankan Dev Server
```bash
npm run dev
```

### Step 2: Buat Test Data
```bash
node seed_digital_delivery.js
```

Outputnya akan kasih URL seperti:
```
🔗 LOCAL TEST URL:
   http://localhost:4321/digital-delivery/dd_1699...?email=acepali2253@gmail.com
```

### Step 3: Test Download Page
Buka URL tersebut di browser. Harusnya muncul halaman download dengan PDF viewer.

### Step 4: Trigger Email (Cara Manual)

Karena webhook Duitku tidak bisa ke localhost, kita trigger manual:

**Via API Test Endpoint:**

```bash
curl -X POST http://localhost:4321/api/test/digital-delivery \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-auth-token=YOUR_TOKEN" \
  -d '{
    "orderId": "ORDER_ID_DARI_SEED",
    "email": "acepali2253@gmail.com",
    "fileUrl": "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
  }'
```

**Cara dapetin auth token:**
1. Buka browser → http://localhost:4321/login
2. Login
3. Buka DevTools → Application → Cookies → sb-auth-token
4. Copy value-nya

---

## 🐛 Debugging Local

### Cek Env Vars Loaded

Tambahkan ini di `src/pages/api/[...path].ts` (sementara):

```typescript
app.get('/debug/env', (c) => {
  return c.json({
    hasResendKey: !!getEnv('RESEND_API_KEY'),
    hasSenderEmail: !!getEnv('RESEND_SENDER_EMAIL'),
    publicSiteUrl: getEnv('PUBLIC_SITE_URL'),
    resendKeyPrefix: getEnv('RESEND_API_KEY')?.substring(0, 10) + '...'
  });
});
```

Lalu akses: http://localhost:4321/api/debug/env

### Cek Email Service Langsung

Di terminal dengan node:
```bash
node -e "
const dotenv = require('dotenv');
dotenv.config();
console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? 'Ada' : 'Tidak ada');
console.log('RESEND_SENDER_EMAIL:', process.env.RESEND_SENDER_EMAIL);
console.log('PUBLIC_SITE_URL:', process.env.PUBLIC_SITE_URL);
"
```

### Cek Console Logs

Pastikan di terminal dev server muncul:
```
[Digital Delivery Email] Starting email send process to: acepali2253@gmail.com
[Digital Delivery Email] Resend API Key present: true
[Digital Delivery Email] ✅ Email sent successfully: em_xxxxxx
```

Kalau tidak muncul, berarti webhook belum trigger atau ada error di atasnya.

---

## 📋 Checklist Sebelum Test

- [ ] `.env` file ada dan terisi
- [ ] `RESEND_API_KEY` = `re_A21Tmy6o_...` ✅
- [ ] `RESEND_SENDER_EMAIL` = `noreply@bimajanuri.my.id` ✅
- [ ] `PUBLIC_SITE_URL` = `http://localhost:4321` ✅
- [ ] `SUPABASE_SERVICE_ROLE_KEY` terisi ✅
- [ ] Domain bimajanuri.my.id verified di Resend (kalau belum, bisa pakai default onboarding@resend.dev)

---

## 🎯 Test Scenarios

### Scenario 1: Email Config Test
```bash
node test-email-simple.cjs
```
✅ Berhasil kalau: Email masuk ke acepali2253@gmail.com

### Scenario 2: Download Page Test
```bash
node seed_digital_delivery.js
# Copy URL yang muncul
# Buka di browser
```
✅ Berhasil kalau: Halaman download muncul, PDF viewer tampil

### Scenario 3: Email Mismatch Test
```
http://localhost:4321/digital-delivery/{token}?email=salah@email.com
```
✅ Berhasil kalau: Redirect ke error page "Email Tidak Sesuai"

### Scenario 4: Invalid Token Test
```
http://localhost:4321/digital-delivery/invalid_token?email=acepali2253@gmail.com
```
✅ Berhasil kalau: Error page "Token tidak valid"

---

## 💡 Tips

1. **Email masuk ke spam?**
   - Domain bimajanuri.my.id belum verified di Resend
   - Verifikasi di https://resend.com/domains

2. **PDF tidak tampil?**
   - File test dari w3.org mungkin blocked CORS
   - Upload file ke Supabase Storage dan pakai URL dari situ

3. **Error 500 saat download?**
   - Cek console terminal untuk stack trace
   - Biasanya database query error atau env var missing

4. **Mau reset test data?**
```sql
DELETE FROM digital_deliveries WHERE token LIKE 'dd_%test%';
DELETE FROM orders WHERE invoice_id LIKE 'TEST-%' OR invoice_id LIKE 'INV-TEST-%';
DELETE FROM customers WHERE email = 'acepali2253@gmail.com';
DELETE FROM products WHERE title = 'E-Book: Test Digital Marketing';
```

---

**Siap test?** Mulai dengan `node test-email-simple.cjs` 🚀
