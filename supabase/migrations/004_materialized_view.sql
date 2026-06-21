-- ============================================================
-- 004_materialized_view.sql
-- friend_leaderboard_mv: precomputed % improvement per user
-- Refreshed every 4 hours by the refresh-leaderboard Edge Function.
-- ============================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS public.friend_leaderboard_mv AS
WITH current_month AS (
  SELECT user_id, SUM(co2_kg) AS total
  FROM public.activities
  WHERE date_trunc('month', created_at) = date_trunc('month', now())
  GROUP BY user_id
),
prev_month AS (
  SELECT user_id, SUM(co2_kg) AS total
  FROM public.activities
  WHERE date_trunc('month', created_at) = date_trunc('month', now() - INTERVAL '1 month')
  GROUP BY user_id
)
SELECT
  u.id                                              AS user_id,
  u.name,
  u.avatar_url,
  COALESCE(c.total, 0)                              AS current_co2_kg,
  COALESCE(p.total, 0)                              AS prev_co2_kg,
  CASE
    WHEN COALESCE(p.total, 0) > 0
      THEN ROUND(((COALESCE(p.total,0) - COALESCE(c.total,0)) / p.total) * 100, 1)
    ELSE 0
  END                                               AS improvement_pct,
  now()                                             AS computed_at
FROM public.users u
LEFT JOIN current_month c ON c.user_id = u.id
LEFT JOIN prev_month p    ON p.user_id = u.id
WITH NO DATA;

-- Index for fast per-user friendship lookups
CREATE UNIQUE INDEX IF NOT EXISTS idx_leaderboard_mv_user
  ON public.friend_leaderboard_mv (user_id);

-- Initial populate (empty until refresh-leaderboard runs)
REFRESH MATERIALIZED VIEW public.friend_leaderboard_mv;
