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

CREATE INDEX IF NOT EXISTS festframe_profiles_country_code_idx ON festframe_profiles (country_code);
CREATE INDEX IF NOT EXISTS saved_plans_updated_at_idx ON saved_plans (updated_at DESC);
