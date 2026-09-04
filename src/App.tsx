import { useMemo, useState, useEffect, useRef } from 'react';
import {
  ArrowRight, BarChart3, Bell, Check, ChevronDown, ChevronLeft, ChevronRight, CircleUserRound,
  Filter, Heart, LayoutDashboard, Menu, Minus, Package, Plus, Search, ShoppingBag, SlidersHorizontal,
  Sparkles, Star, Tag, Trash2, Truck, Users, X, Zap, CreditCard, Smartphone, Banknote, Store,
  TrendingUp, DollarSign, Eye, Edit, CheckCircle, Clock, XCircle, PackageCheck
} from 'lucide-react';
import {
  type Product, type CartItem, type Order, type OrderItem, type Gender,
  products as mockProducts, brands, brandDescriptions, menSubcategories, womenSubcategories,
  money, allColors, heroImages,
} from './data';
import { AuthModal } from './AuthModal';
import { useAuth } from './hooks/useAuth';
import { signOut } from './lib/auth';
import { fetchProducts } from './lib/products';
import { fetchCartRows, replaceCartRows } from './lib/cart';
import { fetchWishlistIds, replaceWishlistIds } from './lib/wishlist';
import { placeOrderInDb, fetchOrdersForUser } from './lib/orders';



type View = 'home' | 'shop' | 'brands' | 'wishlist' | 'orders' | 'orderDetail' | 'account' | 'seller' | 'admin';
type Role = 'customer' | 'seller' | 'admin';
type PaymentMethod = 'demo_card' | 'demo_upi' | 'cod_demo';

interface ShopState {
  gender: string;
  subcategory: string;
  search: string;
  selectedBrands: string[];
  selectedSizes: string[];
  selectedColors: string[];
  priceRange: [number, number];
  minRating: number;
  onSaleOnly: boolean;
  newArrivalsOnly: boolean;
  sort: string;
}

const DEFAULT_SHOP: ShopState = {
  gender: 'All', subcategory: '', search: '',
  selectedBrands: [], selectedSizes: [], selectedColors: [],
  priceRange: [0, 7000], minRating: 0, onSaleOnly: false, newArrivalsOnly: false,
  sort: 'Recommended',
};

const COMMISSION_RATE = 0.10;

const SORT_OPTIONS = ['Recommended', 'Newest', 'Price: Low to High', 'Price: High to Low', 'Highest Rated', 'Biggest Discount'];

const COLOR_HEX: Record<string, string> = {
  White: '#fff', Black: '#222', Navy: '#1a2a4a', Grey: '#888', Blue: '#3b6ea5', Indigo: '#2b3a6b',
  Stone: '#d4cfc6', Olive: '#6b6b3a', Sand: '#d4c4a8', Pink: '#e8b8c8', Yellow: '#f0d040', Green: '#5a8a3a',
  Red: '#c25c3c', Brown: '#6b4a2a', Tan: '#c4a878', Multicolor: 'linear-gradient(45deg,#e74c3c,#f39c12,#3498db)',
  Ivory: '#f8f4e8', Sage: '#9caf88', Rust: '#b8552a', Ink: '#1a1a2e', Oatmeal: '#d4cbb8', 'Heather Grey': '#b8b4b0',
  Camel: '#c4a878', Burgundy: '#6b1a2a', 'Light Blue': '#a8c4e0', Sky: '#8ec4e0', 'Dusty Pink': '#d4a8b8',
  Cream: '#f4ecd8', Charcoal: '#3a3a3a', Moss: '#6a7a4a', 'Black White': '#444',
};

