-- ============================================================
-- Automatic profile + customer role creation on signup.
--
-- Previously, the client (src/lib/auth.ts signUp()) inserted the
-- profiles/user_roles rows itself right after signUp(). That only
-- worked when email confirmation was OFF, because with confirmation
-- required there's no active session yet at that point, and RLS
-- correctly blocks the insert (auth.uid() is null in that request).
--
-- This trigger runs at the database level on every new auth.users
-- row, regardless of confirmation state, so the profile and default
-- 'customer' role always exist immediately — the client no longer
-- needs to (and no longer does) create them itself.
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''))
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'customer')
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- One-time backfill: any existing auth user missing a profile/role row
-- (e.g. an account that signed up while confirmation was required,
-- before this trigger existed) gets one created now. Never overwrites
-- an existing row — ON CONFLICT DO NOTHING, and the WHERE NOT EXISTS
-- guard means only genuinely missing rows are touched.
INSERT INTO public.profiles (id, display_name)
SELECT u.id, COALESCE(u.raw_user_meta_data->>'full_name', '')
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'customer'
FROM auth.users u
LEFT JOIN public.user_roles r ON r.user_id = u.id
WHERE r.user_id IS NULL
ON CONFLICT (user_id) DO NOTHING;
