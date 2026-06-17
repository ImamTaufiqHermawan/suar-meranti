-- SuarMeranti v2: Admin auth, like per device, rich text (HTML) content
-- Jalankan di Supabase SQL Editor SETELAH 001_init.sql
-- Catatan: admin password diverifikasi di server (bcrypt), bukan pgcrypto

-- Perluas batas content untuk HTML rich text
ALTER TABLE aspirations DROP CONSTRAINT IF EXISTS aspirations_content_check;
ALTER TABLE aspirations ADD CONSTRAINT aspirations_content_check
  CHECK (char_length(content) BETWEEN 10 AND 10000);

-- Tabel like per visitor/device (1 like per aspirasi per visitor)
CREATE TABLE IF NOT EXISTS aspiration_likes (
  aspiration_id UUID NOT NULL REFERENCES aspirations(id) ON DELETE CASCADE,
  visitor_id    TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (aspiration_id, visitor_id)
);

CREATE INDEX IF NOT EXISTS idx_aspiration_likes_visitor
  ON aspiration_likes (visitor_id);

ALTER TABLE aspiration_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read likes" ON aspiration_likes;
CREATE POLICY "Public read likes" ON aspiration_likes
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public insert like" ON aspiration_likes;
CREATE POLICY "Public insert like" ON aspiration_likes
  FOR INSERT WITH CHECK (true);

-- Trigger: increment likes_count saat like baru
CREATE OR REPLACE FUNCTION increment_aspiration_likes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE aspirations
  SET likes_count = likes_count + 1
  WHERE id = NEW.aspiration_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_aspiration_like_insert ON aspiration_likes;
CREATE TRIGGER on_aspiration_like_insert
  AFTER INSERT ON aspiration_likes
  FOR EACH ROW
  EXECUTE FUNCTION increment_aspiration_likes();

-- Hapus policy update manual likes (diganti trigger)
DROP POLICY IF EXISTS "Public update likes" ON aspirations;

-- Tabel admin
CREATE TABLE IF NOT EXISTS admins (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username      TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
-- Verifikasi password dilakukan di server (bcryptjs + service role key)
-- Buat akun admin via scripts/generate-admin-hash.mjs (lihat DEPLOYMENT_GUIDE.md)
