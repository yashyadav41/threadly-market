import { supabase } from './supabase';

export interface AdminSellerRow {
  id: string;
  user_id: string;
  business_name: string;
  status: string;
  commission_rate: number;
}

/** All seller storefronts on the platform (admin-only via RLS). */
export async function fetchAllSellers(): Promise<AdminSellerRow[]> {
  const { data, error } = await supabase
    .from('sellers')
    .select('id, user_id, business_name, status, commission_rate')
    .order('business_name');

  if (error) {
    console.error('fetchAllSellers failed:', error.message);
    return [];
  }
  return data ?? [];
}

export async function setSellerStatus(sellerId: string, status: 'approved' | 'suspended'): Promise<void> {
  const { error } = await supabase.from('sellers').update({ status }).eq('id', sellerId);
  if (error) throw new Error(error.message);
}

export interface PendingProduct {
  id: string;
  name: string;
  price: number;
  image_urls: string[];
  status: string;
  sellers: { business_name: string } | null;
}

/** Products awaiting moderation. */
export async function fetchPendingProducts(): Promise<PendingProduct[]> {
  const { data, error } = await supabase
    .from('products')
    .select('id, name, price, image_urls, status, sellers ( business_name )')
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('fetchPendingProducts failed:', error.message);
    return [];
  }
  return (data ?? []) as unknown as PendingProduct[];
}

export async function setProductStatus(productId: string, status: 'approved' | 'rejected'): Promise<void> {
  const { error } = await supabase.from('products').update({ status }).eq('id', productId);
  if (error) throw new Error(error.message);
}
