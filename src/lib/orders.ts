import { supabase } from './supabase';

export interface OrderCartItem {
  id: string; // product id
  name: string;
  price: number;
  quantity: number;
  size: string;
  color: string;
}

export interface PlaceOrderInput {
  userId: string;
  items: OrderCartItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  paymentMethod: 'demo_card' | 'demo_upi' | 'cod_demo';
  address: { name: string; phone: string; address: string; city: string; postal: string };
}


/**
 * Places an order atomically via the `place_order` database function:
 * inserts the order, decrements per-size stock, and inserts order_items
 * all inside a single database transaction. If any item doesn't have
 * enough stock, the whole order fails and nothing is written — no
 * partial orders, no overselling.
 */
export async function placeOrderInDb(input: PlaceOrderInput): Promise<{ id: string; orderNumber: string }> {
  const items = input.items.map((item) => ({
    product_id: item.id,
    product_name: item.name,
    size: item.size,
    color: item.color,
    quantity: item.quantity,
    unit_price: item.price,
  }));

  const { data, error } = await supabase.rpc('place_order', {
    p_items: items,
    p_subtotal: input.subtotal,
    p_discount: input.discount,
    p_shipping: input.shipping,
    p_total: input.total,
    p_payment_method: input.paymentMethod,
    p_address: input.address,
  });

  if (error) {
    throw new Error(error.message);
  }

  return { id: data.id, orderNumber: data.order_number };
}

// === Fetch order history for the current user ===

