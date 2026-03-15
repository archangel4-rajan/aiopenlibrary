-- User activity tracking table for analytics.
-- Captures page views, prompt interactions, searches, etc.
-- Designed for high write throughput with read-optimized indexes.

CREATE TABLE IF NOT EXISTS user_activity (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type  text        NOT NULL,
  user_id     uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id  text,
  resource_type text,
  resource_id   text,
  metadata    jsonb       NOT NULL DEFAULT '{}',
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Filter by event type within a time range (e.g. all prompt.view events this week)
CREATE INDEX idx_activity_event_type_created
  ON user_activity (event_type, created_at DESC);

-- Per-resource analytics (e.g. all events for prompt "my-prompt")
CREATE INDEX idx_activity_resource_created
  ON user_activity (resource_type, resource_id, created_at DESC);

-- User activity feed (only rows with a known user)
CREATE INDEX idx_activity_user_created
  ON user_activity (user_id, created_at DESC)
  WHERE user_id IS NOT NULL;

-- Session replay (only rows with a session)
CREATE INDEX idx_activity_session_created
  ON user_activity (session_id, created_at DESC)
  WHERE session_id IS NOT NULL;

-- General time range scans + future partitioning pivot
CREATE INDEX idx_activity_created
  ON user_activity (created_at);

-- "Most viewed/copied prompts" type queries
CREATE INDEX idx_activity_event_resource
  ON user_activity (event_type, resource_id);

-- RLS: enable but restrict reads to service role only
ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;

-- Allow inserts from any authenticated or anonymous user (via API route)
CREATE POLICY "Allow inserts for all users"
  ON user_activity
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

-- No SELECT/UPDATE/DELETE policies → only service role can read
