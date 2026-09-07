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
 * Simple "delete all, re-insert" approach — fine for typical cart sizes.
 */
export async function replaceCartRows(userId: string, rows: CartRow[]): Promise<void> {
  const { error: delError } = await supabase.from('cart_items').delete().eq('user_id', userId);
  if (delError) { console.error('replaceCartRows delete failed:', delError.message); return; }

  if (rows.length === 0) return;

  const { error: insError } = await supabase
    .from('cart_items')
    .insert(rows.map((r) => ({ user_id: userId, ...r })));
  if (insError) console.error('replaceCartRows insert failed:', insError.message);
}
