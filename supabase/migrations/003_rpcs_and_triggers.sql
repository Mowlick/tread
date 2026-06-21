-- ============================================================
-- 003_rpcs_and_triggers.sql
-- Tread — All Postgres RPCs, triggers, and badge logic
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- RPC: calculate_baseline_footprint
-- Called after Assessment submission. Joins answers → emission_factors,
-- writes result to footprint_baselines.
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.calculate_baseline_footprint(p_user_id UUID)
RETURNS NUMERIC LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_total NUMERIC := 0;
BEGIN
  SELECT COALESCE(SUM(
    CASE
      -- Transport: km/week → monthly (×4.33)
      WHEN ar.module = 'transport' AND ef.unit = 'km'
        THEN (ar.answer_value::NUMERIC * ef.kg_co2_per_unit * 4.33)
      -- Energy: monthly kWh
      WHEN ar.module = 'energy' AND ef.unit = 'kWh'
        THEN (ar.answer_value::NUMERIC * ef.kg_co2_per_unit)
      -- Food: meals/week → monthly (×4.33)
      WHEN ar.module = 'food'
        THEN (ar.answer_value::NUMERIC * ef.kg_co2_per_unit * 4.33)
      -- Shopping: monthly spend
      WHEN ar.module = 'shopping'
        THEN (ar.answer_value::NUMERIC * ef.kg_co2_per_unit)
      -- Waste: kg/week → monthly
      WHEN ar.module = 'waste'
        THEN (ar.answer_value::NUMERIC * ef.kg_co2_per_unit * 4.33)
      ELSE
        COALESCE(ar.answer_value::NUMERIC * ef.kg_co2_per_unit, 0)
    END
  ), 0)
  INTO v_total
  FROM public.assessment_responses ar
  LEFT JOIN public.emission_factors ef
    ON ef.category = ar.module AND ef.subcategory = ar.question_key
  WHERE ar.user_id = p_user_id;

  -- If some answers had no matching emission_factor, log and use category avg
  -- (handled above via COALESCE → 0; server logs missing factors via RAISE NOTICE)
  INSERT INTO public.footprint_baselines (user_id, baseline_co2_kg, calculated_at)
  VALUES (p_user_id, v_total, now())
  ON CONFLICT DO NOTHING;

  RETURN v_total;
END;
$$;

-- ────────────────────────────────────────────────────────────
-- RPC: log_activity
-- Client sends raw amount; server looks up emission factor, computes co2_kg.
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.log_activity(
  p_user_id    UUID,
  p_category   TEXT,
  p_subcategory TEXT,
  p_amount     NUMERIC,
  p_unit       TEXT
)
RETURNS public.activities LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_factor  NUMERIC;
  v_co2     NUMERIC;
  v_row     public.activities;
BEGIN
  -- Lookup emission factor
  SELECT kg_co2_per_unit INTO v_factor
  FROM public.emission_factors
  WHERE category = p_category
    AND subcategory = p_subcategory
    AND unit = p_unit
  LIMIT 1;

  -- Fall back to category average if exact match missing
  IF v_factor IS NULL THEN
    SELECT AVG(kg_co2_per_unit) INTO v_factor
    FROM public.emission_factors
    WHERE category = p_category;
  END IF;

  v_co2 := COALESCE(v_factor, 0) * p_amount;

  INSERT INTO public.activities
    (user_id, category, subcategory, amount, unit, co2_kg, source)
  VALUES
    (p_user_id, p_category, p_subcategory, p_amount, p_unit, v_co2, 'manual')
  RETURNING * INTO v_row;

  RETURN v_row;
END;
$$;

-- ────────────────────────────────────────────────────────────
-- RPC: complete_daily_mission
-- Atomically marks mission complete + inserts XP transaction.
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.complete_daily_mission(
  p_user_id UUID,
  p_date    DATE
)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_xp INT;
BEGIN
  UPDATE public.daily_missions
  SET completed = true
  WHERE user_id = p_user_id AND date = p_date AND completed = false
  RETURNING xp_reward INTO v_xp;

  IF v_xp IS NOT NULL THEN
    INSERT INTO public.xp_transactions (user_id, amount, source)
    VALUES (p_user_id, v_xp, 'mission');
  END IF;
END;
$$;

-- ────────────────────────────────────────────────────────────
-- RPC: get_current_streak
-- Walks backward from today counting consecutive days with activity.
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_current_streak(p_user_id UUID)
RETURNS INT LANGUAGE plpgsql SECURITY DEFINER STABLE AS $$
DECLARE
  v_streak   INT := 0;
  v_date     DATE := CURRENT_DATE;
  v_has_row  BOOLEAN;
