-- ============================================================
-- Migration: Fix Supabase Database Linter Issues
-- Date: 2026-02-07
-- Fixes:
--   1 ERROR  - security_definer_view (public_creators)
--   29 WARN  - function_search_path_mutable
--   2 WARN   - extension_in_public (pg_trgm, vector)
--   1 WARN   - rls_policy_always_true (conversations INSERT)
-- ============================================================

BEGIN;

-- ============================================================
-- 1. FIX ERROR: public_creators view uses SECURITY DEFINER
--    This causes the view to run with the view creator's
--    permissions, bypassing RLS for the querying user.
--    Fix: Recreate with security_invoker = true
-- ============================================================

DROP VIEW IF EXISTS public_creators;

CREATE VIEW public_creators
WITH (security_invoker = true)
AS
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
  (SELECT COUNT(*) FROM public.miniatures m WHERE m.user_id = p.id) AS miniatures_count,
  (SELECT COUNT(*) FROM public.follows f WHERE f.following_id = p.id) AS followers_count,
  p.instagram,
  p.twitter,
  p.youtube,
  p.website
FROM public.profiles p
WHERE p.creator_status = 'approved'
ORDER BY p.creator_verified_at DESC;

GRANT SELECT ON public_creators TO authenticated, anon;

-- ============================================================
-- 2. FIX WARNINGS: Set search_path on all functions
--    Without an explicit search_path, a caller could set their
--    own search_path to a schema containing malicious objects.
--    Fix: SET search_path = 'public' on every function.
--    (Using 'public' instead of '' to avoid rewriting every
--     function body with schema-qualified names.)
-- ============================================================

-- === Trigger functions (no parameters) ===
ALTER FUNCTION public.update_updated_at_column() SET search_path = 'public';
ALTER FUNCTION public.handle_new_user() SET search_path = 'public';
ALTER FUNCTION public.update_miniature_likes_count() SET search_path = 'public';
ALTER FUNCTION public.update_miniature_comments_count() SET search_path = 'public';
ALTER FUNCTION public.update_listing_favorites_count() SET search_path = 'public';
ALTER FUNCTION public.update_conversation_on_message() SET search_path = 'public';
ALTER FUNCTION public.update_store_rating() SET search_path = 'public';
ALTER FUNCTION public.update_stores_updated_at() SET search_path = 'public';
ALTER FUNCTION public.update_event_participants() SET search_path = 'public';
ALTER FUNCTION public.update_events_updated_at() SET search_path = 'public';
ALTER FUNCTION public.update_store_owner_status() SET search_path = 'public';
ALTER FUNCTION public.notify_on_like() SET search_path = 'public';
ALTER FUNCTION public.notify_on_comment() SET search_path = 'public';
ALTER FUNCTION public.notify_on_follow() SET search_path = 'public';
ALTER FUNCTION public.notify_on_message() SET search_path = 'public';

-- === Functions with parameters ===
ALTER FUNCTION public.generate_username_from_email(text) SET search_path = 'public';
ALTER FUNCTION public.increment_listing_views(uuid) SET search_path = 'public';
ALTER FUNCTION public.increment_view_count(uuid) SET search_path = 'public';
ALTER FUNCTION public.increment_wiki_page_views(uuid) SET search_path = 'public';
ALTER FUNCTION public.is_conversation_participant(uuid) SET search_path = 'public';
ALTER FUNCTION public.create_conversation_with_participants(uuid, uuid, uuid) SET search_path = 'public';
ALTER FUNCTION public.check_creator_eligibility(uuid) SET search_path = 'public';
ALTER FUNCTION public.apply_for_creator(uuid, creator_type, text, text[], jsonb) SET search_path = 'public';
ALTER FUNCTION public.review_creator_application(uuid, uuid, boolean, text) SET search_path = 'public';
ALTER FUNCTION public.is_admin(uuid) SET search_path = 'public';
ALTER FUNCTION public.is_moderator_or_above(uuid) SET search_path = 'public';
ALTER FUNCTION public.has_dashboard_access(uuid) SET search_path = 'public';
ALTER FUNCTION public.get_user_permissions(uuid) SET search_path = 'public';
ALTER FUNCTION public.approve_scribe_application(uuid, text) SET search_path = 'public';
ALTER FUNCTION public.reject_scribe_application(uuid, text) SET search_path = 'public';
ALTER FUNCTION public.is_wiki_scribe(uuid) SET search_path = 'public';

-- Embedding functions use vector type — need to include both public and extensions
ALTER FUNCTION public.search_miniatures_by_embedding(vector, float, int) SET search_path = 'public, extensions';
ALTER FUNCTION public.find_similar_miniatures(uuid, int) SET search_path = 'public, extensions';

-- ============================================================
-- 3. FIX WARNINGS: Move extensions out of public schema
--    Extensions in public are accessible to application users.
--    Move to a dedicated 'extensions' schema.
-- ============================================================

CREATE SCHEMA IF NOT EXISTS extensions;

-- Grant usage so existing references keep working
GRANT USAGE ON SCHEMA extensions TO postgres, anon, authenticated, service_role;

ALTER EXTENSION pg_trgm SET SCHEMA extensions;
ALTER EXTENSION vector SET SCHEMA extensions;

-- ============================================================
-- 4. FIX WARNING: RLS policy always true on conversations
--    INSERT policy uses WITH CHECK (true), bypassing security.
--    Fix: Require authenticated user.
-- ============================================================

DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;

CREATE POLICY "Users can create conversations"
ON public.conversations
FOR INSERT
TO authenticated
WITH CHECK ((select auth.uid()) IS NOT NULL);

COMMIT;
