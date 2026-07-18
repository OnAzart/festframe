CREATE TABLE IF NOT EXISTS festframe_profiles (
  user_id text PRIMARY KEY,
  email text,
  country_code char(2) CHECK (country_code IS NULL OR country_code ~ '^[A-Z]{2}$'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS saved_plans (
  user_id text PRIMARY KEY REFERENCES festframe_profiles(user_id) ON DELETE CASCADE,
  priorities jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(priorities) = 'object'),
  weekend text NOT NULL DEFAULT 'w1' CHECK (weekend IN ('w1', 'w2')),
  wallpaper_theme text NOT NULL DEFAULT 'botanical-consciousness' CHECK (wallpaper_theme IN ('consciousness-desert', 'botanical-consciousness')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS festframe_leads (
  visitor_id uuid PRIMARY KEY,
  email text NOT NULL,
  country_code char(2) CHECK (country_code IS NULL OR country_code ~ '^[A-Z]{2}$'),
  marketing_consent boolean NOT NULL DEFAULT false,
  marketing_consent_at timestamptz,
  privacy_version text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE festframe_leads ADD COLUMN IF NOT EXISTS marketing_consent boolean NOT NULL DEFAULT false;
ALTER TABLE festframe_leads ADD COLUMN IF NOT EXISTS marketing_consent_at timestamptz;
ALTER TABLE festframe_leads ADD COLUMN IF NOT EXISTS privacy_version text;

CREATE TABLE IF NOT EXISTS festframe_email_plans (
  email_hash char(64) PRIMARY KEY CHECK (email_hash ~ '^[0-9a-f]{64}$'),
  email text,
  priorities jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(priorities) = 'object'),
  weekend text NOT NULL DEFAULT 'w1' CHECK (weekend IN ('w1', 'w2')),
  wallpaper_theme text NOT NULL DEFAULT 'botanical-consciousness' CHECK (wallpaper_theme IN ('consciousness-desert', 'botanical-consciousness')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE festframe_email_plans ADD COLUMN IF NOT EXISTS email text;

CREATE INDEX IF NOT EXISTS festframe_profiles_country_code_idx ON festframe_profiles (country_code);
CREATE INDEX IF NOT EXISTS saved_plans_updated_at_idx ON saved_plans (updated_at DESC);
CREATE INDEX IF NOT EXISTS festframe_leads_email_idx ON festframe_leads (lower(email));
CREATE INDEX IF NOT EXISTS festframe_leads_country_code_idx ON festframe_leads (country_code);
CREATE INDEX IF NOT EXISTS festframe_email_plans_updated_at_idx ON festframe_email_plans (updated_at DESC);
CREATE INDEX IF NOT EXISTS festframe_email_plans_email_idx ON festframe_email_plans (lower(email));
