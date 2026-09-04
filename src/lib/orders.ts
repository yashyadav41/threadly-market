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

const DEFAULT_COMMISSION_RATE = 10.0;

/**
 * Writes a real order + its line items to Supabase.
 * Throws on failure so the caller can show an error instead of
 * pretending the order succeeded.
 */
export async function placeOrderInDb(input: PlaceOrderInput): Promise<{ id: string; orderNumber: string }> {
  const orderNumber = 'TH-' + Math.random().toString(36).substring(2, 8).toUpperCase();

  const { data: orderRow, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: input.userId,
      order_number: orderNumber,
      subtotal: input.subtotal,
      discount: input.discount,
      shipping: input.shipping,
      total: input.total,
      payment_method: input.paymentMethod,
      payment_status: 'simulated',
      status: 'confirmed',
      shipping_snapshot: input.address,
    })
    .select('id, order_number')
    .single();

  if (orderError || !orderRow) {
    throw new Error(orderError?.message ?? 'Failed to create order.');
  }

  const productIds = [...new Set(input.items.map((i) => i.id))];
  const { data: productRows, error: productsError } = await supabase
    .from('products')
    .select('id, seller_id')
    .in('id', productIds);

  if (productsError) {
    throw new Error(productsError.message);
  }

  const sellerIdByProduct = new Map((productRows ?? []).map((p) => [p.id, p.seller_id]));

  const orderItemsPayload = input.items.map((item) => ({
    order_id: orderRow.id,
    product_id: item.id,
    seller_id: sellerIdByProduct.get(item.id) ?? null,
    product_name: item.name,
    size: item.size,
    color: item.color,
    quantity: item.quantity,
    unit_price: item.price,
    commission_rate: DEFAULT_COMMISSION_RATE,
  }));

  const { error: itemsError } = await supabase.from('order_items').insert(orderItemsPayload);
  if (itemsError) {
    throw new Error(itemsError.message);
  }

  return { id: orderRow.id, orderNumber: orderRow.order_number };
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