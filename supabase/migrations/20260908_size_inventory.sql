-- ============================================================
-- Size-specific inventory: new table + RLS + backfill + sync
-- trigger + atomic order-placement function
-- ============================================================

-- 1. New table
CREATE TABLE IF NOT EXISTS public.product_size_inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  size text NOT NULL,
  stock integer NOT NULL DEFAULT 0 CHECK (stock >= 0),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (product_id, size)
);

ALTER TABLE public.product_size_inventory ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "size_inventory_select_public" ON public.product_size_inventory;
CREATE POLICY "size_inventory_select_public" ON public.product_size_inventory FOR SELECT TO anon, authenticated
USING (
  EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND p.status = 'approved')
  OR EXISTS (SELECT 1 FROM public.products p JOIN public.sellers s ON s.id = p.seller_id WHERE p.id = product_id AND s.user_id = auth.uid())
  OR public.current_user_is_admin()
);

DROP POLICY IF EXISTS "size_inventory_write_seller_or_admin" ON public.product_size_inventory;
CREATE POLICY "size_inventory_write_seller_or_admin" ON public.product_size_inventory FOR ALL TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.products p JOIN public.sellers s ON s.id = p.seller_id WHERE p.id = product_id AND s.user_id = auth.uid())
  OR public.current_user_is_admin()
)
WITH CHECK (
  EXISTS (SELECT 1 FROM public.products p JOIN public.sellers s ON s.id = p.seller_id WHERE p.id = product_id AND s.user_id = auth.uid())
  OR public.current_user_is_admin()
);

-- 2. Backfill: split each existing product's total stock evenly across its sizes.
--    (Per-size history never existed before, so this is an even estimate, not real history.)
INSERT INTO public.product_size_inventory (product_id, size, stock)
SELECT
  p.id,
  sz.size,
  (p.stock / GREATEST(array_length(p.sizes, 1), 1))
    + CASE WHEN sz.idx <= (p.stock % GREATEST(array_length(p.sizes, 1), 1)) THEN 1 ELSE 0 END
FROM public.products p
CROSS JOIN LATERAL unnest(p.sizes) WITH ORDINALITY AS sz(size, idx)
WHERE array_length(p.sizes, 1) > 0
ON CONFLICT (product_id, size) DO NOTHING;

-- 3. Keep products.stock automatically in sync with SUM(product_size_inventory.stock)
CREATE OR REPLACE FUNCTION public.sync_product_total_stock() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  target_product_id uuid;
BEGIN
  target_product_id := COALESCE(NEW.product_id, OLD.product_id);
  UPDATE public.products
  SET stock = COALESCE((SELECT SUM(stock) FROM public.product_size_inventory WHERE product_id = target_product_id), 0)
  WHERE id = target_product_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS size_inventory_sync_product_stock ON public.product_size_inventory;
CREATE TRIGGER size_inventory_sync_product_stock
AFTER INSERT OR UPDATE OR DELETE ON public.product_size_inventory
FOR EACH ROW EXECUTE FUNCTION public.sync_product_total_stock();

-- 4. Atomic order placement: one transaction, all-or-nothing.
--    Raises an exception (rolling back everything) if any item lacks stock.
CREATE OR REPLACE FUNCTION public.place_order(
  p_items jsonb,
  p_subtotal numeric,
  p_discount numeric,
  p_shipping numeric,
  p_total numeric,
  p_payment_method text,
  p_address jsonb
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_order_id uuid;
  v_order_number text;
  v_item jsonb;
  v_seller_id uuid;
  v_commission numeric;
  v_rows_affected int;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  v_order_number := 'TH-' || upper(substr(md5(random()::text), 1, 6));

  INSERT INTO public.orders (user_id, order_number, subtotal, discount, shipping, total, payment_method, payment_status, status, shipping_snapshot)
  VALUES (auth.uid(), v_order_number, p_subtotal, p_discount, p_shipping, p_total, p_payment_method, 'simulated', 'confirmed', p_address)
  RETURNING id INTO v_order_id;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    UPDATE public.product_size_inventory
    SET stock = stock - (v_item->>'quantity')::int, updated_at = now()
    WHERE product_id = (v_item->>'product_id')::uuid
      AND size = (v_item->>'size')
      AND stock >= (v_item->>'quantity')::int;

    GET DIAGNOSTICS v_rows_affected = ROW_COUNT;
    IF v_rows_affected = 0 THEN
      RAISE EXCEPTION 'Insufficient stock for % (size %)', v_item->>'product_name', v_item->>'size';
    END IF;

    SELECT seller_id INTO v_seller_id FROM public.products WHERE id = (v_item->>'product_id')::uuid;
    SELECT commission_rate INTO v_commission FROM public.sellers WHERE id = v_seller_id;

    INSERT INTO public.order_items (order_id, product_id, seller_id, product_name, size, color, quantity, unit_price, commission_rate)
    VALUES (v_order_id, (v_item->>'product_id')::uuid, v_seller_id, v_item->>'product_name', v_item->>'size', v_item->>'color', (v_item->>'quantity')::int, (v_item->>'unit_price')::numeric, COALESCE(v_commission, 10.00));
  END LOOP;

  RETURN jsonb_build_object('id', v_order_id, 'order_number', v_order_number);
END;
$$;

GRANT EXECUTE ON FUNCTION public.place_order TO authenticated;
