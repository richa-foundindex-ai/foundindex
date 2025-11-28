-- Create table to store per-test analysis results
CREATE TABLE IF NOT EXISTS public.test_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id text NOT NULL,
  website text NOT NULL,
  test_type text NOT NULL,
  detected_type text,
  score integer NOT NULL,
  grade text NOT NULL,
  categories jsonb NOT NULL,
  recommendations jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Ensure each test_id only appears once
CREATE UNIQUE INDEX IF NOT EXISTS idx_test_history_test_id ON public.test_history (test_id);

-- Enable RLS and allow public read access (no sensitive data stored here)
ALTER TABLE public.test_history ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'test_history' AND policyname = 'Test history is viewable by everyone'
  ) THEN
    CREATE POLICY "Test history is viewable by everyone"
    ON public.test_history
    FOR SELECT
    USING (true);
  END IF;
END $$;

-- Create contacts table for contact form submissions
CREATE TABLE IF NOT EXISTS public.contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  name text NOT NULL,
  email text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL
);

-- Enable RLS; no public policies so only service role can access via backend functions
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;