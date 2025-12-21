-- Create ai_interpretations table to store AI analysis of websites
CREATE TABLE public.ai_interpretations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  test_id TEXT NOT NULL UNIQUE,
  url_tested TEXT NOT NULL,
  interpretation TEXT NOT NULL,
  industry TEXT NOT NULL,
  audience TEXT NOT NULL,
  problem TEXT NOT NULL,
  solution TEXT NOT NULL,
  confidence_score INTEGER NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 100),
  confidence_breakdown JSONB NOT NULL DEFAULT '{}'::jsonb,
  user_accuracy_feedback TEXT CHECK (user_accuracy_feedback IN ('accurate', 'close', 'wrong')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.ai_interpretations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (deny public access, service role bypasses RLS)
CREATE POLICY "Deny public reads on ai_interpretations" 
ON public.ai_interpretations 
FOR SELECT 
USING (false);

CREATE POLICY "Deny public updates on ai_interpretations" 
ON public.ai_interpretations 
FOR UPDATE 
USING (false);

CREATE POLICY "Deny public deletes on ai_interpretations" 
ON public.ai_interpretations 
FOR DELETE 
USING (false);

CREATE POLICY "Deny public inserts on ai_interpretations" 
ON public.ai_interpretations 
FOR INSERT 
WITH CHECK (false);

-- Create index on test_id for faster lookups
CREATE INDEX idx_ai_interpretations_test_id ON public.ai_interpretations(test_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_ai_interpretations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_ai_interpretations_timestamp
BEFORE UPDATE ON public.ai_interpretations
FOR EACH ROW
EXECUTE FUNCTION public.update_ai_interpretations_updated_at();