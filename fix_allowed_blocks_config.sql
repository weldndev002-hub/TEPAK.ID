-- ============================================================
-- CHECK: Lihat kondisi config sekarang di semua plan
-- ============================================================
SELECT id, name, config, config->'allowed_blocks' as allowed_blocks
FROM subscription_plans
ORDER BY id;

-- ============================================================
-- FIX: Update plan yang config-nya NULL atau tidak punya allowed_blocks
-- Pastikan semua plan punya config.allowed_blocks = [] (empty = block all)
-- atau daftar blok yang diizinkan.
-- 
-- Jalankan query di bawah sesuai kebutuhan:
-- ============================================================

-- Untuk plan 'free': set config dengan allowed_blocks kosong (tidak ada blok)
-- UPDATE subscription_plans
-- SET config = jsonb_set(COALESCE(config, '{}'), '{allowed_blocks}', '[]', true)
-- WHERE id = 'free';

-- Untuk plan 'pro': set config dengan semua blok diizinkan
-- UPDATE subscription_plans
-- SET config = jsonb_set(COALESCE(config, '{}'), '{allowed_blocks}', '["link","text","image","video","social"]', true)
-- WHERE id = 'pro';

-- ============================================================
-- ATAU: Update semua plan yang config-nya NULL menjadi {} dulu
-- ============================================================
UPDATE subscription_plans
SET config = COALESCE(config, '{}')
WHERE config IS NULL;

-- Pastikan semua plan yang belum punya allowed_blocks dapat default empty
UPDATE subscription_plans
SET config = jsonb_set(config, '{allowed_blocks}', '[]', true)
WHERE config->'allowed_blocks' IS NULL;
