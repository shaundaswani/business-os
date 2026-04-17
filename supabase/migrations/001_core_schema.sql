-- ============================================================
-- 001_core_schema.sql
-- Core tables for Business OS
-- ============================================================

-- Auto-update trigger function (shared by all tables)
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- profiles (extends auth.users)
-- ============================================================
CREATE TABLE profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   text,
  role        text NOT NULL DEFAULT 'viewer'
                CHECK (role IN ('owner', 'contributor', 'viewer')),
  avatar_url  text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'viewer'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- businesses (seeded — 8 modules)
-- ============================================================
CREATE TABLE businesses (
  id          text PRIMARY KEY,
  name        text NOT NULL,
  color       text NOT NULL,
  icon        text NOT NULL,
  description text,
  sort_order  integer NOT NULL DEFAULT 0
);

-- ============================================================
-- business_access (RBAC mapping)
-- ============================================================
CREATE TABLE business_access (
  user_id     uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  business_id text NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, business_id)
);

-- ============================================================
-- tasks
-- ============================================================
CREATE TABLE tasks (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title          text NOT NULL,
  business_id    text NOT NULL REFERENCES businesses(id),
  assignee_id    uuid REFERENCES profiles(id),
  from_id        uuid REFERENCES profiles(id),
  priority       text NOT NULL DEFAULT 'normal'
                   CHECK (priority IN ('urgent', 'high', 'normal', 'low')),
  due_date       date,
  done           boolean NOT NULL DEFAULT false,
  cognitive_load integer CHECK (cognitive_load BETWEEN 1 AND 10),
  deleted_at     timestamptz,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX tasks_business_id_idx ON tasks(business_id) WHERE deleted_at IS NULL;
CREATE INDEX tasks_assignee_idx ON tasks(assignee_id) WHERE deleted_at IS NULL;

-- ============================================================
-- messages
-- ============================================================
CREATE TABLE messages (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content     text NOT NULL,
  business_id text NOT NULL REFERENCES businesses(id),
  author_id   uuid NOT NULL REFERENCES profiles(id),
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX messages_business_id_idx ON messages(business_id, created_at DESC);

-- ============================================================
-- documents
-- ============================================================
CREATE TABLE documents (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title       text NOT NULL,
  content     text,
  url         text,
  business_id text NOT NULL REFERENCES businesses(id),
  created_by  uuid NOT NULL REFERENCES profiles(id),
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- goals
-- ============================================================
CREATE TABLE goals (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title         text NOT NULL,
  business_id   text NOT NULL REFERENCES businesses(id),
  target        numeric,
  current_value numeric NOT NULL DEFAULT 0,
  unit          text,
  deadline      date,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER goals_updated_at
  BEFORE UPDATE ON goals
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- workflows (SOPs stored in DB for runtime use)
-- ============================================================
CREATE TABLE workflows (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  business_id text NOT NULL REFERENCES businesses(id),
  description text,
  steps       jsonb NOT NULL DEFAULT '[]',
  active      boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- escalation_rules
-- ============================================================
CREATE TABLE escalation_rules (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id       text NOT NULL REFERENCES businesses(id),
  trigger_condition text NOT NULL,
  action            text NOT NULL,
  assignee_id       uuid REFERENCES profiles(id),
  active            boolean NOT NULL DEFAULT true,
  created_at        timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- audit_log
-- ============================================================
CREATE TABLE audit_log (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid REFERENCES profiles(id),
  action     text NOT NULL,
  table_name text NOT NULL,
  record_id  uuid,
  old_data   jsonb,
  new_data   jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX audit_log_user_idx ON audit_log(user_id, created_at DESC);
CREATE INDEX audit_log_table_idx ON audit_log(table_name, record_id);

-- ============================================================
-- biometrics (Hume Band)
-- ============================================================
CREATE TABLE biometrics (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date             date NOT NULL,
  sleep_hours      numeric,
  hrv_ms           numeric,
  metabolic_score  numeric,
  stress_score     numeric,
  recovery_score   numeric,
  created_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, date)
);

-- ============================================================
-- notifications
-- ============================================================
CREATE TABLE notifications (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title       text NOT NULL,
  body        text,
  business_id text REFERENCES businesses(id),
  read        boolean NOT NULL DEFAULT false,
  read_at     timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX notifications_user_idx ON notifications(user_id, created_at DESC) WHERE read = false;

-- Enable RLS on all tables (policies in 003)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE escalation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE biometrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