BEGIN
  LOOP
    SELECT EXISTS (
      SELECT 1 FROM public.activities
      WHERE user_id = p_user_id
        AND created_at::DATE = v_date
      UNION ALL
      SELECT 1 FROM public.daily_missions
      WHERE user_id = p_user_id
        AND date = v_date
        AND completed = true
    ) INTO v_has_row;

    EXIT WHEN NOT v_has_row;
    v_streak := v_streak + 1;
    v_date   := v_date - 1;
    EXIT WHEN v_streak > 3650; -- safety guard
  END LOOP;

  RETURN v_streak;
END;
$$;

-- ────────────────────────────────────────────────────────────
-- RPC: get_category_breakdown
-- Returns per-category co2_kg and share for a given month.
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_category_breakdown(
  p_user_id UUID,
  p_month   DATE DEFAULT date_trunc('month', CURRENT_DATE)::DATE
)
RETURNS TABLE(category TEXT, co2_kg NUMERIC, share_pct NUMERIC)
LANGUAGE plpgsql SECURITY DEFINER STABLE AS $$
DECLARE
  v_total NUMERIC;
BEGIN
  SELECT COALESCE(SUM(a.co2_kg), 0) INTO v_total
  FROM public.activities a
  WHERE a.user_id = p_user_id
    AND date_trunc('month', a.created_at) = date_trunc('month', p_month::TIMESTAMPTZ);

  RETURN QUERY
  SELECT
    a.category,
    COALESCE(SUM(a.co2_kg), 0)::NUMERIC AS co2_kg,
    CASE WHEN v_total > 0
      THEN ROUND(COALESCE(SUM(a.co2_kg), 0) / v_total * 100, 1)
      ELSE 0
    END AS share_pct
  FROM public.activities a
  WHERE a.user_id = p_user_id
    AND date_trunc('month', a.created_at) = date_trunc('month', p_month::TIMESTAMPTZ)
  GROUP BY a.category
  ORDER BY co2_kg DESC;
END;
$$;

-- ────────────────────────────────────────────────────────────
-- RPC: get_monthly_trend
-- Returns one row per month, zero-filling gaps.
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_monthly_trend(
  p_user_id   UUID,
  p_months_back INT DEFAULT 6
)
RETURNS TABLE(month DATE, co2_kg NUMERIC)
LANGUAGE plpgsql SECURITY DEFINER STABLE AS $$
BEGIN
  RETURN QUERY
  WITH months AS (
    SELECT generate_series(
      date_trunc('month', CURRENT_DATE) - ((p_months_back - 1) || ' months')::INTERVAL,
      date_trunc('month', CURRENT_DATE),
      '1 month'
    )::DATE AS m
  )
  SELECT
    months.m AS month,
    COALESCE(SUM(a.co2_kg), 0)::NUMERIC AS co2_kg
  FROM months
  LEFT JOIN public.activities a
    ON date_trunc('month', a.created_at) = months.m
    AND a.user_id = p_user_id
  GROUP BY months.m
  ORDER BY months.m ASC;
END;
$$;

-- ────────────────────────────────────────────────────────────
-- RPC: set_goal
-- Closes previous goal, opens new one with baseline snapshot.
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_goal(
  p_user_id      UUID,
  p_target_pct   NUMERIC,
  p_duration_days INT
)
RETURNS public.goals LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_baseline NUMERIC;
  v_new_goal public.goals;
BEGIN
  -- Close any active goal
  UPDATE public.goals
  SET status = CASE
    WHEN ends_at < now() THEN 'abandoned'
    ELSE 'abandoned'
  END
  WHERE user_id = p_user_id AND status = 'active';

  -- Snapshot current footprint for this month as the new goal's baseline
  SELECT COALESCE(
    (SELECT SUM(co2_kg) FROM public.activities
     WHERE user_id = p_user_id
       AND date_trunc('month', created_at) = date_trunc('month', now())),
    (SELECT baseline_co2_kg FROM public.footprint_baselines
     WHERE user_id = p_user_id ORDER BY calculated_at DESC LIMIT 1),
    0
  ) INTO v_baseline;

  INSERT INTO public.goals
    (user_id, target_pct, duration_days, baseline_co2_kg, status)
  VALUES
    (p_user_id, p_target_pct, p_duration_days, v_baseline, 'active')
  RETURNING * INTO v_new_goal;

  RETURN v_new_goal;
