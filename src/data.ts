export type Gender = 'Men' | 'Women' | 'Kids';
export type SubCategory = 'Shirts' | 'T-Shirts' | 'Jeans' | 'Trousers' | 'Dresses' | 'Tops' | 'Jackets' | 'Hoodies' | 'Shoes' | 'Accessories';

export interface Product {
  id: number;
  name: string;
  brand: string;
  category: string;
  subcategory: string;
  gender: Gender;
  price: number;
  original: number;
  rating: number;
  reviews: number;
  image: string;
  gallery: string[];
  color: string;
  colors: string[];
  sizes: string[];
  stock: number;
  isNew?: boolean;
  onSale?: boolean;
  description: string;
  material: string;
  care: string;
  seller: string;
}

export interface CartItem extends Product {
  size: string;
  color: string;
  quantity: number;
}

export interface OrderItem {
  productId: number;
  name: string;
  brand: string;
  image: string;
  size: string;
  color: string;
  quantity: number;
  price: number;
  seller: string;
}

export interface Order {
  id: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  paymentMethod: 'demo_card' | 'demo_upi' | 'cod_demo';
  paymentLabel: string;
  status: 'Pending' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  date: string;
  customer: string;
  address: { name: string; phone: string; address: string; city: string; postal: string };
}

export const brands = ['Urban Thread', 'Northline', 'StreetForm', 'ModeCraft', 'VibeWear', 'FamilyFit', 'LittleLane', 'TrendNest'];

export const brandDescriptions: Record<string, string> = {
  'Urban Thread': 'Contemporary casual wear designed for everyday life.',
  'Northline': 'Modern utility and outerwear for a life in motion.',
  'StreetForm': 'Streetwear codes, refined and softened for daily wear.',
  'ModeCraft': 'Quiet forms with strong, considered details.',
  'VibeWear': 'Colour, confidence and character in every piece.',
  'FamilyFit': 'Comfort-driven essentials for the whole family.',
  'LittleLane': 'Age-appropriate, playful clothing for kids.',
  'TrendNest': 'Trend-led pieces that feel effortless and easy.',
};

export const menSubcategories = ['Shirts', 'T-Shirts', 'Jeans', 'Trousers', 'Jackets', 'Hoodies'];
export const womenSubcategories = ['Dresses', 'Tops', 'Shirts', 'T-Shirts', 'Jeans', 'Trousers', 'Jackets', 'Hoodies'];

// Family-friendly Pexels images — fully clothed models, product-only, mannequins, flatlays
const IMG = {
  familyShopping: 'https://images.pexels.com/photos/5705094/pexels-photo-5705094.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  fatherSon: 'https://images.pexels.com/photos/4127458/pexels-photo-4127458.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  greenCoatMannequin: 'https://images.pexels.com/photos/18962296/pexels-photo-18962296.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  manCheckShirt: 'https://images.pexels.com/photos/34191226/pexels-photo-34191226.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  blueCoatMannequin: 'https://images.pexels.com/photos/19490409/pexels-photo-19490409.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  manDenimShirt: 'https://images.pexels.com/photos/10004175/pexels-photo-10004175.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  dressFlatlay: 'https://images.pexels.com/photos/4428388/pexels-photo-4428388.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  accessoryBag: 'https://images.pexels.com/photos/34976479/pexels-photo-34976479.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  kidsNautical: 'https://images.pexels.com/photos/1620759/pexels-photo-1620759.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  jacketHanger: 'https://images.pexels.com/photos/13094233/pexels-photo-13094233.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  brownCoatMannequin: 'https://images.pexels.com/photos/18913370/pexels-photo-18913370.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  denimFlatlay: 'https://images.pexels.com/photos/18533669/pexels-photo-18533669.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  manGrayCoat: 'https://images.pexels.com/photos/9571995/pexels-photo-9571995.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  manLeatherJacket: 'https://images.pexels.com/photos/28946495/pexels-photo-28946495.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  manFloralShirt: 'https://images.pexels.com/photos/2421356/pexels-photo-2421356.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  manDenimJacket: 'https://images.pexels.com/photos/7628429/pexels-photo-7628429.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  manBlackTurtleneck: 'https://images.pexels.com/photos/2897529/pexels-photo-2897529.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  manCasualOutfit: 'https://images.pexels.com/photos/775771/pexels-photo-775771.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  pinkJacketMannequin: 'https://images.pexels.com/photos/19109132/pexels-photo-19109132.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  womenLeatherCoats: 'https://images.pexels.com/photos/21578435/pexels-photo-21578435.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  womenCityCoats: 'https://images.pexels.com/photos/35037295/pexels-photo-35037295.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  womenBeigeCoat: 'https://images.pexels.com/photos/19243485/pexels-photo-19243485.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  womenStaircaseCoats: 'https://images.pexels.com/photos/35524663/pexels-photo-35524663.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  whiteSneakers: 'https://images.pexels.com/photos/27204251/pexels-photo-27204251.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  whiteSneakersBlack: 'https://images.pexels.com/photos/11292946/pexels-photo-11292946.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  yellowSneakers: 'https://images.pexels.com/photos/11135667/pexels-photo-11135667.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  grayShirtBlock: 'https://images.pexels.com/photos/13094187/pexels-photo-13094187.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  grayShirtHanger: 'https://images.pexels.com/photos/13381986/pexels-photo-13381986.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  tshirtsRack: 'https://images.pexels.com/photos/8146450/pexels-photo-8146450.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  tshirtsDraped: 'https://images.pexels.com/photos/8146448/pexels-photo-8146448.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  denimStack: 'https://images.pexels.com/photos/20143795/pexels-photo-20143795.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  denimSneakersFlatlay: 'https://images.pexels.com/photos/18533668/pexels-photo-18533668.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  kidsSporty: 'https://images.pexels.com/photos/29214428/pexels-photo-29214428.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  girlDress: 'https://images.pexels.com/photos/15359697/pexels-photo-15359697.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  kidDenim: 'https://images.pexels.com/photos/38778561/pexels-photo-38778561.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  kidBright: 'https://images.pexels.com/photos/33980569/pexels-photo-33980569.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  boySuit: 'https://images.pexels.com/photos/30690923/pexels-photo-30690923.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  boyStool: 'https://images.pexels.com/photos/1620812/pexels-photo-1620812.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  brownBag: 'https://images.pexels.com/photos/27174573/pexels-photo-27174573.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  blackBag: 'https://images.pexels.com/photos/26736140/pexels-photo-26736140.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  brownBagStrap: 'https://images.pexels.com/photos/27204287/pexels-photo-27204287.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  leatherShoesSweater: 'https://images.pexels.com/photos/8159428/pexels-photo-8159428.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  blackSneakersCheckered: 'https://images.pexels.com/photos/2897533/pexels-photo-2897533.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  clothingRack: 'https://images.pexels.com/photos/5771897/pexels-photo-5771897.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
};

