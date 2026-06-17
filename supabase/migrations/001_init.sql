-- SuarMeranti: Kotak Saran & Aspirasi Warga Bukit Meranti
-- Jalankan di Supabase SQL Editor

CREATE TABLE IF NOT EXISTS aspirations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content       TEXT NOT NULL CHECK (char_length(content) BETWEEN 10 AND 2000),
  category      TEXT NOT NULL DEFAULT 'saran'
                CHECK (category IN ('saran', 'aspirasi', 'keluhan', 'pujian')),
  is_anonymous  BOOLEAN NOT NULL DEFAULT true,
  author_name   TEXT,
  author_address TEXT,
  likes_count   INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_aspirations_created_at
  ON aspirations (created_at DESC);

ALTER TABLE aspirations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read" ON aspirations;
CREATE POLICY "Public read" ON aspirations
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public insert" ON aspirations;
CREATE POLICY "Public insert" ON aspirations
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public update likes" ON aspirations;
CREATE POLICY "Public update likes" ON aspirations
  FOR UPDATE USING (true)
  WITH CHECK (true);
