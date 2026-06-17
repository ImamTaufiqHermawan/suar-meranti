-- SuarMeranti v2.1: Bersihkan RPC lama yang bergantung pgcrypto
-- Jalankan jika login admin error: function crypt(text, text) does not exist

DROP FUNCTION IF EXISTS verify_admin(TEXT, TEXT);

-- Jika belum punya akun admin, buat lewat:
--   node scripts/generate-admin-hash.mjs <username> "<password>"
-- lalu jalankan SQL hasilnya di Supabase SQL Editor.
