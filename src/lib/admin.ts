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
  const { data, error } = await supabase.from('sellers').update({ status }).eq('id', sellerId).select('id');
  if (error) throw new Error(error.message);
  if (!data || data.length === 0) throw new Error('Seller update matched no rows — check admin permissions.');
}

export interface PendingProduct {
  id: string;
  name: string;
  description: string;
  gender: string;
  price: number;
  original_price: number;
  sizes: string[];
  colors: string[];
  material: string;
  stock: number;
  image_urls: string[];
  status: string;
  created_at: string;
  brands: { name: string } | null;
  categories: { name: string } | null;
  sellers: { business_name: string } | null;
  product_size_inventory: { size: string; stock: number }[];
}

/** Products awaiting moderation. */
export async function fetchPendingProducts(): Promise<PendingProduct[]> {
  const { data, error } = await supabase
    .from('products')
    .select('id, name, description, gender, price, original_price, sizes, colors, material, stock, image_urls, status, created_at, brands ( name ), categories ( name ), sellers ( business_name ), product_size_inventory ( size, stock )')
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('fetchPendingProducts failed:', error.message);
    return [];
  }
  return (data ?? []) as unknown as PendingProduct[];
}

export async function setProductStatus(productId: string, status: 'approved' | 'rejected'): Promise<void> {
  const { data, error } = await supabase.from('products').update({ status }).eq('id', productId).select('id');
  if (error) throw new Error(error.message);
  if (!data || data.length === 0) throw new Error('Product update matched no rows — check admin permissions.');
}
