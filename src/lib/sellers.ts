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
  stock: number;
  sizes: string[];
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

export async function insertProduct(sellerId: string, input: ProductFormInput): Promise<void> {
  const [brandId, categoryId] = await Promise.all([
    resolveBrandId(input.brand),
    resolveCategoryId(input.subcategory, input.gender),
  ]);

  const sku = `SEL-${Date.now()}`;
  const { error } = await supabase.from('products').insert({
    seller_id: sellerId,
    brand_id: brandId,
    category_id: categoryId,
    name: input.name,
    description: input.description,
    gender: input.gender,
    price: input.price,
    original_price: input.original,
    sizes: input.sizes,
    colors: input.colors,
    material: input.material,
    care_instructions: 'Machine wash cold, hang dry. Do not bleach.',
    stock: input.stock,
    sku,
    image_urls: [input.image],
    status: 'approved',
  });
  if (error) throw new Error(error.message);
}

export async function updateProduct(productId: string, sellerId: string, input: ProductFormInput): Promise<void> {
  const [brandId, categoryId] = await Promise.all([
    resolveBrandId(input.brand),
    resolveCategoryId(input.subcategory, input.gender),
  ]);

  const { error } = await supabase.from('products').update({
    brand_id: brandId,
    category_id: categoryId,
    name: input.name,
    description: input.description,
    gender: input.gender,
    price: input.price,
    original_price: input.original,
    sizes: input.sizes,
    colors: input.colors,
    material: input.material,
    stock: input.stock,
    image_urls: [input.image],
  }).eq('id', productId).eq('seller_id', sellerId);
  if (error) throw new Error(error.message);
}
