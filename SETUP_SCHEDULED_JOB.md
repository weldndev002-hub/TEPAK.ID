# Panduan Setup Scheduled Job untuk Wallet Clearing

## 📋 **Overview**
Scheduled job diperlukan untuk otomatis memindahkan saldo dari `pending_balance` ke `available_balance` setelah clearing period (misalnya 7 hari). Ini memastikan user bisa menarik dana setelah masa tunggu.

## 🚀 **Langkah 1: Buat Fungsi di Database**

### **Jalankan SQL berikut di Supabase SQL Editor:**

```sql
-- ==============================================================================
-- CREATE CLEAR_PENDING_BALANCES FUNCTION
-- Fungsi ini akan dipanggil oleh scheduled job
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.clear_pending_balances(
    p_days_threshold INTEGER DEFAULT 7
)
RETURNS TABLE(merchant_id UUID, amount_cleared NUMERIC) AS $$
DECLARE
    rec RECORD;
BEGIN
    -- Untuk setiap merchant dengan order sukses yang sudah lebih dari threshold hari
    FOR rec IN 
        SELECT DISTINCT o.merchant_id, 
               SUM(o.net_amount) as total_to_clear
        FROM public.orders o
        WHERE o.status IN ('success', 'paid')
          AND o.updated_at < NOW() - (p_days_threshold || ' days')::INTERVAL
        GROUP BY o.merchant_id
    LOOP
        -- Pindahkan dari pending ke available
        UPDATE public.wallets
        SET 
            pending_balance = GREATEST(pending_balance - rec.total_to_clear, 0),
            available_balance = available_balance + LEAST(rec.total_to_clear, pending_balance),
            updated_at = NOW()
        WHERE merchant_id = rec.merchant_id
        AND pending_balance > 0
        RETURNING wallets.merchant_id, LEAST(rec.total_to_clear, pending_balance) 
        INTO merchant_id, amount_cleared;
        
        RAISE NOTICE '[Wallet] Cleared % from pending to available for merchant %', 
            amount_cleared, rec.merchant_id;
    END LOOP;
    
    RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Berikan izin eksekusi
GRANT EXECUTE ON FUNCTION public.clear_pending_balances(INTEGER) 
TO postgres, authenticated, service_role;
```

## 🚀 **Langkah 2: Setup Scheduled Job di Supabase**

### **Metode 1: Via Supabase Dashboard (Recommended)**

1. **Buka [Supabase Dashboard](https://supabase.com/dashboard)**
2. Pilih project Anda
3. Navigasi ke **Database** → **Functions**
4. Klik **"Schedule a new function"**
5. Isi form dengan konfigurasi berikut:

```
Function Name: clear_pending_balances
Schedule: 0 0 * * *        (setiap hari jam 00:00 UTC)
Timezone: Asia/Jakarta      (UTC+7)
Parameters: {"p_days_threshold": 7}
```

6. Klik **"Schedule"**

### **Metode 2: Via SQL (pg_cron extension)**

Jika pg_cron sudah diaktifkan di Supabase:

```sql
-- Aktifkan extension pg_cron (jika belum)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule job untuk jalan setiap hari jam 00:00 WIB (17:00 UTC)
SELECT cron.schedule(
    'clear-pending-balances-daily',
    '0 17 * * *',  -- 17:00 UTC = 00:00 WIB
    $$
    SELECT * FROM public.clear_pending_balances(7);
    $$
);

-- Cek scheduled jobs
SELECT * FROM cron.job;
```

### **Metode 3: Via Edge Functions + CRON Job**

Jika ingin lebih fleksibel, buat Edge Function:

1. **Buat file `clear-pending-balances/index.ts`:**

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export default async function handler(req: Request) {
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  try {
    const { data, error } = await supabase.rpc('clear_pending_balances', {
      p_days_threshold: 7
    })
    
    if (error) throw error
    
    return new Response(JSON.stringify({
      success: true,
      cleared: data?.length || 0,
      timestamp: new Date().toISOString()
    }), { status: 200 })
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), { status: 500 })
  }
}
```

2. **Deploy ke Supabase Edge Functions:**
```bash
supabase functions deploy clear-pending-balances
```

3. **Setup CRON di Supabase:**
   - Dashboard → Functions → `clear-pending-balances` → Settings
   - Tambah schedule: `0 0 * * *` (setiap hari jam 00:00)

## 🚀 **Langkah 3: Testing Manual**

### **Test Fungsi Langsung di SQL Editor:**

```sql
-- Test dengan threshold 0 hari (clear semua)
SELECT * FROM public.clear_pending_balances(0);

-- Test dengan threshold 7 hari
SELECT * FROM public.clear_pending_balances(7);

