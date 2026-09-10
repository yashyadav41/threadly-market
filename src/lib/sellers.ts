import { supabase } from './supabase';

export interface SellerRecord {
  id: string;
  business_name: string;
  description: string | null;
  status: string;
  commission_rate: number;
}

export async function fetchSellerByUserId(userId: string): Promise<SellerRecord | null> {
  const { data, error } = await supabase
    .from('sellers')
    .select('id, business_name, description, status, commission_rate')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('fetchSellerByUserId failed:', error.message);
    return null;
  }
  return data;
}

export async function updateSellerDescription(sellerId: string, description: string): Promise<void> {
  const { error } = await supabase.from('sellers').update({ description }).eq('id', sellerId);
  if (error) throw new Error(error.message);
}

export interface ProductFormInput {
  name: string;
  brand: string;
  gender: string;
  subcategory: string;
  price: number;
  original: number;
  /** Stock per size, e.g. { S: 4, M: 10, L: 6 }. Replaces the old flat "stock" field —
   *  the total shown everywhere else is now auto-computed from this. */
  sizeStocks: Record<string, number>;
  colors: string[];
  material: string;
  description: string;
  image: string;
}

async function resolveBrandId(brandName: string): Promise<string> {
  const { data, error } = await supabase.from('brands').select('id').eq('name', brandName).maybeSingle();
  if (error || !data) throw new Error(`Brand "${brandName}" not found.`);
  return data.id;
}

async function resolveCategoryId(name: string, gender: string): Promise<string> {
  const { data, error } = await supabase.from('categories').select('id').eq('name', name).eq('gender', gender).maybeSingle();
  if (error || !data) throw new Error(`Category "${name}" for ${gender} not found.`);
  return data.id;
}

/** Writes the seller's per-size stock inputs into product_size_inventory,
 *  removing rows for sizes that are no longer offered. */
async function syncSizeInventory(productId: string, sizeStocks: Record<string, number>): Promise<void> {
  const sizes = Object.keys(sizeStocks);

  const { error: delError } = await supabase
    .from('product_size_inventory')
    .delete()
    .eq('product_id', productId)
    .not('size', 'in', `(${sizes.map((s) => `"${s}"`).join(',')})`);
  if (delError) throw new Error(delError.message);

  const { error: upsertError } = await supabase
    .from('product_size_inventory')
    .upsert(
      sizes.map((size) => ({ product_id: productId, size, stock: sizeStocks[size] })),
      { onConflict: 'product_id,size' }
    );
  if (upsertError) throw new Error(upsertError.message);
}

export async function insertProduct(sellerId: string, input: ProductFormInput): Promise<void> {
  const [brandId, categoryId] = await Promise.all([
    resolveBrandId(input.brand),
    resolveCategoryId(input.subcategory, input.gender),
  ]);

  const sizes = Object.keys(input.sizeStocks);
  const sku = `SEL-${Date.now()}`;
  const { data, error } = await supabase.from('products').insert({
    seller_id: sellerId,
    brand_id: brandId,
    category_id: categoryId,
    name: input.name,
    description: input.description,
    gender: input.gender,
    price: input.price,
    original_price: input.original,
    sizes,
    colors: input.colors,
    material: input.material,
    care_instructions: 'Machine wash cold, hang dry. Do not bleach.',
    stock: 0, // auto-computed from product_size_inventory once inserted below
    sku,
    image_urls: [input.image],
    status: 'pending',
  }).select('id').single();
  if (error || !data) throw new Error(error?.message ?? 'Failed to create product.');

  await syncSizeInventory(data.id, input.sizeStocks);
}

export async function updateProduct(productId: string, sellerId: string, input: ProductFormInput): Promise<void> {
  const [brandId, categoryId] = await Promise.all([
    resolveBrandId(input.brand),
    resolveCategoryId(input.subcategory, input.gender),
  ]);

  const sizes = Object.keys(input.sizeStocks);
  const { data, error } = await supabase.from('products').update({
    brand_id: brandId,
    category_id: categoryId,
    name: input.name,
    description: input.description,
    gender: input.gender,
    price: input.price,
    original_price: input.original,
    sizes,
    colors: input.colors,
    material: input.material,
    image_urls: [input.image],
  }).eq('id', productId).eq('seller_id', sellerId).select('id').single();
  if (error || !data) throw new Error(error?.message ?? 'Product update matched no rows — check permissions.');

  await syncSizeInventory(productId, input.sizeStocks);
}
