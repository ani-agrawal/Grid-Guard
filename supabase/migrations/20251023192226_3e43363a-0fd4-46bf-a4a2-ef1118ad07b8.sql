-- Enable pg_cron extension for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

-- Enable pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Create cron job to fetch news every hour
SELECT cron.schedule(
  'fetch-news-hourly',
  '0 * * * *', -- Every hour at minute 0
  $$
  SELECT
    net.http_post(
      url:='https://tmsulkbypsljthsqxmrk.supabase.co/functions/v1/fetch-news',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtc3Vsa2J5cHNsanRoc3F4bXJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4NDQ1NTMsImV4cCI6MjA3NjQyMDU1M30.v5mmyyCltw2Xy4vv7f_RrEZSPxgt2x9EuQi_tsaIGIg"}'::jsonb,
      body:='{}'::jsonb
    ) as request_id;
  $$
);