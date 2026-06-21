-- ============================================================
-- 001_full_schema.sql
-- Tread — Complete database schema
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_net";

-- ── users ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.users (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email           TEXT,
  name            TEXT,
  avatar_url      TEXT,
  growth_tier     TEXT NOT NULL DEFAULT 'Sprout'
                    CHECK (growth_tier IN ('Sprout','Sapling','Grove','Forest','Canopy')),
  household_id    UUID,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── households ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.households (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL DEFAULT 'My Household',
  owner_id    UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- back-ref from users → households
ALTER TABLE public.users
  ADD CONSTRAINT fk_users_household
  FOREIGN KEY (household_id) REFERENCES public.households(id) ON DELETE SET NULL;

-- ── household_members ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.household_members (
  household_id  UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role          TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner','member')),
  joined_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (household_id, user_id)
);

-- ── emission_factors ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.emission_factors (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category         TEXT NOT NULL,        -- transport | energy | food | shopping | waste
  subcategory      TEXT NOT NULL,        -- e.g. car, bus, flight, electricity
  unit             TEXT NOT NULL,        -- km | kWh | meal | kg | £
  kg_co2_per_unit  NUMERIC(10,6) NOT NULL,
  UNIQUE (category, subcategory, unit)
);

-- ── assessment_responses ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.assessment_responses (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  module        TEXT NOT NULL,           -- transport | energy | food | shopping | waste
  question_key  TEXT NOT NULL,
  answer_value  TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, module, question_key)
);

-- ── footprint_baselines ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.footprint_baselines (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  baseline_co2_kg  NUMERIC(10,3) NOT NULL,
  calculated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_footprint_baselines_user ON public.footprint_baselines(user_id, calculated_at DESC);

-- ── activities ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.activities (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  category     TEXT NOT NULL,
  subcategory  TEXT,
  amount       NUMERIC(12,4) NOT NULL,
  unit         TEXT NOT NULL,
  co2_kg       NUMERIC(10,4) NOT NULL,
  source       TEXT DEFAULT 'manual',   -- manual | connected:<provider>
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_activities_user_created ON public.activities(user_id, created_at DESC);
CREATE INDEX idx_activities_user_created_at   ON public.activities(user_id, created_at);

-- ── daily_missions ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.daily_missions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  date        DATE NOT NULL,
  category    TEXT NOT NULL,
  action_text TEXT NOT NULL,
  xp_reward   INT NOT NULL DEFAULT 25,
  completed   BOOLEAN NOT NULL DEFAULT false,
  UNIQUE (user_id, date)
);
CREATE INDEX idx_daily_missions_user_date ON public.daily_missions(user_id, date DESC);

-- ── weekly_reviews ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.weekly_reviews (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  week_start    DATE NOT NULL,
  summary_text  TEXT NOT NULL,
  key_metric    TEXT NOT NULL,           -- e.g. "↓8% vs last week"
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, week_start)
);
CREATE INDEX idx_weekly_reviews_user ON public.weekly_reviews(user_id, week_start DESC);

-- ── goals ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.goals (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  target_pct       NUMERIC(5,2) NOT NULL,  -- e.g. 0.20 = 20% reduction
  duration_days    INT NOT NULL,
  started_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  ends_at          TIMESTAMPTZ NOT NULL,
  baseline_co2_kg  NUMERIC(10,3) NOT NULL DEFAULT 0,
  status           TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','completed','abandoned'))
);
CREATE INDEX idx_goals_user_active ON public.goals(user_id, status) WHERE status = 'active';

-- ── challenges ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.challenges (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT NOT NULL,
  description   TEXT,
  criteria      JSONB NOT NULL DEFAULT '{}',
  featured      BOOLEAN NOT NULL DEFAULT false,
  glow_eligible BOOLEAN NOT NULL DEFAULT false,
  starts_at     TIMESTAMPTZ NOT NULL,
  ends_at       TIMESTAMPTZ NOT NULL,
  xp_reward     INT NOT NULL DEFAULT 150,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- Only one active challenge can glow at a time
CREATE UNIQUE INDEX idx_challenges_one_glow
  ON public.challenges (glow_eligible)
  WHERE glow_eligible = true;

-- ── challenge_participants ───────────────────────────────────
CREATE TABLE IF NOT EXISTS public.challenge_participants (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  challenge_id  UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  progress      INT NOT NULL DEFAULT 0,
  completed_at  TIMESTAMPTZ,
  joined_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, challenge_id)
);
CREATE INDEX idx_challenge_participants_user ON public.challenge_participants(user_id);

-- ── xp_transactions ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.xp_transactions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount     INT NOT NULL,              -- positive = earned, negative = spent
  source     TEXT NOT NULL,            -- mission | challenge | goal | redemption
  ref_id     UUID,                     -- references the source row
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_xp_transactions_user ON public.xp_transactions(user_id, created_at DESC);

-- ── badges ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.badges (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key       TEXT UNIQUE NOT NULL,      -- e.g. 'first_log', 'streak_7'
  title     TEXT NOT NULL,
  criteria  JSONB NOT NULL DEFAULT '{}'
);

-- ── user_badges ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_badges (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  badge_id    UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, badge_id)
);
CREATE INDEX idx_user_badges_user ON public.user_badges(user_id);

-- ── rewards ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.rewards (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand     TEXT NOT NULL,
  title     TEXT NOT NULL,
  xp_cost   INT NOT NULL,
  active    BOOLEAN NOT NULL DEFAULT true
);

-- ── redemptions ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.redemptions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  reward_id   UUID NOT NULL REFERENCES public.rewards(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_redemptions_user ON public.redemptions(user_id, created_at DESC);

-- ── pledges ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.pledges (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount_xp   INT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── friends ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.friends (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  friend_id   UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status      TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, friend_id)
);

-- ── integrations ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.integrations (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  provider          TEXT NOT NULL,     -- strava | google_fit | oura | google_calendar
  connected         BOOLEAN NOT NULL DEFAULT false,
  oauth_token_enc   TEXT,              -- encrypted token, never exposed to client
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, provider)
);

-- ── notification_prefs ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.notification_prefs (
  user_id          UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  reminders        BOOLEAN NOT NULL DEFAULT true,
  insights         BOOLEAN NOT NULL DEFAULT true,
  challenges       BOOLEAN NOT NULL DEFAULT false,
  household        BOOLEAN NOT NULL DEFAULT true,
  weekly_summary   BOOLEAN NOT NULL DEFAULT true,
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── invites ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.invites (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id  UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  email         TEXT NOT NULL,
  token         TEXT UNIQUE NOT NULL,
  status        TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','expired')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at    TIMESTAMPTZ NOT NULL DEFAULT now() + INTERVAL '7 days'
);

-- ── sol_messages ─────────────────────────────────────────────
-- Already exists in codebase types; ensure columns match
CREATE TABLE IF NOT EXISTS public.sol_messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role        TEXT NOT NULL CHECK (role IN ('user','assistant')),
  content     TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_sol_messages_user ON public.sol_messages(user_id, created_at DESC);

-- ── Auto-create user profile on auth sign-up ─────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;

  -- Default notification prefs
  INSERT INTO public.notification_prefs (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
