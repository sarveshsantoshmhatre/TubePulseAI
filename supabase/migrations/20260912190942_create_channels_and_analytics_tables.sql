/*
# Create user channel connections and saved analytics snapshots

1. New Tables
- `channel_connections` — stores each user's YouTube channel connection info
  - id (uuid, PK)
  - user_id (uuid, FK to auth.users, defaults to auth.uid())
  - channel_name (text, not null) — display name for the channel
  - channel_handle (text) — YouTube handle e.g. @creator
  - youtube_channel_id (text) — YouTube channel ID if connected via OAuth
  - connected (boolean, default false) — whether OAuth is connected
  - subscriber_count (int, default 0)
  - video_count (int, default 0)
  - total_views (bigint, default 0)
  - created_at (timestamptz)
  - updated_at (timestamptz)
- `saved_snapshots` — stores user-saved analytics snapshots for comparison over time
  - id (uuid, PK)
  - user_id (uuid, FK to auth.users, defaults to auth.uid())
  - channel_connection_id (uuid, FK to channel_connections)
  - snapshot_name (text, not null)
  - metrics (jsonb) — flexible storage for snapshot metrics
  - created_at (timestamptz)
- `alert_preferences` — stores per-user alert threshold settings
  - id (uuid, PK)
  - user_id (uuid, FK to auth.users, defaults to auth.uid(), unique)
  - high_risk_threshold (int, default 61)
  - retention_target (int, default 68)
  - email_alerts (boolean, default false)
  - created_at (timestamptz)
  - updated_at (timestamptz)

2. Security
- Enable RLS on all tables.
- Owner-scoped CRUD: each authenticated user can only access their own rows.
- user_id defaults to auth.uid() so inserts work without the client passing it.
*/

CREATE TABLE IF NOT EXISTS channel_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  channel_name text NOT NULL,
  channel_handle text,
  youtube_channel_id text,
  connected boolean NOT NULL DEFAULT false,
  subscriber_count int DEFAULT 0,
  video_count int DEFAULT 0,
  total_views bigint DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE channel_connections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_channels" ON channel_connections;
CREATE POLICY "select_own_channels" ON channel_connections FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_channels" ON channel_connections;
CREATE POLICY "insert_own_channels" ON channel_connections FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_channels" ON channel_connections;
CREATE POLICY "update_own_channels" ON channel_connections FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_channels" ON channel_connections;
CREATE POLICY "delete_own_channels" ON channel_connections FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS saved_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  channel_connection_id uuid REFERENCES channel_connections(id) ON DELETE CASCADE,
  snapshot_name text NOT NULL,
  metrics jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE saved_snapshots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_snapshots" ON saved_snapshots;
CREATE POLICY "select_own_snapshots" ON saved_snapshots FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_snapshots" ON saved_snapshots;
CREATE POLICY "insert_own_snapshots" ON saved_snapshots FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_snapshots" ON saved_snapshots;
CREATE POLICY "update_own_snapshots" ON saved_snapshots FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_snapshots" ON saved_snapshots;
CREATE POLICY "delete_own_snapshots" ON saved_snapshots FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS alert_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  high_risk_threshold int NOT NULL DEFAULT 61,
  retention_target int NOT NULL DEFAULT 68,
  email_alerts boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE alert_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_alert_prefs" ON alert_preferences;
CREATE POLICY "select_own_alert_prefs" ON alert_preferences FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_alert_prefs" ON alert_preferences;
CREATE POLICY "insert_own_alert_prefs" ON alert_preferences FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_alert_prefs" ON alert_preferences;
CREATE POLICY "update_own_alert_prefs" ON alert_preferences FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_alert_prefs" ON alert_preferences;
CREATE POLICY "delete_own_alert_prefs" ON alert_preferences FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_channel_connections_user_id ON channel_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_snapshots_user_id ON saved_snapshots(user_id);
CREATE INDEX IF NOT EXISTS idx_alert_preferences_user_id ON alert_preferences(user_id);
