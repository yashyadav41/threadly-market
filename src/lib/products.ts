import { supabase } from './supabase';
import type { Product } from '../data';

interface ProductRow {
  id: string;
  name: string;
  description: string;
  gender: string;
  price: number;
  original_price: number;
  sizes: string[];
  colors: string[];
  material: string;
  care_instructions: string;
  stock: number;
  image_urls: string[];
  rating: number;
  review_count: number;
  is_new: boolean;
  brands: { name: string } | null;
  categories: { name: string } | null;
  sellers: { business_name: string } | null;
}

/**
 * Fetches all approved products from Supabase (joined with brand,
 * category, and seller names) and maps each row into the same
 * `Product` shape the existing UI already expects.
 *
 * Returns an empty array (never throws) so callers can safely fall
 * back to the existing mock data if this fails for any reason.
 */
export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select(`
      id, name, description, gender, price, original_price,
      sizes, colors, material, care_instructions, stock,
      image_urls, rating, review_count, is_new,
      brands ( name ),
      categories ( name ),
      sellers ( business_name )
    `)
    .eq('status', 'approved');

  if (error) {
    console.error('fetchProducts failed:', error.message);
    return [];
  }

  const rows = (data ?? []) as unknown as ProductRow[];

  return rows.map((row): Product => {
    const categoryName = row.categories?.name ?? '';
    return {
      id: row.id,
      name: row.name,
      brand: row.brands?.name ?? 'Unknown',
      category: categoryName,
      subcategory: categoryName,
      gender: row.gender as Product['gender'],
      price: Number(row.price),
      original: Number(row.original_price),
      rating: Number(row.rating),
      reviews: row.review_count,
      image: row.image_urls?.[0] ?? '',
      gallery: row.image_urls?.length ? row.image_urls : [''],
      color: row.colors?.[0] ?? '',
      colors: row.colors ?? [],
      sizes: row.sizes ?? [],
      stock: row.stock,
      isNew: row.is_new,
      onSale: Number(row.original_price) > Number(row.price),
      description: row.description,
      material: row.material,
      care: row.care_instructions,
      seller: row.sellers?.business_name ?? 'Unknown Seller',
    };
  });
}
