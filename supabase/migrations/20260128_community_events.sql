-- ============================================================
-- Comunidad: Events
-- Phase 2 migration for the Community section
-- ============================================================

-- Enums (only create if they don't exist)
DO $$ BEGIN
  CREATE TYPE event_type AS ENUM (
    'tournament',        -- Torneos competitivos
    'painting_workshop', -- Talleres de pintura
    'casual_play',       -- Partidas casuales
    'campaign',          -- Campañas narrativas
    'release_event',     -- Lanzamientos/Previas
    'meetup',            -- Quedadas de la comunidad
    'other'              -- Otros eventos
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE event_status AS ENUM (
    'draft',       -- Borrador (no visible)
    'upcoming',    -- Próximamente
    'ongoing',     -- En curso
    'completed',   -- Finalizado
    'cancelled'    -- Cancelado
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- Table: events
-- ============================================================
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Organizer info
  organizer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  store_id UUID REFERENCES stores(id) ON DELETE SET NULL, -- Optional: hosted by a store

  -- Basic info
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  event_type event_type NOT NULL DEFAULT 'casual_play',
  status event_status NOT NULL DEFAULT 'draft',

  -- Dates
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  registration_deadline TIMESTAMPTZ,

  -- Location (can be different from store if store_id is set)
  venue_name TEXT,           -- e.g., "Sala principal" or custom venue
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  province TEXT,
  postal_code TEXT,
  country TEXT NOT NULL DEFAULT 'ES',
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,

  -- Event details
  game_system TEXT,          -- e.g., "Warhammer 40K", "Age of Sigmar", "Kill Team"
  format TEXT,               -- e.g., "2000pts", "Incursion", "Combat Patrol"
  max_participants INTEGER,
  current_participants INTEGER DEFAULT 0,
  entry_fee NUMERIC(8,2),    -- NULL = free
  prizes TEXT,

  -- Media
  cover_image TEXT,
  images TEXT[] DEFAULT '{}',

  -- Contact
  contact_email TEXT,
  contact_phone TEXT,
  external_url TEXT,         -- Link to external registration/info

  -- Metadata
  is_featured BOOLEAN DEFAULT FALSE,
  is_official BOOLEAN DEFAULT FALSE,  -- Official = organized by store or verified creator
  tags TEXT[] DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_event_type ON events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_city ON events(city);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date);
CREATE INDEX IF NOT EXISTS idx_events_organizer_id ON events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_events_store_id ON events(store_id);
CREATE INDEX IF NOT EXISTS idx_events_slug ON events(slug);
CREATE INDEX IF NOT EXISTS idx_events_coords ON events(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_events_featured ON events(is_featured) WHERE is_featured = TRUE;

-- ============================================================
-- Table: event_registrations (optional participant tracking)
-- ============================================================
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

-- ============================================================
-- Trigger: update event participant count
-- ============================================================
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

-- ============================================================
-- Updated_at trigger for events
-- ============================================================
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

-- ============================================================
-- RLS Policies
-- ============================================================
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "events_select_public" ON events;
DROP POLICY IF EXISTS "events_select_own" ON events;
DROP POLICY IF EXISTS "events_insert_own" ON events;
DROP POLICY IF EXISTS "events_update_own" ON events;
DROP POLICY IF EXISTS "events_delete_own" ON events;
DROP POLICY IF EXISTS "events_admin_update" ON events;
DROP POLICY IF EXISTS "events_admin_delete" ON events;
DROP POLICY IF EXISTS "event_registrations_select" ON event_registrations;
DROP POLICY IF EXISTS "event_registrations_insert_own" ON event_registrations;
DROP POLICY IF EXISTS "event_registrations_update_own" ON event_registrations;
DROP POLICY IF EXISTS "event_registrations_update_organizer" ON event_registrations;

-- Events: upcoming/ongoing/completed visible to all
CREATE POLICY "events_select_public" ON events
  FOR SELECT USING (status IN ('upcoming', 'ongoing', 'completed'));

-- Events: organizer sees own events (any status)
CREATE POLICY "events_select_own" ON events
  FOR SELECT USING (auth.uid() = organizer_id);

-- Events: authenticated users can create
CREATE POLICY "events_insert_own" ON events
  FOR INSERT WITH CHECK (auth.uid() = organizer_id);

-- Events: organizer can update own events
CREATE POLICY "events_update_own" ON events
  FOR UPDATE USING (auth.uid() = organizer_id)
  WITH CHECK (auth.uid() = organizer_id);

-- Events: organizer can delete own draft/cancelled events
CREATE POLICY "events_delete_own" ON events
  FOR DELETE USING (auth.uid() = organizer_id AND status IN ('draft', 'cancelled'));

-- Events: admins can update/delete any event
CREATE POLICY "events_admin_update" ON events
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

CREATE POLICY "events_admin_delete" ON events
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

-- Event registrations: public read
CREATE POLICY "event_registrations_select" ON event_registrations
  FOR SELECT USING (true);

-- Event registrations: authenticated users can register
CREATE POLICY "event_registrations_insert_own" ON event_registrations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Event registrations: own update (for cancellation)
CREATE POLICY "event_registrations_update_own" ON event_registrations
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Event registrations: organizer can update registrations for their events
CREATE POLICY "event_registrations_update_organizer" ON event_registrations
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM events WHERE id = event_id AND organizer_id = auth.uid())
  );

-- ============================================================
-- Storage bucket: events (public)
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('events', 'events', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing storage policies if they exist
DROP POLICY IF EXISTS "events_bucket_select" ON storage.objects;
DROP POLICY IF EXISTS "events_bucket_insert" ON storage.objects;
DROP POLICY IF EXISTS "events_bucket_update" ON storage.objects;
DROP POLICY IF EXISTS "events_bucket_delete" ON storage.objects;

-- Storage policies for events bucket
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
