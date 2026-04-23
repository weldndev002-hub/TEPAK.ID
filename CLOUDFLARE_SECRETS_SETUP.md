## 🔐 SETUP SECRETS DI CLOUDFLARE WORKERS

Secrets adalah variabel sensitif (password, API keys, merchant keys) yang TIDAK boleh di `wrangler.toml`.
Secrets harus di-set di Cloudflare Dashboard atau via CLI.

---

## LANGKAH 1: Setup via Terminal (Recommended)

```bash
# 1. Login ke Cloudflare
wrangler login

# 2. Set SUPABASE_SERVICE_ROLE_KEY
wrangler secret put SUPABASE_SERVICE_ROLE_KEY --env production
# Paste value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFhcWd1aHhvbndwc25wd2pqZHJ2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjA1OTIzNiwiZXhwIjoyMDkxNjM1MjM2fQ.wxk5XQG8Oq2q8v4E6DSYTVWymlmSSJQOa7p0CHNqBCs

# 3. Set PUBLIC_DUITKU_MERCHANT_KEY
wrangler secret put PUBLIC_DUITKU_MERCHANT_KEY --env production
# Paste value: 61c51a77ea664c53be0e6e02ce6ddbbe

# 4. Verify secrets sudah ter-set
wrangler secret list --env production
```

---

## LANGKAH 2: Update wrangler.toml untuk Reference Secrets

Edit file `wrangler.toml` tambahkan ini:

```toml
# Secrets (sensitive data - set via CLI, not in this file)
# Usage: env.SUPABASE_SERVICE_ROLE_KEY dalam kode
# Set via: wrangler secret put SUPABASE_SERVICE_ROLE_KEY --env production
```

---

## LANGKAH 3: Test Build Lokal Dulu

```bash
# Build
npm run build

# Test locally dengan env vars dari .env
npm run dev
# Akses http://localhost:3000
```

Jika lokal berjalan ✅, berarti kodenya OK - masalah hanya di Cloudflare config.

---

## LANGKAH 4: Deploy ke Cloudflare (Production)

```bash
# Build
npm run build

# Deploy ke production
wrangler deploy --env production
```

---

## CHECKLIST SEBELUM DEPLOY

- [ ] `wrangler.toml` sudah updated dengan vars lengkap
- [ ] Semua secrets sudah di-set via CLI:
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`
  - [ ] `PUBLIC_DUITKU_MERCHANT_KEY`
- [ ] Test lokal running OK (`npm run dev`)
- [ ] Build berhasil (`npm run build`)
- [ ] Tidak ada error di terminal

---

## VERIFY SECRETS DI CLOUDFLARE DASHBOARD

1. Buka https://dash.cloudflare.com
2. Workers & Pages → tepak-id
3. Settings → Environment variables
4. Lihat apakah SUPABASE_SERVICE_ROLE_KEY ada di "Secrets"

---

## ERROR HANDLING

Jika masih ada error setelah deploy, cek:

```bash
# Tail logs dari Cloudflare
wrangler tail --env production

# Search untuk error messages (SUPABASE, DUITKU, etc)
```

---

## CONTOH PENGGUNAAN SECRETS DI CODE

```typescript
// Middleware atau API route
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;
const duitkuKey = env.PUBLIC_DUITKU_MERCHANT_KEY;

if (!serviceRoleKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY tidak ditemukan di Cloudflare!');
  return c.json({ error: 'Configuration error' }, 500);
}
```

---

## Quick Reference

| Variable | Type | Lokasi | Value |
|----------|------|--------|-------|
| `PUBLIC_SUPABASE_URL` | var | wrangler.toml | `https://aaqguhxonwpsnpwjjdrv.supabase.co` |
| `PUBLIC_SUPABASE_ANON_KEY` | var | wrangler.toml | `sb_publishable_xxxxx` |
| `SUPABASE_SERVICE_ROLE_KEY` | secret | CLI / Dashboard | (dari Supabase) |
| `PUBLIC_DUITKU_MERCHANT_CODE` | var | wrangler.toml | `DS29376` |
| `PUBLIC_DUITKU_MERCHANT_KEY` | secret | CLI / Dashboard | (dari Duitku) |
| `DUITKU_CALLBACK_URL` | var | wrangler.toml | `https://tepakid.weldn-dev-002.workers.dev/api/payments/duitku/webhook` |
| `ADMIN_PASSCODE` | var | wrangler.toml | `admin123` |
