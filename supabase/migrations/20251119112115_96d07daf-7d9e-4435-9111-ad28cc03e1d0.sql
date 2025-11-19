-- Create table for rate limiting test submissions
CREATE TABLE public.test_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  ip_address text,
  test_id text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create index for efficient rate limit queries
CREATE INDEX idx_test_submissions_email_created ON public.test_submissions(email, created_at);
CREATE INDEX idx_test_submissions_ip_created ON public.test_submissions(ip_address, created_at);

-- Enable RLS
ALTER TABLE public.test_submissions ENABLE ROW LEVEL SECURITY;

-- Only service role can insert (edge functions)
CREATE POLICY "Service role can insert submissions"
  ON public.test_submissions
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Only service role can read (for rate limit checks)
CREATE POLICY "Service role can read submissions"
  ON public.test_submissions
  FOR SELECT
  TO service_role
  USING (true);

-- No public access to prevent manipulation of rate limits