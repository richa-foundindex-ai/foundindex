-- Fix: feedback table has overly permissive SELECT policy exposing PII
-- Drop the permissive read policy
DROP POLICY IF EXISTS "Service role can read feedback" ON public.feedback;

-- Create restrictive policy that denies all public reads
CREATE POLICY "Deny reads on feedback" 
ON public.feedback 
AS RESTRICTIVE
FOR SELECT 
USING (false);

-- Add explicit deny policies for contacts table (defense in depth)
CREATE POLICY "Deny reads on contacts" 
ON public.contacts 
AS RESTRICTIVE
FOR SELECT 
USING (false);

CREATE POLICY "Deny updates on contacts" 
ON public.contacts 
AS RESTRICTIVE
FOR UPDATE 
USING (false);

CREATE POLICY "Deny deletes on contacts" 
ON public.contacts 
AS RESTRICTIVE
FOR DELETE 
USING (false);

-- Add explicit deny for test_history updates/deletes
CREATE POLICY "Deny updates on test history" 
ON public.test_history 
AS RESTRICTIVE
FOR UPDATE 
USING (false);

CREATE POLICY "Deny deletes on test history" 
ON public.test_history 
AS RESTRICTIVE
FOR DELETE 
USING (false);

-- Add explicit deny for feedback updates/deletes
CREATE POLICY "Deny updates on feedback" 
ON public.feedback 
AS RESTRICTIVE
FOR UPDATE 
USING (false);

CREATE POLICY "Deny deletes on feedback" 
ON public.feedback 
AS RESTRICTIVE
FOR DELETE 
USING (false);