-- ============================================================
-- Comunidad: Stores + Store Reviews
-- Phase 1 migration for the Community section
-- ============================================================

-- Enums
CREATE TYPE store_type AS ENUM ('specialist', 'comics_games', 'general_hobby', 'online_only');
CREATE TYPE store_status AS ENUM ('pending', 'approved', 'rejected', 'closed');

-- Add is_admin to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- ============================================================
-- Table: stores
-- ============================================================
CREATE TABLE stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submitted_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  store_type store_type NOT NULL DEFAULT 'specialist',
  status store_status NOT NULL DEFAULT 'pending',
  phone TEXT,
  email TEXT,
  website TEXT,
  instagram TEXT,
  facebook TEXT,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  province TEXT,
  postal_code TEXT,
  country TEXT NOT NULL DEFAULT 'ES',
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  images TEXT[] DEFAULT '{}',
  services TEXT[] DEFAULT '{}',
  opening_hours JSONB DEFAULT '{}',
  avg_rating NUMERIC(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_stores_status ON stores(status);
CREATE INDEX idx_stores_city ON stores(city);
CREATE INDEX idx_stores_store_type ON stores(store_type);
CREATE INDEX idx_stores_submitted_by ON stores(submitted_by);
CREATE INDEX idx_stores_slug ON stores(slug);
CREATE INDEX idx_stores_coords ON stores(latitude, longitude);

-- ============================================================
-- Table: store_reviews
-- ============================================================
CREATE TABLE store_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(store_id, reviewer_id)
);

CREATE INDEX idx_store_reviews_store_id ON store_reviews(store_id);
CREATE INDEX idx_store_reviews_reviewer_id ON store_reviews(reviewer_id);

-- ============================================================
-- Trigger: update store avg_rating and review_count
-- ============================================================
CREATE OR REPLACE FUNCTION update_store_rating()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    UPDATE stores SET
      avg_rating = COALESCE((SELECT AVG(rating)::NUMERIC(3,2) FROM store_reviews WHERE store_id = OLD.store_id), 0),
      review_count = (SELECT COUNT(*) FROM store_reviews WHERE store_id = OLD.store_id),
      updated_at = now()
    WHERE id = OLD.store_id;
    RETURN OLD;
  ELSE
    UPDATE stores SET
      avg_rating = COALESCE((SELECT AVG(rating)::NUMERIC(3,2) FROM store_reviews WHERE store_id = NEW.store_id), 0),
      review_count = (SELECT COUNT(*) FROM store_reviews WHERE store_id = NEW.store_id),
      updated_at = now()
    WHERE id = NEW.store_id;
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_store_rating
  AFTER INSERT OR UPDATE OR DELETE ON store_reviews
  FOR EACH ROW EXECUTE FUNCTION update_store_rating();

-- ============================================================
-- Updated_at trigger for stores
-- ============================================================
CREATE OR REPLACE FUNCTION update_stores_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_stores_updated_at
  BEFORE UPDATE ON stores
  FOR EACH ROW EXECUTE FUNCTION update_stores_updated_at();

-- ============================================================
-- RLS Policies
-- ============================================================
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_reviews ENABLE ROW LEVEL SECURITY;

-- Stores: approved visible to all + submitter sees own (any status)
CREATE POLICY "stores_select_approved" ON stores
  FOR SELECT USING (status = 'approved');

CREATE POLICY "stores_select_own" ON stores
  FOR SELECT USING (auth.uid() = submitted_by);

-- Stores: authenticated users can insert their own
CREATE POLICY "stores_insert_own" ON stores
  FOR INSERT WITH CHECK (auth.uid() = submitted_by);

-- Stores: submitter can update own pending stores
CREATE POLICY "stores_update_own_pending" ON stores
  FOR UPDATE USING (auth.uid() = submitted_by AND status = 'pending')
  WITH CHECK (auth.uid() = submitted_by AND status = 'pending');

-- Stores: admins can update any store
CREATE POLICY "stores_update_admin" ON stores
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

-- Store reviews: public read
CREATE POLICY "store_reviews_select" ON store_reviews
  FOR SELECT USING (true);

-- Store reviews: authenticated users can insert own
CREATE POLICY "store_reviews_insert_own" ON store_reviews
  FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

-- Store reviews: own update
CREATE POLICY "store_reviews_update_own" ON store_reviews
  FOR UPDATE USING (auth.uid() = reviewer_id)
  WITH CHECK (auth.uid() = reviewer_id);

-- Store reviews: own delete
CREATE POLICY "store_reviews_delete_own" ON store_reviews
  FOR DELETE USING (auth.uid() = reviewer_id);

-- ============================================================
-- Storage bucket: stores (public)
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('stores', 'stores', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for stores bucket
CREATE POLICY "stores_bucket_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'stores');

CREATE POLICY "stores_bucket_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'stores'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "stores_bucket_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'stores'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "stores_bucket_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'stores'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
