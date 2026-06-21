-- ============================================================
-- 002_rls_policies.sql
-- Tread — Row-Level Security policies for every table
-- ============================================================

ALTER TABLE public.users                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.households             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.household_members      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emission_factors       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_responses   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.footprint_baselines    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_missions         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_reviews         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_transactions        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewards                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.redemptions            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pledges                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friends                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integrations           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_prefs     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invites                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sol_messages           ENABLE ROW LEVEL SECURITY;

-- Helper: is caller a member of the given household?
CREATE OR REPLACE FUNCTION public.is_household_member(hid UUID)
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.household_members
    WHERE household_id = hid AND user_id = auth.uid()
  );
$$;

-- Helper: what is caller's household_id?
CREATE OR REPLACE FUNCTION public.my_household_id()
RETURNS UUID LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT household_id FROM public.users WHERE id = auth.uid();
$$;

-- ── users ────────────────────────────────────────────────────
CREATE POLICY "users_select_own"  ON public.users FOR SELECT USING (id = auth.uid());
CREATE POLICY "users_update_own"  ON public.users FOR UPDATE USING (id = auth.uid());
-- Users can see household members' names/tiers
CREATE POLICY "users_select_household" ON public.users FOR SELECT
  USING (public.is_household_member(household_id));

-- ── households ───────────────────────────────────────────────
CREATE POLICY "households_select_member" ON public.households FOR SELECT
  USING (public.is_household_member(id));
CREATE POLICY "households_insert_own"    ON public.households FOR INSERT
  WITH CHECK (owner_id = auth.uid());
CREATE POLICY "households_update_owner"  ON public.households FOR UPDATE
  USING (owner_id = auth.uid());

-- ── household_members ────────────────────────────────────────
CREATE POLICY "hm_select_member"  ON public.household_members FOR SELECT
  USING (public.is_household_member(household_id));
CREATE POLICY "hm_insert_service" ON public.household_members FOR INSERT
  WITH CHECK (auth.role() = 'service_role'); -- only Edge Functions insert members
CREATE POLICY "hm_delete_self_or_owner" ON public.household_members FOR DELETE
  USING (
    user_id = auth.uid()   -- member removes themselves
    OR EXISTS (            -- owner removes others
      SELECT 1 FROM public.households h
      WHERE h.id = household_id AND h.owner_id = auth.uid()
    )
  );

-- ── emission_factors (read-only for authenticated users) ─────
CREATE POLICY "ef_select_authenticated" ON public.emission_factors FOR SELECT
  USING (auth.role() = 'authenticated');

-- ── assessment_responses ─────────────────────────────────────
CREATE POLICY "ar_all_own" ON public.assessment_responses FOR ALL
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ── footprint_baselines ──────────────────────────────────────
CREATE POLICY "fb_select_own" ON public.footprint_baselines FOR SELECT
  USING (user_id = auth.uid());
-- Only service role writes baselines (via RPC)
CREATE POLICY "fb_insert_service" ON public.footprint_baselines FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- ── activities ───────────────────────────────────────────────
CREATE POLICY "act_select_own"       ON public.activities FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "act_insert_service"   ON public.activities FOR INSERT WITH CHECK (auth.role() = 'service_role');
-- Household-aggregated reads
CREATE POLICY "act_select_household" ON public.activities FOR SELECT
  USING (public.is_household_member(
    (SELECT household_id FROM public.users WHERE id = activities.user_id)
  ));

-- ── daily_missions ───────────────────────────────────────────
CREATE POLICY "dm_select_own" ON public.daily_missions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "dm_update_own" ON public.daily_missions FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "dm_insert_service" ON public.daily_missions FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- ── weekly_reviews ───────────────────────────────────────────
CREATE POLICY "wr_select_own" ON public.weekly_reviews FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "wr_insert_service" ON public.weekly_reviews FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- ── goals ────────────────────────────────────────────────────
CREATE POLICY "goals_all_own" ON public.goals FOR ALL
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ── challenges (read-only catalog) ───────────────────────────
CREATE POLICY "challenges_select_authenticated" ON public.challenges FOR SELECT
  USING (auth.role() = 'authenticated');

-- ── challenge_participants ───────────────────────────────────
CREATE POLICY "cp_select_own"   ON public.challenge_participants FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "cp_insert_own"   ON public.challenge_participants FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "cp_update_service" ON public.challenge_participants FOR UPDATE
  USING (auth.role() = 'service_role'); -- triggers update progress

-- ── xp_transactions ─────────────────────────────────────────
CREATE POLICY "xp_select_own" ON public.xp_transactions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "xp_insert_service" ON public.xp_transactions FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- ── badges (catalog) ─────────────────────────────────────────
CREATE POLICY "badges_select_authenticated" ON public.badges FOR SELECT
  USING (auth.role() = 'authenticated');

-- ── user_badges ──────────────────────────────────────────────
CREATE POLICY "ub_select_own" ON public.user_badges FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "ub_insert_service" ON public.user_badges FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- ── rewards (catalog) ────────────────────────────────────────
CREATE POLICY "rewards_select_authenticated" ON public.rewards FOR SELECT
  USING (auth.role() = 'authenticated' AND active = true);

-- ── redemptions ──────────────────────────────────────────────
CREATE POLICY "redemptions_select_own" ON public.redemptions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "redemptions_insert_service" ON public.redemptions FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- ── pledges ──────────────────────────────────────────────────
CREATE POLICY "pledges_all_own" ON public.pledges FOR ALL
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ── friends ──────────────────────────────────────────────────
CREATE POLICY "friends_select_own" ON public.friends FOR SELECT
  USING (user_id = auth.uid() OR friend_id = auth.uid());
CREATE POLICY "friends_insert_own" ON public.friends FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "friends_update_own" ON public.friends FOR UPDATE USING (user_id = auth.uid() OR friend_id = auth.uid());

-- ── integrations ─────────────────────────────────────────────
CREATE POLICY "int_select_own" ON public.integrations FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "int_insert_own" ON public.integrations FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "int_update_service" ON public.integrations FOR UPDATE
  USING (auth.role() = 'service_role'); -- token revocation via Edge Function

-- ── notification_prefs ───────────────────────────────────────
CREATE POLICY "np_all_own" ON public.notification_prefs FOR ALL
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ── invites ──────────────────────────────────────────────────
CREATE POLICY "invites_select_service" ON public.invites FOR SELECT
  USING (auth.role() = 'service_role');
CREATE POLICY "invites_insert_service" ON public.invites FOR INSERT
  WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "invites_update_service" ON public.invites FOR UPDATE
  USING (auth.role() = 'service_role');

-- ── sol_messages ─────────────────────────────────────────────
CREATE POLICY "sm_select_own" ON public.sol_messages FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "sm_insert_own" ON public.sol_messages FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "sm_insert_service" ON public.sol_messages FOR INSERT
  WITH CHECK (auth.role() = 'service_role'); -- Edge Function writes assistant replies
