# 🔐 Security Guide - API Keys & Credentials

## ⚠️ CRITICAL: API Keys Exposed!

Jika repository Anda sudah **public di GitHub**, semua API key yang pernah di-commit sudah terekspose dan harus di-**rotate immediately**.

---

## ✅ Langkah-Langkah Keamanan

### 1. **Rotate Semua API Keys** (URGENT)

**Supabase:**
- Login ke https://app.supabase.com
- Pergi ke Project Settings → API
- Regenerate `anon key` dan `service role key`
- Update `.env` dengan key yang baru

**DuitKu:**
- Login ke https://sandbox.duitku.com atau https://duitku.com
- Regenerate API key
- Update `.env` dengan key yang baru

**Resend:**
- Login ke https://resend.com/api-keys
- Delete old API key
- Generate new one
- Update `.env` dengan key yang baru

### 2. **Clean Git History** (jika sudah di-commit)

Untuk menghapus API keys dari Git history selamanya:

```bash
# Install BFG Repo Cleaner (recommended, lebih cepat dari git-filter-branch)
bfg --help  # atau download dari https://rtyley.github.io/bfg-repo-cleaner/

# Atau gunakan git-filter-branch (built-in)
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch .env' \
  --prune-empty --tag-name-filter cat -- --all

# Push changes
git push origin --force --all
git push origin --force --tags
```

**CATATAN:** Ini hanya bekerja jika Anda punya akses push ke repo. Jika sudah public, **better safe than sorry** - rotate semua keys.

### 3. **Update GitHub Secrets** (untuk CI/CD)

Jika menggunakan GitHub Actions, update secrets:

```bash
# Go to: Repository → Settings → Secrets and variables → Actions
# Update/add these:
- PUBLIC_SUPABASE_URL
- PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- PUBLIC_DUITKU_MERCHANT_CODE
- PUBLIC_DUITKU_MERCHANT_KEY
- RESEND_API_KEY
- DATABASE_URL
- DIRECT_URL
```

### 4. **Verify .gitignore**

Pastikan `.gitignore` berisi:

```
# Environment variables
.env
.env.*.local
.env.production.local
.env.development.local
.env.test.local
```

### 5. **Update Cloudflare Workers**

Jika deployment ke Cloudflare Workers:

```bash
# Set environment variables via Cloudflare dashboard
# Dashboard → Your Worker → Settings → Environment Variables

# Atau via CLI:
wrangler secret put SUPABASE_SERVICE_ROLE_KEY
wrangler secret put RESEND_API_KEY
# (secrets tidak terlihat di wrangler.toml)
```

---

## ✅ Checklist - Deployment Security

- [ ] Semua API keys sudah di-rotate
- [ ] `.env` file di-add ke `.gitignore`
- [ ] Tidak ada hardcoded keys di source code (semua di env variables)
- [ ] `.env.example` ada di repo (sebagai template tanpa real values)
- [ ] GitHub Secrets sudah di-update (untuk CI/CD)
- [ ] Cloudflare Workers environment variables sudah di-set
- [ ] `wrangler.toml` tidak berisi hardcoded credentials
- [ ] `astro.config.mjs` menggunakan env variables saja
- [ ] Git history sudah di-clean (jika ada keys yang ter-commit)

---

## 📝 Development Setup

```bash
# 1. Copy template
cp .env.example .env

# 2. Edit .env dengan real values
nano .env  # atau gunakan editor lainnya

# 3. Install dependencies
npm install

# 4. Run development server
npm run dev
```

---

## 🚀 Production Deployment

### Cloudflare Pages/Workers

1. **Set Environment Variables di Cloudflare Dashboard:**
   - Settings → Environment Variables
   - Add semua keys dari `.env.example`

2. **Deploy:**
   ```bash
   npm run build
   wrangler deploy
   ```

3. **Verify:**
   ```bash
   # Test edge function
   curl https://your-domain.com/api/health
   ```

---

## 🔍 Security Best Practices

1. **Never commit `.env` files** - Use `.env.example` sebagai template
2. **Rotate keys regularly** - Especially setelah exposure
3. **Use different keys per environment** - dev/staging/production
4. **Monitor API usage** - Cek suspicious activity di provider dashboards
5. **Use restricted API keys** - DuitKu & Supabase support key restrictions by domain/IP
6. **Audit Git history** - `git log -S "password" --all` untuk find secrets
7. **Use git hooks** - Install `git-secrets` untuk prevent accidental commits

---

## 🛠️ Tools untuk Security

```bash
# Scan untuk secrets dalam repo
npm install -g git-secrets
git secrets --install
git secrets --register-aws

# Atau gunakan TruffleHog
pip install truffleHog
truffleHog filesystem . --json

# Atau gunakan Gitleaks
gitleaks detect --source filesystem --verbose
```

---

## 📞 Emergency Response

**Jika API key sudah terekspose:**

1. ✅ IMMEDIATELY rotate the key
2. ✅ Monitor activity/usage untuk suspicious transactions
3. ✅ Clean Git history
4. ✅ Check commit history untuk see who had access
5. ✅ Enable 2FA pada semua provider accounts
6. ✅ Update GitHub Actions secrets
7. ✅ Redeploy dengan keys baru

---

## References

- [Supabase Security Best Practices](https://supabase.com/docs/guides/platform/security)
- [OWASP: Secrets Management](https://owasp.org/www-community/Sensitive_Data_Exposure)
- [12 Factor App: Store config in environment](https://12factor.net/config)
- [GitHub: Managing sensitive data](https://docs.github.com/en/code-security/secret-scanning)
