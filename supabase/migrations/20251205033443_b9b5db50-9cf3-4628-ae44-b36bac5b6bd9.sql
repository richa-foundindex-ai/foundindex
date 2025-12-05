-- Fix PII exposure: restrict test_submissions reads to service role only
DROP POLICY IF EXISTS "Service role can read submissions" ON public.test_submissions;

CREATE POLICY "Service role can read submissions"
ON public.test_submissions
FOR SELECT
TO authenticated, anon
USING (false);