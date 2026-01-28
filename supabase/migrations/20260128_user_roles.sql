-- =====================================================
-- Migration: User Roles & Permissions System
-- Description: Adds hierarchical role system for users
-- Roles: admin (Lord Inquisidor), moderator (Comisario), user (default)
-- Special attributes: creator (Rememorizador), store_owner (Rogue Trader)
-- =====================================================

-- Create role enum
CREATE TYPE user_role AS ENUM ('user', 'moderator', 'admin');

-- Add role column to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS role user_role NOT NULL DEFAULT 'user';

-- Add is_store_owner flag (separate from role hierarchy)
-- This is TRUE if user has submitted an approved store
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS is_store_owner boolean NOT NULL DEFAULT false;

-- Create index for quick role lookups
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
  -- When a store is approved, set is_store_owner = true for the submitter
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status <> 'approved') THEN
    UPDATE profiles
    SET is_store_owner = true
    WHERE id = NEW.submitted_by;
  END IF;

  -- When a store is unapproved/closed, check if user has other approved stores
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

-- RLS Policy updates for role-based access
-- Note: These policies supplement existing ones

-- Allow admins to update any profile's role
CREATE POLICY "Admins can update user roles"
  ON profiles
  FOR UPDATE
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- Allow moderators to view all profiles for moderation
CREATE POLICY "Moderators can view all profiles"
  ON profiles
  FOR SELECT
  USING (is_moderator_or_above(auth.uid()));

-- Reports: Only mods/admins can manage
DROP POLICY IF EXISTS "Moderators can view all reports" ON reports;
CREATE POLICY "Moderators can view all reports"
  ON reports
  FOR SELECT
  USING (is_moderator_or_above(auth.uid()));

DROP POLICY IF EXISTS "Moderators can update reports" ON reports;
CREATE POLICY "Moderators can update reports"
  ON reports
  FOR UPDATE
  USING (is_moderator_or_above(auth.uid()));

-- Creator applications: Mods/admins can manage
DROP POLICY IF EXISTS "Moderators can view all creator applications" ON creator_applications;
CREATE POLICY "Moderators can view all creator applications"
  ON creator_applications
  FOR SELECT
  USING (is_moderator_or_above(auth.uid()));

DROP POLICY IF EXISTS "Moderators can update creator applications" ON creator_applications;
CREATE POLICY "Moderators can update creator applications"
  ON creator_applications
  FOR UPDATE
  USING (is_moderator_or_above(auth.uid()));

-- Stores: Mods/admins can manage pending stores
DROP POLICY IF EXISTS "Moderators can update store status" ON stores;
CREATE POLICY "Moderators can update store status"
  ON stores
  FOR UPDATE
  USING (is_moderator_or_above(auth.uid()));

-- Comment: Set initial admin user (replace with actual admin user ID)
-- UPDATE profiles SET role = 'admin' WHERE id = 'YOUR_ADMIN_USER_UUID';
