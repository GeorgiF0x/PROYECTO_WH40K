-- ============================================================================
-- Dashboard stats RPC
-- ----------------------------------------------------------------------------
-- Consolidates ~17 separate count/aggregate queries from the admin dashboard
-- into a single round-trip. Returns all KPI counts plus 6-month growth series
-- and recent activity in one JSON payload.
--
-- Security: SECURITY DEFINER + admin role check inside the function.
-- Only callable by users with profiles.is_admin = true OR role = 'admin'.
-- ============================================================================

CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_id uuid;
  is_admin_caller boolean;
  six_months_ago timestamptz;
  result jsonb;
BEGIN
  -- ── Auth gate ────────────────────────────────────────────
  caller_id := auth.uid();
  IF caller_id IS NULL THEN
    RAISE EXCEPTION 'unauthorized' USING ERRCODE = '42501';
  END IF;

  SELECT (p.is_admin OR p.role = 'admin')
    INTO is_admin_caller
    FROM profiles p
   WHERE p.id = caller_id;

  IF NOT COALESCE(is_admin_caller, false) THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
  END IF;

  six_months_ago := date_trunc('month', now()) - interval '5 months';

  -- ── Build the payload in one shot ────────────────────────
  WITH counts AS (
    SELECT
      (SELECT count(*) FROM profiles)                                                AS total_users,
      (SELECT count(*) FROM miniatures)                                              AS total_miniatures,
      (SELECT count(*) FROM listings WHERE status = 'active')                        AS active_listings,
      (SELECT count(*) FROM stores   WHERE status = 'approved')                      AS total_stores,
      (SELECT count(*) FROM stores   WHERE status = 'pending')                       AS pending_stores,
      (SELECT count(*) FROM stores   WHERE status = 'rejected')                      AS rejected_stores,
      (SELECT count(*) FROM profiles WHERE creator_status = 'pending')               AS pending_creators,
      (SELECT count(*) FROM profiles WHERE creator_status = 'approved')              AS approved_creators,
      (SELECT count(*) FROM reports  WHERE status = 'pending')                       AS pending_reports
  ),
  growth AS (
    SELECT
      to_char(month, 'YYYY-MM') AS bucket,
      coalesce((SELECT count(*) FROM profiles   p WHERE date_trunc('month', p.created_at) = month), 0) AS usuarios,
      coalesce((SELECT count(*) FROM miniatures m WHERE date_trunc('month', m.created_at) = month), 0) AS miniaturas,
      coalesce((SELECT count(*) FROM listings   l WHERE date_trunc('month', l.created_at) = month), 0) AS anuncios
    FROM generate_series(six_months_ago, date_trunc('month', now()), interval '1 month') AS month
  ),
  factions AS (
    SELECT t.name, count(*)::int AS value
      FROM miniatures m
      JOIN tags t ON t.id = m.faction_id
     WHERE m.faction_id IS NOT NULL
     GROUP BY t.name
     ORDER BY count(*) DESC
     LIMIT 5
  ),
  recent_users AS (
    SELECT id, username, display_name, created_at
      FROM profiles
     ORDER BY created_at DESC
     LIMIT 3
  ),
  recent_stores AS (
    SELECT id, name, status::text AS status, created_at
      FROM stores
     WHERE created_at IS NOT NULL
     ORDER BY created_at DESC
     LIMIT 3
  )
  SELECT jsonb_build_object(
    'counts', (SELECT to_jsonb(counts) FROM counts),
    'growth', (SELECT coalesce(jsonb_agg(to_jsonb(growth) ORDER BY bucket), '[]'::jsonb) FROM growth),
    'factions', (SELECT coalesce(jsonb_agg(to_jsonb(factions)), '[]'::jsonb) FROM factions),
    'recent_users', (SELECT coalesce(jsonb_agg(to_jsonb(recent_users)), '[]'::jsonb) FROM recent_users),
    'recent_stores', (SELECT coalesce(jsonb_agg(to_jsonb(recent_stores)), '[]'::jsonb) FROM recent_stores)
  ) INTO result;

  RETURN result;
END;
$$;

-- Grant execute to authenticated users (admin gate is inside the function)
GRANT EXECUTE ON FUNCTION get_dashboard_stats() TO authenticated;

-- Revoke from anon for safety
REVOKE EXECUTE ON FUNCTION get_dashboard_stats() FROM anon;
