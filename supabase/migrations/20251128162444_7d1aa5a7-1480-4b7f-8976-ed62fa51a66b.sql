-- Create beta_applications table
CREATE TABLE public.beta_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  website TEXT NOT NULL,
  content_type TEXT NOT NULL,
  why_apply TEXT,
  allow_case_study BOOLEAN NOT NULL DEFAULT false,
  commitment_confirmed BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT
);

-- Enable Row Level Security
ALTER TABLE public.beta_applications ENABLE ROW LEVEL SECURITY;

-- Create policies for service role access
CREATE POLICY "Service role can manage beta applications"
ON public.beta_applications
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Create index on email for faster lookups
CREATE INDEX idx_beta_applications_email ON public.beta_applications(email);
CREATE INDEX idx_beta_applications_status ON public.beta_applications(status);