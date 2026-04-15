# Panduan Integrasi Gateway Pembayaran DuitKu

## Variabel Lingkungan yang Diperlukan

Tambahkan berikut ke file `.env` atau Cloudflare Workers KV store:

```env
# Konfigurasi Gateway Pembayaran DuitKu
PUBLIC_DUITKU_MERCHANT_CODE=KODE_MERCHANT_ANDA
PUBLIC_DUITKU_MERCHANT_KEY=KUNCI_MERCHANT_ANDA

# Opsional: Lingkungan DuitKu (sandbox atau production)
DUITKU_ENVIRONMENT=production  # atau 'sandbox' untuk testing
```

## Mendapatkan Kredensial DuitKu

1. **Buat Akun DuitKu** di https://www.duitku.com
2. **Dapatkan Kredensial Merchant**:
   - Login ke Dashboard DuitKu
   - Pergi ke "Pengaturan" → "Kredensial API"
   - Salin **Kode Merchant** dan **Kunci Merchant** Anda
3. **Atur URL Webhook** di Dashboard DuitKu:
   - URL Webhook: `https://domainanda.com/api/payments/duitku/webhook`

## Metode Pembayaran yang Didukung

- ✅ **QRIS** - Pembayaran instan melalui e-wallet (GoPay, OVO, Dana, LinkAja)
- ✅ **Virtual Account** - BNI, BRI, Mandiri
- ✅ **Kartu Kredit** - Visa, Mastercard, JCB
- ✅ **E-Wallet Langsung** - OVO, ShopeePay

Implementasi ini standarnya menggunakan **QRIS** untuk pemrosesan tercepat.

## Endpoint API

### 1. Buat Permintaan Pembayaran
```
POST /api/payments/duitku/create
```

**Badan Permintaan**:
```json
{
  "orderId": "ORD-1234567890",
  "amount": 500000,
  "productDetails": "Nama Produk",
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "customerPhone": "62812345678",
  "merchantCode": "KODE_MERCHANT",
  "merchantKey": "KUNCI_MERCHANT",
  "paymentMethod": "QRIS",
  "returnUrl": "https://domainanda.com/checkout?order_id=...",
  "callbackUrl": "https://domainanda.com/api/payments/duitku/webhook",
  "expiryPeriod": 60
}
```

**Respons** (Sukses):
```json
{
  "statusCode": "00",
  "statusMessage": "Sukses",
  "reference": "DUITKU123456",
  "paymentUrl": "https://payment.duitku.com/...",
  "qrUrl": "https://...(URL gambar kode QR)",
  "vaNumber": "123456789" // Hanya untuk metode VA
}
```

### 2. Periksa Status Pembayaran
```
POST /api/payments/duitku/status
```

**Badan Permintaan**:
```json
{
  "orderId": "ORD-1234567890",
  "amount": 500000,
  "merchantCode": "KODE_MERCHANT",
  "merchantKey": "KUNCI_MERCHANT"
}
```

**Respons**:
```json
{
  "statusCode": "00", // 00=sukses, 01=tertunda, 02=dibatalkan, 03=kedaluwarsa
  "statusMessage": "Sukses",
  "reference": "DUITKU123456",
  "merchantCode": "KODE_MERCHANT"
}
```

### 3. Notifikasi Webhook
```
POST /api/payments/duitku/webhook
```

Dipanggil otomatis oleh DuitKu ketika status pembayaran berubah.

**Badan Permintaan**:
```json
{
  "merchantCode": "KODE_MERCHANT",
  "orderId": "ORD-1234567890",
  "amount": 500000,
  "reference": "DUITKU123456",
  "statusCode": "00",
  "statusMessage": "Sukses",
  "signature": "hash_md5_tanda_tangan"
}
```

## Penggunaan Komponen

### CheckoutForm
Komponen **CheckoutForm** sekarang secara otomatis menggunakan DuitKu untuk pembayaran:

```tsx
<CheckoutForm />
```

### DuitkuPaymentModal (Level Rendah)
Untuk implementasi kustom:

