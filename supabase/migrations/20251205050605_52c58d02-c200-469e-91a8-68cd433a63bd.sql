-- COMPREHENSIVE SECURITY FIX: Drop all permissive policies and create restrictive ones

-- ==========================================
-- BETA APPLICATIONS
-- ==========================================
DROP POLICY IF EXISTS "Enable read access for all users" ON public.beta_applications;
DROP POLICY IF EXISTS "Service role can read beta applications" ON public.beta_applications;
DROP POLICY IF EXISTS "Deny all public reads on beta_applications" ON public.beta_applications;
DROP POLICY IF EXISTS "Deny all public updates on beta_applications" ON public.beta_applications;
DROP POLICY IF EXISTS "Deny all public deletes on beta_applications" ON public.beta_applications;

CREATE POLICY "Deny all public reads on beta_applications"
ON public.beta_applications
FOR SELECT TO authenticated, anon
USING (false);

CREATE POLICY "Deny all public updates on beta_applications"
ON public.beta_applications
FOR UPDATE TO authenticated, anon
USING (false);

CREATE POLICY "Deny all public deletes on beta_applications"
ON public.beta_applications
FOR DELETE TO authenticated, anon
USING (false);

-- ==========================================
-- TEST HISTORY
-- ==========================================
DROP POLICY IF EXISTS "Test history is viewable by everyone" ON public.test_history;
DROP POLICY IF EXISTS "Service role can read test history" ON public.test_history;
DROP POLICY IF EXISTS "Deny all public reads on test_history" ON public.test_history;
DROP POLICY IF EXISTS "Deny all public updates on test_history" ON public.test_history;
DROP POLICY IF EXISTS "Deny all public deletes on test_history" ON public.test_history;

CREATE POLICY "Deny all public reads on test_history"
ON public.test_history
FOR SELECT TO authenticated, anon
USING (false);

CREATE POLICY "Deny all public updates on test_history"
ON public.test_history
FOR UPDATE TO authenticated, anon
USING (false);

CREATE POLICY "Deny all public deletes on test_history"
ON public.test_history
FOR DELETE TO authenticated, anon
USING (false);

-- ==========================================
-- TEST SUBMISSIONS
-- ==========================================
DROP POLICY IF EXISTS "Service role can read submissions" ON public.test_submissions;
DROP POLICY IF EXISTS "Deny all public reads on test_submissions" ON public.test_submissions;

CREATE POLICY "Deny all public reads on test_submissions"
ON public.test_submissions
FOR SELECT TO authenticated, anon
USING (false);

-- ==========================================
-- CONTACTS
-- ==========================================
DROP POLICY IF EXISTS "Deny all public reads on contacts" ON public.contacts;
DROP POLICY IF EXISTS "Deny all public updates on contacts" ON public.contacts;
DROP POLICY IF EXISTS "Deny all public deletes on contacts" ON public.contacts;

CREATE POLICY "Deny all public reads on contacts"
ON public.contacts
FOR SELECT TO authenticated, anon
USING (false);

CREATE POLICY "Deny all public updates on contacts"
ON public.contacts
FOR UPDATE TO authenticated, anon
USING (false);

CREATE POLICY "Deny all public deletes on contacts"
ON public.contacts
FOR DELETE TO authenticated, anon
USING (false);

-- ==========================================
-- FEEDBACK
-- ==========================================
DROP POLICY IF EXISTS "Service role can read feedback" ON public.feedback;
DROP POLICY IF EXISTS "Deny all public reads on feedback" ON public.feedback;
DROP POLICY IF EXISTS "Deny all public updates on feedback" ON public.feedback;
DROP POLICY IF EXISTS "Deny all public deletes on feedback" ON public.feedback;

CREATE POLICY "Deny all public reads on feedback"
ON public.feedback
FOR SELECT TO authenticated, anon
USING (false);

CREATE POLICY "Deny all public updates on feedback"
ON public.feedback
FOR UPDATE TO authenticated, anon
USING (false);

CREATE POLICY "Deny all public deletes on feedback"
ON public.feedback
FOR DELETE TO authenticated, anon
USING (false);