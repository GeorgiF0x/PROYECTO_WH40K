-- Add faction reference to listings
-- Allows sellers to tag their listing with a specific Warhammer faction
ALTER TABLE listings ADD COLUMN IF NOT EXISTS faction_id UUID REFERENCES tags(id) ON DELETE SET NULL;

-- Partial index for active listings filtered by faction
CREATE INDEX IF NOT EXISTS idx_listings_faction ON listings(faction_id) WHERE status = 'active' AND faction_id IS NOT NULL;
