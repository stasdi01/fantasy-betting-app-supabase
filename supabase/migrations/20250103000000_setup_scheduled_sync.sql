-- Enable pg_cron extension for scheduled tasks
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule EuroLeague data sync to run every 6 hours
-- This will call the Edge Function to sync player data
SELECT cron.schedule(
  'euroleague-data-sync',  -- Job name
  '0 */6 * * *',           -- Every 6 hours (at minute 0)
  $$
  SELECT
    net.http_post(
      url := 'https://ngphnbkkatezpjsfpxpw.supabase.co/functions/v1/sync-euroleague-data',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.settings.service_role_key') || '"}'::jsonb,
      body := '{}'::jsonb
    ) AS request_id;
  $$
);

-- Alter existing table to add missing columns if needed
DO $$
BEGIN
  -- Add created_at column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'api_sync_logs' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE api_sync_logs ADD COLUMN created_at timestamp with time zone DEFAULT now();
  END IF;
END $$;

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS api_sync_logs_created_at_idx ON api_sync_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS api_sync_logs_status_idx ON api_sync_logs(status);

-- Comment: To check scheduled jobs, run:
-- SELECT * FROM cron.job;

-- Comment: To unschedule (if needed), run:
-- SELECT cron.unschedule('euroleague-data-sync');
