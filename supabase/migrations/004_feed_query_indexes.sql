CREATE INDEX IF NOT EXISTS idx_aspirations_category_created_at
  ON aspirations (category, created_at DESC, id DESC);
