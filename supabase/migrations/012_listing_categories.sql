-- Listing product categories
DO $$ BEGIN
  CREATE TYPE listing_category AS ENUM (
    'miniatures',
    'novels',
    'codex',
    'paints',
    'tools',
    'terrain',
    'accessories',
    'other'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE listings ADD COLUMN IF NOT EXISTS category listing_category DEFAULT 'miniatures' NOT NULL;

-- Partial index for active listings filtered by category
CREATE INDEX IF NOT EXISTS idx_listings_category ON listings(category) WHERE status = 'active';