export const heroImages = [IMG.familyShopping, IMG.fatherSon, IMG.greenCoatMannequin, IMG.womenCityCoats];

const SIZES_CLOTHING = ['XS', 'S', 'M', 'L', 'XL'];
const SIZES_JEANS = ['28', '30', '32', '34', '36'];
const SIZES_SHOES = ['6', '7', '8', '9', '10', '11'];
const SIZES_KIDS = ['2-3Y', '4-5Y', '6-7Y', '8-9Y'];
const ONE_SIZE = ['One Size'];

interface RawProduct {
  name: string; brand: string; sub: string; gender: Gender; price: number; original: number;
  rating: number; reviews: number; img: string; color: string; colors: string[]; sizes: string[];
  stock: number; isNew?: boolean; onSale?: boolean; desc: string; material: string; seller: string;
}

const rawProducts: RawProduct[] = [
  // === MEN SHIRTS ===
  { name: 'Everyday Cotton Oxford Shirt', brand: 'Urban Thread', sub: 'Shirts', gender: 'Men', price: 1299, original: 1999, rating: 4.5, reviews: 128, img: IMG.manCheckShirt, color: 'Blue', colors: ['Blue', 'White', 'Pink'], sizes: SIZES_CLOTHING, stock: 45, isNew: true, desc: 'A classic Oxford weave shirt with a tailored fit. Breathable cotton that works from desk to weekend.', material: '100% Cotton Oxford', seller: 'Urban Thread Store' },
  { name: 'Brushed Cotton Overshirt', brand: 'Northline', sub: 'Shirts', gender: 'Men', price: 1899, original: 2799, rating: 4.6, reviews: 54, img: IMG.manDenimShirt, color: 'Stone', colors: ['Stone', 'Olive', 'Navy'], sizes: SIZES_CLOTHING, stock: 22, isNew: true, onSale: true, desc: 'A brushed cotton overshirt designed for layering through changing seasons. Relaxed fit with chest pockets.', material: '100% Brushed Cotton', seller: 'Northline Store' },
  { name: 'Premium Pique Polo Shirt', brand: 'Northline', sub: 'Shirts', gender: 'Men', price: 1299, original: 1899, rating: 4.5, reviews: 76, img: IMG.manCasualOutfit, color: 'Navy', colors: ['Navy', 'White', 'Burgundy'], sizes: SIZES_CLOTHING, stock: 40, desc: 'A classic pique cotton polo with a tailored collar. A versatile piece for smart-casual occasions.', material: '100% Pique Cotton', seller: 'Northline Store' },
  { name: 'Tropical Print Camp Shirt', brand: 'VibeWear', sub: 'Shirts', gender: 'Men', price: 1799, original: 2499, rating: 4.5, reviews: 72, img: IMG.manFloralShirt, color: 'Multicolor', colors: ['Multicolor', 'Navy'], sizes: SIZES_CLOTHING, stock: 25, isNew: true, desc: 'A vibrant tropical-print shirt for relaxed days. Lightweight rayon with a camp collar.', material: '100% Rayon', seller: 'VibeWear Store' },
  { name: 'Office Smart Poplin Shirt', brand: 'Northline', sub: 'Shirts', gender: 'Men', price: 1699, original: 2399, rating: 4.6, reviews: 81, img: IMG.grayShirtHanger, color: 'White', colors: ['White', 'Light Blue', 'Pink'], sizes: SIZES_CLOTHING, stock: 42, desc: 'A crisp office-ready shirt in breathable cotton poplin. Tailored fit with a spread collar.', material: '100% Cotton Poplin', seller: 'Northline Store' },
  { name: 'Checked Casual Flannel Shirt', brand: 'Urban Thread', sub: 'Shirts', gender: 'Men', price: 1599, original: 2299, rating: 4.4, reviews: 58, img: IMG.manCheckShirt, color: 'Green', colors: ['Green', 'Blue', 'Red'], sizes: SIZES_CLOTHING, stock: 33, onSale: true, desc: 'A relaxed checked shirt in soft brushed cotton. Great for layering or wearing on its own.', material: '100% Cotton', seller: 'Urban Thread Store' },

  // === MEN T-SHIRTS ===
  { name: 'Everyday Cotton Crew Tee', brand: 'Urban Thread', sub: 'T-Shirts', gender: 'Men', price: 799, original: 1299, rating: 4.5, reviews: 203, img: IMG.tshirtsRack, color: 'White', colors: ['White', 'Black', 'Navy'], sizes: SIZES_CLOTHING, stock: 45, isNew: true, desc: 'A soft, breathable cotton crew-neck tee cut for an easy regular fit. A wardrobe staple made to last.', material: '100% Organic Cotton', seller: 'Urban Thread Store' },
  { name: 'Heavyweight Relaxed Tee', brand: 'StreetForm', sub: 'T-Shirts', gender: 'Men', price: 899, original: 1299, rating: 4.5, reviews: 203, img: IMG.tshirtsDraped, color: 'Black', colors: ['Black', 'White', 'Grey'], sizes: SIZES_CLOTHING, stock: 42, isNew: true, desc: 'Everyday jersey, elevated. Cut relaxed with a considered heavyweight handfeel.', material: '100% Cotton', seller: 'StreetForm Store' },
  { name: 'Striped Crew Neck Tee', brand: 'VibeWear', sub: 'T-Shirts', gender: 'Men', price: 699, original: 999, rating: 4.3, reviews: 89, img: IMG.grayShirtBlock, color: 'Grey', colors: ['Grey', 'Navy', 'White'], sizes: SIZES_CLOTHING, stock: 60, desc: 'A classic striped tee in soft cotton jersey. Easy to layer or wear on its own.', material: '100% Cotton', seller: 'VibeWear Store' },
  { name: 'Graphic Print Tee', brand: 'StreetForm', sub: 'T-Shirts', gender: 'Men', price: 999, original: 1499, rating: 4.4, reviews: 112, img: IMG.tshirtsRack, color: 'Red', colors: ['Red', 'Yellow', 'Black'], sizes: SIZES_CLOTHING, stock: 38, onSale: true, desc: 'A bold graphic tee with a relaxed fit. Soft cotton with a durable print.', material: '100% Cotton', seller: 'StreetForm Store' },

  // === MEN JEANS ===
  { name: 'Relaxed Straight Jeans', brand: 'StreetForm', sub: 'Jeans', gender: 'Men', price: 1799, original: 2499, rating: 4.4, reviews: 89, img: IMG.denimFlatlay, color: 'Indigo', colors: ['Indigo', 'Black', 'Stone'], sizes: SIZES_JEANS, stock: 38, desc: 'Classic straight-leg jeans with a comfortable relaxed fit. Durable denim that breaks in beautifully.', material: '98% Cotton 2% Elastane', seller: 'StreetForm Store' },
  { name: 'Slim Tapered Jeans', brand: 'Urban Thread', sub: 'Jeans', gender: 'Men', price: 1899, original: 2699, rating: 4.5, reviews: 134, img: IMG.denimStack, color: 'Black', colors: ['Black', 'Indigo', 'Light Blue'], sizes: SIZES_JEANS, stock: 30, isNew: true, desc: 'Slim-fit tapered jeans with a modern silhouette. Stretch denim for all-day comfort.', material: '98% Cotton 2% Elastane', seller: 'Urban Thread Store' },
  { name: 'Denim & Cotton Set', brand: 'StreetForm', sub: 'Jeans', gender: 'Men', price: 2499, original: 3499, rating: 4.3, reviews: 34, img: IMG.denimSneakersFlatlay, color: 'Indigo', colors: ['Indigo', 'Stone'], sizes: SIZES_CLOTHING, stock: 18, onSale: true, desc: 'A coordinated denim and cotton set for an easy, put-together look. Relaxed fit throughout.', material: '100% Cotton', seller: 'StreetForm Store' },

  // === MEN TROUSERS ===
  { name: 'Tailored Chino Trousers', brand: 'ModeCraft', sub: 'Trousers', gender: 'Men', price: 1999, original: 2899, rating: 4.5, reviews: 67, img: IMG.grayShirtHanger, color: 'Navy', colors: ['Navy', 'Charcoal', 'Beige'], sizes: SIZES_JEANS, stock: 30, desc: 'Smart chinos with a tailored cut and a touch of stretch for all-day comfort. Versatile from desk to dinner.', material: '97% Cotton 3% Elastane', seller: 'ModeCraft Store' },
  { name: 'Basecamp Cargo Trousers', brand: 'Northline', sub: 'Trousers', gender: 'Men', price: 2299, original: 3199, rating: 4.5, reviews: 61, img: IMG.manCasualOutfit, color: 'Moss', colors: ['Moss', 'Black', 'Stone'], sizes: SIZES_CLOTHING, stock: 16, desc: 'A considered cargo with articulated pockets and an easy tapered fit.', material: '100% Cotton', seller: 'Northline Store' },

  // === MEN JACKETS ===
  { name: 'Utility Field Jacket', brand: 'Northline', sub: 'Jackets', gender: 'Men', price: 3299, original: 4599, rating: 4.8, reviews: 39, img: IMG.manGrayCoat, color: 'Olive', colors: ['Olive', 'Black', 'Navy'], sizes: SIZES_CLOTHING, stock: 14, isNew: true, desc: 'Utility details meet a refined cut in this lightweight everyday jacket. Multiple pockets, adjustable waist.', material: '100% Cotton Canvas', seller: 'Northline Store' },
  { name: 'Leather Biker Jacket', brand: 'StreetForm', sub: 'Jackets', gender: 'Men', price: 4999, original: 6999, rating: 4.7, reviews: 28, img: IMG.manLeatherJacket, color: 'Black', colors: ['Black', 'Brown'], sizes: SIZES_CLOTHING, stock: 8, desc: 'A classic leather biker jacket with asymmetric zip and quilted shoulders. Ages beautifully.', material: 'Genuine Leather', seller: 'StreetForm Store' },
  { name: 'Padded Winter Jacket', brand: 'TrendNest', sub: 'Jackets', gender: 'Men', price: 3999, original: 5499, rating: 4.8, reviews: 31, img: IMG.manGrayCoat, color: 'Black', colors: ['Black', 'Navy', 'Olive'], sizes: SIZES_CLOTHING, stock: 10, isNew: true, onSale: true, desc: 'A warm padded jacket with a water-resistant outer shell. Removable hood and fleece-lined pockets.', material: '100% Polyester', seller: 'TrendNest Store' },
  { name: 'Denim Trucker Jacket', brand: 'Urban Thread', sub: 'Jackets', gender: 'Men', price: 2799, original: 3999, rating: 4.6, reviews: 45, img: IMG.manDenimJacket, color: 'Indigo', colors: ['Indigo', 'Light Blue', 'Black'], sizes: SIZES_CLOTHING, stock: 20, desc: 'A classic denim trucker jacket with a relaxed fit. Timeless style that goes with everything.', material: '100% Cotton Denim', seller: 'Urban Thread Store' },

  // === MEN HOODIES ===
  { name: 'Fleece-Lined Hoodie', brand: 'VibeWear', sub: 'Hoodies', gender: 'Men', price: 1499, original: 2299, rating: 4.7, reviews: 143, img: IMG.clothingRack, color: 'Grey', colors: ['Grey', 'Navy', 'Black', 'Olive'], sizes: SIZES_CLOTHING, stock: 52, isNew: true, desc: 'A soft brushed-fleece hoodie with a relaxed fit. Made for off-duty days and long weekends.', material: '80% Cotton 20% Polyester', seller: 'VibeWear Store' },
  { name: 'Zip-Up Tech Hoodie', brand: 'ModeCraft', sub: 'Hoodies', gender: 'Men', price: 1899, original: 2699, rating: 4.5, reviews: 49, img: IMG.grayShirtBlock, color: 'Black', colors: ['Black', 'Charcoal', 'Olive'], sizes: SIZES_CLOTHING, stock: 28, desc: 'A modern zip-up hoodie in moisture-wicking tech fabric. Athletic fit with zip pockets.', material: '100% Polyester', seller: 'ModeCraft Store' },

  // === WOMEN DRESSES ===
  { name: 'Button-Front Summer Dress', brand: 'VibeWear', sub: 'Dresses', gender: 'Women', price: 2499, original: 3499, rating: 4.7, reviews: 76, img: IMG.dressFlatlay, color: 'Yellow', colors: ['Yellow', 'Black', 'Blue'], sizes: SIZES_CLOTHING, stock: 24, isNew: true, desc: 'A cheerful button-front dress with a defined waist and breathable fabric. Perfect for warm days.', material: '100% Rayon', seller: 'VibeWear Store' },
  { name: 'Classic Black Dress', brand: 'ModeCraft', sub: 'Dresses', gender: 'Women', price: 2799, original: 3999, rating: 4.8, reviews: 67, img: IMG.brownCoatMannequin, color: 'Black', colors: ['Black', 'Navy'], sizes: SIZES_CLOTHING, stock: 16, desc: 'A timeless black dress with a flattering silhouette. Effortlessly elegant for any occasion.', material: '95% Polyester 5% Elastane', seller: 'ModeCraft Store' },
  { name: 'White Pleated Dress', brand: 'Urban Thread', sub: 'Dresses', gender: 'Women', price: 2999, original: 4299, rating: 4.9, reviews: 24, img: IMG.dressFlatlay, color: 'White', colors: ['White', 'Ivory'], sizes: SIZES_CLOTHING, stock: 12, isNew: true, desc: 'An elegant white dress with delicate pleating and a flowing silhouette. Perfect for special occasions.', material: '100% Polyester', seller: 'Urban Thread Store' },
  { name: 'Cove Satin Midi Dress', brand: 'VibeWear', sub: 'Dresses', gender: 'Women', price: 2499, original: 3499, rating: 4.9, reviews: 121, img: IMG.pinkJacketMannequin, color: 'Ink', colors: ['Ink', 'Rust', 'Sage'], sizes: SIZES_CLOTHING, stock: 12, onSale: true, desc: 'A fluid satin silhouette with a softly gathered waist and modern midi length.', material: '100% Polyester Satin', seller: 'VibeWear Store' },

  // === WOMEN TOPS ===
  { name: 'Relaxed Linen Blouse', brand: 'ModeCraft', sub: 'Tops', gender: 'Women', price: 1799, original: 2599, rating: 4.8, reviews: 33, img: IMG.greenCoatMannequin, color: 'White', colors: ['White', 'Black', 'Sage'], sizes: SIZES_CLOTHING, stock: 35, isNew: true, desc: 'A breezy linen blouse with a softly rounded hem and relaxed fit. Effortless from morning to evening.', material: '100% Linen', seller: 'ModeCraft Store' },
  { name: 'Luma Ribbed Knit Top', brand: 'ModeCraft', sub: 'Tops', gender: 'Women', price: 1299, original: 1899, rating: 4.8, reviews: 86, img: IMG.pinkJacketMannequin, color: 'Oatmeal', colors: ['Oatmeal', 'Black', 'Sage'], sizes: SIZES_CLOTHING, stock: 18, desc: 'A softly structured ribbed knit with a clean neckline and effortless drape.', material: '60% Cotton 40% Viscose', seller: 'ModeCraft Store' },
  { name: 'Sheer Sleeve Blouse', brand: 'VibeWear', sub: 'Tops', gender: 'Women', price: 1899, original: 2699, rating: 4.6, reviews: 44, img: IMG.womenBeigeCoat, color: 'White', colors: ['White', 'Black'], sizes: SIZES_CLOTHING, stock: 22, isNew: true, desc: 'An elegant blouse with sheer sleeves and a clean neckline. A versatile piece for day or evening.', material: '100% Polyester', seller: 'VibeWear Store' },

  // === WOMEN SHIRTS ===
  { name: 'Morrow Linen Shirt', brand: 'Urban Thread', sub: 'Shirts', gender: 'Women', price: 1799, original: 2599, rating: 4.8, reviews: 33, img: IMG.grayShirtHanger, color: 'White', colors: ['White', 'Sky', 'Sand'], sizes: SIZES_CLOTHING, stock: 8, isNew: true, desc: 'Relaxed linen with a cool, airy handfeel and softly rounded hem.', material: '100% Linen', seller: 'Urban Thread Store' },
  { name: 'Silk Blend Wrap Shirt', brand: 'ModeCraft', sub: 'Shirts', gender: 'Women', price: 2199, original: 2999, rating: 4.7, reviews: 41, img: IMG.grayShirtBlock, color: 'Ivory', colors: ['Ivory', 'Black', 'Rose'], sizes: SIZES_CLOTHING, stock: 19, desc: 'A luxurious silk-blend shirt with a wrap silhouette. Elegant drape and a flattering tie waist.', material: '70% Silk 30% Cotton', seller: 'ModeCraft Store' },

  // === WOMEN T-SHIRTS ===
  { name: 'Cropped Graphic Tee', brand: 'VibeWear', sub: 'T-Shirts', gender: 'Women', price: 699, original: 999, rating: 4.3, reviews: 67, img: IMG.tshirtsDraped, color: 'White', colors: ['White', 'Black', 'Sage'], sizes: SIZES_CLOTHING, stock: 44, isNew: true, desc: 'A cropped cotton tee with a modern graphic print. Pairs perfectly with high-waist bottoms.', material: '100% Cotton', seller: 'VibeWear Store' },
  { name: 'Relaxed V-Neck Tee', brand: 'Urban Thread', sub: 'T-Shirts', gender: 'Women', price: 599, original: 899, rating: 4.4, reviews: 92, img: IMG.tshirtsRack, color: 'Black', colors: ['Black', 'White', 'Heather Grey'], sizes: SIZES_CLOTHING, stock: 50, desc: 'A relaxed V-neck tee in soft cotton jersey. An everyday essential with a flattering cut.', material: '100% Cotton', seller: 'Urban Thread Store' },

  // === WOMEN JEANS ===
  { name: 'High-Rise Skinny Jeans', brand: 'Urban Thread', sub: 'Jeans', gender: 'Women', price: 1899, original: 2699, rating: 4.5, reviews: 112, img: IMG.denimFlatlay, color: 'Indigo', colors: ['Indigo', 'Black', 'Light Blue'], sizes: SIZES_CLOTHING, stock: 40, desc: 'Figure-flattering high-rise skinny jeans with stretch denim for all-day comfort.', material: '98% Cotton 2% Elastane', seller: 'Urban Thread Store' },
  { name: 'Denim Overall Dress', brand: 'Urban Thread', sub: 'Jeans', gender: 'Women', price: 2099, original: 2899, rating: 4.4, reviews: 39, img: IMG.denimStack, color: 'Indigo', colors: ['Indigo', 'Stone'], sizes: SIZES_CLOTHING, stock: 20, isNew: true, desc: 'A playful denim overall dress with adjustable straps. Layer over a tee for a casual look.', material: '100% Cotton', seller: 'Urban Thread Store' },

  // === WOMEN TROUSERS ===
  { name: 'Wide-Leg Tailored Trouser', brand: 'ModeCraft', sub: 'Trousers', gender: 'Women', price: 1999, original: 2899, rating: 4.7, reviews: 67, img: IMG.grayShirtHanger, color: 'Charcoal', colors: ['Charcoal', 'Beige', 'Black'], sizes: SIZES_CLOTHING, stock: 18, desc: 'A high-rise tailored trouser with a fluid wide leg and precise front crease. Polished and comfortable.', material: '97% Cotton 3% Elastane', seller: 'ModeCraft Store' },
  { name: 'Dune Slip Skirt', brand: 'ModeCraft', sub: 'Trousers', gender: 'Women', price: 1699, original: 2399, rating: 4.4, reviews: 42, img: IMG.brownCoatMannequin, color: 'Sand', colors: ['Sand', 'Black', 'Sage'], sizes: SIZES_CLOTHING, stock: 24, onSale: true, desc: 'A bias-cut midi with quiet movement and a luminous matte finish.', material: '100% Polyester', seller: 'ModeCraft Store' },
  { name: 'Belted Cargo Trousers', brand: 'Northline', sub: 'Trousers', gender: 'Women', price: 2299, original: 3199, rating: 4.5, reviews: 48, img: IMG.womenStaircaseCoats, color: 'Sand', colors: ['Sand', 'Olive', 'Black'], sizes: SIZES_CLOTHING, stock: 14, desc: 'Utility-inspired cargo trousers with a belt and tapered leg. Functional and stylish.', material: '97% Cotton 3% Elastane', seller: 'Northline Store' },

  // === WOMEN JACKETS ===
  { name: 'Lightweight Trench Jacket', brand: 'Northline', sub: 'Jackets', gender: 'Women', price: 3499, original: 4999, rating: 4.9, reviews: 28, img: IMG.womenBeigeCoat, color: 'Sand', colors: ['Sand', 'Olive', 'Black'], sizes: SIZES_CLOTHING, stock: 12, isNew: true, desc: 'A classic trench reimagined in lightweight cotton twill. Belted waist, double-breasted closure.', material: '100% Cotton Twill', seller: 'Northline Store' },
  { name: 'Quilted Bomber Jacket', brand: 'VibeWear', sub: 'Jackets', gender: 'Women', price: 2999, original: 4199, rating: 4.7, reviews: 33, img: IMG.pinkJacketMannequin, color: 'Black', colors: ['Black', 'Olive', 'Burgundy'], sizes: SIZES_CLOTHING, stock: 11, isNew: true, desc: 'A quilted bomber jacket with a relaxed fit and ribbed cuffs. Lightweight warmth for transitional weather.', material: '100% Polyester', seller: 'VibeWear Store' },
  { name: 'Wool Blend Coat', brand: 'ModeCraft', sub: 'Jackets', gender: 'Women', price: 4999, original: 6999, rating: 4.9, reviews: 19, img: IMG.blueCoatMannequin, color: 'Blue', colors: ['Blue', 'Camel', 'Black'], sizes: SIZES_CLOTHING, stock: 7, desc: 'A tailored wool-blend coat with a clean silhouette. Warm, elegant, and built to last.', material: '60% Wool 40% Polyester', seller: 'ModeCraft Store' },

  // === WOMEN HOODIES ===
  { name: 'Soft-Touch Pullover Hoodie', brand: 'FamilyFit', sub: 'Hoodies', gender: 'Women', price: 1399, original: 1999, rating: 4.6, reviews: 91, img: IMG.clothingRack, color: 'Heather Grey', colors: ['Heather Grey', 'Dusty Pink', 'Black'], sizes: SIZES_CLOTHING, stock: 48, isNew: true, desc: 'A cozy soft-touch hoodie with a relaxed fit and kangaroo pocket. Perfect for layering.', material: '60% Cotton 40% Polyester', seller: 'FamilyFit Store' },
  { name: 'Cropped Sweatshirt', brand: 'FamilyFit', sub: 'Hoodies', gender: 'Women', price: 1299, original: 1899, rating: 4.5, reviews: 56, img: IMG.grayShirtBlock, color: 'Cream', colors: ['Cream', 'Sage', 'Pink'], sizes: SIZES_CLOTHING, stock: 38, desc: 'A cozy cropped sweatshirt with ribbed cuffs and hem. Pairs perfectly with high-waist bottoms.', material: '80% Cotton 20% Polyester', seller: 'FamilyFit Store' },

  // === KIDS ===
  { name: 'Nautical Button Shirt', brand: 'LittleLane', sub: 'Shirts', gender: 'Kids', price: 899, original: 1299, rating: 4.5, reviews: 38, img: IMG.kidsNautical, color: 'Navy', colors: ['Navy', 'White', 'Striped'], sizes: SIZES_KIDS, stock: 40, desc: 'A smart-casual button-up shirt with a nautical-inspired stripe. Soft and breathable for all-day play.', material: '100% Cotton', seller: 'LittleLane Store' },
  { name: 'Smart School Shirt', brand: 'LittleLane', sub: 'Shirts', gender: 'Kids', price: 799, original: 1199, rating: 4.4, reviews: 33, img: IMG.boyStool, color: 'White', colors: ['White', 'Light Blue'], sizes: SIZES_KIDS, stock: 55, desc: 'A crisp school-ready shirt in easy-care fabric. Button-down collar and a comfortable fit.', material: '65% Polyester 35% Cotton', seller: 'LittleLane Store' },
  { name: 'Play-Ready Graphic Tee', brand: 'LittleLane', sub: 'T-Shirts', gender: 'Kids', price: 599, original: 899, rating: 4.6, reviews: 74, img: IMG.kidBright, color: 'Blue', colors: ['Blue', 'Red', 'Yellow'], sizes: SIZES_KIDS, stock: 65, isNew: true, desc: 'A soft, durable cotton tee with a fun graphic print. Made for active days and easy play.', material: '100% Cotton', seller: 'LittleLane Store' },
  { name: 'Sporty Kids Tee', brand: 'LittleLane', sub: 'T-Shirts', gender: 'Kids', price: 549, original: 799, rating: 4.5, reviews: 35, img: IMG.kidsSporty, color: 'Blue', colors: ['Blue', 'Green', 'Grey'], sizes: SIZES_KIDS, stock: 58, desc: 'A breathable sporty tee for active kids. Moisture-wicking fabric with a fun graphic.', material: '100% Polyester', seller: 'LittleLane Store' },
  { name: 'Everyday Play Dress', brand: 'LittleLane', sub: 'Dresses', gender: 'Kids', price: 999, original: 1499, rating: 4.7, reviews: 56, img: IMG.girlDress, color: 'Pink', colors: ['Pink', 'Blue', 'Yellow'], sizes: SIZES_KIDS, stock: 45, isNew: true, desc: 'A comfortable, age-appropriate play dress with a full skirt. Soft fabric that is easy to move in.', material: '100% Cotton', seller: 'LittleLane Store' },
  { name: 'Cozy Knit Dress', brand: 'LittleLane', sub: 'Dresses', gender: 'Kids', price: 1099, original: 1599, rating: 4.6, reviews: 28, img: IMG.girlDress, color: 'Pink', colors: ['Pink', 'Grey', 'Cream'], sizes: SIZES_KIDS, stock: 30, desc: 'A soft knit dress for cool days. Long sleeves and a comfortable fit that is easy to layer.', material: '100% Cotton', seller: 'LittleLane Store' },
  { name: 'Stretch Denim Jeans', brand: 'FamilyFit', sub: 'Jeans', gender: 'Kids', price: 1099, original: 1599, rating: 4.4, reviews: 62, img: IMG.kidDenim, color: 'Indigo', colors: ['Indigo', 'Black', 'Stone'], sizes: SIZES_KIDS, stock: 50, desc: 'Durable, stretchy denim jeans with an adjustable waistband. Built to keep up with active kids.', material: '98% Cotton 2% Elastane', seller: 'FamilyFit Store' },
  { name: 'Denim Shortall', brand: 'FamilyFit', sub: 'Jeans', gender: 'Kids', price: 1199, original: 1699, rating: 4.5, reviews: 19, img: IMG.kidDenim, color: 'Indigo', colors: ['Indigo', 'Stone'], sizes: ['2-3Y', '4-5Y', '6-7Y'], stock: 25, isNew: true, desc: 'A classic denim shortall with adjustable straps and snap closure. Durable and adorable.', material: '100% Cotton', seller: 'FamilyFit Store' },
  { name: 'Cozy Fleece Hoodie', brand: 'FamilyFit', sub: 'Hoodies', gender: 'Kids', price: 1199, original: 1799, rating: 4.7, reviews: 74, img: IMG.clothingRack, color: 'Sky', colors: ['Sky', 'Pink', 'Grey', 'Navy'], sizes: SIZES_KIDS, stock: 55, isNew: true, desc: 'A soft brushed-fleece hoodie made for off-duty days. Kangaroo pocket and cozy hood.', material: '80% Cotton 20% Polyester', seller: 'FamilyFit Store' },
  { name: 'Animal-Print Hoodie', brand: 'FamilyFit', sub: 'Hoodies', gender: 'Kids', price: 999, original: 1499, rating: 4.7, reviews: 51, img: IMG.kidBright, color: 'Tan', colors: ['Tan', 'Grey', 'Pink'], sizes: SIZES_KIDS, stock: 42, desc: 'A fun animal-print hoodie for adventurous kids. Soft fleece interior and kangaroo pocket.', material: '80% Cotton 20% Polyester', seller: 'FamilyFit Store' },

  // === SHOES ===
  { name: 'Canvas Low Sneaker', brand: 'StreetForm', sub: 'Shoes', gender: 'Men', price: 2199, original: 2999, rating: 4.6, reviews: 98, img: IMG.whiteSneakers, color: 'White', colors: ['White', 'Black'], sizes: SIZES_SHOES, stock: 28, desc: 'A low-profile canvas sneaker with a sculpted rubber sole. Clean lines, all-day comfort.', material: 'Canvas upper, Rubber sole', seller: 'StreetForm Store' },
  { name: 'Everyday Black Sneaker', brand: 'StreetForm', sub: 'Shoes', gender: 'Men', price: 2499, original: 3299, rating: 4.6, reviews: 103, img: IMG.blackSneakersCheckered, color: 'Black', colors: ['Black'], sizes: SIZES_SHOES, stock: 35, desc: 'A versatile all-black sneaker that goes with everything. Cushioned insole for all-day wear.', material: 'Leather upper, Rubber sole', seller: 'StreetForm Store' },
  { name: 'Minimalist Slip-On Sneaker', brand: 'StreetForm', sub: 'Shoes', gender: 'Women', price: 2299, original: 3199, rating: 4.5, reviews: 84, img: IMG.whiteSneakersBlack, color: 'White', colors: ['White', 'Black'], sizes: ['5', '6', '7', '8'], stock: 32, isNew: true, desc: 'A clean slip-on sneaker with memory-foam insole. Effortless style with all-day comfort.', material: 'Knit upper, Rubber sole', seller: 'StreetForm Store' },
  { name: 'Yellow Statement Sneaker', brand: 'VibeWear', sub: 'Shoes', gender: 'Women', price: 2399, original: 3299, rating: 4.4, reviews: 47, img: IMG.yellowSneakers, color: 'Yellow', colors: ['Yellow', 'White'], sizes: ['5', '6', '7', '8'], stock: 18, onSale: true, desc: 'A bold yellow sneaker to brighten any outfit. Comfortable sole and durable construction.', material: 'Canvas upper, Rubber sole', seller: 'VibeWear Store' },

  // === ACCESSORIES ===
  { name: 'Leather Card Holder', brand: 'TrendNest', sub: 'Accessories', gender: 'Men', price: 999, original: 1499, rating: 4.3, reviews: 45, img: IMG.leatherShoesSweater, color: 'Black', colors: ['Black', 'Brown', 'Tan'], sizes: ONE_SIZE, stock: 60, desc: 'A slim, full-grain leather card holder with six card slots. Ages beautifully with use.', material: 'Full-grain Leather', seller: 'TrendNest Store' },
  { name: 'Leather Weekend Bag', brand: 'TrendNest', sub: 'Accessories', gender: 'Men', price: 3999, original: 5499, rating: 4.7, reviews: 22, img: IMG.brownBag, color: 'Brown', colors: ['Brown', 'Black', 'Tan'], sizes: ONE_SIZE, stock: 15, isNew: true, desc: 'A spacious full-grain leather weekend bag with detachable strap. Perfect for short trips.', material: 'Full-grain Leather', seller: 'TrendNest Store' },
  { name: 'Structured Top-Handle Bag', brand: 'TrendNest', sub: 'Accessories', gender: 'Women', price: 2799, original: 3999, rating: 4.4, reviews: 52, img: IMG.accessoryBag, color: 'Orange', colors: ['Orange', 'Black', 'Tan'], sizes: ONE_SIZE, stock: 20, desc: 'A structured top-handle bag with a detachable strap. Roomy enough for daily essentials.', material: 'Vegan Leather', seller: 'TrendNest Store' },
  { name: 'Crossbody Bag', brand: 'TrendNest', sub: 'Accessories', gender: 'Women', price: 1999, original: 2799, rating: 4.4, reviews: 61, img: IMG.blackBag, color: 'Black', colors: ['Black', 'Tan', 'Red'], sizes: ONE_SIZE, stock: 25, isNew: true, desc: 'A bold crossbody bag with an adjustable strap. Compact but roomy enough for essentials.', material: 'Vegan Leather', seller: 'TrendNest Store' },
  { name: 'Leather Tote Bag', brand: 'TrendNest', sub: 'Accessories', gender: 'Women', price: 2999, original: 4199, rating: 4.6, reviews: 38, img: IMG.brownBagStrap, color: 'Brown', colors: ['Brown', 'Black'], sizes: ONE_SIZE, stock: 14, desc: 'A spacious leather tote with an interior pocket and sturdy handles. Perfect for everyday use.', material: 'Genuine Leather', seller: 'TrendNest Store' },
];

