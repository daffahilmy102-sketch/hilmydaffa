import React, { useState, useRef } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { CartProvider, useCart } from './context/CartContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderTrackerModal } from './components/OrderTrackerModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminPanel } from './components/AdminPanel';
import { Footer } from './components/Footer';
import { Product, ProductCategory } from './types';
import { Sparkles, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import ceramicImg from './assets/images/product_ceramic_dining_1791359456160.jpg';

function StoreApp() {
  const { products, isLoading, dbError, isAdmin } = useStore();
  const { isCartOpen, setIsCartOpen, addToCart, toastMessage } = useCart();

  // Navigation & View States
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'featured' | 'price_asc' | 'price_desc' | 'rating'>('featured');
  const [isAdminView, setIsAdminView] = useState<boolean>(false);

  // Modals
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [isOrderTrackerOpen, setIsOrderTrackerOpen] = useState<boolean>(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState<boolean>(false);
  const [lastCreatedOrderId, setLastCreatedOrderId] = useState<string | undefined>(undefined);

  const productSectionRef = useRef<HTMLDivElement>(null);

  const scrollToProducts = () => {
    productSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Filter & Sort Products
  const filteredProducts = products.filter((prod) => {
    const matchesCategory = activeCategory === 'all' || prod.category === activeCategory;
    const matchesSearch = prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          prod.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (prod.material && prod.material.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price_asc') return a.price - b.price;
    if (sortBy === 'price_desc') return b.price - a.price;
    if (sortBy === 'rating') return b.rating - a.rating;
    return 0; // default order
  });

  const handleBuyNow = (product: Product, quantity: number) => {
    addToCart(product, quantity);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleOrderSuccess = (orderId: string, orderNumber: string) => {
    setLastCreatedOrderId(orderId);
    setIsOrderTrackerOpen(true);
  };

  // If Admin View is active, display the full admin workspace
  if (isAdminView) {
    return (
      <AdminPanel onExitAdmin={() => setIsAdminView(false)} />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#fbfbf9] text-[#1c1917]">
      
      {/* Toast Notification for Cart Actions */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1c1917] text-white text-xs px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2 animate-bounce">
          <Sparkles className="w-3.5 h-3.5 text-[#e2a87a]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        activeCategory={activeCategory}
        onSelectCategory={(cat) => {
          setActiveCategory(cat);
          scrollToProducts();
        }}
        onOpenOrderTracker={() => setIsOrderTrackerOpen(true)}
        onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
        onToggleAdminView={() => setIsAdminView(!isAdminView)}
        isAdminView={isAdminView}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Hero Section */}
      <Hero
        onExploreClick={scrollToProducts}
        onOpenOrderTracker={() => setIsOrderTrackerOpen(true)}
      />

      {/* Main Product Catalog Section */}
      <section ref={productSectionRef} className="py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-1 w-full">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#e7e2d7]">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#8c6d52] tracking-wider uppercase mb-1">
              <span>Katalog Lengkap</span>
              <span aria-hidden="true">·</span>
              <span>12 Produk Aesthetic</span>
              <span aria-hidden="true">·</span>
              <span>Real Database Firestore</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1c1917]">
              {activeCategory === 'all' ? 'Seluruh Koleksi Pilihan' : activeCategory}
            </h2>
          </div>

          {/* Interactive Filter Tabs (Anti-slop clean segmented control) */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center p-1 bg-[#f4f1ea] rounded-lg border border-[#e7e2d7]">
              {[
                { id: 'all', label: `Semua (${products.length})` },
                { id: 'Living & Decor', label: 'Living' },
                { id: 'Kitchen & Dining', label: 'Kitchen' },
                { id: 'Bed & Bath', label: 'Bed & Bath' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveCategory(tab.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                    activeCategory === tab.id
                      ? 'bg-white text-[#1c1917] shadow-2xs font-semibold'
                      : 'text-[#57534e] hover:text-[#1c1917]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 bg-white border border-[#d6cebf] rounded-lg px-2.5 py-1 text-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#78716c]" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-xs text-[#1c1917] focus:outline-none cursor-pointer"
              >
                <option value="featured">Paling Populer</option>
                <option value="price_asc">Harga Terendah</option>
                <option value="price_desc">Harga Tertinggi</option>
                <option value="rating">Rating Tertinggi</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading / Error States */}
        {isLoading && (
          <div className="py-20 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-[#1c1917] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-[#78716c]">Menghubungkan ke Cloud Firestore...</p>
          </div>
        )}

        {dbError && (
          <div className="my-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg">
            Terjadi kendala koneksi database: {dbError}
          </div>
        )}

        {/* 12-Product Grid */}
        {!isLoading && (
          <div className="mt-8">
            {sortedProducts.length === 0 ? (
              <div className="py-16 text-center text-xs text-[#78716c] space-y-3">
                <p>Tidak ada produk yang cocok dengan pencarian "{searchQuery}".</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setActiveCategory('all');
                  }}
                  className="px-4 py-2 bg-[#1c1917] text-white rounded text-xs font-semibold cursor-pointer"
                >
                  Reset Filter Pencarian
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-7">
                {sortedProducts.map((prod) => (
                  <ProductCard
                    key={prod.id}
                    product={prod}
                    onOpenDetail={setSelectedProduct}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Editorial Craftsmanship Highlight Section */}
        <div className="mt-20 bg-[#f4f1ea] rounded-2xl p-8 sm:p-12 border border-[#e7e2d7]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <span className="text-xs font-semibold text-[#8c6d52] uppercase tracking-wider">
                Sentuhan Alami & Presisi Perajin
              </span>
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#1c1917] leading-snug">
                Material Autentik dari Kayu Jati, Batu Travertine, dan Keramik Gerabah
              </h3>
              <p className="text-sm text-[#57534e] leading-relaxed">
                Kami meyakini bahwa rumah adalah tempat berlindung dari kepenatan dunia luar. Komorebi Living memilih material dengan cermat — serat kayu yang alami, keramik stoneware yang dibakar dengan suhu 1280°C, serta serat kain rami Prancis yang bernapas.
              </p>
              <div className="pt-2 flex items-center gap-6 text-xs text-[#1c1917]">
                <div>
                  <span className="font-bold text-base block font-serif">12+</span>
                  <span className="text-[#78716c]">Desain Eksklusif</span>
                </div>
                <div className="h-8 w-px bg-[#d6cebf]" />
                <div>
                  <span className="font-bold text-base block font-serif">100%</span>
                  <span className="text-[#78716c]">Garansi Tiba Utuh</span>
                </div>
                <div className="h-8 w-px bg-[#d6cebf]" />
                <div>
                  <span className="font-bold text-base block font-serif">Real-Time</span>
                  <span className="text-[#78716c]">Sinkronisasi Stok</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="aspect-4/3 rounded-xl overflow-hidden shadow-md border border-[#e7e2d7]">
                <img
                  src={ceramicImg}
                  alt="Keramik Artisan Komorebi"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* Modals & Drawers */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onBuyNow={handleBuyNow}
      />

      <CartDrawer
        onProceedToCheckout={() => setIsCheckoutOpen(true)}
        onExploreProducts={scrollToProducts}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderSuccess={handleOrderSuccess}
      />

      <OrderTrackerModal
        isOpen={isOrderTrackerOpen}
        onClose={() => setIsOrderTrackerOpen(false)}
        initialOrderId={lastCreatedOrderId}
      />

      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onLoginSuccess={() => setIsAdminView(true)}
      />

      {/* Footer */}
      <Footer onOpenAdminLogin={() => setIsAdminLoginOpen(true)} />

    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <CartProvider>
        <StoreApp />
      </CartProvider>
    </StoreProvider>
  );
}
