-- Create feedback table for storing user feedback from results page
CREATE TABLE public.feedback (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  test_id text NOT NULL,
  score integer NOT NULL,
  website text NOT NULL,
  surprising_result text NOT NULL,
  describe_to_colleague text NOT NULL,
  preventing_improvements text NOT NULL,
  user_type text NOT NULL,
  email text NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Create policy for service role to insert feedback
CREATE POLICY "Service role can insert feedback" 
ON public.feedback 
FOR INSERT 
WITH CHECK (true);

-- Create policy for service role to read feedback
CREATE POLICY "Service role can read feedback" 
ON public.feedback 
FOR SELECT 
USING (true);

-- Add performance indexes (using IF NOT EXISTS to avoid conflicts)
CREATE INDEX IF NOT EXISTS idx_test_history_created ON test_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_test_history_website ON test_history(website);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
CREATE INDEX IF NOT EXISTS idx_beta_applications_email ON beta_applications(email);
CREATE INDEX IF NOT EXISTS idx_beta_applications_status ON beta_applications(status);
CREATE INDEX IF NOT EXISTS idx_feedback_email ON feedback(email);
CREATE INDEX IF NOT EXISTS idx_feedback_test_id ON feedback(test_id);