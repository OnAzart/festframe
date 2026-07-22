CREATE TABLE IF NOT EXISTS product_events (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  session_id uuid NOT NULL,
  visitor_id uuid,
  event_name text NOT NULL CHECK (event_name IN (
    'planner_opened',
    'signup_completed',
    'email_submitted',
    'plan_restored',
    'first_artist_selected',
    'five_artists_selected',
    'timeline_viewed',
    'calendar_exported',
    'pdf_exported',
    'wallpaper_exported',
    'wallpaper_shared',
    'support_opened'
  )),
  festival_date date,
  weekend text CHECK (weekend IN ('w1', 'w2')),
  country_code char(2) CHECK (country_code IS NULL OR country_code ~ '^[A-Z]{2}$'),
  properties jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE product_events ADD COLUMN IF NOT EXISTS country_code char(2);
ALTER TABLE product_events ADD COLUMN IF NOT EXISTS visitor_id uuid;
ALTER TABLE product_events DROP CONSTRAINT IF EXISTS product_events_event_name_check;
ALTER TABLE product_events ADD CONSTRAINT product_events_event_name_check CHECK (event_name IN (
  'planner_opened',
  'signup_completed',
  'email_submitted',
  'plan_restored',
  'first_artist_selected',
  'five_artists_selected',
  'timeline_viewed',
  'calendar_exported',
  'pdf_exported',
  'wallpaper_exported',
  'wallpaper_shared',
  'support_opened'
));

CREATE INDEX IF NOT EXISTS product_events_created_at_idx ON product_events (created_at DESC);
CREATE INDEX IF NOT EXISTS product_events_event_name_idx ON product_events (event_name, created_at DESC);
CREATE INDEX IF NOT EXISTS product_events_country_code_idx ON product_events (country_code, created_at DESC);
CREATE INDEX IF NOT EXISTS product_events_visitor_id_idx ON product_events (visitor_id, created_at DESC);
