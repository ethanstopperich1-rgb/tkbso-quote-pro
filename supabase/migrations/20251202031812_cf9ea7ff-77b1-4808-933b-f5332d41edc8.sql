-- Fix security: Set search_path for update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql 
SET search_path = public;

COMMENT ON FUNCTION public.update_updated_at_column() IS 'Trigger function to automatically update updated_at timestamp';