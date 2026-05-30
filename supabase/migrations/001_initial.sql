-- ============================================================
-- 001_initial.sql — Household Finance App schema
-- Run this in Supabase dashboard → SQL Editor
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------
-- TABLES
-- ----------------------------------------------------------

CREATE TABLE households (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE profiles (
  id                    UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name             TEXT,
  avatar_url            TEXT,
  household_id          UUID REFERENCES households(id),
  role                  TEXT CHECK (role IN ('owner','member')) DEFAULT 'owner',
  onboarding_completed  BOOLEAN DEFAULT FALSE,
  created_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE invitations (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id   UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  invited_email  TEXT NOT NULL,
  invited_by     UUID NOT NULL REFERENCES profiles(id),
  status         TEXT CHECK (status IN ('pending','accepted','rejected')) DEFAULT 'pending',
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE categories (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id    UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  icon            TEXT NOT NULL DEFAULT '💰',
  color           TEXT NOT NULL DEFAULT '#6366f1',
  monthly_budget  NUMERIC(12,2),
  is_fixed        BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE incomes (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id  UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES profiles(id),
  label         TEXT NOT NULL,
  amount        NUMERIC(12,2) NOT NULL,
  day_of_month  SMALLINT DEFAULT 1,
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE fixed_expenses (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id  UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  category_id   UUID REFERENCES categories(id),
  label         TEXT NOT NULL,
  amount        NUMERIC(12,2) NOT NULL,
  day_of_month  SMALLINT DEFAULT 1,
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE transactions (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id  UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES profiles(id),
  category_id   UUID REFERENCES categories(id),
  amount        NUMERIC(12,2) NOT NULL,
  note          TEXT,
  date          DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE account_balance (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id  UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  balance       NUMERIC(12,2) NOT NULL DEFAULT 0,
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_by    UUID REFERENCES profiles(id),
  UNIQUE(household_id)
);

CREATE TABLE monthly_summaries (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id            UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  year                    SMALLINT NOT NULL,
  month                   SMALLINT NOT NULL,
  opening_balance         NUMERIC(12,2),
  closing_balance         NUMERIC(12,2),
  total_income            NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_fixed_expenses    NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_dynamic_expenses  NUMERIC(12,2) NOT NULL DEFAULT 0,
  actual_savings          NUMERIC(12,2),
  created_at              TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(household_id, year, month)
);

-- ----------------------------------------------------------
-- TRIGGER — auto-create profile on sign-up
-- ----------------------------------------------------------

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ----------------------------------------------------------
-- ROW-LEVEL SECURITY
-- ----------------------------------------------------------

ALTER TABLE households       ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations      ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories       ENABLE ROW LEVEL SECURITY;
ALTER TABLE incomes          ENABLE ROW LEVEL SECURITY;
ALTER TABLE fixed_expenses   ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_balance  ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_summaries ENABLE ROW LEVEL SECURITY;

-- Helper: get current user's household
CREATE OR REPLACE FUNCTION get_household_id()
RETURNS UUID LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT household_id FROM profiles WHERE id = auth.uid()
$$;

-- Households
CREATE POLICY "own_household" ON households
  FOR ALL USING (id = get_household_id());

-- Profiles
CREATE POLICY "same_household_read" ON profiles
  FOR SELECT USING (household_id = get_household_id() OR id = auth.uid());
CREATE POLICY "own_profile_write" ON profiles
  FOR INSERT WITH CHECK (id = auth.uid());
CREATE POLICY "own_profile_update" ON profiles
  FOR UPDATE USING (id = auth.uid());

-- Categories
CREATE POLICY "household_categories" ON categories
  FOR ALL USING (household_id = get_household_id());

-- Incomes
CREATE POLICY "household_incomes" ON incomes
  FOR ALL USING (household_id = get_household_id());

-- Fixed expenses
CREATE POLICY "household_fixed" ON fixed_expenses
  FOR ALL USING (household_id = get_household_id());

-- Transactions
CREATE POLICY "household_transactions" ON transactions
  FOR ALL USING (household_id = get_household_id());

-- Account balance
CREATE POLICY "household_balance" ON account_balance
  FOR ALL USING (household_id = get_household_id());

-- Monthly summaries
CREATE POLICY "household_summaries" ON monthly_summaries
  FOR ALL USING (household_id = get_household_id());

-- Invitations
CREATE POLICY "view_invitations" ON invitations
  FOR SELECT USING (
    household_id = get_household_id() OR
    invited_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );
CREATE POLICY "create_invitations" ON invitations
  FOR INSERT WITH CHECK (household_id = get_household_id());
CREATE POLICY "update_invitations" ON invitations
  FOR UPDATE USING (
    household_id = get_household_id() OR
    invited_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );
