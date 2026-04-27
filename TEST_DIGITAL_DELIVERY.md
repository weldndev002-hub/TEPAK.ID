# 🧪 Testing Digital Delivery Locally

## Quick Start (2 Options)

### Option 1: SQL Script (Recommended)

1. Buka Supabase Dashboard → SQL Editor
2. Copy-paste isi file `seed_test_digital_delivery.sql`
3. Run query
4. Lihat output di "Logs" untuk mendapatkan URL test

### Option 2: Node.js Script

```bash
# Install dependencies (if not yet)
npm install @supabase/supabase-js

# Set environment variables
$env:PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Run script
node seed_digital_delivery.js
```

## 📋 URL Testing

Setelah seed data berhasil, Anda akan mendapatkan URL seperti:

```
http://localhost:4321/digital-delivery/dd_1234567890_test123?email=test.buyer@example.com
```

## 🧪 Test Scenarios

### 1. ✅ Happy Path (Success)
```
http://localhost:4321/digital-delivery/{token}?email=test.buyer@example.com
```
**Expected:** Halaman download muncul dengan PDF viewer atau tombol download

### 2. ❌ Email Mismatch
```
http://localhost:4321/digital-delivery/{token}?email=wrong@email.com
```
**Expected:** Redirect ke `/digital-delivery/error?reason=email_mismatch`

### 3. ❌ Missing Email
```
http://localhost:4321/digital-delivery/{token}
```
**Expected:** Redirect ke error page dengan pesan "Token dan email diperlukan"

### 4. ❌ Invalid Token
```
http://localhost:4321/digital-delivery/invalid_token?email=test@example.com
```
**Expected:** Error page "Token tidak valid"

### 5. ⏰ Expired Token (Simulated)
Update database:
```sql
UPDATE digital_deliveries 
SET expires_at = NOW() - INTERVAL '1 day'
WHERE token = 'your-token';
```
**Expected:** Error page "Token telah kadaluarsa"

## 🔍 Debugging

### Check Logs di Terminal
Jalankan dev server dengan verbose logging:
```bash
npm run dev
```

Lihat log saat akses halaman:
- `[Digital Delivery] Valid access granted` = Sukses
- `[Digital Delivery] Email mismatch` = Email salah
- `[Digital Delivery] Token expired` = Token kadaluarsa
- `[Digital Delivery] Token verification error` = Token tidak ditemukan

### Check Data di Supabase
```sql
-- Lihat semua digital deliveries
SELECT 
    dd.token,
    dd.accessed_email,
    dd.expires_at,
    dd.access_count,
    o.invoice_id,
    c.email as customer_email,
    p.title
FROM digital_deliveries dd
JOIN orders o ON o.id = dd.order_id
JOIN customers c ON c.id = o.customer_id
JOIN products p ON p.id = o.product_id
ORDER BY dd.created_at DESC
LIMIT 10;
```

## 🐛 Common Issues

### Issue: "SUPABASE_SERVICE_ROLE_KEY is required"
**Solusi:** 
- Copy Service Role Key dari Supabase Dashboard → Project Settings → API
- Jangan pakai anon key untuk seeding!

### Issue: "No user found"
**Solusi:**
- Anda harus signup/login minimal satu user terlebih dahulu
- Atau buat user manual di Supabase Auth

### Issue: PDF tidak tampil
**Solusi:**
- File test menggunakan dummy PDF dari w3.org
- Jika blocked oleh CORS, ganti dengan file lain atau upload ke Supabase Storage

### Issue: Email tidak terkirim
**Checklist:**
- [ ] `RESEND_API_KEY` sudah di-set di `.env`
- [ ] `RESEND_SENDER_EMAIL` sudah terverifikasi di Resend
- [ ] `PUBLIC_SITE_URL` di-set ke `http://localhost:4321`

## 📝 Clean Up Test Data

Setelah testing, hapus data test:

```sql
-- Hapus semua test data (hati-hati!)
DELETE FROM digital_deliveries WHERE token LIKE 'dd_%test%';
DELETE FROM orders WHERE invoice_id LIKE 'INV-TEST-%';
DELETE FROM customers WHERE email = 'test.buyer@example.com';
DELETE FROM products WHERE title = 'E-Book: Panduan Digital Marketing';
```

## 🎯 Production Testing

Untuk test dengan pembayaran real:

1. Buat produk digital asli
2. Gunakan Duitku Sandbox Mode
3. Lakukan checkout dengan email Anda
4. Cek email Anda untuk tautan download
5. Klik tautan dan verifikasi halaman muncul

**Note:** Di production, signed URL akan digenerate ulang setiap kali buyer akses (bukan pakai URL static).
