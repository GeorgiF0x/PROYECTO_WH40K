-- ============================================================================
-- Notifications cleanup
-- ----------------------------------------------------------------------------
-- The notifications table grows unbounded — there is no TTL or retention.
-- This migration adds:
--   1. cleanup_old_notifications(retention_days)  -> deletes old READ
--      notifications older than the cutoff. Unread notifications are kept
--      regardless of age (user has not seen them yet).
--   2. notifications_retention_stats(retention_days) -> dry-run helper that
--      reports how many rows WOULD be deleted, so you can sanity-check
--      before running a destructive cleanup.
--
-- Scheduling:
--   If pg_cron is available, you can schedule a daily run with:
--     SELECT cron.schedule(
--       'notifications-cleanup',
--       '0 3 * * *',
--       $$ SELECT public.cleanup_old_notifications(30) $$
--     );
--   If pg_cron is NOT available, run it manually from the SQL editor or
--   from a scheduled GitHub Action / Vercel cron job.
-- ============================================================================

-- Returns rows deleted.
CREATE OR REPLACE FUNCTION public.cleanup_old_notifications(retention_days int DEFAULT 30)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count bigint;
BEGIN
  IF retention_days < 1 THEN
    RAISE EXCEPTION 'retention_days must be >= 1';
  END IF;

  WITH deleted AS (
    DELETE FROM notifications
     WHERE read = true
       AND created_at < now() - (retention_days || ' days')::interval
    RETURNING 1
  )
  SELECT count(*) INTO deleted_count FROM deleted;

  RETURN deleted_count;
END;
$$;

-- Dry-run: how many rows WOULD be deleted without touching data.
CREATE OR REPLACE FUNCTION public.notifications_retention_stats(retention_days int DEFAULT 30)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'retention_days', retention_days,
    'cutoff', now() - (retention_days || ' days')::interval,
    'total_rows', (SELECT count(*) FROM notifications),
    'unread_rows', (SELECT count(*) FROM notifications WHERE read = false),
    'read_rows', (SELECT count(*) FROM notifications WHERE read = true),
    'would_delete', (
      SELECT count(*) FROM notifications
       WHERE read = true
         AND created_at < now() - (retention_days || ' days')::interval
    )
  );
$$;

-- Restrict to admin callers only (these are not user-facing).
REVOKE ALL ON FUNCTION public.cleanup_old_notifications(int) FROM public, anon, authenticated;
REVOKE ALL ON FUNCTION public.notifications_retention_stats(int) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.cleanup_old_notifications(int) TO service_role;
GRANT EXECUTE ON FUNCTION public.notifications_retention_stats(int) TO service_role;
