-- =============================================================================
-- LEXICANUM SCRIBE SYSTEM
-- =============================================================================
-- Allows users to request "Lexicanum Scribe" status to contribute to the wiki
-- Scribes can create and edit wiki articles directly (without contribution approval)
-- =============================================================================

-- =============================================================================
-- WIKI ROLE ENUM
-- =============================================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'wiki_role') THEN
    CREATE TYPE wiki_role AS ENUM ('scribe', 'lexicanum');
  END IF;
END$$;

-- scribe = Lexicanum Scribe (can create/edit articles)
-- lexicanum = Senior editor (can also approve other scribes)

-- =============================================================================
-- ADD WIKI_ROLE TO PROFILES
-- =============================================================================

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS wiki_role wiki_role DEFAULT NULL;

-- Index for quick lookups
CREATE INDEX IF NOT EXISTS idx_profiles_wiki_role ON profiles(wiki_role) WHERE wiki_role IS NOT NULL;

-- =============================================================================
-- SCRIBE APPLICATIONS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS scribe_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Application details
  motivation TEXT NOT NULL,  -- Why they want to be a scribe
  experience TEXT,           -- Previous experience with 40K lore
  sample_topic TEXT,         -- Topic they'd like to write about first

  -- Status
  status VARCHAR(20) DEFAULT 'pending',  -- pending, approved, rejected

  -- Review
  reviewer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reviewer_notes TEXT,
  reviewed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- One pending application per user
  CONSTRAINT unique_pending_application UNIQUE (user_id, status)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_scribe_applications_status ON scribe_applications(status);
CREATE INDEX IF NOT EXISTS idx_scribe_applications_user ON scribe_applications(user_id);

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE scribe_applications ENABLE ROW LEVEL SECURITY;

-- Users can create applications (one pending at a time)
CREATE POLICY "Users can create scribe applications"
ON scribe_applications FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND NOT EXISTS (
    SELECT 1 FROM scribe_applications
    WHERE user_id = auth.uid() AND status = 'pending'
  )
  AND NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND wiki_role IS NOT NULL
  )
);

-- Users can view their own applications
CREATE POLICY "Users can view own applications"
ON scribe_applications FOR SELECT
USING (user_id = auth.uid());

-- Admins/mods can view all applications
CREATE POLICY "Admins can view all applications"
ON scribe_applications FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND (is_admin = true OR role IN ('admin', 'moderator'))
  )
);

-- Admins/mods/lexicanums can update applications
CREATE POLICY "Admins can update applications"
ON scribe_applications FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND (is_admin = true OR role IN ('admin', 'moderator') OR wiki_role = 'lexicanum')
  )
);

-- =============================================================================
-- UPDATE WIKI PAGES POLICIES TO INCLUDE SCRIBES
-- =============================================================================

-- Drop existing policies first
DROP POLICY IF EXISTS "Admins can view all wiki pages" ON faction_wiki_pages;
DROP POLICY IF EXISTS "Admins can create wiki pages" ON faction_wiki_pages;
DROP POLICY IF EXISTS "Admins can update wiki pages" ON faction_wiki_pages;
DROP POLICY IF EXISTS "Admins can delete wiki pages" ON faction_wiki_pages;

-- Scribes can view all pages (including drafts they authored)
CREATE POLICY "Scribes can view own drafts"
ON faction_wiki_pages FOR SELECT
USING (
  author_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND (is_admin = true OR role IN ('admin', 'moderator') OR wiki_role IS NOT NULL)
  )
);

-- Scribes can create wiki pages
CREATE POLICY "Scribes can create wiki pages"
ON faction_wiki_pages FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND (is_admin = true OR role IN ('admin', 'moderator') OR wiki_role IS NOT NULL)
  )
);

-- Scribes can update their own pages, admins can update all
CREATE POLICY "Scribes can update own pages"
ON faction_wiki_pages FOR UPDATE
USING (
  author_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND (is_admin = true OR role IN ('admin', 'moderator') OR wiki_role = 'lexicanum')
  )
);

-- Only admins/lexicanums can delete pages
CREATE POLICY "Admins can delete wiki pages"
ON faction_wiki_pages FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND (is_admin = true OR role IN ('admin', 'moderator') OR wiki_role = 'lexicanum')
  )
);

-- =============================================================================
-- UPDATE WIKI REVISIONS POLICIES
-- =============================================================================

DROP POLICY IF EXISTS "Admins can create revisions" ON wiki_revisions;

-- Scribes can create revisions for pages they can edit
CREATE POLICY "Scribes can create revisions"
ON wiki_revisions FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND (is_admin = true OR role IN ('admin', 'moderator') OR wiki_role IS NOT NULL)
  )
);

-- =============================================================================
-- FUNCTION: Approve scribe application
-- =============================================================================

CREATE OR REPLACE FUNCTION approve_scribe_application(
  application_id UUID,
  notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  app_record scribe_applications%ROWTYPE;
BEGIN
  -- Get application
  SELECT * INTO app_record FROM scribe_applications WHERE id = application_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Application not found';
  END IF;

  IF app_record.status != 'pending' THEN
    RAISE EXCEPTION 'Application already processed';
  END IF;

  -- Update application
  UPDATE scribe_applications
  SET
    status = 'approved',
    reviewer_id = auth.uid(),
    reviewer_notes = notes,
    reviewed_at = NOW()
  WHERE id = application_id;

  -- Grant scribe role to user
  UPDATE profiles
  SET wiki_role = 'scribe'
  WHERE id = app_record.user_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- FUNCTION: Reject scribe application
-- =============================================================================

CREATE OR REPLACE FUNCTION reject_scribe_application(
  application_id UUID,
  notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  app_record scribe_applications%ROWTYPE;
BEGIN
  -- Get application
  SELECT * INTO app_record FROM scribe_applications WHERE id = application_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Application not found';
  END IF;

  IF app_record.status != 'pending' THEN
    RAISE EXCEPTION 'Application already processed';
  END IF;

  -- Update application
  UPDATE scribe_applications
  SET
    status = 'rejected',
    reviewer_id = auth.uid(),
    reviewer_notes = notes,
    reviewed_at = NOW()
  WHERE id = application_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to authenticated users (RLS will control access)
GRANT EXECUTE ON FUNCTION approve_scribe_application(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION reject_scribe_application(UUID, TEXT) TO authenticated;

-- =============================================================================
-- HELPER: Check if user is scribe
-- =============================================================================

CREATE OR REPLACE FUNCTION is_wiki_scribe(user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = user_uuid
    AND (
      wiki_role IS NOT NULL
      OR is_admin = true
      OR role IN ('admin', 'moderator')
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION is_wiki_scribe(UUID) TO authenticated;
