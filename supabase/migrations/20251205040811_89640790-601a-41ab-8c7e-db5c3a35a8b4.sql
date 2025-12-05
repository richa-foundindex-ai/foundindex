-- Fix beta_applications table
DROP POLICY IF EXISTS "Service role can read beta applications" ON public.beta_applications;
CREATE POLICY "Deny reads on beta_applications"
ON public.beta_applications
FOR SELECT TO authenticated, anon
USING (false);

-- Fix test_history table (if still has public access)
DROP POLICY IF EXISTS "Test history is viewable by everyone" ON public.test_history;
DROP POLICY IF EXISTS "Service role can read test history" ON public.test_history;
CREATE POLICY "Deny reads on test_history"
ON public.test_history
FOR SELECT TO authenticated, anon
USING (false);