import { supabase } from './supabase';

export interface CartRow {
  product_id: string;
  size: string;
  color: string;
  quantity: number;
}

/** Fetch the logged-in user's saved cart rows (product id + size/color/qty only). */
export async function fetchCartRows(userId: string): Promise<CartRow[]> {
  const { data, error } = await supabase
    .from('cart_items')
    .select('product_id, size, color, quantity')
    .eq('user_id', userId);

  if (error) {
    console.error('fetchCartRows failed:', error.message);
    return [];
  }
  return data ?? [];
}

/**
 * Replaces the user's entire saved cart with the given rows.
 * Deletes rows no longer in the cart, then upserts the current rows
 * (insert-or-update on the user+product+size+color unique key) —
 * upsert instead of a plain insert avoids a duplicate-key error if
 * two syncs happen to overlap in quick succession.
 */
export async function replaceCartRows(userId: string, rows: CartRow[]): Promise<void> {
  const { error: delError } = await supabase.from('cart_items').delete().eq('user_id', userId);
  if (delError) { console.error('replaceCartRows delete failed:', delError.message); return; }

  if (rows.length === 0) return;

  const { error: insError } = await supabase
    .from('cart_items')
    .upsert(rows.map((r) => ({ user_id: userId, ...r })), { onConflict: 'user_id,product_id,size,color' });
  if (insError) console.error('replaceCartRows insert failed:', insError.message);
}
