-- ============================================================
-- CRITICAL security fixes found in production-readiness audit
-- ============================================================

-- FIX 1: sellers table allowed any customer to self-insert with
-- status='approved' directly via the API, completely bypassing the
-- seller_applications -> admin approval workflow. Restrict self-insert
-- to 'pending' only; only an admin can insert an 'approved' row.
DROP POLICY IF EXISTS "sellers_admin_insert" ON public.sellers;
CREATE POLICY "sellers_admin_insert" ON public.sellers FOR INSERT TO authenticated
WITH CHECK (
  (user_id = auth.uid() AND status = 'pending')
  OR public.current_user_is_admin()
);

-- FIX 2: sellers table also allowed a seller to UPDATE their own
-- status field directly (e.g. reactivate themselves after being
-- suspended by an admin), and their own commission_rate (e.g. set
-- it to 0%). A trigger silently keeps both fields unchanged for any
-- non-admin update, while still allowing legitimate self-edits
-- (business_name, description) to go through normally.
CREATE OR REPLACE FUNCTION public.protect_seller_status() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NOT public.current_user_is_admin() THEN
    NEW.status := OLD.status;
    NEW.commission_rate := OLD.commission_rate;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sellers_protect_status ON public.sellers;
CREATE TRIGGER sellers_protect_status
BEFORE UPDATE ON public.sellers
FOR EACH ROW EXECUTE FUNCTION public.protect_seller_status();

-- FIX 3: products table (original schema, pre-existing) allowed a
-- seller to UPDATE their own product's status field directly (e.g.
-- setting a pending product straight to 'approved'), bypassing admin
-- moderation entirely. Same trigger technique: non-admin updates keep
-- the existing status, while normal edits (price, stock, etc.) still work.
CREATE OR REPLACE FUNCTION public.protect_product_status() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NOT public.current_user_is_admin() THEN
    NEW.status := OLD.status;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS products_protect_status ON public.products;
CREATE TRIGGER products_protect_status
BEFORE UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.protect_product_status();

-- FIX 4: seller_applications INSERT policy didn't restrict the
-- `status` column, so a submitted application could claim
-- status='approved' from the moment it's created (instead of the
-- intended 'pending'). This doesn't grant real seller access on its
-- own (only an actual `sellers` row does, per FIX 1 above), but it's
-- misleading data an admin might otherwise trust at face value.
DROP POLICY IF EXISTS "applications_insert_own" ON public.seller_applications;
CREATE POLICY "applications_insert_own" ON public.seller_applications FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid() AND status = 'pending');