export interface FetchedOrder {
  id: string;
  items: {
    productId: string; name: string; brand: string; image: string;
    size: string; color: string; quantity: number; price: number; seller: string;
  }[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  paymentMethod: 'demo_card' | 'demo_upi' | 'cod_demo';
  paymentLabel: string;
  status: 'Pending' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  date: string;
  customer: string;
  address: { name: string; phone: string; address: string; city: string; postal: string };
}

const PAYMENT_LABELS: Record<string, string> = {
  demo_card: 'Demo Card',
  demo_upi: 'Demo UPI',
  cod_demo: 'Cash on Delivery',
};

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export async function fetchOrdersForUser(userId: string, customerName: string): Promise<FetchedOrder[]> {
  const { data: orderRows, error: ordersError } = await supabase
    .from('orders')
    .select('id, order_number, subtotal, discount, shipping, total, payment_method, status, shipping_snapshot, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (ordersError || !orderRows || orderRows.length === 0) {
    if (ordersError) console.error('fetchOrdersForUser failed:', ordersError.message);
    return [];
  }

  const orderIds = orderRows.map((o) => o.id);
  const { data: itemRows, error: itemsError } = await supabase
    .from('order_items')
    .select('order_id, product_id, product_name, size, color, quantity, unit_price, products ( image_urls, brands ( name ) ), sellers ( business_name )')
    .in('order_id', orderIds);

  if (itemsError) {
    console.error('fetchOrdersForUser (items) failed:', itemsError.message);
  }

  const itemsByOrder = new Map<string, FetchedOrder['items']>();
  for (const row of (itemRows ?? []) as any[]) {
    const list = itemsByOrder.get(row.order_id) ?? [];
    list.push({
      productId: row.product_id ?? '',
      name: row.product_name,
      brand: row.products?.brands?.name ?? 'Unknown',
      image: row.products?.image_urls?.[0] ?? '',
      size: row.size,
      color: row.color,
      quantity: row.quantity,
      price: Number(row.unit_price),
      seller: row.sellers?.business_name ?? 'Unknown Seller',
    });
    itemsByOrder.set(row.order_id, list);
  }

  return orderRows.map((row): FetchedOrder => ({
    id: row.order_number,
    items: itemsByOrder.get(row.id) ?? [],
    subtotal: Number(row.subtotal),
    discount: Number(row.discount),
    shipping: Number(row.shipping),
    total: Number(row.total),
    paymentMethod: row.payment_method as FetchedOrder['paymentMethod'],
    paymentLabel: PAYMENT_LABELS[row.payment_method] ?? row.payment_method,
    status: capitalize(row.status) as FetchedOrder['status'],
    date: new Date(row.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
    customer: customerName,
    address: (row.shipping_snapshot as FetchedOrder['address']) ?? { name: '', phone: '', address: '', city: '', postal: '' },
  }));
}

// === Look up display names for a set of customers (used by admin/seller views) ===
async function fetchCustomerNames(userIds: string[]): Promise<Map<string, string>> {
  const uniqueIds = [...new Set(userIds)];
  if (uniqueIds.length === 0) return new Map();
  const { data, error } = await supabase
    .from('profile_public_names')
    .select('id, display_name')
    .in('id', uniqueIds);
  if (error) {
    console.error('fetchCustomerNames failed:', error.message);
    return new Map();
  }
  return new Map((data ?? []).map((r) => [r.id, r.display_name || 'Threadly customer']));
}

function mapOrderRow(
  row: { id: string; order_number: string; subtotal: number; discount: number; shipping: number; total: number; payment_method: string; status: string; shipping_snapshot: unknown; created_at: string },
  items: FetchedOrder['items'],
  customerName: string
): FetchedOrder {
  return {
    id: row.order_number,
    items,
    subtotal: Number(row.subtotal),
    discount: Number(row.discount),
    shipping: Number(row.shipping),
    total: Number(row.total),
    paymentMethod: row.payment_method as FetchedOrder['paymentMethod'],
    paymentLabel: PAYMENT_LABELS[row.payment_method] ?? row.payment_method,
    status: capitalize(row.status) as FetchedOrder['status'],
    date: new Date(row.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
    customer: customerName,
    address: (row.shipping_snapshot as FetchedOrder['address']) ?? { name: '', phone: '', address: '', city: '', postal: '' },
  };
}

/**
 * Admin-only: every order on the platform, with every item.
 * Relies on the existing `orders_select_own_or_seller` RLS policy's
 * admin clause — no `user_id` filter here, unlike fetchOrdersForUser.
 */
export async function fetchAllOrdersForAdmin(): Promise<FetchedOrder[]> {
  const { data: orderRows, error: ordersError } = await supabase
    .from('orders')
    .select('id, order_number, subtotal, discount, shipping, total, payment_method, status, shipping_snapshot, created_at, user_id')
    .order('created_at', { ascending: false });

  if (ordersError) throw new Error(ordersError.message);
  if (!orderRows || orderRows.length === 0) return [];

  const orderIds = orderRows.map((o) => o.id);
  const { data: itemRows, error: itemsError } = await supabase
    .from('order_items')
    .select('order_id, product_id, product_name, size, color, quantity, unit_price, products ( image_urls, brands ( name ) ), sellers ( business_name )')
    .in('order_id', orderIds);

  if (itemsError) throw new Error(itemsError.message);

  const itemsByOrder = new Map<string, FetchedOrder['items']>();
  for (const row of (itemRows ?? []) as any[]) {
    const list = itemsByOrder.get(row.order_id) ?? [];
    list.push({
      productId: row.product_id ?? '',
      name: row.product_name,
      brand: row.products?.brands?.name ?? 'Unknown',
      image: row.products?.image_urls?.[0] ?? '',
      size: row.size,
      color: row.color,
      quantity: row.quantity,
      price: Number(row.unit_price),
      seller: row.sellers?.business_name ?? 'Unknown Seller',
    });
    itemsByOrder.set(row.order_id, list);
  }

  const customerNames = await fetchCustomerNames(orderRows.map((o) => o.user_id));

  return orderRows.map((row) =>
    mapOrderRow(row, itemsByOrder.get(row.id) ?? [], customerNames.get(row.user_id) ?? 'Threadly customer')
  );
}

/**
 * Seller-only: every order that contains at least one of this seller's
 * products, showing only THIS seller's items/subtotal for that order
 * (not other sellers' items in the same multi-seller order). Uses the
 * real `seller_id` relationship — never business-name matching.
 */
export async function fetchOrdersForSeller(sellerId: string): Promise<FetchedOrder[]> {
  const { data: itemRows, error: itemsError } = await supabase
    .from('order_items')
    .select('order_id, product_id, product_name, size, color, quantity, unit_price, products ( image_urls, brands ( name ) ), sellers ( business_name )')
    .eq('seller_id', sellerId);

  if (itemsError) throw new Error(itemsError.message);
  if (!itemRows || itemRows.length === 0) return [];

  const itemsByOrder = new Map<string, FetchedOrder['items']>();
  const subtotalByOrder = new Map<string, number>();
  for (const row of itemRows as any[]) {
    const list = itemsByOrder.get(row.order_id) ?? [];
    list.push({
      productId: row.product_id ?? '',
      name: row.product_name,
      brand: row.products?.brands?.name ?? 'Unknown',
      image: row.products?.image_urls?.[0] ?? '',
      size: row.size,
      color: row.color,
      quantity: row.quantity,
      price: Number(row.unit_price),
      seller: row.sellers?.business_name ?? 'Unknown Seller',
    });
    itemsByOrder.set(row.order_id, list);
    subtotalByOrder.set(row.order_id, (subtotalByOrder.get(row.order_id) ?? 0) + Number(row.unit_price) * row.quantity);
  }

  const orderIds = [...itemsByOrder.keys()];
  const { data: orderRows, error: ordersError } = await supabase
    .from('orders')
    .select('id, order_number, payment_method, status, shipping_snapshot, created_at, user_id')
    .in('id', orderIds)
    .order('created_at', { ascending: false });

  if (ordersError) throw new Error(ordersError.message);
  if (!orderRows) return [];

  const customerNames = await fetchCustomerNames(orderRows.map((o) => o.user_id));

  // Sellers see only their own portion of a multi-seller order — not the
  // buyer's full order total, discount, or shipping (that's not theirs to see).
  return orderRows.map((row) => {
    const sellerSubtotal = subtotalByOrder.get(row.id) ?? 0;
    return mapOrderRow(
      { ...row, subtotal: sellerSubtotal, discount: 0, shipping: 0, total: sellerSubtotal },
      itemsByOrder.get(row.id) ?? [],
      customerNames.get(row.user_id) ?? 'Threadly customer'
    );
  });
}
