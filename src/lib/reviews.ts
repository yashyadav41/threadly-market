import { supabase } from './supabase';

export interface ReviewRow {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  reviewerName: string;
}

export async function fetchReviewsForProduct(productId: string): Promise<ReviewRow[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select('id, user_id, rating, comment, created_at')
    .eq('product_id', productId)
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('fetchReviewsForProduct failed:', error.message);
    return [];
  }
  if (!data || data.length === 0) return [];

  const userIds = [...new Set(data.map((r) => r.user_id))];
  const { data: names } = await supabase
    .from('profile_public_names')
    .select('id, display_name')
    .in('id', userIds);
  const nameById = new Map((names ?? []).map((n) => [n.id, n.display_name]));

  return data.map((r) => ({
    id: r.id,
    rating: r.rating,
    comment: r.comment,
    created_at: r.created_at,
    reviewerName: nameById.get(r.user_id) || 'Threadly customer',
  }));
}

/**
 * Finds an order of this user's that contains the given product and
 * doesn't already have a review from them — i.e. whether they're
 * eligible to leave a new review right now. Returns the order_id to
 * use, or null if they have nothing left to review.
 */
export async function findReviewableOrderId(userId: string, productId: string): Promise<string | null> {
  const { data: purchasedOrders, error: purchaseError } = await supabase
    .from('order_items')
    .select('order_id, orders!inner(user_id)')
    .eq('product_id', productId)
    .eq('orders.user_id', userId);

  if (purchaseError || !purchasedOrders || purchasedOrders.length === 0) return null;

  const { data: existingReviews, error: reviewError } = await supabase
    .from('reviews')
    .select('order_id')
    .eq('user_id', userId)
    .eq('product_id', productId);

  if (reviewError) return null;

  const reviewedOrderIds = new Set((existingReviews ?? []).map((r) => r.order_id));
  const eligible = purchasedOrders.find((o: any) => !reviewedOrderIds.has(o.order_id));
  return eligible ? (eligible as any).order_id : null;
}

export async function submitReview(userId: string, productId: string, orderId: string, rating: number, comment: string): Promise<void> {
  const { error } = await supabase.from('reviews').insert({
    user_id: userId, product_id: productId, order_id: orderId, rating, comment,
  });
  if (error) throw new Error(error.message);
}