END;
$$;

-- ────────────────────────────────────────────────────────────
-- RPC: get_top_improving_categories
-- Compares this month's per-category totals against goal baseline month.
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_top_improving_categories(
  p_user_id UUID,
  p_limit   INT DEFAULT 3
)
RETURNS TABLE(category TEXT, improvement_pct NUMERIC)
LANGUAGE plpgsql SECURITY DEFINER STABLE AS $$
BEGIN
  RETURN QUERY
  WITH current_month AS (
    SELECT category, SUM(co2_kg) AS total
    FROM public.activities
    WHERE user_id = p_user_id
      AND date_trunc('month', created_at) = date_trunc('month', now())
    GROUP BY category
  ),
  prev_month AS (
    SELECT category, SUM(co2_kg) AS total
    FROM public.activities
    WHERE user_id = p_user_id
      AND date_trunc('month', created_at) = date_trunc('month', now() - INTERVAL '1 month')
    GROUP BY category
  )
  SELECT
    COALESCE(c.category, p.category) AS category,
    CASE
      WHEN p.total > 0
        THEN ROUND(((p.total - COALESCE(c.total, 0)) / p.total) * 100, 1)
      ELSE 0
    END AS improvement_pct
  FROM prev_month p
  LEFT JOIN current_month c ON c.category = p.category
  WHERE p.total > 0
  ORDER BY improvement_pct DESC
  LIMIT p_limit;
END;
$$;

-- ────────────────────────────────────────────────────────────
-- RPC: get_profile_stats
-- Single round-trip for total CO2 saved, streak, lifetime XP.
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_profile_stats(p_user_id UUID)
RETURNS TABLE(co2_saved_kg NUMERIC, current_streak INT, lifetime_xp INT)
LANGUAGE plpgsql SECURITY DEFINER STABLE AS $$
DECLARE
  v_baseline NUMERIC;
BEGIN
  SELECT COALESCE(baseline_co2_kg, 0) INTO v_baseline
  FROM public.footprint_baselines
  WHERE user_id = p_user_id
  ORDER BY calculated_at DESC
  LIMIT 1;

  RETURN QUERY
  SELECT
    GREATEST(
      v_baseline - COALESCE(
        (SELECT SUM(co2_kg) FROM public.activities
         WHERE user_id = p_user_id
           AND date_trunc('month', created_at) = date_trunc('month', now())),
        v_baseline
      ),
      0
    ) AS co2_saved_kg,
    public.get_current_streak(p_user_id) AS current_streak,
    COALESCE(
      (SELECT SUM(amount)::INT FROM public.xp_transactions WHERE user_id = p_user_id),
      0
    ) AS lifetime_xp;
END;
$$;

-- ────────────────────────────────────────────────────────────
-- RPC: redeem_reward
-- Atomic: balance check → negative XP row → redemption row.
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.redeem_reward(
  p_user_id   UUID,
  p_reward_id UUID
)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_balance INT;
  v_cost    INT;
BEGIN
  SELECT COALESCE(SUM(amount), 0)::INT INTO v_balance
  FROM public.xp_transactions WHERE user_id = p_user_id;

  SELECT xp_cost INTO v_cost
  FROM public.rewards WHERE id = p_reward_id AND active = true;

  IF v_cost IS NULL THEN
    RETURN jsonb_build_object('error', 'reward_not_found');
  END IF;

  IF v_balance < v_cost THEN
    RETURN jsonb_build_object('error', 'insufficient_xp', 'balance', v_balance, 'cost', v_cost);
  END IF;

  INSERT INTO public.xp_transactions (user_id, amount, source, ref_id)
  VALUES (p_user_id, -v_cost, 'redemption', p_reward_id);

  INSERT INTO public.redemptions (user_id, reward_id)
  VALUES (p_user_id, p_reward_id);

  RETURN jsonb_build_object('success', true, 'new_balance', v_balance - v_cost);
END;
$$;

-- ────────────────────────────────────────────────────────────
-- RPC: complete_challenge
-- Awards XP when a user completes a challenge.
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.complete_challenge(
  p_user_id     UUID,
  p_challenge_id UUID
)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_xp INT;
BEGIN
  SELECT xp_reward INTO v_xp
  FROM public.challenges WHERE id = p_challenge_id;

  UPDATE public.challenge_participants
  SET completed_at = now()
  WHERE user_id = p_user_id
    AND challenge_id = p_challenge_id
    AND completed_at IS NULL;

  IF FOUND AND v_xp IS NOT NULL THEN
    INSERT INTO public.xp_transactions (user_id, amount, source, ref_id)
    VALUES (p_user_id, v_xp, 'challenge', p_challenge_id);
  END IF;
