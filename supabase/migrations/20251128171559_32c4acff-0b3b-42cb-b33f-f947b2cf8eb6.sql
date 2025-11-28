-- Add service role policy for contacts table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'contacts' AND policyname = 'Service role can insert contacts'
  ) THEN
    CREATE POLICY "Service role can insert contacts"
    ON public.contacts
    FOR INSERT
    WITH CHECK (true);
  END IF;
END $$;