```tsx
import { DuitkuPaymentModal } from '@/components/checkout/DuitkuPaymentModal';

<DuitkuPaymentModal
  isOpen={isOpen}
  onClose={handleClose}
  onSuccess={handleSuccess}
  grossAmount={500000}
  orderId="ORD-123"
  productDetails="Nama Produk"
  buyerName="John Doe"
  buyerEmail="john@example.com"
  buyerPhone="62812345678"
  merchantCode="KODE_MERCHANT"
  merchantKey="KUNCI_MERCHANT"
  paymentMethod="QRIS"
/>
```

## Struktur Biaya

### Biaya QRIS DuitKu
- **Biaya Transaksi**: 0,7% (otomatis dipotong oleh DuitKu)
- **Contoh**: Rp 500.000 → Bersih: Rp 496.500 (setelah biaya 0,7%)

## Catatan Keamanan

⚠️ **Penting**:
1. Jangan pernah tampilkan `merchantKey` dalam kode frontend
2. Simpan kredensial hanya dalam variabel lingkungan
3. Selalu validasi tanda tangan webhook
4. Gunakan HTTPS untuk semua endpoint pembayaran
5. Implementasikan rate limiting untuk endpoint pembayaran

## Pengujian

### Mode Sandbox
Untuk menguji dengan lingkungan sandbox:
1. Buat [Akun Sandbox](https://sandbox.duitku.com)
2. Perbarui `DUITKU_ENVIRONMENT=sandbox` di `.env`
3. Gunakan kredensial sandbox untuk pengujian

### Alur Pengujian Pembayaran
1. Kunjungi halaman `/checkout`
2. Isi informasi pembeli
3. Pilih metode pembayaran QRIS
4. Pindai kode QR dengan aplikasi DuitKu (lingkungan pengujian)
5. Verifikasi pembayaran selesai dan pesanan dibuat

## Skema Database

Tabel `orders` mencakup:
- `payment_method`: Menyimpan metode pembayaran (misalnya, "QRIS")
- `status`: Status pesanan (pending, success, cancelled, expired)
- Diperbarui otomatis oleh handler webhook

## Pemecahan Masalah

### Pembuatan Pembayaran Gagal
- ✓ Periksa kredensial merchant sudah benar
- ✓ Verifikasi jumlah > 0
- ✓ Pastikan email dalam format valid
- ✓ Periksa API DuitKu tidak sedang dalam pemeliharaan

### Webhook Tidak Dipicu
- ✓ Verifikasi URL webhook diatur dengan benar di dashboard DuitKu
- ✓ Pastikan URL dapat diakses publik (tidak localhost)
- ✓ Periksa log kesalahan untuk masalah validasi tanda tangan

### Validasi Tanda Tangan Gagal
- ✓ Verifikasi hashing MD5 sudah benar
- ✓ Periksa kunci merchant sudah benar
- ✓ Pastikan data tidak dimodifikasi selama transmisi

## Daftar Periksa Produksi

Sebelum go live:
- [ ] Perbarui ke kredensial produksi
- [ ] Uji alur pembayaran end-to-end
- [ ] Atur URL webhook di dashboard DuitKu
- [ ] Siapkan monitoring/logging kesalahan
- [ ] Implementasikan penanganan timeout pembayaran
- [ ] Uji dengan pembayaran nyata (jumlah kecil)
- [ ] Siapkan gateway pembayaran cadangan (jika memungkinkan)
- [ ] Konfigurasi logika retry untuk pembayaran gagal
- [ ] Monitor biaya transaksi

## Dukungan

Untuk dukungan DuitKu:
- Dokumentasi: https://docs.duitku.com
- Dukungan: https://www.duitku.com/contact
- Email: support@duitku.com

Untuk masalah implementasi ini:
- Periksa sumber komponen di `src/lib/duitku.ts`
- Tinjau endpoint API di `src/pages/api/[...path].ts`
- Periksa komponen checkout di `src/components/checkout/`