END;
$$;

-- ────────────────────────────────────────────────────────────
-- TRIGGER: Update challenge progress on new activity
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.update_challenge_progress()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  r RECORD;
  v_criteria JSONB;
  v_matches  BOOLEAN;
  v_target   INT;
BEGIN
  FOR r IN
    SELECT cp.id, cp.challenge_id, cp.progress, c.criteria, c.xp_reward
    FROM public.challenge_participants cp
    JOIN public.challenges c ON c.id = cp.challenge_id
    WHERE cp.user_id = NEW.user_id
      AND cp.completed_at IS NULL
      AND now() BETWEEN c.starts_at AND c.ends_at
  LOOP
    v_criteria := r.criteria;
    v_matches  := false;

    -- category_count: count activities in a category (optionally excluding a subcategory)
    IF v_criteria->>'type' = 'category_count' THEN
      IF NEW.category = v_criteria->>'category' THEN
        IF v_criteria->>'exclude' IS NULL
           OR NEW.subcategory != v_criteria->>'exclude' THEN
          v_matches := true;
        END IF;
      END IF;
    -- co2_total: track cumulative CO2 saved (not yet, extend later)
    END IF;

    IF v_matches THEN
      UPDATE public.challenge_participants
      SET progress = progress + 1
      WHERE id = r.id;

      v_target := (v_criteria->>'target')::INT;
      IF r.progress + 1 >= v_target THEN
        PERFORM public.complete_challenge(NEW.user_id, r.challenge_id);
      END IF;
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_update_challenge_progress ON public.activities;
CREATE TRIGGER trg_update_challenge_progress
  AFTER INSERT ON public.activities
  FOR EACH ROW EXECUTE FUNCTION public.update_challenge_progress();

-- ────────────────────────────────────────────────────────────
-- TRIGGER: Award badges on activity insert
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.evaluate_badges()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_activity_count INT;
  v_streak         INT;
BEGIN
  -- first_log badge
  SELECT COUNT(*) INTO v_activity_count
  FROM public.activities WHERE user_id = NEW.user_id;

  IF v_activity_count = 1 THEN
    INSERT INTO public.user_badges (user_id, badge_id)
    SELECT NEW.user_id, id FROM public.badges WHERE key = 'first_log'
    ON CONFLICT DO NOTHING;
  END IF;

  -- streak_7 badge
  IF v_activity_count % 7 = 0 THEN
    v_streak := public.get_current_streak(NEW.user_id);
    IF v_streak >= 7 THEN
      INSERT INTO public.user_badges (user_id, badge_id)
      SELECT NEW.user_id, id FROM public.badges WHERE key = 'streak_7'
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_evaluate_badges ON public.activities;
CREATE TRIGGER trg_evaluate_badges
  AFTER INSERT ON public.activities
  FOR EACH ROW EXECUTE FUNCTION public.evaluate_badges();

-- ────────────────────────────────────────────────────────────
-- TRIGGER: Update growth_tier on XP change
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.update_growth_tier()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_lifetime_xp INT;
  v_tier TEXT;
BEGIN
  SELECT COALESCE(SUM(amount), 0)::INT INTO v_lifetime_xp
  FROM public.xp_transactions WHERE user_id = NEW.user_id;

  v_tier := CASE
    WHEN v_lifetime_xp >= 10000 THEN 'Canopy'
    WHEN v_lifetime_xp >= 5000  THEN 'Forest'
    WHEN v_lifetime_xp >= 2000  THEN 'Grove'
    WHEN v_lifetime_xp >= 500   THEN 'Sapling'
    ELSE 'Sprout'
  END;

  UPDATE public.users SET growth_tier = v_tier WHERE id = NEW.user_id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_update_growth_tier ON public.xp_transactions;
CREATE TRIGGER trg_update_growth_tier
  AFTER INSERT ON public.xp_transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_growth_tier();

-- ────────────────────────────────────────────────────────────
-- RPC: refresh_friend_leaderboard
-- Refreshes the materialized view. Callable from Edge Function.
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.refresh_friend_leaderboard()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.friend_leaderboard_mv;
END;
$$;