-- Cek hasil
SELECT 
    merchant_id,
    pending_balance,
    available_balance,
    updated_at
FROM public.wallets 
WHERE pending_balance > 0 
ORDER BY pending_balance DESC 
LIMIT 10;
```

### **Test dengan Script Node.js:**

```bash
# Jalankan script test
node check_and_clear_pending.cjs

# Atau test dengan threshold tertentu
node -e "
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function test() {
  const { data, error } = await supabase.rpc('clear_pending_balances', {
    p_days_threshold: 7
  });
  console.log('Cleared:', data);
}
test();
"
```

## 🚀 **Langkah 4: Monitoring & Alerting**

### **Setup Logging:**

```sql
-- Buat tabel log untuk tracking
CREATE TABLE IF NOT EXISTS public.wallet_clearing_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    executed_at TIMESTAMPTZ DEFAULT NOW(),
    cleared_count INTEGER,
    total_amount NUMERIC,
    threshold_days INTEGER
);

-- Update fungsi untuk logging
CREATE OR REPLACE FUNCTION public.clear_pending_balances_with_log(
    p_days_threshold INTEGER DEFAULT 7
)
RETURNS JSON AS $$
DECLARE
    result RECORD;
    cleared_count INTEGER := 0;
    total_amount NUMERIC := 0;
BEGIN
    -- Panggil fungsi asli
    FOR result IN 
        SELECT * FROM public.clear_pending_balances(p_days_threshold)
    LOOP
        cleared_count := cleared_count + 1;
        total_amount := total_amount + COALESCE(result.amount_cleared, 0);
    END LOOP;
    
    -- Insert log
    INSERT INTO public.wallet_clearing_logs (cleared_count, total_amount, threshold_days)
    VALUES (cleared_count, total_amount, p_days_threshold);
    
    RETURN json_build_object(
        'success', true,
        'cleared_count', cleared_count,
        'total_amount', total_amount,
        'threshold_days', p_days_threshold
    );
END;
$$ LANGUAGE plpgsql;
```

### **Dashboard Monitoring:**

```sql
-- Cek log terakhir
SELECT * FROM public.wallet_clearing_logs 
ORDER BY executed_at DESC 
LIMIT 10;

-- Statistik harian
SELECT 
    DATE(executed_at) as date,
    COUNT(*) as runs,
    SUM(cleared_count) as total_wallets_cleared,
    SUM(total_amount) as total_amount_cleared
FROM public.wallet_clearing_logs
GROUP BY DATE(executed_at)
ORDER BY date DESC;
```

## 🚀 **Langkah 5: Troubleshooting**

### **Jika Job Tidak Berjalan:**

1. **Cek Status pg_cron:**
```sql
-- Cek job yang aktif
SELECT * FROM cron.job;
SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;
```

2. **Manual Trigger via API:**
```bash
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/clear-pending-balances \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json"
```

3. **Cek Error Logs:**
   - Supabase Dashboard → Database → Logs
   - Filter: `clear_pending_balances`

### **Jika Fungsi Error:**

1. **Test dengan parameter berbeda:**
```sql
-- Test dengan 0 hari (debug)
SELECT * FROM public.clear_pending_balances(0);

-- Test dengan 1 hari
SELECT * FROM public.clear_pending_balances(1);
```

2. **Cek permissions:**
```sql
-- Berikan permissions jika perlu
GRANT EXECUTE ON FUNCTION public.clear_pending_balances(INTEGER) 
TO postgres, authenticated, service_role;
```

## 📊 **Konfigurasi Production**

### **Rekomendasi untuk Production:**

1. **Schedule**: `0 0 * * *` (setiap hari jam 00:00)
2. **Threshold**: 7 hari (sesuai kebijakan bisnis)
3. **Timezone**: Asia/Jakarta (UTC+7)
4. **Monitoring**: Setup alert jika job gagal 3x berturut-turut
5. **Backup**: Simpan log ke tabel terpisah untuk audit

### **Environment Variables (jika pakai Edge Function):**
```
SUPABASE_URL=your-project-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SCHEDULE_CRON=0 0 * * *
CLEARING_THRESHOLD_DAYS=7
```

## 🎯 **Kesimpulan**

Dengan setup scheduled job ini, sistem akan:
1. **Otomatis** memindahkan saldo dari pending ke available setiap hari
2. **Konsisten** dengan kebijakan clearing period (7 hari)
3. **Terpantau** melalui logging dan monitoring
4. **Handal** dengan error handling yang baik

**Status saat ini**: Fungsi `clear_pending_balances` sudah siap, tinggal dijadikan scheduled job melalui Supabase Dashboard atau pg_cron.

**Next action**: Jalankan Langkah 2 (Setup Scheduled Job) di Supabase Dashboard untuk mengaktifkan automation.