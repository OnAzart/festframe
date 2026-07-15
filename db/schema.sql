CREATE TABLE IF NOT EXISTS product_events (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  session_id uuid NOT NULL,
  event_name text NOT NULL CHECK (event_name IN (
    'planner_opened',
    'first_artist_selected',
    'five_artists_selected',
    'timeline_viewed',
    'wallpaper_exported',
    'support_opened'
  )),
  festival_date date,
  weekend text CHECK (weekend IN ('w1', 'w2')),
  properties jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS product_events_created_at_idx ON product_events (created_at DESC);
CREATE INDEX IF NOT EXISTS product_events_event_name_idx ON product_events (event_name, created_at DESC);

