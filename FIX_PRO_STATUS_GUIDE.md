## 🔧 PANDUAN FIX STATUS PRO YG TIDAK BERUBAH

### ⚠️ Root Cause
**Webhook dari Duitku tidak ter-trigger atau gagal proses**, sehingga status tetap PENDING dan user tetap FREE.

Sudah diselidiki:
- ✅ Columns `plan_expiry` dan `auto_renewal` **sudah ada**
- ✅ Webhook handler code sudah correct
- ⚠️ Webhook belum ter-trigger dari Duitku (semua transaksi PENDING)

---

## 🚀 QUICK FIX (5 Menit)

### Step 1: Clone/ Pull Updates Terbaru

```bash
cd d:\Kerjaan\Tepak.ID
git pull origin main
npm install
```

### Step 2: Update .env (Sangat Penting!)

Pastikan file `.env` atau `.env.local` punya:

```bash
# Duitku (Sandbox untuk testing)
PUBLIC_DUITKU_MERCHANT_CODE=DS29376
PUBLIC_DUITKU_MERCHANT_KEY=61c51a77ea... # Full key dari Duitku Dashboard

# Supabase (HARUS ADA untuk webhook!)
PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
PUBLIC_SUPABASE_ANON_KEY=eyJxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxx...  # ← THIS IS CRITICAL!

# Duitku Callback
DUITKU_CALLBACK_URL=https://yourdomain.com/api/payments/duitku/webhook
```

**Cara ambil SUPABASE_SERVICE_ROLE_KEY:**
1. Buka https://app.supabase.com
2. Pilih project Anda
3. Settings → API → Copy "service_role" (jangan anon_key)
4. Paste ke `.env` sebagai `SUPABASE_SERVICE_ROLE_KEY`

### Step 3: Start Development Server

```bash
npm run dev
```

App akan running di `http://localhost:4321`

### Step 4: Test Webhook Secara Lokal

Buka terminal baru:

```bash
node test_webhook_real.js
```

Script akan:
1. ✅ Ambil PENDING transaction dari database
2. ✅ Generate signature yang benar
3. ✅ Send webhook ke localhost
4. ✅ Verify apakah status berubah

### Step 5: Cek Hasil

Jika output adalah `SUCCESS! User is now PRO!`, berarti **sudah fixed!** 🎉

Refresh dashboard Anda → Status seharusnya sudah **PRO**.

---

## 📋 LANGKAH LENGKAP (Untuk Production)

Jika still tidak berfungsi, ikuti checklist ini:

### STEP 1: Jalankan Migration SQL di Supabase ✅ (Sudah ada columns)

Dari test kami, columns `plan_expiry` dan `auto_renewal` **sudah ada**. Jadi step ini bisa skip.

---

### STEP 2: Tambahkan RLS Bypass untuk Webhook

Buka Supabase Dashboard → SQL Editor → Run query ini:

```sql
-- Drop overly restrictive policy
DROP POLICY IF EXISTS "Users can update own settings" ON public.user_settings;

-- Recreate with explicit conditions
CREATE POLICY "Users can update own settings" ON public.user_settings 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Verify by checking current policies:
SELECT * FROM pg_policies WHERE tablename = 'user_settings';
```

---

### STEP 3: Verify Duitku Credentials di .env

Pastikan file `.env` (atau `.env.local`) punya:

```bash
PUBLIC_DUITKU_MERCHANT_CODE=DS29376      # Sandbox merchant code
PUBLIC_DUITKU_MERCHANT_KEY=61c51a77ea... # Merchant secret key
DUITKU_CALLBACK_URL=https://yourdomain.com/api/payments/duitku/webhook
SUPABASE_SERVICE_ROLE_KEY=...           # Harus ada untuk webhook!
```

Jika belum ada `SUPABASE_SERVICE_ROLE_KEY`, ambil dari Supabase Dashboard → Settings → API.

---

### STEP 4: Test Webhook Secara Manual

#### Option A: Pakai ngrok (Local Testing)

```bash
# Terminal 1: Start app
npm run dev

# Terminal 2: Expose local server publicly
npx ngrok http 4321

# Copy URL dari ngrok, misal: https://abc123.ngrok.io
```

Update di Duitku Dashboard:
- Callback URL: `https://abc123.ngrok.io/api/payments/duitku/webhook`

#### Option B: Test Pakai Script Node

```bash
# Terminal 1: Start app
npm run dev

# Terminal 2: Run webhook simulator
node test_webhook_signature.js
```

Atau manual dengan curl:

```bash
curl -X POST http://localhost:4321/api/payments/duitku/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "merchantCode": "DS29376",
    "merchantOrderId": "SUB--f1947a0b-f2af-4f67-80b4-e7724ab4618f--4394",
    "amount": 45000,
    "reference": "REF-TEST-123",
    "resultCode": "00",
    "statusMessage": "SUCCESS",
    "signature": "f7fcadda2ea00e7e8db7ffefd27055f2"
  }'
```

---

### STEP 5: Cek Database Setelah Test

Jalankan di Supabase SQL:

```sql
-- Cek apakah subscription_history status berubah ke SUCCESS
SELECT invoice_id, plan_id, status FROM public.subscription_history 
ORDER BY created_at DESC LIMIT 5;

-- Cek apakah user_settings sudah update ke PRO
SELECT user_id, plan_status, plan_expiry 
FROM public.user_settings 
WHERE plan_status != 'free' LIMIT 5;
```

---

### STEP 6: Jika Masih Gagal - Debug Signature

Dari test kami, signature format B yang benar:
```
merchantCode + amount + orderId + merchantKey
```

Signature untuk order SUB--f1947a0b-f2af-4f67-80b4-e7724ab4618f--4394:
```
DS2937645000SUB--f1947a0b-f2af-4f67-80b4-e7724ab4618f--439461c51a77ea...
= f7fcadda2ea00e7e8db7ffefd27055f2
```

Jika webhook return error "signature tidak valid", berarti Duitku mengirim format berbeda. Cek console logs di `/api/payments/duitku/webhook` untuk lihat signature yang diterima.

---

## 🧪 TESTING CHECKLIST

- [ ] SQL migration dijalankan
- [ ] RLS policy sudah diperbaiki
- [ ] .env credentials lengkap
- [ ] Webhook bisa receive request (test manual success)
- [ ] subscription_history status berubah ke SUCCESS
- [ ] user_settings plan_status berubah ke PRO
- [ ] Dashboard di-refresh, status sudah PRO ✨

---

## 🆘 Jika Masih Tidak Berhasil

1. **Cek console logs di webhook handler:**
   - Buka browser Developer Tools
   - Live Server Console / App Logs
   - Cari "[Webhook DuitKu]" messages

2. **Cek Duitku callback config:**
   - Login ke Duitku Dashboard
   - Verify callback URL sudah di-register
   - Cek apakah merchant active di Sandbox

3. **Test dengan transaction existing:**
   - Gunakan invoice_id dari `subscription_history` yang masih PENDING
   - Trigger manual webhook dengan data tersebut

---

## 📞 Quick Links

- Supabase Dashboard: https://app.supabase.com
- Duitku Sandbox: https://sandbox.duitku.com
- Duitku Integration Guide: DUITKU_INTEGRATION_GUIDE.md
