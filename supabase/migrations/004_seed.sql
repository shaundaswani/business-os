-- ============================================================
-- 004_seed.sql
-- Seed data: 8 businesses + demo trades for trading module
-- ============================================================

-- ============================================================
-- Businesses (8 modules)
-- ============================================================
INSERT INTO businesses (id, name, color, icon, description, sort_order) VALUES
  ('overview',    'Morning Brief', '#0F172A', '◉', 'Daily command centre and digest',           1),
  ('trading',     'Trading',       '#7C3AED', '◈', 'Gold, forex, and index trading operations', 2),
  ('jetset',      'Jetset BC',     '#0891B2', '◆', 'Business centre and co-working management', 3),
  ('commercial',  'Commercial',    '#6366F1', '⬢', 'Commercial property portfolio',             4),
  ('exaim',       'ExAIm',         '#DC2626', '▲', 'AI-powered exam preparation platform',      5),
  ('improveme',   'Improve ME',    '#059669', '■', 'Education institute and tutoring centre',   6),
  ('residential', 'Residential',   '#2563EB', '⬟', 'Residential property portfolio',            7),
  ('personal',    'Personal',      '#818CF8', '●', 'Personal goals, health, and finance',       8)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Demo trades (seed for development — covers all analytics)
-- ============================================================
INSERT INTO trades (asset, direction, entry_price, entry_time, exit_price, exit_time, pnl_r, status, notes)
VALUES
  ('XAUUSD', 'long',  2312.40, '2026-04-07 09:00:00+00', 2328.70, '2026-04-07 15:30:00+00',  2.4,  'closed', NULL),
  ('EURUSD', 'short', 1.0842,  '2026-04-07 10:00:00+00', 1.0810,  '2026-04-07 14:00:00+00',  1.8,  'closed', NULL),
  ('NAS100', 'long',  18240,   '2026-04-06 09:30:00+00', 18105,   '2026-04-06 13:00:00+00', -1.0,  'closed', NULL),
  ('GBPJPY', 'long',  191.40,  '2026-04-06 10:00:00+00', 192.15,  '2026-04-06 15:00:00+00',  2.1,  'closed', NULL),
  ('XAUUSD', 'short', 2305,    '2026-04-05 09:00:00+00', 2298.40, '2026-04-05 12:30:00+00',  1.5,  'closed', NULL),
  ('EURUSD', 'long',  1.0795,  '2026-04-05 10:30:00+00', 1.0778,  '2026-04-05 14:00:00+00', -0.7,  'closed', NULL),
  ('USOIL',  'long',  83.20,   '2026-04-04 09:00:00+00', 84.65,   '2026-04-04 16:00:00+00',  2.8,  'closed', NULL),
  ('NAS100', 'short', 18310,   '2026-04-04 10:00:00+00', 18180,   '2026-04-04 14:30:00+00',  1.9,  'closed', NULL),
  ('XAUUSD', 'long',  2290,    '2026-04-03 09:00:00+00', 2285.50, '2026-04-03 11:30:00+00', -0.5,  'closed', NULL),
  ('GBPUSD', 'long',  1.2635,  '2026-04-03 10:00:00+00', 1.2672,  '2026-04-03 15:00:00+00',  1.6,  'closed', NULL),
  ('EURUSD', 'short', 1.0830,  '2026-04-02 09:30:00+00', 1.0802,  '2026-04-02 13:00:00+00',  1.4,  'closed', NULL),
  ('XAUUSD', 'long',  2278,    '2026-04-02 10:00:00+00', 2296.50, '2026-04-02 16:00:00+00',  3.2,  'closed', NULL)
ON CONFLICT DO NOTHING;
