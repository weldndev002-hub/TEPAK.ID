-- ==============================================================================
-- PAYOUT ENHANCEMENT MIGRATION
-- ==============================================================================

-- 1. Tambah kolom bukti transfer ke tabel withdrawals
-- Ini untuk menyimpan URL gambar bukti transfer manual dari Admin.
ALTER TABLE public.withdrawals ADD COLUMN IF NOT EXISTS proof_url TEXT;

-- 2. Buat tabel notifikasi
-- Digunakan untuk memberitahu kreator tentang status payout atau info penting lainnya.
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info', -- 'success', 'warning', 'info'
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tambahkan RLS untuk notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- 3. Inisialisasi storage bucket untuk bukti transfer
-- Jika dijalankan via SQL editor, ini akan mendaftarkan bucket baru 'payout-proofs'
INSERT INTO storage.buckets (id, name, public) 
VALUES ('payout-proofs', 'payout-proofs', true)
ON CONFLICT (id) DO NOTHING;

-- Kebijakan akses storage bucket payout-proofs (Publik untuk dibaca, Admin dapar mengunggah)
-- Catatan: Kebijakan storage biasanya lebih mudah dikonfigurasi via dashboard Supabase, 
-- namun SQL ini memberikan dasar akses yang dibutuhkan.
INSERT INTO storage.policies (name, bucket_id, definition, action)
VALUES 
  ('Public Read Access', 'payout-proofs', '{"auth.role()": "anon"}', 'SELECT'),
  ('Admin Upload Access', 'payout-proofs', '{"auth.role()": "authenticated"}', 'INSERT')
ON CONFLICT DO NOTHING;
