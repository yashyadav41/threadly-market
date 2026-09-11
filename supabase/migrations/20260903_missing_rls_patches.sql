-- ============================================================
-- CONSOLIDATION MIGRATION — records fixes that were previously
-- applied directly in the Supabase SQL Editor during development
-- but were never saved to version control. This file makes the
-- repo a complete, reproducible record of the live database.
--
-- These changes are ALREADY LIVE on the project's Supabase
-- instance — this file does not need to be run again there.
-- It exists so a fresh Supabase project set up from this repo's
-- migrations, in order, ends up in the same working state.
-- ============================================================

-- 1. RLS infinite recursion fix (orders <-> order_items).
--    The original policies on these two tables each queried the
--    other in a circular reference, causing Postgres to fail with
--    "infinite recursion detected in policy for relation orders".
--    These SECURITY DEFINER helper functions break the loop.
CREATE OR REPLACE FUNCTION public.current_user_is_admin() RETURNS boolean
LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin');
$$;

CREATE OR REPLACE FUNCTION public.user_owns_order(p_order_id uuid) RETURNS boolean
LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (SELECT 1 FROM public.orders WHERE id = p_order_id AND user_id = auth.uid());
$$;

CREATE OR REPLACE FUNCTION public.user_is_order_seller(p_order_id uuid) RETURNS boolean
LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.order_items oi
    JOIN public.sellers s ON s.id = oi.seller_id
    WHERE oi.order_id = p_order_id AND s.user_id = auth.uid()
  );
$$;

DROP POLICY IF EXISTS "orders_select_own_or_seller" ON public.orders;
CREATE POLICY "orders_select_own_or_seller" ON public.orders FOR SELECT TO authenticated
USING (
  user_id = auth.uid()
  OR public.user_is_order_seller(id)
  OR public.current_user_is_admin()
);

DROP POLICY IF EXISTS "order_items_select_related" ON public.order_items;
CREATE POLICY "order_items_select_related" ON public.order_items FOR SELECT TO authenticated
USING (
  public.user_owns_order(order_id)
  OR EXISTS (SELECT 1 FROM public.sellers s WHERE s.id = order_items.seller_id AND s.user_id = auth.uid())
  OR public.current_user_is_admin()
);

DROP POLICY IF EXISTS "order_items_insert_customer" ON public.order_items;
CREATE POLICY "order_items_insert_customer" ON public.order_items FOR INSERT TO authenticated
WITH CHECK (public.user_owns_order(order_id));

-- 2. sellers table had RLS enabled but ZERO policies at all,
--    meaning nobody (not even a seller viewing their own store)
--    could read or update their own row. NOTE: the INSERT policy
--    below is superseded by the tightened version in
--    20260910_security_fixes.sql (that migration runs after this
--    one and closes a self-approval hole in the original version).
DROP POLICY IF EXISTS "sellers_select_own_or_public_or_admin" ON public.sellers;
CREATE POLICY "sellers_select_own_or_public_or_admin" ON public.sellers FOR SELECT TO anon, authenticated
USING (
  status = 'approved'
  OR user_id = auth.uid()
  OR public.current_user_is_admin()
);

DROP POLICY IF EXISTS "sellers_update_own_or_admin" ON public.sellers;
CREATE POLICY "sellers_update_own_or_admin" ON public.sellers FOR UPDATE TO authenticated
USING (user_id = auth.uid() OR public.current_user_is_admin())
WITH CHECK (user_id = auth.uid() OR public.current_user_is_admin());

DROP POLICY IF EXISTS "sellers_admin_insert" ON public.sellers;
CREATE POLICY "sellers_admin_insert" ON public.sellers FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid() OR public.current_user_is_admin());

-- 3. Safe public view exposing only display_name (not phone/other
--    private profile fields) so review author names can be shown
--    to viewers who aren't the review's author.
CREATE OR REPLACE VIEW public.profile_public_names AS
SELECT id, display_name FROM public.profiles;

GRANT SELECT ON public.profile_public_names TO anon, authenticated;

-- 4. Keeps products.rating / products.review_count automatically
--    in sync with real reviews, instead of showing static seed data.
CREATE OR REPLACE FUNCTION public.update_product_rating() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  target_product_id uuid;
BEGIN
  target_product_id := COALESCE(NEW.product_id, OLD.product_id);
  UPDATE public.products
  SET rating = COALESCE((SELECT ROUND(AVG(rating)::numeric, 1) FROM public.reviews WHERE product_id = target_product_id AND status = 'published'), rating),
      review_count = (SELECT COUNT(*) FROM public.reviews WHERE product_id = target_product_id AND status = 'published')
  WHERE id = target_product_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS reviews_update_product_rating ON public.reviews;
CREATE TRIGGER reviews_update_product_rating
AFTER INSERT OR UPDATE OR DELETE ON public.reviews
FOR EACH ROW EXECUTE FUNCTION public.update_product_rating();

UPDATE public.products p
SET rating = COALESCE((SELECT ROUND(AVG(rating)::numeric, 1) FROM public.reviews r WHERE r.product_id = p.id AND r.status = 'published'), p.rating),
    review_count = COALESCE((SELECT COUNT(*) FROM public.reviews r WHERE r.product_id = p.id AND r.status = 'published'), 0)
WHERE EXISTS (SELECT 1 FROM public.reviews r WHERE r.product_id = p.id);
