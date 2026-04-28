# 🔐 Panduan Integrasi Google OAuth - Tepak.ID

## Diagnosis

Kode aplikasi sudah siap mendukung Google OAuth (tombol sudah ada di halaman Login dan Signup), tetapi **Google OAuth Provider belum diaktifkan di Supabase Dashboard**. Berikut langkah-langkah untuk mengaktifkannya.

---

## Langkah 1: Buat Kredensial di Google Cloud Console

### 1.1 Buka Google Cloud Console
- Akses: https://console.cloud.google.com/
- Login dengan akun Google Anda

### 1.2 Buat Project Baru (atau gunakan yang sudah ada)
- Klik dropdown project di header → **New Project**
- Nama project: `Tepak.ID Auth` (atau sesuai keinginan)
- Klik **Create**

### 1.3 Aktifkan Consent Screen
- Di sidebar, buka **APIs & Services** → **OAuth consent screen**
- Pilih tipe: **External** (jika tidak punya Google Workspace)
- Isi form:
  - **App name**: `Tepak.ID`
  - **User support email**: email Anda
  - **Developer contact email**: email Anda
- Klik **Save and Continue**
- Di bagian **Scopes**, biarkan default (email, profile, openid sudah cukup)
- Klik **Save and Continue**
- Di bagian **Test users**, tambahkan email Anda jika status masih "Testing"
- Klik **Save and Continue**

> ⚠️ **PENTING**: Jika consent screen masih status "Testing", hanya email yang didaftarkan di Test users yang bisa login. Untuk production, klik **PUBLISH APP**.

### 1.4 Buat OAuth 2.0 Client ID
- Di sidebar, buka **APIs & Services** → **Credentials**
- Klik **+ CREATE CREDENTIALS** → **OAuth client ID**
- Application type: **Web application**
- Name: `Tepak.ID Web Client`
- **Authorized JavaScript origins** (tambahkan semua):
  ```
  http://localhost:4321
  https://tepakid.weldn-dev-002.workers.dev
  ```
- **Authorized redirect URIs** (tambahkan semua):
  ```
  https://aaqguhxonwpsnpwjjdrv.supabase.co/auth/v1/callback
  ```
  > Ini adalah Supabase callback URL untuk project Anda (berdasarkan `PUBLIC_SUPABASE_URL` di `.env`)

- Klik **Create**

### 1.5 Copy Client ID & Client Secret
- Setelah dibuat, akan muncul modal dengan **Client ID** dan **Client Secret**
- Simpan kedua nilai ini — akan digunakan di Langkah 2

---

## Langkah 2: Aktifkan Google Provider di Supabase Dashboard

### 2.1 Buka Supabase Dashboard
- Akses: https://supabase.com/dashboard
- Pilih project: `aaqguhxonwpsnpwjjdrv` (Tepak.ID)

### 2.2 Konfigurasi Google Provider
- Di sidebar, buka **Authentication** → **Providers**
- Cari **Google** dan klik untuk expand
- Toggle **Enable Google Provider** → ON
- Masukkan:
  - **Client ID**: (dari Langkah 1.5)
  - **Client Secret**: (dari Langkah 1.5)
- Klik **Save**

### 2.3 Verifikasi Redirect URL
- Di halaman yang sama, pastikan **Redirect URL** yang ditampilkan adalah:
  ```
  https://aaqguhxonwpsnpwjjdrv.supabase.co/auth/v1/callback
  ```
  Ini harus sama dengan yang didaftarkan di Google Cloud Console (Langkah 1.4)

---

## Langkah 3: Konfigurasi Site URL di Supabase

### 3.1 Set Site URL
- Di Supabase Dashboard, buka **Authentication** → **URL Configuration**
- **Site URL**: 
  - Untuk development: `http://localhost:4321`
  - Untuk production: `https://tepakid.weldn-dev-002.workers.dev`
- **Redirect URLs** (tambahkan):
  ```
  http://localhost:4321/auth/callback
  https://tepakid.weldn-dev-002.workers.dev/auth/callback
  ```
