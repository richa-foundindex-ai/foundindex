-- Create table for foundindex insights
CREATE TABLE public.foundindex_insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  url_tested TEXT NOT NULL,
  situation_selected TEXT NOT NULL,
  problem_description TEXT,
  email_consent BOOLEAN NOT NULL DEFAULT false,
  email TEXT,
  user_email TEXT NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.foundindex_insights ENABLE ROW LEVEL SECURITY;

-- Deny all public reads
CREATE POLICY "Deny all public reads on foundindex_insights" 
ON public.foundindex_insights 
FOR SELECT 
USING (false);

-- Deny all public updates
CREATE POLICY "Deny all public updates on foundindex_insights" 
ON public.foundindex_insights 
FOR UPDATE 
USING (false);

-- Deny all public deletes
CREATE POLICY "Deny all public deletes on foundindex_insights" 
ON public.foundindex_insights 
FOR DELETE 
USING (false);

-- Service role can insert
CREATE POLICY "Service role can insert foundindex_insights" 
ON public.foundindex_insights 
FOR INSERT 
WITH CHECK (true);