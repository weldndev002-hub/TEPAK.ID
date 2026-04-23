## 🚀 DEPLOYMENT GUIDE KE CLOUDFLARE WORKERS

Status: **Error "chrome-error://chromewebdata" = Environment Variables tidak lengkap**

---

## 📋 SETUP CHECKLIST

### ✅ STEP 1: Update wrangler.toml
**Status: SUDAH DONE** ✓

File `wrangler.toml` sudah diupdate dengan:
- PUBLIC_SUPABASE_URL
- PUBLIC_SUPABASE_ANON_KEY  
- PUBLIC_DUITKU_MERCHANT_CODE
- DUITKU_ENVIRONMENT
- DUITKU_CALLBACK_URL
- ADMIN_PASSCODE

---

### ⚠️ STEP 2: Setup SECRETS di Cloudflare (CRITICAL!)

**Ini adalah penyebab error Anda!** 

Jalankan perintah ini di terminal:

```bash
# Login ke Cloudflare
wrangler login

# Set Service Role Key untuk Supabase (untuk webhook)
wrangler secret put SUPABASE_SERVICE_ROLE_KEY --env production
```

Saat diminta paste value, copy dari `.env` file Anda:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFhcWd1aHhvbndwc25wd2pqZHJ2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjA1OTIzNiwiZXhwIjoyMDkxNjM1MjM2fQ.wxk5XQG8Oq2q8v4E6DSYTVWymlmSSJQOa7p0CHNqBCs
```

```bash
# Set Duitku Merchant Key untuk payment
wrangler secret put PUBLIC_DUITKU_MERCHANT_KEY --env production
```

Saat diminta paste value:
```
61c51a77ea664c53be0e6e02ce6ddbbe
```

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
