-- ============================================================
-- emission_factors seed data
-- Covers Transport, Energy, Food, Shopping, Waste
-- Sources: BEIS 2023, Our World in Data, EPA emission factors
-- ============================================================

INSERT INTO public.emission_factors (category, subcategory, unit, kg_co2_per_unit) VALUES
-- ── Transport ──────────────────────────────────────────────
('transport', 'car',              'km',   0.170),   -- average petrol car
('transport', 'car_electric',     'km',   0.053),   -- EV (UK grid)
('transport', 'bus',              'km',   0.089),   -- local bus
('transport', 'train',            'km',   0.037),   -- national rail
('transport', 'flight_short',     'km',   0.255),   -- short-haul flight
('transport', 'flight_long',      'km',   0.195),   -- long-haul flight
('transport', 'motorcycle',       'km',   0.114),
('transport', 'bicycle',          'km',   0.000),   -- zero emissions
('transport', 'walking',          'km',   0.000),
('transport', 'taxi',             'km',   0.149),
-- ── Energy ─────────────────────────────────────────────────
('energy', 'electricity',         'kWh',  0.233),   -- UK grid 2023
('energy', 'natural_gas',         'kWh',  0.183),
('energy', 'heating_oil',         'litre',2.520),
('energy', 'lpg',                 'litre',1.555),
('energy', 'renewable',           'kWh',  0.015),   -- green tariff
-- ── Food ───────────────────────────────────────────────────
('food', 'meal_meat',             'meal', 3.800),   -- beef-heavy meal
('food', 'meal_chicken',          'meal', 1.100),
('food', 'meal_fish',             'meal', 1.340),
('food', 'meal_vegetarian',       'meal', 0.570),
('food', 'meal_vegan',            'meal', 0.320),
('food', 'dairy_heavy',           'meal', 2.200),
-- ── Shopping ───────────────────────────────────────────────
('shopping', 'clothing',          '£',    0.076),   -- kg CO2 per £ spend
('shopping', 'electronics',       '£',    0.130),
('shopping', 'furniture',         '£',    0.053),
('shopping', 'groceries',         '£',    0.044),
('shopping', 'general',           '£',    0.060),   -- average retail
-- ── Waste ──────────────────────────────────────────────────
('waste', 'mixed',                'kg',   0.587),   -- landfill
('waste', 'recycled',             'kg',   0.021),
('waste', 'composted',            'kg',   0.010),
('waste', 'food_waste',           'kg',   0.310)
ON CONFLICT (category, subcategory, unit) DO UPDATE
  SET kg_co2_per_unit = EXCLUDED.kg_co2_per_unit;

-- ── Badge catalog seed ──────────────────────────────────────
INSERT INTO public.badges (key, title, criteria) VALUES
('first_log',     'First Step',        '{"type": "activity_count", "threshold": 1}'),
('streak_7',      'Week Warrior',      '{"type": "streak", "threshold": 7}'),
('streak_30',     'Monthly Habit',     '{"type": "streak", "threshold": 30}'),
('co2_saver_50',  '50kg Saved',        '{"type": "co2_saved", "threshold": 50}'),
('co2_saver_250', '250kg Saved',       '{"type": "co2_saved", "threshold": 250}'),
('car_free_week', 'Car-Free Week',     '{"type": "category_absence", "category": "transport", "subcategory": "car", "days": 7}'),
('mission_10',    'Mission 10',        '{"type": "missions_completed", "threshold": 10}'),
('challenge_1',   'Challenger',        '{"type": "challenges_completed", "threshold": 1}'),
('goal_achieved', 'Goal Getter',       '{"type": "goals_completed", "threshold": 1}')
ON CONFLICT (key) DO UPDATE SET title = EXCLUDED.title;

-- ── Reward catalog seed ─────────────────────────────────────
INSERT INTO public.rewards (brand, title, xp_cost, active) VALUES
('Patagonia',   '20% off repair kit',       1200, true),
('Oatly',       'Free oat latte',           800,  true),
('Bulb Energy', '£5 credit on your bill',   1500, true),
('Brompton',    'Free service check',        2000, true),
('Ecosia',      'Plant 10 extra trees',      600,  true)
ON CONFLICT DO NOTHING;

-- ── Challenge seed ──────────────────────────────────────────
INSERT INTO public.challenges (title, description, criteria, featured, glow_eligible, starts_at, ends_at, xp_reward) VALUES
(
  'No-Car November',
  'Avoid car trips for the entire month.',
  '{"type": "category_count", "category": "transport", "exclude": "car", "target": 20}',
  true, true,
  date_trunc('month', now())::TIMESTAMPTZ,
  (date_trunc('month', now()) + INTERVAL '1 month - 1 second')::TIMESTAMPTZ,
  300
),
(
  'Plant Week',
  'Log one plant-based meal every day for 7 days.',
  '{"type": "category_count", "category": "food", "subcategory": "meal_vegan", "target": 7}',
  true, false,
  now(),
  now() + INTERVAL '30 days',
  150
),
(
  'Energy Audit',
  'Reduce home energy logs below 50 kWh for a month.',
  '{"type": "category_count", "category": "energy", "target": 5}',
  true, false,
  now(),
  now() + INTERVAL '30 days',
  150
)
ON CONFLICT DO NOTHING;