function App() {
  const [view, setView] = useState<View>('home');
  const [shop, setShop] = useState<ShopState>(DEFAULT_SHOP);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [liveProducts, setLiveProducts] = useState<Product[]>(mockProducts);
  const products = liveProducts;
  const { profile, refresh: refreshAuth } = useAuth();
  useEffect(() => {
    let active = true;
    fetchProducts()
      .then((live) => { if (active && live.length > 0) setLiveProducts(live); })
      .catch((err) => { console.error('Falling back to demo products:', err); });
    return () => { active = false; };
  }, []);

  // === CART/WISHLIST <-> SUPABASE SYNC ===
  const cartLoadedRef = useRef(false);
  useEffect(() => {
    if (!profile) { cartLoadedRef.current = false; return; }
    cartLoadedRef.current = false;
    let active = true;
    Promise.all([fetchCartRows(profile.id), fetchWishlistIds(profile.id)]).then(([cartRows, wishIds]) => {
      if (!active) return;
      const restoredCart: CartItem[] = cartRows
        .map((row) => {
          const product = products.find((p) => p.id === row.product_id);
          return product ? { ...product, size: row.size, color: row.color, quantity: row.quantity } : null;
        })
        .filter((c): c is CartItem => c !== null);
      setCart(restoredCart);
      setWishlist(wishIds);
      cartLoadedRef.current = true;
    });
    return () => { active = false; };
  }, [profile?.id, products]);

  useEffect(() => {
    if (!profile || !cartLoadedRef.current) return;
    replaceCartRows(profile.id, cart.map((c) => ({ product_id: c.id, size: c.size, color: c.color, quantity: c.quantity })));
  }, [cart, profile]);

  useEffect(() => {
    if (!profile || !cartLoadedRef.current) return;
    replaceWishlistIds(profile.id, wishlist);
  }, [wishlist, profile]);

  useEffect(() => {
    if (!profile) return;
    let active = true;
    fetchOrdersForUser(profile.id, profile.fullName || profile.email).then((fetched) => {
      if (active && fetched.length > 0) setOrders(fetched);
    });
    return () => { active = false; };
  }, [profile?.id]);

  const [selected, setSelected] = useState<Product | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [dropdown, setDropdown] = useState<string | null>(null);
  const [checkout, setCheckout] = useState(false);
  const [role, setRole] = useState<Role>('customer');
  const [toast, setToast] = useState('');
  const [orderDetailId, setOrderDetailId] = useState<string | null>(null);
  const [sellerTab, setSellerTab] = useState('overview');
  const [adminTab, setAdminTab] = useState('overview');
  
  const [searchFocused, setSearchFocused] = useState(false);
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchFocused(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const navTo = (next: View) => { setView(next); setMobileNav(false); setDropdown(null); };
  const navShop = (gender: string, sub: string = '') => {
    setShop({ ...DEFAULT_SHOP, gender, subcategory: sub });
    setView('shop'); setMobileNav(false); setDropdown(null);
  };
  const navSearch = (q: string) => {
    setShop({ ...DEFAULT_SHOP, search: q });
    setView('shop'); setMobileNav(false); setSearchFocused(false);
  };

  const filtered = useMemo(() => {
    let next = products.filter((p) => {
      if (shop.gender !== 'All' && p.gender !== shop.gender) return false;
      if (shop.subcategory && p.subcategory !== shop.subcategory) return false;
      if (shop.search) {
        const q = shop.search.toLowerCase().trim();
        const haystack = `${p.name} ${p.brand} ${p.category} ${p.subcategory} ${p.gender} ${p.color} ${p.colors.join(' ')} ${p.description}`.toLowerCase();
        if (!q.split(' ').every((word) => haystack.includes(word))) return false;
      }
      if (shop.selectedBrands.length && !shop.selectedBrands.includes(p.brand)) return false;
      if (shop.selectedSizes.length && !p.sizes.some((s) => shop.selectedSizes.includes(s))) return false;
      if (shop.selectedColors.length && !p.colors.some((c) => shop.selectedColors.includes(c))) return false;
      if (p.price < shop.priceRange[0] || p.price > shop.priceRange[1]) return false;
      if (p.rating < shop.minRating) return false;
      if (shop.onSaleOnly && !p.onSale) return false;
      if (shop.newArrivalsOnly && !p.isNew) return false;
      return true;
    });
    const s = shop.sort;
    if (s === 'Price: Low to High') next.sort((a, b) => a.price - b.price);
    if (s === 'Price: High to Low') next.sort((a, b) => b.price - a.price);
    if (s === 'Newest') next.sort((a, b) => Number(!!b.isNew) - Number(!!a.isNew));
    if (s === 'Highest Rated') next.sort((a, b) => b.rating - a.rating);
    if (s === 'Biggest Discount') next.sort((a, b) => (1 - b.price / b.original) - (1 - a.price / a.original));
    return next;
  }, [shop]);

  const searchSuggestions = useMemo(() => {
    if (!shop.search || shop.search.length < 2) return [];
    const q = shop.search.toLowerCase().trim();
    return products.filter((p) => {
      const haystack = `${p.name} ${p.brand} ${p.category} ${p.subcategory}`.toLowerCase();
      return q.split(' ').every((word) => haystack.includes(word));
    }).slice(0, 6);
  }, [shop.search]);

  const addToCart = (product: Product, size: string, color: string, qty: number = 1) => {
    setCart((items) => {
      const existing = items.find((item) => item.id === product.id && item.size === size && item.color === color);
      if (existing) return items.map((item) => item === existing ? { ...item, quantity: Math.min(item.quantity + qty, product.stock) } : item);
      return [...items, { ...product, size, color, quantity: qty }];
    });
    showToast('Added to your bag');
  };

  const buyNow = (product: Product, size: string, color: string) => {
    setBuyNowItem({ ...product, size, color, quantity: 1 });
    setSelected(null);
    startCheckout();
  };

  const startCheckout = () => {
    if (!profile) { setAuthModalOpen(true); showToast('Please log in to place an order'); return; }
    setCheckout(true);
  };

  const toggleWish = (id: string) => {
    setWishlist((items) => items.includes(id) ? items.filter((i) => i !== id) : [...items, id]);
    showToast(wishlist.includes(id) ? 'Removed from wishlist' : 'Saved to wishlist');
  };

  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const [buyNowItem, setBuyNowItem] = useState<CartItem | null>(null);
  const checkoutItems = buyNowItem ? [buyNowItem] : cart;
  const checkoutSubtotal = checkoutItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const cartCount = cart.reduce((a, b) => a + b.quantity, 0);

  const placeOrder = async (method: PaymentMethod, address: { name: string; phone: string; address: string; city: string; postal: string }) => {
    const orderItems: OrderItem[] = checkoutItems.map((item) => ({
      productId: item.id, name: item.name, brand: item.brand, image: item.image,
      size: item.size, color: item.color, quantity: item.quantity, price: item.price, seller: item.seller,
    }));
    const sub = orderItems.reduce((s, i) => s + i.price * i.quantity, 0);
    const ship = sub >= 1499 ? 0 : 99;

    if (!profile) { showToast('Please log in to place an order'); return; }

    try {
      await placeOrderInDb({
        userId: profile.id,
        items: checkoutItems.map((c) => ({ id: c.id, name: c.name, price: c.price, quantity: c.quantity, size: c.size, color: c.color })),
        subtotal: sub, discount: 0, shipping: ship, total: sub + ship,
        paymentMethod: method, address,
      });
    } catch (err) {
      console.error('placeOrderInDb failed:', err);
      showToast('Something went wrong placing your order. Please try again.');
      return;
    }

    const order: Order = {
      id: 'TH-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
      items: orderItems, subtotal: sub, discount: 0, shipping: ship, total: sub + ship,
      paymentMethod: method,
      paymentLabel: method === 'demo_card' ? 'Demo Card' : method === 'demo_upi' ? 'Demo UPI' : 'Cash on Delivery',
      status: 'Confirmed', date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      customer: profile.fullName || profile.email, address,
    };
    setOrders((prev) => [order, ...prev]);
    if (buyNowItem) { setBuyNowItem(null); } else { setCart([]); }
    setCheckout(false);
    showToast('Order placed successfully');
    setView('orders');
  };

  const orderDetail = orders.find((o) => o.id === orderDetailId);

  const megaMenuData = (gender: string) => {
    const subs = gender === 'Men' ? menSubcategories : womenSubcategories;
    const groups: { title: string; items: string[] }[] = [];
    const clothing = subs.filter((s) => ['Shirts', 'T-Shirts', 'Jeans', 'Trousers', 'Dresses', 'Tops'].includes(s));
    const outerwear = subs.filter((s) => ['Jackets', 'Hoodies'].includes(s));
    if (clothing.length) groups.push({ title: 'Clothing', items: clothing });
    if (outerwear.length) groups.push({ title: 'Outerwear', items: outerwear });
    groups.push({ title: 'More', items: ['Shoes', 'Accessories'] });
    return groups;
  };

  return <div className="app-shell">
    <div className="demo-strip"><Sparkles size={14} /> Demo Marketplace <span>Payments are simulated — no real money is charged.</span></div>
    <header className="site-header">
      <button className="mobile-menu" onClick={() => setMobileNav(!mobileNav)} aria-label="Open menu"><Menu size={21} /></button>
      <button className="wordmark" onClick={() => navTo('home')}><span>THREADLY</span><small>MARKET</small></button>
      <nav className={mobileNav ? 'main-nav is-open' : 'main-nav'}>
        <button onClick={() => navShop('All')}>Shop</button>
        <div className="nav-dropdown" onMouseEnter={() => setDropdown('men')} onMouseLeave={() => setDropdown(null)}>
          <button onClick={() => navShop('Men')} className={dropdown === 'men' ? 'active' : ''}>Men <ChevronDown size={13} /></button>
          {dropdown === 'men' && <div className="dropdown-menu">
            {megaMenuData('Men').map((g) => <div key={g.title} className="mega-group">
              <p className="mega-group-title">{g.title}</p>
              {g.items.map((s) => <button key={s} onClick={() => navShop('Men', s)}>{s}</button>)}
            </div>)}
          </div>}
        </div>
        <div className="nav-dropdown" onMouseEnter={() => setDropdown('women')} onMouseLeave={() => setDropdown(null)}>
          <button onClick={() => navShop('Women')} className={dropdown === 'women' ? 'active' : ''}>Women <ChevronDown size={13} /></button>
          {dropdown === 'women' && <div className="dropdown-menu">
            {megaMenuData('Women').map((g) => <div key={g.title} className="mega-group">
              <p className="mega-group-title">{g.title}</p>
              {g.items.map((s) => <button key={s} onClick={() => navShop('Women', s)}>{s}</button>)}
            </div>)}
          </div>}
        </div>
        <button onClick={() => { setShop({ ...DEFAULT_SHOP, newArrivalsOnly: true }); navTo('shop'); }}>New In</button>
        <button onClick={() => { setShop({ ...DEFAULT_SHOP, onSaleOnly: true }); navTo('shop'); }}>Sale</button>
        <button onClick={() => navTo('brands')}>Brands</button>
      </nav>
      <div className="header-actions">
        <div className="search-box" ref={searchRef}>
          <Search size={16} />
          <input
            value={shop.search}
            onChange={(e) => { setShop({ ...shop, search: e.target.value }); if (view !== 'shop') setView('shop'); }}
            onFocus={() => setSearchFocused(true)}
            placeholder="Search products, brands..."
          />
          {shop.search && <button className="search-clear" onClick={() => setShop({ ...shop, search: '' })}><X size={15} /></button>}
          {searchFocused && searchSuggestions.length > 0 && <div className="search-suggestions">
            <div className="suggestion-section">Products</div>
            {searchSuggestions.map((p) => <button key={p.id} className="suggestion-item" onClick={() => { setSelected(p); setSearchFocused(false); setShop({ ...shop, search: '' }); }}>
              <img src={p.image} alt={p.name} />
              <div className="sugg-info"><strong>{p.name}</strong><small>{p.brand} · {p.gender}</small></div>
              <span className="sugg-price">{money(p.price)}</span>
            </button>)}
          </div>}
        </div>
        <button className="icon-btn" onClick={() => navTo('account')} aria-label="Account"><CircleUserRound size={20} /><span className="nav-label">Account</span></button>
        <button className="icon-btn desktop-only" onClick={() => navTo('wishlist')} aria-label="Wishlist"><Heart size={20} fill={wishlist.length ? 'currentColor' : 'none'} /><sup>{wishlist.length}</sup></button>
        <button className="icon-btn" onClick={() => setCartOpen(true)} aria-label="Bag"><ShoppingBag size={20} /><sup>{cartCount}</sup></button>
      </div>
    </header>

    {view === 'home' && <Home products={products} onShop={() => navShop('All')} onProduct={setSelected} onBrand={(b) => { setShop({ ...DEFAULT_SHOP, selectedBrands: [b] }); navTo('shop'); }} onCategory={navShop} />}
    {view === 'shop' && <Shop products={filtered} shop={shop} setShop={setShop} onProduct={setSelected} wishlist={wishlist} toggleWish={toggleWish} onNavShop={navShop} />}
    {view === 'brands' && <Brands onBrand={(b) => { setShop({ ...DEFAULT_SHOP, selectedBrands: [b] }); navTo('shop'); }} />}
    {view === 'wishlist' && <Wishlist items={products.filter((p) => wishlist.includes(p.id))} onProduct={setSelected} toggleWish={toggleWish} onMoveToCart={addToCart} />}
    {view === 'orders' && <Orders orders={orders} onView={(id) => { setOrderDetailId(id); navTo('orderDetail'); }} />}
    {view === 'orderDetail' && orderDetail && <OrderDetail order={orderDetail} onBack={() => navTo('orders')} />}
    {view === 'account' && <Account role={role} setRole={setRole} onSeller={() => { setView('seller'); }} onAdmin={() => { setView('admin'); }} orders={orders} onViewOrder={(id) => { setOrderDetailId(id); navTo('orderDetail'); }} profile={profile} onLoginClick={() => setAuthModalOpen(true)} onLogout={async () => { await signOut(); refreshAuth(); }} />}
    {view === 'seller' && <SellerDashboard tab={sellerTab} setTab={setSellerTab} onBack={() => navTo('home')} orders={orders} products={products.filter((p) => p.seller === 'Urban Thread Store')} onProduct={setSelected} onViewOrder={(id) => { setOrderDetailId(id); navTo('orderDetail'); }} />}
    {view === 'admin' && <AdminDashboard tab={adminTab} setTab={setAdminTab} onBack={() => navTo('home')} orders={orders} products={products} onViewOrder={(id) => { setOrderDetailId(id); navTo('orderDetail'); }} />}

    {view !== 'seller' && view !== 'admin' && <Footer onSeller={() => navTo('seller')} onCategory={navShop} />}
    {selected && <ProductModal product={selected} onClose={() => setSelected(null)} onAdd={addToCart} onBuy={buyNow} isWishlisted={wishlist.includes(selected.id)} toggleWish={toggleWish} related={products.filter((p) => p.subcategory === selected.subcategory && p.gender === selected.gender && p.id !== selected.id).slice(0, 4)} onProduct={setSelected} />}
    {cartOpen && <CartDrawer cart={cart} setCart={setCart} subtotal={subtotal} onClose={() => setCartOpen(false)} onCheckout={() => { setCartOpen(false); startCheckout(); }} />}
    {checkout && <Checkout subtotal={checkoutSubtotal} cart={checkoutItems} onClose={() => { setCheckout(false); setBuyNowItem(null); }} onComplete={placeOrder} />}
    {toast && <div className="toast"><Check size={16} />{toast}<button onClick={() => setToast('')}><X size={14} /></button></div>}
       {authModalOpen && <AuthModal onClose={() => setAuthModalOpen(false)} onSuccess={() => { setAuthModalOpen(false); refreshAuth(); }} />}
  </div>;
}
  

// === BREADCRUMBS ===
function Breadcrumbs({ items, onNav }: { items: { label: string; onClick?: () => void }[] }) {
  return <div className="breadcrumbs">
    {items.map((item, i) => <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {i > 0 && <span className="crumb-sep">/</span>}
      {item.onClick ? <button onClick={item.onClick}>{item.label}</button> : <span className="crumb-current">{item.label}</span>}
    </span>)}
  </div>;
}

// === HOME ===
function Home({ products, onShop, onProduct, onBrand, onCategory }: { products: Product[]; onShop: () => void; onProduct: (p: Product) => void; onBrand: (b: string) => void; onCategory: (g: string, s?: string) => void }) {
  const [heroIdx, setHeroIdx] = useState(0);
  useEffect(() => { const t = setInterval(() => setHeroIdx((i) => (i + 1) % heroImages.length), 5000); return () => clearInterval(t); }, []);
  return <main>
    <section className="hero">
      <div className="hero-copy">
        <p className="eyebrow">The September edit · 2025</p>
        <h1>Style for<br /><em>Everyone</em></h1>
        <p className="hero-intro">Discover fashion from trusted sellers and brands for the whole family. Thoughtful pieces, curated for every version of you.</p>
        <div className="hero-buttons">
          <button className="button button-dark" onClick={onShop}>Shop Now <ArrowRight size={16} /></button>
          <button className="button button-outline" onClick={() => onBrand('All')}>Explore Brands</button>
        </div>
      </div>
      <div className="hero-image">
        <img src={heroImages[heroIdx]} alt="Family enjoying a fashion shopping trip" />
        <div className="hero-dots">{heroImages.map((_, i) => <button key={i} className={i === heroIdx ? 'active' : ''} onClick={() => setHeroIdx(i)} />)}</div>
      </div>
    </section>
    <section className="ticker"><span>Independent labels</span><span>Considered design</span><span>Made to be lived in</span><span>Free delivery over ₹1,499</span></section>

    <section className="section">
      <SectionHeading eyebrow="Shop by category" title="Find your section" />
      <div className="home-cats">
        <button className="home-cat" onClick={() => onCategory('Men')}><img src={heroImages[2]} alt="Men" /><div><h3>Men</h3><span>Shirts, Tees, Jeans & more</span></div></button>
        <button className="home-cat" onClick={() => onCategory('Women')}><img src={heroImages[3]} alt="Women" /><div><h3>Women</h3><span>Dresses, Tops, Jeans & more</span></div></button>
        <button className="home-cat" onClick={() => onCategory('Kids')}><img src={heroImages[0]} alt="Kids" /><div><h3>Kids</h3><span>Shirts, Dresses, Jeans & more</span></div></button>
      </div>
    </section>

    <section className="section">
      <SectionHeading eyebrow="Just landed" title="New Arrivals" action="View all" onClick={onShop} />
      <div className="product-grid four">{products.filter((p) => p.isNew).slice(0, 8).map((p) => <ProductCard key={p.id} product={p} onProduct={onProduct} />)}</div>
    </section>

    <section className="split-feature">
      <div className="feature-image"><img src={heroImages[1]} alt="Father and son with shopping bags" /></div>
      <div className="feature-copy">
        <p className="eyebrow">The Threadly journal</p>
        <h2>Less, but<br /><em>better.</em></h2>
        <p>We believe in a wardrobe that works harder. Discover the people, places and ideas behind the brands we bring together.</p>
        <button className="text-button">Read the journal <ArrowRight size={16} /></button>
      </div>
    </section>

    <section className="section">
      <SectionHeading eyebrow="Most loved" title="Best Sellers" />
      <div className="product-grid four">{products.filter((p) => p.reviews > 80).slice(0, 4).map((p) => <ProductCard key={p.id} product={p} onProduct={onProduct} />)}</div>
    </section>

    <section className="section brands-row">
      <SectionHeading eyebrow="The collective" title="Popular Brands" action="All brands" onClick={() => onBrand('All')} />
      <div className="brand-list">{brands.map((brand, i) => <button key={brand} onClick={() => onBrand(brand)}><span className={`brand-mark mark-${i % 5}`}>{brand.slice(0, 1)}</span><strong>{brand}</strong><small>Explore label <ArrowRight size={13} style={{ transform: 'rotate(-45deg)' }} /></small></button>)}</div>
    </section>

    <section className="section">
      <SectionHeading eyebrow="Limited time" title="Seasonal Offers" action="Shop sale" onClick={() => onCategory('All')} />
      <div className="product-grid four">{products.filter((p) => p.onSale).slice(0, 4).map((p) => <ProductCard key={p.id} product={p} onProduct={onProduct} />)}</div>
    </section>

    <section className="newsletter">
      <div><p className="eyebrow">A note from Threadly</p><h2>Good things,<br /><em>in your inbox.</em></h2></div>
      <div><p>New drops, thoughtful stories and 10% off your first order. No noise, just the good stuff.</p>
        <div className="email-form"><input placeholder="Your email address" /><button className="button button-dark">Join us <ArrowRight size={15} /></button></div>
      </div>
    </section>
  </main>;
}

function SectionHeading({ eyebrow, title, action, onClick }: { eyebrow: string; title: string; action?: string; onClick?: () => void }) {
  return <div className="section-heading"><div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2></div>{action && <button className="text-button" onClick={onClick}>{action} <ArrowRight size={15} /></button>}</div>;
}

// === PRODUCT CARD ===
function ProductCard({ product, onProduct, toggleWish, isWishlisted }: { product: Product; onProduct: (p: Product) => void; toggleWish?: (id: string) => void; isWishlisted?: boolean }) {
  return <article className="product-card">
    <div className="product-image" onClick={() => onProduct(product)}>
      <img src={product.image} alt={product.name} />
      {product.isNew && <span className="badge badge-new">New</span>}
      {product.onSale && <span className="badge badge-sale">Sale</span>}
      {toggleWish && <button className={`heart-btn ${isWishlisted ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); toggleWish(product.id); }}><Heart size={17} fill={isWishlisted ? 'currentColor' : 'none'} /></button>}
    </div>
    <div className="product-meta">
      <p className="product-brand">{product.brand}</p>
      <button className="product-name" onClick={() => onProduct(product)}>{product.name}</button>
      <div className="rating"><Star size={13} fill="currentColor" /> {product.rating} <span>({product.reviews})</span></div>
      <div className="product-bottom">
        <span className="price">{money(product.price)}</span>
        {product.original > product.price && <span className="old-price">{money(product.original)}</span>}
        {product.original > product.price && <span className="discount">{Math.round((1 - product.price / product.original) * 100)}% off</span>}
      </div>
    </div>
  </article>;
}

// === SHOP with sidebar filters ===
function Shop({ products: items, shop, setShop, onProduct, wishlist, toggleWish, onNavShop }: {
  products: Product[]; shop: ShopState; setShop: (s: ShopState) => void;
  onProduct: (p: Product) => void; wishlist: string[]; toggleWish: (n: string) => void; onNavShop: (g: string, s?: string) => void;
}) {
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const toggleArr = (arr: string[], val: string) => arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];

  const heading = shop.search ? `Results for "${shop.search}"` : shop.subcategory ? shop.subcategory : shop.gender === 'All' ? 'All Products' : shop.gender;
  const crumbItems = useMemo(() => {
    const items: { label: string; onClick?: () => void }[] = [{ label: 'Home', onClick: () => onNavShop('All') }];
    if (shop.search) { items.push({ label: 'Search', onClick: () => onNavShop('All') }); items.push({ label: `"${shop.search}"` }); return items; }
    if (shop.gender !== 'All') { items.push({ label: shop.gender, onClick: () => onNavShop(shop.gender) }); }
    if (shop.subcategory) { items.push({ label: shop.subcategory }); }
    return items;
  }, [shop.gender, shop.subcategory, shop.search, onNavShop]);

  const clearFilters = () => setShop({ ...shop, selectedBrands: [], selectedSizes: [], selectedColors: [], priceRange: [0, 7000], minRating: 0, onSaleOnly: false, newArrivalsOnly: false });

  const filterContent = (<>
    <FilterSection title="Category">
      {shop.gender === 'All' ? ['Men', 'Women', 'Kids'].map((g) => <button key={g} className={`filter-chip ${shop.gender === g ? 'active' : ''}`} onClick={() => setShop({ ...shop, gender: g, subcategory: '' })}>{g}</button>) :
        (shop.gender === 'Men' ? menSubcategories : shop.gender === 'Women' ? womenSubcategories : ['Shirts', 'T-Shirts', 'Dresses', 'Jeans', 'Hoodies']).map((s) => <button key={s} className={`filter-chip ${shop.subcategory === s ? 'active' : ''}`} onClick={() => setShop({ ...shop, subcategory: shop.subcategory === s ? '' : s })}>{s}</button>)
      }
    </FilterSection>
    <FilterSection title="Brand">
      {brands.map((b) => <label key={b} className="filter-check"><input type="checkbox" checked={shop.selectedBrands.includes(b)} onChange={() => setShop({ ...shop, selectedBrands: toggleArr(shop.selectedBrands, b) })} /> {b}</label>)}
    </FilterSection>
    <FilterSection title="Size">
      <div className="filter-sizes">{['XS', 'S', 'M', 'L', 'XL', '28', '30', '32', '34', '36', '6', '7', '8', '9', '10', '2-3Y', '4-5Y', '6-7Y', '8-9Y'].map((s) => <button key={s} className={`size-chip ${shop.selectedSizes.includes(s) ? 'active' : ''}`} onClick={() => setShop({ ...shop, selectedSizes: toggleArr(shop.selectedSizes, s) })}>{s}</button>)}</div>
    </FilterSection>
    <FilterSection title="Color">
      <div className="filter-colors">{allColors.slice(0, 18).map((c) => <button key={c} className={`color-chip ${shop.selectedColors.includes(c) ? 'active' : ''}`} onClick={() => setShop({ ...shop, selectedColors: toggleArr(shop.selectedColors, c) })}><span className="color-dot" style={{ background: COLOR_HEX[c] || '#ccc' }} />{c}</button>)}</div>
    </FilterSection>
    <FilterSection title="Price Range">
      <div className="price-range-display">{money(shop.priceRange[0])} — {money(shop.priceRange[1])}</div>
      <input type="range" min={0} max={7000} step={500} value={shop.priceRange[1]} onChange={(e) => setShop({ ...shop, priceRange: [shop.priceRange[0], Number(e.target.value)] })} className="range-slider" />
    </FilterSection>
    <FilterSection title="Rating">
      {[4, 3, 2].map((r) => <label key={r} className="filter-check"><input type="radio" name="rating" checked={shop.minRating === r} onChange={() => setShop({ ...shop, minRating: r })} /> {r}★ & above</label>)}
      {shop.minRating > 0 && <button className="text-button" onClick={() => setShop({ ...shop, minRating: 0 })}>Clear rating</button>}
    </FilterSection>
    <FilterSection title="Availability">
      <label className="filter-check"><input type="checkbox" checked={shop.onSaleOnly} onChange={() => setShop({ ...shop, onSaleOnly: !shop.onSaleOnly })} /> On Sale</label>
      <label className="filter-check"><input type="checkbox" checked={shop.newArrivalsOnly} onChange={() => setShop({ ...shop, newArrivalsOnly: !shop.newArrivalsOnly })} /> New Arrivals</label>
    </FilterSection>
  </>);

  return <main className="shop-page">
    <div className="page-intro compact">
      <Breadcrumbs items={crumbItems} />
      <h1>{heading}</h1>
      <p>{items.length} {items.length === 1 ? 'product' : 'products'} available</p>
    </div>
    <div className="shop-layout">
      <aside className="filter-sidebar">
        <div className="filter-head"><strong><Filter size={16} /> Filters</strong><button className="text-button" onClick={clearFilters}>Clear all</button></div>
        {filterContent}
      </aside>

      <div className="shop-main">
        <div className="shop-toolbar">
          <span className="results-count">{items.length} {items.length === 1 ? 'product' : 'products'}</span>
          <div className="sort-select"><SlidersHorizontal size={16} /><select value={shop.sort} onChange={(e) => setShop({ ...shop, sort: e.target.value })}>
            {SORT_OPTIONS.map((o) => <option key={o}>{o}</option>)}
          </select><ChevronDown size={15} /></div>
        </div>

        <div className="mobile-filter-bar">
          <button onClick={() => setMobileFilterOpen(true)}><Filter size={16} /> Filters</button>
          <button onClick={() => setSortOpen(true)}><SlidersHorizontal size={16} /> Sort</button>
        </div>

        {items.length ? <div className="shop-results"><div className="product-grid four">{items.map((p) => <ProductCard key={p.id} product={p} onProduct={onProduct} toggleWish={toggleWish} isWishlisted={wishlist.includes(p.id)} />)}</div></div>
          : <div className="empty-state"><Search size={28} /><h2>No products found</h2><p>Try adjusting your filters or search for something else.</p><button className="button button-dark" onClick={clearFilters}>Clear all filters</button></div>}
      </div>
    </div>

    <div className={`filter-drawer-backdrop ${mobileFilterOpen ? 'open' : ''}`} onClick={() => setMobileFilterOpen(false)} />
    <div className={`filter-drawer ${mobileFilterOpen ? 'open' : ''}`}>
      <div className="filter-drawer-head"><strong>Filters</strong><button onClick={() => setMobileFilterOpen(false)}><X size={20} /></button></div>
      <div className="filter-drawer-body">{filterContent}</div>
      <div className="filter-drawer-foot">
        <button className="button button-outline" onClick={clearFilters}>Clear all</button>
        <button className="button button-dark" onClick={() => setMobileFilterOpen(false)}>Show {items.length} results</button>
      </div>
    </div>

    <div className={`filter-drawer-backdrop ${sortOpen ? 'open' : ''}`} onClick={() => setSortOpen(false)} />
    <div className={`sort-dropdown ${sortOpen ? 'open' : ''}`}>
      <div className="sort-dropdown-head">Sort by</div>
      {SORT_OPTIONS.map((o) => <button key={o} className={shop.sort === o ? 'active' : ''} onClick={() => { setShop({ ...shop, sort: o }); setSortOpen(false); }}>{o} {shop.sort === o && <Check size={16} />}</button>)}
    </div>
  </main>;
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return <div className="filter-section">
    <button className="filter-title" onClick={() => setOpen(!open)}>{title} <ChevronDown size={15} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} /></button>
    {open && <div className="filter-content">{children}</div>}
  </div>;
}

// === BRANDS ===
function Brands({ onBrand }: { onBrand: (b: string) => void }) {
  const [search, setSearch] = useState('');
  const filtered = brands.filter((b) => b.toLowerCase().includes(search.toLowerCase()));
  return <main className="brands-page">
    <div className="page-intro"><p className="eyebrow">The collective</p><h1>Brands with<br /><em>a point of view.</em></h1><p>Independent labels selected for their quality, clarity and commitment to better design.</p></div>
    <div className="brand-search"><Search size={17} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search brands..." /></div>
    <div className="brand-cards">
      {filtered.map((b, i) => <button key={b} onClick={() => onBrand(b)}>
        <div className={`large-brand-mark mark-${i % 5}`}>{b.slice(0, 1)}</div>
        <div><h2>{b}</h2><p>{brandDescriptions[b]}</p><span>View collection <ArrowRight size={15} /></span></div>
      </button>)}
    </div>
  </main>;
}

// === WISHLIST ===
function Wishlist({ items, onProduct, toggleWish, onMoveToCart }: { items: Product[]; onProduct: (p: Product) => void; toggleWish: (n: string) => void; onMoveToCart: (p: Product, s: string, c: string) => void }) {
  return <main className="shop-page">
    <div className="page-intro compact">
      <Breadcrumbs items={[{ label: 'Home', onClick: () => { if (items[0]) onProduct(items[0]); } }, { label: 'Wishlist' }]} />
      <h1>Wishlist</h1>
      <p>{items.length} {items.length === 1 ? 'piece' : 'pieces'} waiting for you.</p>
    </div>
    {items.length ? <div className="shop-results"><div className="product-grid four">
      {items.map((p) => <article key={p.id} className="product-card">
        <div className="product-image" onClick={() => onProduct(p)}>
          <img src={p.image} alt={p.name} />
          <button className="heart-btn active" onClick={(e) => { e.stopPropagation(); toggleWish(p.id); }}><Heart size={17} fill="currentColor" /></button>
        </div>
        <div className="product-meta">
          <p className="product-brand">{p.brand}</p>
          <button className="product-name" onClick={() => onProduct(p)}>{p.name}</button>
          <div className="rating"><Star size={13} fill="currentColor" /> {p.rating} <span>({p.reviews})</span></div>
          <div className="product-bottom"><span className="price">{money(p.price)}</span></div>
          <div className="wishlist-actions">
            <button className="button button-dark small" onClick={() => onMoveToCart(p, p.sizes[0], p.colors[0])}><ShoppingBag size={14} /> Move to bag</button>
            <button className="text-button" onClick={() => toggleWish(p.id)}>Remove</button>
          </div>
        </div>
      </article>)}
    </div></div> : <div className="empty-state"><Heart size={28} /><h2>Your wishlist is waiting</h2><p>Save pieces you love and find them here later.</p></div>}
  </main>;
}

// === PRODUCT DETAIL MODAL ===
function ProductModal({ product, onClose, onAdd, onBuy, isWishlisted, toggleWish, related, onProduct }: {
  product: Product; onClose: () => void; onAdd: (p: Product, s: string, c: string, q?: number) => void; onBuy: (p: Product, s: string, c: string) => void;
  isWishlisted: boolean; toggleWish: (n: string) => void; related: Product[]; onProduct: (p: Product) => void;
}) {
  const [size, setSize] = useState(product.sizes[0]);
  const [color, setColor] = useState(product.colors[0]);
  const [qty, setQty] = useState(1);

  return <div className="modal-backdrop" onClick={onClose}>
    <div className="product-modal" onClick={(e) => e.stopPropagation()}>
      <button className="close-btn" onClick={onClose}><X size={20} /></button>
      <div className="modal-gallery">
        <div className="modal-main-image"><img src={product.image} alt={product.name} /></div>
      </div>
      <div className="modal-content">
        <p className="eyebrow">{product.brand}</p>
        <h2>{product.name}</h2>
        <div className="modal-rating"><Star size={15} fill="currentColor" /> {product.rating} <span>{product.reviews} reviews</span></div>
        <div className="modal-price"><strong>{money(product.price)}</strong>{product.original > product.price && <><del>{money(product.original)}</del><span className="discount">{Math.round((1 - product.price / product.original) * 100)}% off</span></>}</div>
        <p className="modal-description">{product.description}</p>

        <div className="option-row"><span>Color: <strong>{color}</strong></span><span className={`stock ${product.stock < 10 ? 'low' : ''}`}>{product.stock < 10 ? `Only ${product.stock} left` : 'In stock'}</span></div>
        <div className="color-row">{product.colors.map((c) => <button key={c} className={`color-swatch ${color === c ? 'active' : ''}`} onClick={() => setColor(c)}>{c}</button>)}</div>

        <div className="option-row"><span>Size: <strong>{size}</strong></span><button className="text-button">Size guide</button></div>
        <div className="size-row">{product.sizes.map((s) => <button key={s} className={size === s ? 'selected' : ''} onClick={() => setSize(s)}>{s}</button>)}</div>

        <div className="qty-row"><span>Quantity</span><div className="qty-control"><button onClick={() => setQty(Math.max(1, qty - 1))}><Minus size={15} /></button><span>{qty}</span><button onClick={() => setQty(Math.min(product.stock, qty + 1))}><Plus size={15} /></button></div></div>

        <div className="modal-actions">
          <button className="button button-dark full" onClick={() => onAdd(product, size, color, qty)}><ShoppingBag size={16} /> Add to Cart</button>
          <button className="button button-outline full" onClick={() => onBuy(product, size, color)}><Zap size={16} /> Buy Now</button>
          <button className={`save-btn ${isWishlisted ? 'saved' : ''}`} onClick={() => toggleWish(product.id)}><Heart size={18} fill={isWishlisted ? 'currentColor' : 'none'} /></button>
        </div>

        <div className="modal-info-grid">
          <div><strong>Material</strong><span>{product.material}</span></div>
          <div><strong>Care</strong><span>{product.care}</span></div>
          <div><strong>Seller</strong><span>{product.seller}</span></div>
          <div><strong>Shipping</strong><span>Free over ₹1,499</span></div>
          <div><strong>Returns</strong><span>14-day easy returns</span></div>
          <div><strong>SKU</strong><span>TM-{product.id.toString().padStart(4, '0')}</span></div>
        </div>
      </div>

      {related.length > 0 && <div className="modal-related">
        <h3>You might also like</h3>
        <div className="related-grid">{related.map((p) => <button key={p.id} className="related-card" onClick={() => { onProduct(p); onClose(); }}>
          <img src={p.image} alt={p.name} /><div><p className="product-brand">{p.brand}</p><strong>{p.name}</strong><span className="price">{money(p.price)}</span></div>
        </button>)}</div>
      </div>}
    </div>
  </div>;
}

// === CART DRAWER ===
function CartDrawer({ cart, setCart, subtotal, onClose, onCheckout }: { cart: CartItem[]; setCart: React.Dispatch<React.SetStateAction<CartItem[]>>; subtotal: number; onClose: () => void; onCheckout: () => void }) {
  const shipping = subtotal >= 1499 ? 0 : 99;
  return <div className="drawer-backdrop" onClick={onClose}>
    <aside className="cart-drawer" onClick={(e) => e.stopPropagation()}>
      <div className="drawer-head"><div><p className="eyebrow">Your selection</p><h2>Your Bag <span>({cart.length})</span></h2></div><button className="close-btn" onClick={onClose}><X size={20} /></button></div>
      {cart.length ? <>
        <div className="cart-items">{cart.map((item) => <div className="cart-item" key={`${item.id}-${item.size}-${item.color}`}>
          <img src={item.image} alt={item.name} />
          <div>
            <p className="product-brand">{item.brand}</p>
            <strong>{item.name}</strong>
            <small>Size: {item.size} · Color: {item.color}</small>
            <small>Price: {money(item.price)}</small>
            <div className="quantity">
              <button onClick={() => setCart((c) => c.map((x) => x === item ? { ...x, quantity: Math.max(1, x.quantity - 1) } : x))}><Minus size={15} /></button>
              <span>{item.quantity}</span>
              <button onClick={() => setCart((c) => c.map((x) => x === item ? { ...x, quantity: Math.min(item.stock, x.quantity + 1) } : x))}><Plus size={15} /></button>
              <button className="remove" onClick={() => setCart((c) => c.filter((x) => x !== item))}><Trash2 size={14} /></button>
            </div>
            <small className="item-subtotal">Subtotal: {money(item.price * item.quantity)}</small>
          </div>
        </div>)}</div>
        <div className="cart-summary">
          <div><span>Subtotal</span><strong>{money(subtotal)}</strong></div>
          <div><span>Delivery</span><span className={shipping === 0 ? 'free' : ''}>{shipping === 0 ? 'Free' : money(shipping)}</span></div>
          <div className="total"><span>Total</span><strong>{money(subtotal + shipping)}</strong></div>
          <button className="button button-dark full" onClick={onCheckout}>Proceed to Checkout <ArrowRight size={16} /></button>
          <p className="demo-caption">Demo checkout · no payment will be charged</p>
        </div>
      </> : <div className="empty-state"><ShoppingBag size={28} /><h2>Your bag is empty</h2><p>Add pieces to your bag to get started.</p></div>}
    </aside>
  </div>;
}

// === CHECKOUT with all 3 payment methods ===
function Checkout({ subtotal, cart, onClose, onComplete }: { subtotal: number; cart: CartItem[]; onClose: () => void; onComplete: (method: PaymentMethod, address: { name: string; phone: string; address: string; city: string; postal: string }) => void }) {
  const [step, setStep] = useState(1);
  const [delivery, setDelivery] = useState('standard');
  const [payMethod, setPayMethod] = useState<PaymentMethod>('demo_card');
  const [card, setCard] = useState({ number: '', expiry: '', cvv: '' });
  const [upi, setUpi] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [addr, setAddr] = useState({ name: '', phone: '', address: '', city: '', postal: '' });

  const shipping = delivery === 'express' ? 149 : (subtotal >= 1499 ? 0 : 99);
  const total = subtotal + shipping;

  const validateAddress = () => {
    const e: Record<string, string> = {};
    if (!addr.name.trim()) e.name = 'Name is required';
    if (!addr.phone.trim()) e.phone = 'Phone is required';
    else if (addr.phone.length < 10) e.phone = 'Enter a valid phone number';
    if (!addr.address.trim()) e.address = 'Address is required';
    if (!addr.city.trim()) e.city = 'City is required';
    if (!addr.postal.trim()) e.postal = 'Postal code is required';
    else if (addr.postal.length < 6) e.postal = 'Enter a valid postal code';
    setErrors(e); return Object.keys(e).length === 0;
  };

  const validatePayment = () => {
    const e: Record<string, string> = {};
    if (payMethod === 'demo_card') {
      if (!card.number.trim()) e.cardNumber = 'Card number is required';
      else if (card.number.replace(/\s/g, '').length < 12) e.cardNumber = 'Enter a valid card number';
      if (!card.expiry.trim()) e.expiry = 'Expiry date is required';
      else if (!/^\d{2}\/\d{2}$/.test(card.expiry)) e.expiry = 'Use MM/YY format';
      if (!card.cvv.trim()) e.cvv = 'CVV is required';
      else if (card.cvv.length < 3) e.cvv = 'Enter a valid CVV';
    } else if (payMethod === 'demo_upi') {
      if (!upi.trim()) e.upi = 'UPI ID is required';
      else if (!upi.includes('@')) e.upi = 'Enter a valid UPI ID (e.g. name@bank)';
    }
    setErrors(e); return Object.keys(e).length === 0;
  };

  const handlePlaceOrder = () => {
    if (validatePayment()) onComplete(payMethod, addr);
  };

  return <div className="modal-backdrop"><div className="checkout-modal">
    <div className="checkout-head"><button className="wordmark"><span>THREADLY</span><small>MARKET</small></button><button onClick={onClose}><X size={20} /></button></div>
    <div className="checkout-steps">
      <span className={step >= 1 ? 'active' : ''}>01 Address</span>
      <span className={step >= 2 ? 'active' : ''}>02 Delivery</span>
      <span className={step >= 3 ? 'active' : ''}>03 Payment</span>
    </div>

    {step === 1 && <div className="checkout-body">
      <div><p className="eyebrow">Delivery details</p><h2>Where should we send it?</h2>
        <div className="checkout-form">
          <input placeholder="Full name" value={addr.name} onChange={(e) => setAddr({ ...addr, name: e.target.value })} className={errors.name ? 'error' : ''} />
          {errors.name && <span className="err-msg">{errors.name}</span>}
          <input placeholder="Phone number" value={addr.phone} onChange={(e) => setAddr({ ...addr, phone: e.target.value })} className={errors.phone ? 'error' : ''} />
          {errors.phone && <span className="err-msg">{errors.phone}</span>}
          <input placeholder="Address" className="wide" value={addr.address} onChange={(e) => setAddr({ ...addr, address: e.target.value })} />
          {errors.address && <span className="err-msg wide">{errors.address}</span>}
          <input placeholder="City" value={addr.city} onChange={(e) => setAddr({ ...addr, city: e.target.value })} className={errors.city ? 'error' : ''} />
          <input placeholder="Postal code" value={addr.postal} onChange={(e) => setAddr({ ...addr, postal: e.target.value })} className={errors.postal ? 'error' : ''} />
          {errors.city && <span className="err-msg">{errors.city}</span>}
          {errors.postal && <span className="err-msg">{errors.postal}</span>}
        </div>
        <button className="button button-dark" onClick={() => { if (validateAddress()) setStep(2); }}>Continue to delivery <ArrowRight size={16} /></button>
      </div>
      <OrderSummary subtotal={subtotal} shipping={shipping} total={total} />
    </div>}

    {step === 2 && <div className="checkout-body">
      <div><p className="eyebrow">Delivery method</p><h2>Choose your delivery</h2>
        <div className="delivery-options">
          <button className={delivery === 'standard' ? 'selected' : ''} onClick={() => setDelivery('standard')}><Truck size={20} /><span><strong>Standard delivery</strong><small>Arrives in 3–5 business days</small></span><b>{subtotal >= 1499 ? 'Free' : '₹99'}</b></button>
          <button className={delivery === 'express' ? 'selected' : ''} onClick={() => setDelivery('express')}><Zap size={20} /><span><strong>Express delivery</strong><small>Arrives in 1–2 business days</small></span><b>₹149</b></button>
        </div>
        <div className="step-nav"><button className="text-button" onClick={() => setStep(1)}><ChevronLeft size={15} /> Back</button><button className="button button-dark" onClick={() => setStep(3)}>Continue to payment <ArrowRight size={16} /></button></div>
      </div>
      <OrderSummary subtotal={subtotal} shipping={shipping} total={total} />
    </div>}

    {step === 3 && <div className="checkout-body">
      <div><p className="eyebrow">Demo payment</p><h2>Complete your order</h2>
        <div className="demo-alert"><Sparkles size={17} /><span>Demo Payment — No real money will be charged.</span></div>
        <div className="payment-options">
          <button className={payMethod === 'demo_card' ? 'selected' : ''} onClick={() => setPayMethod('demo_card')}><CreditCard size={20} /><span>Demo Card</span></button>
          <button className={payMethod === 'demo_upi' ? 'selected' : ''} onClick={() => setPayMethod('demo_upi')}><Smartphone size={20} /><span>Demo UPI</span></button>
          <button className={payMethod === 'cod_demo' ? 'selected' : ''} onClick={() => setPayMethod('cod_demo')}><Banknote size={20} /><span>Cash on Delivery</span></button>
        </div>

        {payMethod === 'demo_card' && <div className="checkout-form">
          <input placeholder="Card number (e.g. 4242 4242 4242 4242)" className={`wide ${errors.cardNumber ? 'error' : ''}`} value={card.number} onChange={(e) => setCard({ ...card, number: e.target.value })} />
          {errors.cardNumber && <span className="err-msg wide">{errors.cardNumber}</span>}
          <input placeholder="MM / YY" className={errors.expiry ? 'error' : ''} value={card.expiry} onChange={(e) => setCard({ ...card, expiry: e.target.value })} />
          <input placeholder="CVV" className={errors.cvv ? 'error' : ''} value={card.cvv} onChange={(e) => setCard({ ...card, cvv: e.target.value })} />
          {errors.expiry && <span className="err-msg">{errors.expiry}</span>}
          {errors.cvv && <span className="err-msg">{errors.cvv}</span>}
        </div>}

        {payMethod === 'demo_upi' && <div className="checkout-form">
          <input placeholder="Enter UPI ID (e.g. yourname@bank)" className={`wide ${errors.upi ? 'error' : ''}`} value={upi} onChange={(e) => setUpi(e.target.value)} />
          {errors.upi && <span className="err-msg wide">{errors.upi}</span>}
          <div className="upi-info"><Smartphone size={16} /> <span>Enter any UPI ID for this demo. No real payment will be processed.</span></div>
        </div>}

        {payMethod === 'cod_demo' && <div className="cod-info"><Banknote size={20} /> <span>Pay with cash when your order is delivered. No card or UPI details needed.</span></div>}

        <div className="step-nav"><button className="text-button" onClick={() => setStep(2)}><ChevronLeft size={15} /> Back</button><button className="button button-dark" onClick={handlePlaceOrder}><Check size={16} /> Place {payMethod === 'demo_card' ? 'Card' : payMethod === 'demo_upi' ? 'UPI' : 'COD'} Order</button></div>
      </div>
      <OrderSummary subtotal={subtotal} shipping={shipping} total={total} cartItems={cart} />
    </div>}
  </div></div>;
}

function OrderSummary({ subtotal, shipping, total, cartItems }: { subtotal: number; shipping: number; total: number; cartItems?: CartItem[] }) {
  return <div className="order-total">
    <p className="eyebrow">Order summary</p>
    {cartItems && <div className="summary-items">{cartItems.map((item) => <div key={`${item.id}-${item.size}`} className="summary-item"><img src={item.image} alt={item.name} /><div><strong>{item.name}</strong><small>{item.size} · {item.color} · Qty {item.quantity}</small></div><span>{money(item.price * item.quantity)}</span></div>)}</div>}
    <div><span>Subtotal</span><b>{money(subtotal)}</b></div>
    <div><span>Delivery</span><b className={shipping === 0 ? 'free' : ''}>{shipping === 0 ? 'Free' : money(shipping)}</b></div>
    <hr /><div className="total"><span>Total</span><b>{money(total)}</b></div>
  </div>;
}

// === ORDERS ===
function Orders({ orders, onView }: { orders: Order[]; onView: (id: string) => void }) {
  const statusIcon = (s: string) => s === 'Delivered' ? <CheckCircle size={14} /> : s === 'Cancelled' ? <XCircle size={14} /> : s === 'Shipped' ? <Truck size={14} /> : <Clock size={14} />;
  return <main className="shop-page">
    <div className="page-intro compact">
      <Breadcrumbs items={[{ label: 'Home', onClick: () => onView('') }, { label: 'My Orders' }]} />
      <h1>My Orders</h1>
      <p>{orders.length} {orders.length === 1 ? 'order' : 'orders'} placed.</p>
    </div>
    {orders.length ? <div className="orders-list">
      {orders.map((order) => <div key={order.id} className="order-card" onClick={() => onView(order.id)}>
        <div className="order-card-head">
          <div><strong>{order.id}</strong><small>{order.date}</small></div>
          <span className={`order-status ${order.status.toLowerCase()}`}>{statusIcon(order.status)} {order.status}</span>
        </div>
        <div className="order-card-items">{order.items.slice(0, 3).map((item, i) => <div key={i} className="order-thumb"><img src={item.image} alt={item.name} /></div>)}
          {order.items.length > 3 && <div className="order-thumb more">+{order.items.length - 3}</div>}
        </div>
        <div className="order-card-foot"><span>{order.items.length} {order.items.length === 1 ? 'item' : 'items'} · {order.paymentLabel}</span><strong>{money(order.total)}</strong></div>
      </div>)}
    </div> : <div className="empty-state"><Package size={28} /><h2>No orders yet</h2><p>Your placed orders will appear here.</p></div>}
  </main>;
}

function OrderDetail({ order, onBack }: { order: Order; onBack: () => void }) {
  const statusIcon = (s: string) => s === 'Delivered' ? <CheckCircle size={14} /> : s === 'Cancelled' ? <XCircle size={14} /> : s === 'Shipped' ? <Truck size={14} /> : <Clock size={14} />;
  return <main className="shop-page">
    <div className="page-intro compact"><button className="text-button" onClick={onBack}><ChevronLeft size={15} /> Back to orders</button><h1>Order {order.id}</h1><p>Placed on {order.date}</p></div>
    <div className="order-detail-layout">
      <div className="order-detail-main">
        <div className={`order-status-banner ${order.status.toLowerCase()}`}>{statusIcon(order.status)} <span>Status: {order.status}</span><span>Payment: {order.paymentLabel}</span></div>
        <h3>Items in this order</h3>
        <div className="order-detail-items">{order.items.map((item, i) => <div key={i} className="order-detail-item">
          <img src={item.image} alt={item.name} /><div><p className="product-brand">{item.brand}</p><strong>{item.name}</strong><small>Size: {item.size} · Color: {item.color} · Qty: {item.quantity}</small><small>Seller: {item.seller}</small></div><span className="price">{money(item.price * item.quantity)}</span>
        </div>)}</div>
      </div>
      <div className="order-detail-side">
        <div className="order-total"><p className="eyebrow">Payment summary</p><div><span>Subtotal</span><b>{money(order.subtotal)}</b></div><div><span>Delivery</span><b className={order.shipping === 0 ? 'free' : ''}>{order.shipping === 0 ? 'Free' : money(order.shipping)}</b></div><hr /><div className="total"><span>Total Paid</span><b>{money(order.total)}</b></div><p className="demo-caption">Demo payment — no real money was charged.</p></div>
        <div className="order-total"><p className="eyebrow">Delivery address</p><strong>{order.address.name}</strong><p>{order.address.address}</p><p>{order.address.city} — {order.address.postal}</p><p>Phone: {order.address.phone}</p></div>
      </div>
    </div>
  </main>;
}

// === ACCOUNT ===
function Account({ role, setRole, onSeller, onAdmin, orders, onViewOrder, profile, onLoginClick, onLogout }: { role: Role; setRole: (r: Role) => void; onSeller: () => void; onAdmin: () => void; orders: Order[]; onViewOrder: (id: string) => void; profile: import('./lib/auth').AuthProfile | null; onLoginClick: () => void; onLogout: () => void }) {
  if (!profile) {
    return <main className="account-page">
      <div className="account-hero"><div className="avatar">?</div><div><p className="eyebrow">You're not logged in</p><h1>Welcome to Threadly</h1><p>Log in or create an account to view your orders and wishlist.</p></div></div>
      <button className="button button-dark" onClick={onLoginClick}>Log in / Sign up</button>
    </main>;
  }
  const initials = (profile.fullName || profile.email).slice(0, 2).toUpperCase();
  return <main className="account-page">
    <div className="account-hero"><div className="avatar">{initials}</div><div><p className="eyebrow">Welcome back</p><h1>{profile.fullName || profile.email}</h1><p>{profile.email}</p></div></div>
    <button className="text-button" onClick={onLogout} style={{ marginBottom: 16 }}>Log out</button>
    <div className="role-switch"><span>Demo role:</span>{(['customer', 'seller', 'admin'] as const).map((r) => <button className={role === r ? 'active' : ''} key={r} onClick={() => { setRole(r); if (r === 'seller') onSeller(); else if (r === 'admin') onAdmin(); }}>{r}</button>)}</div>
    
    <div className="account-grid">
      <div className="account-card"><p className="eyebrow">Recent orders</p><h2>{orders.length}</h2><p>{orders.length === 0 ? 'No orders yet.' : `Last order: ${orders[0].id}`}</p>{orders.length > 0 && <button className="text-button" onClick={() => onViewOrder(orders[0].id)}>View latest <ArrowRight size={15} /></button>}</div>
      <div className="account-card"><p className="eyebrow">Your details</p><h2>Profile</h2><p>Manage your name, email, phone and saved addresses.</p><button className="text-button">Manage profile <ArrowRight size={15} /></button></div>
      <div className="account-card dark-card"><p className="eyebrow">For independent labels</p><h2>Sell on Threadly</h2><p>Bring your point of view to a thoughtful, growing community.</p><button className="button button-light" onClick={onSeller}>Explore selling <ArrowRight size={15} /></button></div>
    </div>
  </main>;
}

// === SELLER DASHBOARD ===
function SellerDashboard({ tab, setTab, onBack, orders, products, onProduct, onViewOrder }: {
  tab: string; setTab: (t: string) => void; onBack: () => void; orders: Order[]; products: Product[]; onProduct: (p: Product) => void; onViewOrder: (id: string) => void;
}) {
  const sellerOrders = orders.filter((o) => o.items.some((i) => i.seller === 'Urban Thread Store'));
  const sellerOrderItems = sellerOrders.flatMap((o) => o.items.filter((i) => i.seller === 'Urban Thread Store').map((i) => ({ ...i, orderId: o.id, date: o.date, status: o.status, customer: o.customer, paymentLabel: o.paymentLabel })));
  const grossSales = sellerOrderItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const commission = grossSales * COMMISSION_RATE;
  const netEarnings = grossSales - commission;
  const customers = [...new Set(sellerOrders.map((o) => o.customer))];
  const lowStock = products.filter((p) => p.stock < 15);

  return <main className="dashboard">
    <aside className="dashboard-side">
      <button className="wordmark" onClick={onBack}><span>THREADLY</span><small>MARKET</small></button>
      <div className="dash-profile"><div className="avatar">UT</div><div><strong>Urban Thread</strong><span>Seller account</span></div></div>
      <nav>
        <button className={tab === 'overview' ? 'active' : ''} onClick={() => setTab('overview')}><LayoutDashboard size={17} />Overview</button>
        <button className={tab === 'products' ? 'active' : ''} onClick={() => setTab('products')}><Package size={17} />Products <span>{products.length}</span></button>
        <button className={tab === 'orders' ? 'active' : ''} onClick={() => setTab('orders')}><ShoppingBag size={17} />Orders <span>{sellerOrders.length}</span></button>
        <button className={tab === 'earnings' ? 'active' : ''} onClick={() => setTab('earnings')}><DollarSign size={17} />Sales & Earnings</button>
        <button className={tab === 'customers' ? 'active' : ''} onClick={() => setTab('customers')}><Users size={17} />Customers <span>{customers.length}</span></button>
        <button className={tab === 'profile' ? 'active' : ''} onClick={() => setTab('profile')}><Store size={17} />Store Profile</button>
      </nav>
      <button className="back-store" onClick={onBack}><ChevronLeft size={15} /> Back to storefront</button>
    </aside>
    <section className="dashboard-main">
      {tab === 'overview' && (<><div className="dashboard-top"><div><p className="eyebrow">Store overview</p><h1>Urban Thread Dashboard</h1></div><button className="button button-dark"><Plus size={16} /> Add product</button></div>
        <div className="stat-grid">
          <Stat label="Total Products" value={String(products.length)} sub={`${products.filter((p) => p.stock > 0).length} active`} icon={<Package />} onClick={() => setTab('products')} />
          <Stat label="Total Orders" value={String(sellerOrders.length)} sub={`${sellerOrderItems.length} items sold`} icon={<ShoppingBag />} onClick={() => setTab('orders')} />
          <Stat label="Gross Sales" value={money(grossSales)} sub={`Commission: ${money(commission)}`} icon={<TrendingUp />} onClick={() => setTab('earnings')} />
          <Stat label="Net Earnings" value={money(netEarnings)} sub={`${(COMMISSION_RATE * 100).toFixed(0)}% commission`} icon={<DollarSign />} onClick={() => setTab('earnings')} />
        </div>
        <div className="dash-panels">
          <div className="chart-panel"><div className="panel-heading"><div><p className="eyebrow">Performance</p><h2>Sales overview</h2></div></div><SalesChart /></div>
          <div className="recent-panel"><div className="panel-heading"><div><p className="eyebrow">Recent activity</p><h2>Recent orders</h2></div><button className="text-button" onClick={() => setTab('orders')}>View all <ArrowRight size={14} /></button></div>
            {sellerOrderItems.slice(0, 4).map((item, i) => <div className="recent-row" key={i} onClick={() => onViewOrder(item.orderId)}><div className="mini-avatar"><Package size={15} /></div><div><strong>{item.orderId}</strong><small>{item.name} · Qty {item.quantity}</small></div><span className="status">{item.status}</span></div>)}
            {sellerOrderItems.length === 0 && <p className="empty-mini">No orders yet.</p>}
          </div>
        </div>
        {lowStock.length > 0 && <div className="low-stock-alert"><h3>Low stock alert</h3><div className="low-stock-list">{lowStock.map((p) => <div key={p.id} className="low-stock-item" onClick={() => onProduct(p)}><img src={p.image} alt={p.name} /><div><strong>{p.name}</strong><small>Only {p.stock} left</small></div></div>)}</div></div>}
      </>)}

      {tab === 'products' && (<><div className="dashboard-top"><div><h1>My Products</h1><p>{products.length} products in your store</p></div><button className="button button-dark"><Plus size={16} /> Add product</button></div>
        <div className="seller-product-list">{products.map((p) => <div key={p.id} className="seller-product-row" onClick={() => onProduct(p)}><img src={p.image} alt={p.name} /><div className="sp-info"><strong>{p.name}</strong><small>{p.brand} · {p.gender} · {p.subcategory}</small></div><div className="sp-price">{money(p.price)}</div><div className="sp-stock">{p.stock < 15 ? <span className="warn">Low: {p.stock}</span> : <span>{p.stock} in stock</span>}</div><div className="sp-actions"><button className="icon-btn-sm"><Edit size={15} /></button><button className="icon-btn-sm"><Eye size={15} /></button></div></div>)}</div>
      </>)}

      {tab === 'orders' && (<><div className="dashboard-top"><div><h1>Orders</h1><p>{sellerOrders.length} orders containing your products</p></div></div>
        {sellerOrders.length ? <div className="orders-list">{sellerOrders.map((o) => <div key={o.id} className="order-card" onClick={() => onViewOrder(o.id)}><div className="order-card-head"><div><strong>{o.id}</strong><small>{o.date}</small></div><span className={`order-status ${o.status.toLowerCase()}`}>{o.status}</span></div><div className="order-card-items">{o.items.filter((i) => i.seller === 'Urban Thread Store').map((item, i) => <div key={i} className="order-thumb"><img src={item.image} alt={item.name} /></div>)}</div><div className="order-card-foot"><span>{o.customer} · {o.paymentLabel}</span><strong>{money(o.items.filter((i) => i.seller === 'Urban Thread Store').reduce((s, i) => s + i.price * i.quantity, 0))}</strong></div></div>)}</div>
          : <div className="empty-state"><Package size={28} /><h2>No orders yet</h2><p>Orders containing your products will appear here.</p></div>}
      </>)}

      {tab === 'earnings' && (<><div className="dashboard-top"><div><h1>Sales & Earnings</h1><p>Commission rate: {(COMMISSION_RATE * 100).toFixed(0)}%</p></div></div>
        <div className="stat-grid">
          <Stat label="Gross Sales" value={money(grossSales)} sub={`${sellerOrderItems.length} items sold`} icon={<TrendingUp />} />
          <Stat label="Commission (10%)" value={money(commission)} sub="Marketplace fee" icon={<Tag />} />
          <Stat label="Net Earnings" value={money(netEarnings)} sub="After commission" icon={<DollarSign />} />
          <Stat label="Total Orders" value={String(sellerOrders.length)} sub="Orders received" icon={<ShoppingBag />} />
        </div>
        <div className="chart-panel"><div className="panel-heading"><div><p className="eyebrow">Earnings breakdown</p><h2>Transaction history</h2></div></div>
          {sellerOrderItems.length ? <div className="earnings-table">{sellerOrderItems.map((item, i) => <div key={i} className="earnings-row"><div><strong>{item.name}</strong><small>{item.orderId} · {item.date}</small></div><div><span>Price: {money(item.price * item.quantity)}</span><span className="commission">Commission: -{money(item.price * item.quantity * COMMISSION_RATE)}</span><strong>Net: {money(item.price * item.quantity * (1 - COMMISSION_RATE))}</strong></div></div>)}</div>
            : <p className="empty-mini">No transactions yet.</p>}
        </div>
      </>)}

      {tab === 'customers' && (<><div className="dashboard-top"><div><h1>Customers</h1><p>{customers.length} customers ordered your products</p></div></div>
        {customers.length ? <div className="customer-list">{customers.map((c, i) => { const custOrders = sellerOrders.filter((o) => o.customer === c); const spent = custOrders.flatMap((o) => o.items.filter((i) => i.seller === 'Urban Thread Store')).reduce((s, i) => s + i.price * i.quantity, 0); return <div key={i} className="customer-card"><div className="avatar">{c.slice(0, 2).toUpperCase()}</div><div><strong>{c}</strong><small>{custOrders.length} orders · {money(spent)} spent</small></div></div>; })}</div>
          : <div className="empty-state"><Users size={28} /><h2>No customers yet</h2><p>Customers who buy your products will appear here.</p></div>}
      </>)}

      {tab === 'profile' && (<><div className="dashboard-top"><div><h1>Store Profile</h1></div></div>
        <div className="profile-form"><div className="profile-field"><label>Business Name</label><input value="Urban Thread" readOnly /></div><div className="profile-field"><label>Description</label><textarea defaultValue="Contemporary casual wear designed for everyday life." /></div><div className="profile-field"><label>Commission Rate</label><input value="10% (set by admin)" readOnly /></div><div className="profile-field"><label>Status</label><span className="status approved"><CheckCircle size={14} /> Approved</span></div><button className="button button-dark">Save changes</button></div>
      </>)}
    </section>
  </main>;
}

// === ADMIN DASHBOARD ===
function AdminDashboard({ tab, setTab, onBack, orders, products, onViewOrder }: {
  tab: string; setTab: (t: string) => void; onBack: () => void; orders: Order[]; products: Product[]; onViewOrder: (id: string) => void;
}) {
  const totalRevenue = orders.reduce((s, o) => s + o.total, 0);
  const totalCommission = orders.reduce((s, o) => s + o.items.reduce((si, i) => si + i.price * i.quantity * COMMISSION_RATE, 0), 0);
  const allSellers = [...new Set(products.map((p) => p.seller))];
  const allCustomers = [...new Set(orders.map((o) => o.customer))];

  return <main className="dashboard">
    <aside className="dashboard-side">
      <button className="wordmark" onClick={onBack}><span>THREADLY</span><small>MARKET</small></button>
      <div className="dash-profile"><div className="avatar">AD</div><div><strong>Admin</strong><span>Platform operations</span></div></div>
      <nav>
        <button className={tab === 'overview' ? 'active' : ''} onClick={() => setTab('overview')}><LayoutDashboard size={17} />Overview</button>
        <button className={tab === 'sellers' ? 'active' : ''} onClick={() => setTab('sellers')}><Store size={17} />Sellers <span>{allSellers.length}</span></button>
        <button className={tab === 'products' ? 'active' : ''} onClick={() => setTab('products')}><Package size={17} />Products <span>{products.length}</span></button>
        <button className={tab === 'orders' ? 'active' : ''} onClick={() => setTab('orders')}><ShoppingBag size={17} />Orders <span>{orders.length}</span></button>
        <button className={tab === 'customers' ? 'active' : ''} onClick={() => setTab('customers')}><Users size={17} />Customers <span>{allCustomers.length}</span></button>
      </nav>
      <button className="back-store" onClick={onBack}><ChevronLeft size={15} /> Back to storefront</button>
    </aside>
    <section className="dashboard-main">
      {tab === 'overview' && (<><div className="dashboard-top"><div><p className="eyebrow">Platform overview</p><h1>Marketplace Dashboard</h1></div></div>
        <div className="stat-grid">
          <Stat label="Total Revenue" value={money(totalRevenue)} sub={`${orders.length} orders`} icon={<TrendingUp />} />
          <Stat label="Commission Earned" value={money(totalCommission)} sub="10% marketplace fee" icon={<Tag />} />
          <Stat label="Total Products" value={String(products.length)} sub={`${allSellers.length} sellers`} icon={<Package />} />
          <Stat label="Total Customers" value={String(allCustomers.length)} sub={`${allSellers.length} sellers`} icon={<Users />} />
        </div>
        <div className="dash-panels">
          <div className="chart-panel"><div className="panel-heading"><div><p className="eyebrow">Performance</p><h2>Revenue overview</h2></div></div><SalesChart /></div>
          <div className="recent-panel"><div className="panel-heading"><div><p className="eyebrow">Recent activity</p><h2>Latest orders</h2></div><button className="text-button" onClick={() => setTab('orders')}>View all <ArrowRight size={14} /></button></div>
            {orders.slice(0, 4).map((o) => <div className="recent-row" key={o.id} onClick={() => onViewOrder(o.id)}><div className="mini-avatar"><Package size={15} /></div><div><strong>{o.id}</strong><small>{o.customer} · {o.paymentLabel}</small></div><span className="status">{o.status}</span></div>)}
            {orders.length === 0 && <p className="empty-mini">No orders yet.</p>}
          </div>
        </div>
      </>)}

      {tab === 'sellers' && (<><div className="dashboard-top"><div><h1>Sellers</h1><p>{allSellers.length} sellers on the platform</p></div></div>
        <div className="seller-list">{allSellers.map((s, i) => { const sProducts = products.filter((p) => p.seller === s); const sOrders = orders.filter((o) => o.items.some((i) => i.seller === s)); return <div key={i} className="seller-card"><div className="avatar">{s.slice(0, 2).toUpperCase()}</div><div><strong>{s}</strong><small>{sProducts.length} products · {sOrders.length} orders</small></div><span className="status approved"><CheckCircle size={14} /> Approved</span></div>; })}</div>
      </>)}

      {tab === 'products' && (<><div className="dashboard-top"><div><h1>All Products</h1><p>{products.length} products across the marketplace</p></div></div>
        <div className="admin-product-grid">{products.slice(0, 24).map((p) => <div key={p.id} className="admin-product-card"><img src={p.image} alt={p.name} /><div><p className="product-brand">{p.brand}</p><strong>{p.name}</strong><small>{p.gender} · {p.subcategory}</small><div className="product-bottom"><span className="price">{money(p.price)}</span><span className={`stock-badge ${p.stock < 15 ? 'low' : ''}`}>{p.stock} in stock</span></div></div></div>)}</div>
      </>)}

      {tab === 'orders' && (<><div className="dashboard-top"><div><h1>All Orders</h1><p>{orders.length} orders on the platform</p></div></div>
        {orders.length ? <div className="orders-list">{orders.map((o) => <div key={o.id} className="order-card" onClick={() => onViewOrder(o.id)}><div className="order-card-head"><div><strong>{o.id}</strong><small>{o.date} · {o.customer}</small></div><span className={`order-status ${o.status.toLowerCase()}`}>{o.status}</span></div><div className="order-card-items">{o.items.slice(0, 3).map((item, i) => <div key={i} className="order-thumb"><img src={item.image} alt={item.name} /></div>)}{o.items.length > 3 && <div className="order-thumb more">+{o.items.length - 3}</div>}</div><div className="order-card-foot"><span>{o.items.length} items · {o.paymentLabel}</span><strong>{money(o.total)}</strong></div></div>)}</div>
          : <div className="empty-state"><Package size={28} /><h2>No orders yet</h2><p>Platform orders will appear here.</p></div>}
      </>)}

      {tab === 'customers' && (<><div className="dashboard-top"><div><h1>Customers</h1><p>{allCustomers.length} customers on the platform</p></div></div>
        {allCustomers.length ? <div className="customer-list">{allCustomers.map((c, i) => { const cOrders = orders.filter((o) => o.customer === c); const spent = cOrders.reduce((s, o) => s + o.total, 0); return <div key={i} className="customer-card"><div className="avatar">{c.slice(0, 2).toUpperCase()}</div><div><strong>{c}</strong><small>{cOrders.length} orders · {money(spent)} spent</small></div></div>; })}</div>
          : <div className="empty-state"><Users size={28} /><h2>No customers yet</h2><p>Registered customers will appear here.</p></div>}
      </>)}
    </section>
  </main>;
}

function Stat({ label, value, sub, icon, onClick }: { label: string; value: string; sub: string; icon: React.ReactNode; onClick?: () => void }) {
  return <div className={`stat-card ${onClick ? 'clickable' : ''}`} onClick={onClick}>
    <div className="stat-icon">{icon}</div><p>{label}</p><strong>{value}</strong><span>{sub}</span>
  </div>;
}

function SalesChart() {
  return <div className="chart"><div className="chart-labels"><span>₹3L</span><span>₹2L</span><span>₹1L</span><span>₹0</span></div>
    <svg viewBox="0 0 700 240" preserveAspectRatio="none"><path d="M0 210 C70 190, 80 200, 130 165 S210 185, 260 135 S330 150, 390 105 S460 145, 515 70 S600 100, 700 25" fill="none" stroke="#a44b2a" strokeWidth="3" /><path d="M0 210 C70 190, 80 200, 130 165 S210 185, 260 135 S330 150, 390 105 S460 145, 515 70 S600 100, 700 25 L700 240 L0 240Z" fill="url(#area)" opacity=".22" /><defs><linearGradient id="area" x1="0" x2="0" y1="0" y2="1"><stop stopColor="#a44b2a" /><stop offset="1" stopColor="#a44b2a" stopOpacity="0" /></linearGradient></defs></svg>
    <div className="chart-days"><span>Aug 18</span><span>Aug 25</span><span>Sep 01</span><span>Sep 08</span><span>Sep 14</span></div>
  </div>;
}

function Footer({ onSeller, onCategory }: { onSeller: () => void; onCategory: (g: string, s?: string) => void }) {
  return <footer>
    <div className="footer-top">
      <div><button className="wordmark"><span>THREADLY</span><small>MARKET</small></button><p>A considered marketplace for<br />the way you live now.</p></div>
      <div><strong>Shop</strong><button onClick={() => onCategory('Men')}>Men</button><button onClick={() => onCategory('Women')}>Women</button><button onClick={() => onCategory('Kids')}>Kids</button><button onClick={() => onCategory('All')}>All Products</button></div>
      <div><strong>Help</strong><button>Contact us</button><button>Shipping & returns</button><button>Size guide</button><button>FAQs</button></div>
      <div><strong>For brands</strong><button onClick={onSeller}>Sell on Threadly</button><button>Our standards</button><button>Brand login</button></div>
    </div>
    <div className="footer-bottom"><span>© 2025 Threadly Market · A demo marketplace</span><span>Privacy · Terms · Instagram · Pinterest</span></div>
  </footer>;
}

export default App;