- Klik **Save**

---

## Langkah 4: Update `.env` untuk Production

Pastikan `PUBLIC_SITE_URL` di [`.env`](.env) sesuai dengan environment:

```env
# Untuk development (local)
PUBLIC_SITE_URL=http://localhost:4321

# Untuk production (deploy)
# PUBLIC_SITE_URL=https://tepakid.weldn-dev-002.workers.dev
```

Jika menggunakan Cloudflare Workers, pastikan `PUBLIC_SITE_URL` juga di-set di Cloudflare Dashboard → Workers → Variables.

---

## Langkah 5: Test Google OAuth

### 5.1 Test di Local Development
1. Jalankan dev server: `npm run dev`
2. Buka http://localhost:4321/login
3. Klik tombol **Google**
4. Harusnya akan redirect ke Google login page
5. Setelah login, akan redirect ke `/auth/callback` lalu ke `/onboarding` (user baru) atau `/dashboard` (user lama)

### 5.2 Test di Production
1. Deploy ulang jika ada perubahan `.env`
2. Buka https://tepakid.weldn-dev-002.workers.dev/login
3. Klik tombol **Google**
4. Verifikasi flow sama seperti di local

---

## Arsitektur Flow Google OAuth (Sudah Diimplementasi di Kode)

```
User Klik "Google" Button
       ↓
[SocialButton.tsx] → supabase.auth.signInWithOAuth({ provider: 'google' })
       ↓
Redirect ke Google Login Page
       ↓
User Login & Consent
       ↓
Google Redirect ke Supabase Callback
  (https://aaqguhxonwpsnpwjjdrv.supabase.co/auth/v1/callback)
       ↓
Supabase Exchange Code → Redirect ke App
  (/auth/callback?code=xxx)
       ↓
[auth/callback.astro] → exchangeCodeForSession(code)
       ↓
Cek profile.onboarding_completed
       ↓
├── Belum onboarding → /onboarding
└── Sudah onboarding → /dashboard
```

### File Kode yang Sudah Siap (Tidak Perlu Diubah):
- `src/components/ui/SocialButton.tsx` — Handler OAuth
- `src/components/auth/LoginForm.tsx` — Tombol Google di halaman login
- `src/components/auth/SignupForm.tsx` — Tombol Google di halaman signup
- `src/pages/auth/callback.astro` — Handler callback setelah OAuth

---

## ❓ Troubleshooting

### Error: "Provider google is not enabled"
→ Google provider belum diaktifkan di Supabase Dashboard (Langkah 2)

### Error: "redirect_uri_mismatch"
→ Authorized redirect URI di Google Cloud Console tidak cocok. Pastikan:
`https://aaqguhxonwpsnpwjjdrv.supabase.co/auth/v1/callback` sudah ditambahkan (Langkah 1.4)

### Error: "This app isn't verified"
→ OAuth consent screen masih status "Testing". Tambahkan email test user atau publish app (Langkah 1.3)

### Error: Pop-up blocked
→ Ini sudah di-handle di kode [`SocialButton.tsx`](src/components/ui/SocialButton.tsx:38-45), akan muncul toast "Pop-up diblokir"

### OAuth berhasil tapi user tidak punya `full_name`
→ User dari Google OAuth mungkin tidak punya metadata `full_name`. Pastikan trigger SQL di Supabase menangani case ini. Google OAuth mengirim `full_name` melalui `raw_user_meta_data.full_name` atau `raw_user_meta_data.name`.

---

## Bonus: Juga Aktifkan Apple OAuth (Opsional)

Jika ingin mengaktifkan tombol Apple yang sudah ada di kode:
1. Butuh Apple Developer Account ($99/tahun)
2. Buat Services ID di Apple Developer Portal
3. Aktifkan Apple Provider di Supabase Dashboard
4. Lihat panduan lengkap: https://supabase.com/docs/guides/auth/social-login/auth-apple
