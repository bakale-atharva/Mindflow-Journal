-- This trigger function ensures that only emails present in public.beta_access
-- with status = 'active' can be inserted into auth.users.
-- This prevents unauthorized users from bypassing the UI and using the Supabase API directly to sign up via magic link.

CREATE OR REPLACE FUNCTION public.enforce_beta_access_before_insert()
RETURNS TRIGGER AS $$
DECLARE
  v_is_allowed boolean;
BEGIN
  -- Check if the email exists in beta_access and is active
  SELECT EXISTS (
    SELECT 1 
    FROM public.beta_access 
    WHERE email = NEW.email 
      AND status = 'active'
  ) INTO v_is_allowed;

  IF NOT v_is_allowed THEN
    RAISE EXCEPTION 'Access denied: Email % is not on the active allowlist.', NEW.email;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the trigger if it already exists to allow idempotent runs
DROP TRIGGER IF EXISTS ensure_beta_access_on_signup ON auth.users;

-- Create the before insert trigger on auth.users
CREATE TRIGGER ensure_beta_access_on_signup
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_beta_access_before_insert();