export const products: Product[] = rawProducts.map((p, i) => ({
  id: i + 1,
  name: p.name,
  brand: p.brand,
  category: p.sub,
  subcategory: p.sub,
  gender: p.gender,
  price: p.price,
  original: p.original,
  rating: p.rating,
  reviews: p.reviews,
  image: p.img,
  gallery: [p.img, p.img],
  color: p.color,
  colors: p.colors,
  sizes: p.sizes,
  stock: p.stock,
  isNew: p.isNew,
  onSale: p.onSale,
  description: p.desc,
  material: p.material,
  care: 'Machine wash cold, hang dry. Do not bleach.',
  seller: p.seller,
}));

export const money = (value: number) => `₹${value.toLocaleString('en-IN')}`;

export const allColors = ['White', 'Black', 'Navy', 'Grey', 'Blue', 'Indigo', 'Stone', 'Olive', 'Sand', 'Pink', 'Yellow', 'Green', 'Red', 'Brown', 'Tan', 'Multicolor', 'Ivory', 'Sage', 'Rust', 'Ink', 'Oatmeal', 'Heather Grey', 'Camel', 'Burgundy', 'Light Blue', 'Sky', 'Dusty Pink', 'Cream', 'Charcoal', 'Moss'];

export const allSizes = ['XS', 'S', 'M', 'L', 'XL', '28', '30', '32', '34', '36', '6', '7', '8', '9', '10', '11', '2-3Y', '4-5Y', '6-7Y', '8-9Y', 'One Size'];
