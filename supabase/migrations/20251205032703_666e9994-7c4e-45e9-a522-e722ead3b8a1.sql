-- Remove the overly permissive public SELECT policy
DROP POLICY IF EXISTS "Test history is viewable by everyone" ON public.test_history;

-- Add restrictive policy: only service role can read (through edge functions)
CREATE POLICY "Service role can read test history"
ON public.test_history
FOR SELECT
TO authenticated, anon
USING (false);

-- Allow service role to insert (for edge functions)
CREATE POLICY "Service role can insert test history"
ON public.test_history
FOR INSERT
WITH CHECK (true);

-- Add explicit deny policies for UPDATE and DELETE on test_submissions
CREATE POLICY "Deny updates on test_submissions"
ON public.test_submissions
FOR UPDATE
USING (false);

CREATE POLICY "Deny deletes on test_submissions"
ON public.test_submissions
FOR DELETE
USING (false);