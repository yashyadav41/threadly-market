import { supabase } from './supabase';

/** Fetch the logged-in user's saved wishlist product IDs. */
export async function fetchWishlistIds(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('wishlist_items')
    .select('product_id')
    .eq('user_id', userId);

  if (error) {
    console.error('fetchWishlistIds failed:', error.message);
    return [];
  }
  return (data ?? []).map((r) => r.product_id);
}

/**
 * Replaces the user's entire saved wishlist with the given product IDs.
 * Deletes rows no longer wishlisted, then upserts the current ones —
 * upsert instead of a plain insert avoids a duplicate-key error if
 * two syncs happen to overlap in quick succession (same fix already
 * applied to cart.ts).
 */
export async function replaceWishlistIds(userId: string, ids: string[]): Promise<void> {
  const { error: delError } = await supabase.from('wishlist_items').delete().eq('user_id', userId);
  if (delError) { console.error('replaceWishlistIds delete failed:', delError.message); return; }

  if (ids.length === 0) return;

  const { error: insError } = await supabase
    .from('wishlist_items')
    .upsert(ids.map((id) => ({ user_id: userId, product_id: id })), { onConflict: 'user_id,product_id' });
  if (insError) console.error('replaceWishlistIds insert failed:', insError.message);
}
