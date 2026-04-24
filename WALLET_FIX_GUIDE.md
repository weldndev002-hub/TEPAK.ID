# PANDUAN PERBAIKAN SINKRONISASI WALLET TEPAK.ID

## Status Saat Ini (Berdasarkan Diagnosa)
✅ **Webhook Duitku berfungsi** - Sudah bisa update status order  
✅ **Database schema siap** - Tabel wallets dan orders sudah ada  
❌ **Trigger tidak ada** - Fungsi `handle_order_status_change()` tidak ditemukan  
❌ **Saldo tidak sinkron** - 2.7 juta IDR belum masuk ke wallet (9 order sukses)  
❌ **Platform config kosong** - Fee belum dikonfigurasi  

## LANGKAH-LANGKAH PERBAIKAN

### Langkah 1: Jalankan Script SQL di Supabase Dashboard

1. **Buka Supabase Dashboard**:
   - Login ke https://supabase.com/dashboard/project/aaqguhxonwpsnpwjjdrv
   - Pilih project **aaqguhxonwpsnpwjjdrv**

2. **Masuk ke SQL Editor**:
   - Di sidebar kiri, klik **SQL Editor**
   - Klik **New Query**

3. **Salin Script SQL**:
   - Buka file `wallet_fix_manual.sql` di VS Code
   - Salin **seluruh konten** (Ctrl+A, Ctrl+C)

4. **Tempel dan Jalankan**:
   - Tempel di SQL Editor (Ctrl+V)
   - Klik tombol **Run** atau tekan **Ctrl+Enter**

### Apa yang Dilakukan Script SQL:
- ✅ **Buat fungsi** `handle_order_status_change()` 
- ✅ **Buat trigger** `on_order_status_changed` di tabel `orders`
- ✅ **Update saldo wallet** untuk order yang sudah sukses
- ✅ **Tambahkan konfigurasi platform** (fee, minimum withdrawal)
- ✅ **Perbaiki perhitungan** `net_amount` untuk order yang ada

### Langkah 2: Verifikasi Perbaikan

Jalankan perintah berikut di terminal:
```bash
node verify_wallet_fix.js
```

**Hasil yang Diharapkan**:
- ✅ Trigger dan fungsi ditemukan
- ✅ Saldo wallet sinkron dengan order sukses (Rp 2.720.978)
- ✅ Platform config tersedia dengan fee yang benar

### Langkah 3: Testing Alur Lengkap

1. **Buat order baru**:
   - Checkout produk apapun
   - Dapatkan invoice ID (misal: TPK-793920)

2. **Bayar via Duitku**:
   - Gunakan sandbox atau production
   - Selesaikan pembayaran

3. **Monitor Webhook**:
   - Duitku akan kirim webhook ke `https://tepakid.weldn-dev-002.workers.dev/api/payments/duitku/webhook`
   - Webhook akan update status order ke `'success'`

4. **Cek Wallet Dashboard**:
   - Trigger akan otomatis tambah `net_amount` ke `pending_balance`
   - Saldo wallet merchant harus bertambah
   - Buka halaman `/wallet` untuk verifikasi

## MEKANISME YANG DIPERBAIKI

**Sebelum**:
```
Duitku Payment → Webhook → Update order status → ❌ Wallet TIDAK berubah
```

**Sesudah**:
```
Duitku Payment → Webhook → Update order status → ✅ Trigger aktif → Wallet bertambah
```

## TROUBLESHOOTING

### Jika SQL Error:
- **"function already exists"** - Aman diabaikan, script menggunakan `CREATE OR REPLACE`
- **"table does not exist"** - Pastikan tabel `wallets` dan `orders` ada
- **"permission denied"** - Gunakan Service Role Key untuk akses penuh

### Jika Saldo Masih 0:
1. Cek status order: `SELECT status, net_amount FROM orders WHERE merchant_id = 'your-merchant-id'`
2. Verifikasi trigger aktif: `SELECT tgname FROM pg_trigger WHERE tgname = 'on_order_status_changed'`
3. Test manual trigger:
   ```sql
   -- Cari order pending
   SELECT id FROM orders WHERE status = 'pending' LIMIT 1;
   
   -- Update ke success
   UPDATE orders SET status = 'success' WHERE id = 'order-id';
   
   -- Cek wallet
   SELECT * FROM wallets WHERE merchant_id = 'merchant-id';
   ```

### Testing Order yang Disarankan:
- **Order TPK-793920** (Rp 115.159) - sudah pending, tinggal update status
- Atau buat order baru dengan amount kecil untuk testing

## KONFIGURASI PLATFORM DEFAULT
- **Payout fee**: Rp 5.000 (biaya admin penarikan)
- **Minimum withdrawal**: Rp 50.000 (minimal penarikan)
- **PG fee**: Rp 2.000 (biaya payment gateway per transaksi)
- **Platform fee**: 5% (persentase dari total order)

## MONITORING SETELAH PERBAIKAN

1. **Cek Dashboard Wallet**:
   - `/wallet` - lihat pending_balance dan available_balance
   
2. **Test Transaksi Baru**:
   - Buat order kecil (Rp 10.000)
   - Bayar via Duitku sandbox
   - Pastikan saldo bertambah

3. **Monitor Logs**:
   - Supabase Logs → Database
   - Cari "RAISE NOTICE" dari trigger

## SUPPORT

Jika masih ada masalah:
1. Jalankan `node debug_wallet_trigger.js` untuk diagnosa detail
2. Cek file `FIXES_SUMMARY.md` untuk dokumentasi perbaikan lain
3. Hubungi tim developer untuk bantuan teknis

## HASIL YANG DIHARAPKAN

Setelah semua langkah di atas:
- ✅ **Saldo wallet sinkron** dengan total order sukses (Rp 2.720.978)
- ✅ **Trigger aktif** untuk order baru
- ✅ **Platform config lengkap** dengan fee yang tepat
- ✅ **Sistem otomatis** update wallet saat status order berubah

**Catatan Penting**: Order yang sudah sukses akan otomatis di-sync ke wallet setelah script dijalankan. Order baru akan otomatis trigger setelah perbaikan.