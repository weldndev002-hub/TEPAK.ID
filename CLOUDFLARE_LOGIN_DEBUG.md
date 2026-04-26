# 🔍 Panduan Debug Login Error di Cloudflare

## Cara Melihat Error Sebenarnya Saat Login

Karena di Cloudflare tidak ada server console yang bisa dilihat, Anda harus melihat error di **Browser Console** di device Anda:

### Langkah 1: Buka Browser Console
```
Windows/Linux: Tekan Ctrl + Shift + J (Chrome) atau F12
Mac: Cmd + Option + J
```

### Langkah 2: Lihat Tab "Console"
Pastikan Anda di tab **Console**, bukan Network atau Elements.

### Langkah 3: Coba Login
1. Masuk ke halaman login di domain Cloudflare Anda
2. Buka browser console (jangan tutup)
3. Masukkan email dan password
4. Klik tombol "Masuk Sekarang"

### Langkah 4: Cari Error di Console
Lihat console, akan ada log seperti ini:

```
[LoginForm] Auth attempt: {email: 'user@email.com', hasPassword: true}
[LoginForm] Calling signInWithPassword...
[LoginForm] Auth Error: {
  message: "Invalid login credentials", 
  status: 400, 
  code: "invalid_credentials"
}
```

---

## Kemungkinan Error dan Solusinya

### ❌ Error: "Supabase client not initialized"
**Artinya:** PUBLIC_SUPABASE_URL atau PUBLIC_SUPABASE_ANON_KEY tidak tersedia

**Solusi:**
- [ ] Cek di Cloudflare → Workers & Pages → Settings → Environment variables
- [ ] Pastikan ada variable `PUBLIC_SUPABASE_URL` dan `PUBLIC_SUPABASE_ANON_KEY`
- [ ] Nilai harus sama persis dengan file `.env` lokal Anda
- [ ] Jangan lupa deploy ulang setelah menambah env variables

**Debug lebih lanjut:**
Buka `https://yourdomain.com/api/debug/env` di browser, Anda akan lihat:
```json
{
  "has_url": false,  // ← MASALAH!
  "has_anon": false, // ← MASALAH!
  "has_service": true,
  "supabase_reachable": false,
  "user_id": null
}
```

---

### ❌ Error: "Failed to fetch" atau Network Error
**Artinya:** Tidak bisa connect ke Supabase

**Solusi:**
- [ ] Cek PUBLIC_SUPABASE_URL apakah benar-benar URL Supabase
  - Format harus: `https://xxxxx.supabase.co` (tanpa / di akhir)
- [ ] Test koneksi ke Supabase: buka `https://yourdomain.com/api/debug/env`
  - Jika `supabase_reachable: false` → URL salah atau Supabase down

---

### ❌ Error: "Invalid login credentials"
**Artinya:** Email/password salah, atau credentials tersimpan dengan benar

**Solusi:**
- [ ] Pastikan email dan password benar
- [ ] User sudah pernah signup sebelumnya
- [ ] Coba reset password di halaman "Lupa Password"

---

### ❌ Error: "Gagal mengambil data profil" atau Database Error
**Artinya:** Login berhasil tapi tidak bisa ambil data dari table `profiles`

**Solusi:**
- [ ] Pastikan schema database sudah migrate (ada table `profiles`)
- [ ] Cek Row Level Security (RLS) di Supabase:
  - Buka Supabase Console → Authentication → Users
  - Cek bahwa user bisa akses table `profiles`
- [ ] Cek apakah kolom `role` dan `is_banned` ada di table `profiles`

---

## Cara Melihat Env Variables yang Tersimpan di Cloudflare

Buka URL ini di browser (ganti domain Anda):
```
https://yourdomain.com/api/debug/keys
```

Anda akan melihat:
```json
{
  "url": "https*****.co",
  "url_full_length": 45,
  "key": "eyJxxx...yyy",
  "key_full_length": 240,
  "cf_keys": [
    "PUBLIC_SUPABASE_URL",
    "PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    ...
  ]
}
```

Jika `url_full_length` atau `key_full_length` tidak masuk akal (terlalu pendek), berarti env variables belum tersimpan dengan benar.

---

## Checklist Deployment Cloudflare

Sebelum deploy, pastikan:

- [ ] Semua env variables sudah di-set di Cloudflare
  ```bash
  wrangler secret put PUBLIC_SUPABASE_URL
  wrangler secret put PUBLIC_SUPABASE_ANON_KEY
  wrangler secret put SUPABASE_SERVICE_ROLE_KEY
  wrangler secret put DATABASE_URL
  ```

- [ ] Atau set via Cloudflare Dashboard:
  - Workers & Pages → Your Project → Settings → Environment variables
  - Pastikan di "Production" atau "Preview" environment yang sesuai

- [ ] Re-deploy setelah menambah env variables
  ```bash
  npm run build
  npm run deploy
  ```

- [ ] Tunggu 30-60 detik agar Cloudflare propagate perubahan

---

## Tip: Copy Error Message dari Console ke ChatGPT

Jika masih bingung, copy seluruh error dari console dan paste ke ChatGPT dengan konteks:
```
Di Cloudflare, saat klik login muncul error di console:
[LoginForm] CATCH BLOCK ERROR: {
  message: "...",
  stack: "..."
}
```

---

## Kontak Support

Jika sudah semua langkah di atas tapi masih error, sediakan info:
1. Screenshot dari browser console (Console tab)
2. Hasil dari `/api/debug/env` endpoint
3. Error message lengkapnya

