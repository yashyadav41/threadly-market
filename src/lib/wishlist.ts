import { supabase } from './supabase';

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

export async function replaceWishlistIds(userId: string, ids: string[]): Promise<void> {
  const { error: delError } = await supabase.from('wishlist_items').delete().eq('user_id', userId);
  if (delError) { console.error('replaceWishlistIds delete failed:', delError.message); return; }

  if (ids.length === 0) return;

  const { error: insError } = await supabase
    .from('wishlist_items')
    .insert(ids.map((id) => ({ user_id: userId, product_id: id })));
  if (insError) console.error('replaceWishlistIds insert failed:', insError.message);
}