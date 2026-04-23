## 🚀 DEPLOYMENT GUIDE KE CLOUDFLARE WORKERS

---

## ⚠️ 🔐 SECURITY FIRST

**CRITICAL:** Pastikan Anda sudah read [SECURITY_GUIDE.md](./SECURITY_GUIDE.md) dan rotate semua API keys!

❌ **JANGAN** hardcode API keys di file yang di-commit ke GitHub
✅ **GUNAKAN** environment variables & Cloudflare secrets

---

## 📋 SETUP CHECKLIST

### ✅ STEP 1: Environment Variables Setup

**1. Copy template:**
```bash
cp .env.example .env
```

**2. Edit `.env` dengan real values:**
```bash
nano .env
```

**3. Verify `.gitignore` includes `.env`:**
```bash
cat .gitignore | grep ".env"
# Should output: .env
```

### ✅ STEP 2: Setup Secrets di Cloudflare (CRITICAL!)

**Cloudflare Secrets** = Secret values yang tidak terlihat di `wrangler.toml`

```bash
# Login ke Cloudflare
wrangler login

# Set Supabase Service Role Key (untuk database operations di Edge)
wrangler secret put SUPABASE_SERVICE_ROLE_KEY --env production

# Set Resend API Key (untuk email service)
wrangler secret put RESEND_API_KEY --env production

# Set DuitKu Merchant Key
wrangler secret put PUBLIC_DUITKU_MERCHANT_KEY --env production
```

**Saat diminta, paste values dari `.env` file Anda (jangan share dengan orang lain!)**

### ✅ STEP 3: Setup Public Variables di Cloudflare Dashboard

1. Login ke https://dash.cloudflare.com
2. Go to Workers & Pages → Your Project → Settings → Environment Variables
3. Tambahkan untuk Production:
   - `PUBLIC_SUPABASE_URL` = https://your-project.supabase.co
   - `PUBLIC_SUPABASE_ANON_KEY` = your-anon-key (safe untuk public)
   - `PUBLIC_DUITKU_MERCHANT_CODE` = your-merchant-code
   - `DUITKU_ENVIRONMENT` = production
   - `DUITKU_CALLBACK_URL` = https://yourdomain.com/api/payments/duitku/webhook

---

### ✅ STEP 3: Verifikasi Secrets Ter-set

Jalankan perintah:

```bash
wrangler secret list --env production
```

**Output harus menampilkan:**
```
SUPABASE_SERVICE_ROLE_KEY (4 months ago)
PUBLIC_DUITKU_MERCHANT_KEY (just now)
```

---

### ✅ STEP 4: Build Lokal (Test)

```bash
# Navigasi ke folder project
cd d:\Kerjaan\Tepak.ID

# Install dependencies (jika belum)
npm install

# Build
npm run build
```

**Jika ada error, lihat pesan errornya dan bilang ke saya.**

Jika build berhasil, lanjut ke step 5.

---

### ✅ STEP 5: Test Lokal Sebelum Deploy

```bash
npm run dev
```

Akses **http://localhost:3000** di browser.

Jika:
- ✅ Halaman loading dan tidak ada error → Bagus!
- ❌ Masih ada error → Cek console browser (F12 → Console tab)

---

### ✅ STEP 6: Deploy ke Cloudflare

```bash
# Dari folder project
wrangler deploy --env production
```

**Output harus menampilkan:**
```
✅ Uploaded tepak-id (xx) in x.xx seconds
Your migration hooks ran successfully!
Deployment ID: xxxxxxxxxxxxxxxx
```

---

### ✅ STEP 7: Test di Cloudflare URL

Tunggu 30 detik, lalu buka:
```
https://tepakid.weldn-dev-002.workers.dev/
```

**Jika berhasil:**
- ✅ Halaman loading
- ✅ Tidak ada chrome-error://chromewebdata
- ✅ Bisa lihat konten website

---

## 🆘 Troubleshooting

### Error: "chrome-error://chromewebdata"

**Penyebab:** Environment variables belum di-set

**Solusi:**
```bash
# Cek apakah secrets sudah ter-set
wrangler secret list --env production

# Jika kosong, set ulang:
wrangler secret put SUPABASE_SERVICE_ROLE_KEY --env production
wrangler secret put PUBLIC_DUITKU_MERCHANT_KEY --env production

# Deploy ulang
wrangler deploy --env production
```

### Error: "Cannot read property X of undefined"

**Penyebab:** Environment variable tertentu tidak tersedia

**Solusi:** Lihat error di tail logs:
```bash
wrangler tail --env production
```

### Build Error: "Module not found"

**Penyebab:** Dependencies tidak ter-install

**Solusi:**
```bash
npm install
npm run build
```

---

## 📊 Environment Variables Summary

| Variabel | Jenis | Status |
|----------|-------|--------|
| PUBLIC_SUPABASE_URL | var | ✅ Di wrangler.toml |
| PUBLIC_SUPABASE_ANON_KEY | var | ✅ Di wrangler.toml |
| SUPABASE_SERVICE_ROLE_KEY | secret | ⚠️ Harus di-set via CLI |
| PUBLIC_DUITKU_MERCHANT_CODE | var | ✅ Di wrangler.toml |
| PUBLIC_DUITKU_MERCHANT_KEY | secret | ⚠️ Harus di-set via CLI |
| DUITKU_CALLBACK_URL | var | ✅ Di wrangler.toml |
| DUITKU_ENVIRONMENT | var | ✅ Di wrangler.toml |
| ADMIN_PASSCODE | var | ✅ Di wrangler.toml |

---

## 🔗 Referensi

- Cloudflare Wrangler Docs: https://developers.cloudflare.com/workers/wrangler/
- Secrets Management: https://developers.cloudflare.com/workers/configuration/secrets/
- File: `CLOUDFLARE_SECRETS_SETUP.md` (panduan lengkap)

---

## Next Step

Ikuti langkah di atas satu-satu. Kalau masih error, kirim saya:
1. Output terminal saat `npm run build`
2. Output `wrangler secret list --env production`
3. Output `wrangler tail --env production` (saat akses URL)
