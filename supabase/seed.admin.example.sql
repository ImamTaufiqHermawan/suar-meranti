-- Contoh seed admin — JANGAN pakai password default di production.
-- 1. Generate hash di lokal:
--      node scripts/generate-admin-hash.mjs admin.meranti "PasswordKuatAnda"
-- 2. Paste hasil SQL dari script ke Supabase SQL Editor → Run
-- 3. Simpan username/password di password manager (bukan di git)

-- Template (ganti YOUR_BCRYPT_HASH dengan output script di atas):
-- INSERT INTO public.admins (username, password_hash)
-- VALUES ('admin.meranti', 'YOUR_BCRYPT_HASH')
-- ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash;
