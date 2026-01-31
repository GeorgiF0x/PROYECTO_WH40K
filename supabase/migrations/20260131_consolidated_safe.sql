-- =====================================================
-- CONSOLIDATED SAFE MIGRATION
-- Includes: stores, creator profiles, user roles
-- All statements are idempotent (safe to run multiple times)
-- =====================================================

-- =====================================================
-- PART 1: STORES (Community)
-- =====================================================

-- Create enums only if they don't exist
DO $$ BEGIN
  CREATE TYPE store_type AS ENUM ('specialist', 'comics_games', 'general_hobby', 'online_only');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE store_status AS ENUM ('pending', 'approved', 'rejected', 'closed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Add is_admin to profiles (legacy, will be replaced by role)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Create stores table
CREATE TABLE IF NOT EXISTS stores (
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

-- Indexes for stores
CREATE INDEX IF NOT EXISTS idx_stores_status ON stores(status);
CREATE INDEX IF NOT EXISTS idx_stores_city ON stores(city);
CREATE INDEX IF NOT EXISTS idx_stores_store_type ON stores(store_type);
CREATE INDEX IF NOT EXISTS idx_stores_submitted_by ON stores(submitted_by);
CREATE INDEX IF NOT EXISTS idx_stores_slug ON stores(slug);
CREATE INDEX IF NOT EXISTS idx_stores_coords ON stores(latitude, longitude);

-- Create store_reviews table
CREATE TABLE IF NOT EXISTS store_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(store_id, reviewer_id)
);

CREATE INDEX IF NOT EXISTS idx_store_reviews_store_id ON store_reviews(store_id);
CREATE INDEX IF NOT EXISTS idx_store_reviews_reviewer_id ON store_reviews(reviewer_id);

-- Trigger for store rating update
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

DROP TRIGGER IF EXISTS trg_update_store_rating ON store_reviews;
CREATE TRIGGER trg_update_store_rating
  AFTER INSERT OR UPDATE OR DELETE ON store_reviews
  FOR EACH ROW EXECUTE FUNCTION update_store_rating();

-- Updated_at trigger for stores
CREATE OR REPLACE FUNCTION update_stores_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_stores_updated_at ON stores;
CREATE TRIGGER trg_stores_updated_at
  BEFORE UPDATE ON stores
  FOR EACH ROW EXECUTE FUNCTION update_stores_updated_at();

-- RLS for stores
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_reviews ENABLE ROW LEVEL SECURITY;

-- Drop existing policies before creating
DROP POLICY IF EXISTS "stores_select_approved" ON stores;
DROP POLICY IF EXISTS "stores_select_own" ON stores;
DROP POLICY IF EXISTS "stores_insert_own" ON stores;
DROP POLICY IF EXISTS "stores_update_own_pending" ON stores;
DROP POLICY IF EXISTS "stores_update_admin" ON stores;

CREATE POLICY "stores_select_approved" ON stores
  FOR SELECT USING (status = 'approved');

CREATE POLICY "stores_select_own" ON stores
  FOR SELECT USING (auth.uid() = submitted_by);

CREATE POLICY "stores_insert_own" ON stores
  FOR INSERT WITH CHECK (auth.uid() = submitted_by);

CREATE POLICY "stores_update_own_pending" ON stores
  FOR UPDATE USING (auth.uid() = submitted_by AND status = 'pending')
  WITH CHECK (auth.uid() = submitted_by AND status = 'pending');

CREATE POLICY "stores_update_admin" ON stores
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

-- RLS for store_reviews
DROP POLICY IF EXISTS "store_reviews_select" ON store_reviews;
DROP POLICY IF EXISTS "store_reviews_insert_own" ON store_reviews;
DROP POLICY IF EXISTS "store_reviews_update_own" ON store_reviews;
DROP POLICY IF EXISTS "store_reviews_delete_own" ON store_reviews;

CREATE POLICY "store_reviews_select" ON store_reviews
  FOR SELECT USING (true);

CREATE POLICY "store_reviews_insert_own" ON store_reviews
  FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "store_reviews_update_own" ON store_reviews
  FOR UPDATE USING (auth.uid() = reviewer_id)
  WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "store_reviews_delete_own" ON store_reviews
  FOR DELETE USING (auth.uid() = reviewer_id);

-- Storage bucket for stores
INSERT INTO storage.buckets (id, name, public)
VALUES ('stores', 'stores', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies (drop first to avoid conflicts)
DROP POLICY IF EXISTS "stores_bucket_select" ON storage.objects;
DROP POLICY IF EXISTS "stores_bucket_insert" ON storage.objects;
DROP POLICY IF EXISTS "stores_bucket_update" ON storage.objects;
DROP POLICY IF EXISTS "stores_bucket_delete" ON storage.objects;

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

-- =====================================================
-- PART 2: CREATOR PROFILES
-- =====================================================

-- Create creator enums
DO $$ BEGIN
  CREATE TYPE creator_type AS ENUM (
    'painter',
    'youtuber',
    'artist',
    'blogger',
    'instructor'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE creator_status AS ENUM (
    'none',
    'pending',
    'approved',
    'rejected'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Add creator columns to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS creator_status creator_status DEFAULT 'none';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS creator_type creator_type;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS creator_verified_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS creator_bio TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS creator_services TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS accepts_commissions BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS commission_info TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS portfolio_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS pinned_miniatures UUID[] DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS creator_application_date TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS creator_rejection_reason TEXT;

-- Creator applications table
CREATE TABLE IF NOT EXISTS creator_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  creator_type creator_type NOT NULL,
  motivation TEXT NOT NULL,
  portfolio_links TEXT[],
  social_links JSONB,
  status creator_status DEFAULT 'pending',
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for creator
CREATE INDEX IF NOT EXISTS idx_profiles_creator_status ON profiles(creator_status) WHERE creator_status != 'none';
CREATE INDEX IF NOT EXISTS idx_profiles_creator_type ON profiles(creator_type) WHERE creator_type IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_accepts_commissions ON profiles(accepts_commissions) WHERE accepts_commissions = true;
CREATE INDEX IF NOT EXISTS idx_creator_applications_status ON creator_applications(status);
CREATE INDEX IF NOT EXISTS idx_creator_applications_user ON creator_applications(user_id);

-- Trigger for updated_at on creator_applications
DROP TRIGGER IF EXISTS update_creator_applications_updated_at ON creator_applications;
CREATE TRIGGER update_creator_applications_updated_at
  BEFORE UPDATE ON creator_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS for creator_applications
ALTER TABLE creator_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own applications" ON creator_applications;
DROP POLICY IF EXISTS "Users can create applications" ON creator_applications;
DROP POLICY IF EXISTS "Users can update own pending applications" ON creator_applications;

CREATE POLICY "Users can view own applications"
  ON creator_applications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create applications"
  ON creator_applications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pending applications"
  ON creator_applications FOR UPDATE
  USING (auth.uid() = user_id AND status = 'pending');

-- View for public creators
CREATE OR REPLACE VIEW public_creators AS
SELECT
  p.id,
  p.username,
  p.display_name,
  p.avatar_url,
  p.bio,
  p.creator_type,
  p.creator_bio,
  p.creator_services,
  p.accepts_commissions,
  p.portfolio_url,
  p.pinned_miniatures,
  p.creator_verified_at,
  p.favorite_factions,
  (SELECT COUNT(*) FROM miniatures m WHERE m.user_id = p.id) as miniatures_count,
  (SELECT COUNT(*) FROM follows f WHERE f.following_id = p.id) as followers_count,
  p.instagram,
  p.twitter,
  p.youtube,
  p.website
FROM profiles p
WHERE p.creator_status = 'approved'
ORDER BY p.creator_verified_at DESC;

-- Creator eligibility check function
CREATE OR REPLACE FUNCTION check_creator_eligibility(user_uuid UUID)
RETURNS JSONB AS $$
DECLARE
  profile_record RECORD;
  has_social BOOLEAN;
  eligibility JSONB;
BEGIN
  SELECT * INTO profile_record FROM profiles WHERE id = user_uuid;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('eligible', false, 'reason', 'Profile not found');
  END IF;

  has_social := (
    profile_record.instagram IS NOT NULL OR
    profile_record.twitter IS NOT NULL OR
    profile_record.youtube IS NOT NULL OR
    profile_record.website IS NOT NULL
  );

  eligibility := jsonb_build_object(
    'eligible', (
      profile_record.avatar_url IS NOT NULL AND
      profile_record.bio IS NOT NULL AND LENGTH(profile_record.bio) >= 10 AND
      has_social
    ),
    'checks', jsonb_build_object(
      'has_avatar', profile_record.avatar_url IS NOT NULL,
      'has_bio', profile_record.bio IS NOT NULL AND LENGTH(profile_record.bio) >= 10,
      'has_social', has_social
    )
  );

  RETURN eligibility;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply for creator function
CREATE OR REPLACE FUNCTION apply_for_creator(
  user_uuid UUID,
  p_creator_type creator_type,
  p_motivation TEXT,
  p_portfolio_links TEXT[] DEFAULT NULL,
  p_social_links JSONB DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  eligibility JSONB;
  application_id UUID;
BEGIN
  eligibility := check_creator_eligibility(user_uuid);

  IF NOT (eligibility->>'eligible')::boolean THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not eligible', 'eligibility', eligibility);
  END IF;

  IF EXISTS (SELECT 1 FROM creator_applications WHERE user_id = user_uuid AND status = 'pending') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Already has pending application');
  END IF;

  IF EXISTS (SELECT 1 FROM profiles WHERE id = user_uuid AND creator_status = 'approved') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Already a creator');
  END IF;

  INSERT INTO creator_applications (user_id, creator_type, motivation, portfolio_links, social_links)
  VALUES (user_uuid, p_creator_type, p_motivation, p_portfolio_links, p_social_links)
  RETURNING id INTO application_id;

  UPDATE profiles
  SET creator_status = 'pending',
      creator_application_date = NOW()
  WHERE id = user_uuid;

  RETURN jsonb_build_object('success', true, 'application_id', application_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Review creator application function
CREATE OR REPLACE FUNCTION review_creator_application(
  application_uuid UUID,
  reviewer_uuid UUID,
  p_approved BOOLEAN,
  p_rejection_reason TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  app_record RECORD;
BEGIN
  SELECT * INTO app_record FROM creator_applications WHERE id = application_uuid;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Application not found');
  END IF;

  IF app_record.status != 'pending' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Application already reviewed');
  END IF;

  UPDATE creator_applications
  SET status = CASE WHEN p_approved THEN 'approved'::creator_status ELSE 'rejected'::creator_status END,
      reviewed_by = reviewer_uuid,
      reviewed_at = NOW(),
      rejection_reason = p_rejection_reason,
      updated_at = NOW()
  WHERE id = application_uuid;

  IF p_approved THEN
    UPDATE profiles
    SET creator_status = 'approved',
        creator_type = app_record.creator_type,
        creator_verified_at = NOW()
    WHERE id = app_record.user_id;
  ELSE
    UPDATE profiles
    SET creator_status = 'rejected',
        creator_rejection_reason = p_rejection_reason
    WHERE id = app_record.user_id;
  END IF;

  RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- PART 3: USER ROLES
-- =====================================================

-- Create role enum
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('user', 'moderator', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Add role column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role user_role NOT NULL DEFAULT 'user';

-- Add is_store_owner flag
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_store_owner boolean NOT NULL DEFAULT false;

-- Index for role lookups
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Function to check if a user is admin
CREATE OR REPLACE FUNCTION is_admin(user_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = user_uuid AND role = 'admin'
  );
END;
$$;

-- Function to check if a user is moderator or higher
CREATE OR REPLACE FUNCTION is_moderator_or_above(user_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = user_uuid AND role IN ('moderator', 'admin')
  );
END;
$$;

-- Function to check if user has dashboard access
CREATE OR REPLACE FUNCTION has_dashboard_access(user_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = user_uuid
    AND (role IN ('moderator', 'admin') OR creator_status = 'approved' OR is_store_owner = true)
  );
END;
$$;

-- Function to get user's full permission set
CREATE OR REPLACE FUNCTION get_user_permissions(user_uuid uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_profile profiles%ROWTYPE;
  permissions jsonb;
BEGIN
  SELECT * INTO user_profile FROM profiles WHERE id = user_uuid;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  permissions := jsonb_build_object(
    'role', user_profile.role::text,
    'is_admin', user_profile.role = 'admin',
    'is_moderator', user_profile.role IN ('moderator', 'admin'),
    'is_creator', user_profile.creator_status = 'approved',
    'is_store_owner', user_profile.is_store_owner,
    'has_dashboard_access', user_profile.role IN ('moderator', 'admin')
                           OR user_profile.creator_status = 'approved'
                           OR user_profile.is_store_owner,
    'creator_type', user_profile.creator_type,
    'permissions', CASE
      WHEN user_profile.role = 'admin' THEN jsonb_build_array(
        'manage_users',
        'manage_stores',
        'manage_creators',
        'manage_events',
        'manage_listings',
        'manage_reports',
        'manage_content',
        'view_analytics',
        'system_settings'
      )
      WHEN user_profile.role = 'moderator' THEN jsonb_build_array(
        'manage_stores',
        'manage_creators',
        'manage_events',
        'manage_listings',
        'manage_reports',
        'manage_content'
      )
      ELSE jsonb_build_array()
    END
  );

  RETURN permissions;
END;
$$;

-- Trigger to auto-set is_store_owner when store is approved
CREATE OR REPLACE FUNCTION update_store_owner_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status <> 'approved') THEN
    UPDATE profiles
    SET is_store_owner = true
    WHERE id = NEW.submitted_by;
  END IF;

  IF NEW.status <> 'approved' AND OLD.status = 'approved' THEN
    UPDATE profiles
    SET is_store_owner = EXISTS (
      SELECT 1 FROM stores
      WHERE submitted_by = NEW.submitted_by
      AND status = 'approved'
      AND id <> NEW.id
    )
    WHERE id = NEW.submitted_by;
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger on stores table
DROP TRIGGER IF EXISTS trigger_update_store_owner_status ON stores;
CREATE TRIGGER trigger_update_store_owner_status
  AFTER INSERT OR UPDATE OF status ON stores
  FOR EACH ROW
  EXECUTE FUNCTION update_store_owner_status();

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION is_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION is_moderator_or_above(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION has_dashboard_access(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_permissions(uuid) TO authenticated;

-- RLS policies for role-based access (drop first to avoid conflicts)
DROP POLICY IF EXISTS "Admins can update user roles" ON profiles;
DROP POLICY IF EXISTS "Moderators can view all profiles" ON profiles;

CREATE POLICY "Admins can update user roles"
  ON profiles
  FOR UPDATE
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Moderators can view all profiles"
  ON profiles
  FOR SELECT
  USING (is_moderator_or_above(auth.uid()));

-- Policies for stores (moderator access)
DROP POLICY IF EXISTS "Moderators can update store status" ON stores;
CREATE POLICY "Moderators can update store status"
  ON stores
  FOR UPDATE
  USING (is_moderator_or_above(auth.uid()));

-- Policies for creator_applications (moderator access)
DROP POLICY IF EXISTS "Moderators can view all creator applications" ON creator_applications;
DROP POLICY IF EXISTS "Moderators can update creator applications" ON creator_applications;

CREATE POLICY "Moderators can view all creator applications"
  ON creator_applications
  FOR SELECT
  USING (is_moderator_or_above(auth.uid()));

CREATE POLICY "Moderators can update creator applications"
  ON creator_applications
  FOR UPDATE
  USING (is_moderator_or_above(auth.uid()));

-- =====================================================
-- PART 4: EVENTS
-- =====================================================

-- Event enums
DO $$ BEGIN
  CREATE TYPE event_type AS ENUM (
    'tournament',
    'painting_workshop',
    'casual_play',
    'campaign',
    'release_event',
    'meetup',
    'other'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE event_status AS ENUM (
    'draft',
    'upcoming',
    'ongoing',
    'completed',
    'cancelled'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Events table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  store_id UUID REFERENCES stores(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  event_type event_type NOT NULL DEFAULT 'casual_play',
  status event_status NOT NULL DEFAULT 'draft',
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  registration_deadline TIMESTAMPTZ,
  venue_name TEXT,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  province TEXT,
  postal_code TEXT,
  country TEXT NOT NULL DEFAULT 'ES',
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  game_system TEXT,
  format TEXT,
  max_participants INTEGER,
  current_participants INTEGER DEFAULT 0,
  entry_fee NUMERIC(8,2),
  prizes TEXT,
  cover_image TEXT,
  images TEXT[] DEFAULT '{}',
  contact_email TEXT,
  contact_phone TEXT,
  external_url TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  is_official BOOLEAN DEFAULT FALSE,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Event indexes
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_event_type ON events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_city ON events(city);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date);
CREATE INDEX IF NOT EXISTS idx_events_organizer_id ON events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_events_store_id ON events(store_id);
CREATE INDEX IF NOT EXISTS idx_events_slug ON events(slug);
CREATE INDEX IF NOT EXISTS idx_events_coords ON events(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_events_featured ON events(is_featured) WHERE is_featured = TRUE;

-- Event registrations table
CREATE TABLE IF NOT EXISTS event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'registered' CHECK (status IN ('registered', 'waitlist', 'cancelled', 'attended')),
  notes TEXT,
  registered_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(event_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_event_registrations_event_id ON event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_user_id ON event_registrations(user_id);

-- Event participant count trigger
CREATE OR REPLACE FUNCTION update_event_participants()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    UPDATE events SET
      current_participants = (
        SELECT COUNT(*) FROM event_registrations
        WHERE event_id = OLD.event_id AND status IN ('registered', 'attended')
      ),
      updated_at = now()
    WHERE id = OLD.event_id;
    RETURN OLD;
  ELSE
    UPDATE events SET
      current_participants = (
        SELECT COUNT(*) FROM event_registrations
        WHERE event_id = NEW.event_id AND status IN ('registered', 'attended')
      ),
      updated_at = now()
    WHERE id = NEW.event_id;
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_event_participants ON event_registrations;
CREATE TRIGGER trg_update_event_participants
  AFTER INSERT OR UPDATE OR DELETE ON event_registrations
  FOR EACH ROW EXECUTE FUNCTION update_event_participants();

-- Events updated_at trigger
CREATE OR REPLACE FUNCTION update_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_events_updated_at ON events;
CREATE TRIGGER trg_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_events_updated_at();

-- RLS for events
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;

-- Events policies
DROP POLICY IF EXISTS "events_select_public" ON events;
DROP POLICY IF EXISTS "events_select_own" ON events;
DROP POLICY IF EXISTS "events_insert_own" ON events;
DROP POLICY IF EXISTS "events_update_own" ON events;
DROP POLICY IF EXISTS "events_delete_own" ON events;
DROP POLICY IF EXISTS "events_admin_update" ON events;
DROP POLICY IF EXISTS "events_admin_delete" ON events;

CREATE POLICY "events_select_public" ON events
  FOR SELECT USING (status IN ('upcoming', 'ongoing', 'completed'));

CREATE POLICY "events_select_own" ON events
  FOR SELECT USING (auth.uid() = organizer_id);

CREATE POLICY "events_insert_own" ON events
  FOR INSERT WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "events_update_own" ON events
  FOR UPDATE USING (auth.uid() = organizer_id)
  WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "events_delete_own" ON events
  FOR DELETE USING (auth.uid() = organizer_id AND status IN ('draft', 'cancelled'));

CREATE POLICY "events_admin_update" ON events
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

CREATE POLICY "events_admin_delete" ON events
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

-- Event registrations policies
DROP POLICY IF EXISTS "event_registrations_select" ON event_registrations;
DROP POLICY IF EXISTS "event_registrations_insert_own" ON event_registrations;
DROP POLICY IF EXISTS "event_registrations_update_own" ON event_registrations;
DROP POLICY IF EXISTS "event_registrations_update_organizer" ON event_registrations;

CREATE POLICY "event_registrations_select" ON event_registrations
  FOR SELECT USING (true);

CREATE POLICY "event_registrations_insert_own" ON event_registrations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "event_registrations_update_own" ON event_registrations
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "event_registrations_update_organizer" ON event_registrations
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM events WHERE id = event_id AND organizer_id = auth.uid())
  );

-- Events storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('events', 'events', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "events_bucket_select" ON storage.objects;
DROP POLICY IF EXISTS "events_bucket_insert" ON storage.objects;
DROP POLICY IF EXISTS "events_bucket_update" ON storage.objects;
DROP POLICY IF EXISTS "events_bucket_delete" ON storage.objects;

CREATE POLICY "events_bucket_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'events');

CREATE POLICY "events_bucket_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'events'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "events_bucket_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'events'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "events_bucket_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'events'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- =====================================================
-- DONE! All tables, functions, and policies created.
-- =====================================================
