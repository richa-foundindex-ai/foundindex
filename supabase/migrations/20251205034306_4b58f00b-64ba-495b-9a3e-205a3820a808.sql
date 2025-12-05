-- Fix PII exposure: restrict beta_applications table access
-- Drop the overly permissive ALL policy
DROP POLICY IF EXISTS "Service role can manage beta applications" ON public.beta_applications;

-- Allow inserts (needed for form submissions via edge function with service role)
CREATE POLICY "Service role can insert beta applications"
ON public.beta_applications
FOR INSERT
TO authenticated, anon
WITH CHECK (true);

-- Deny all reads to regular users (service role can still read)
CREATE POLICY "Deny reads on beta applications"
ON public.beta_applications
FOR SELECT
TO authenticated, anon
USING (false);

-- Deny updates to regular users
CREATE POLICY "Deny updates on beta applications"
ON public.beta_applications
FOR UPDATE
TO authenticated, anon
USING (false);

-- Deny deletes to regular users
CREATE POLICY "Deny deletes on beta applications"
ON public.beta_applications
FOR DELETE
TO authenticated, anon
USING (false);