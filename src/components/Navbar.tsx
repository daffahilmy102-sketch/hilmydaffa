import React, { useState } from 'react';
import { ShoppingBag, Search, PackageCheck, ShieldCheck, UserCheck, Menu, X, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';
import { ProductCategory } from '../types';

interface NavbarProps {
  activeCategory: string;
  onSelectCategory: (category: string) => void;
  onOpenOrderTracker: () => void;
  onOpenAdminLogin: () => void;
  onToggleAdminView: () => void;
  isAdminView: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeCategory,
  onSelectCategory,
  onOpenOrderTracker,
  onOpenAdminLogin,
  onToggleAdminView,
  isAdminView,
  searchQuery,
  onSearchChange
}) => {
  const { totalItemsCount, setIsCartOpen } = useCart();
  const { isAdmin, adminUser, orders } = useStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Count orders pending payment approval
  const pendingProofCount = orders.filter(o => o.paymentStatus === 'proof_submitted').length;

  const categories = [
    { id: 'all', label: 'Semua Koleksi' },
    { id: 'Living & Decor', label: 'Living & Decor' },
    { id: 'Kitchen & Dining', label: 'Kitchen & Dining' },
    { id: 'Bed & Bath', label: 'Bed & Bath' }
  ];

  return (
    <>
      {/* Announcement Bar */}
      <div className="bg-[#1c1917] text-[#f4f1ea] px-4 py-2 text-xs tracking-wider text-center flex items-center justify-center gap-2 font-medium">
        <span>Pengiriman Gratis ke Seluruh Indonesia untuk pesanan di atas Rp 750.000</span>
        <span className="opacity-40">·</span>
        <span className="text-[#e2a87a]">Gunakan Kupon: UTS2026</span>
      </div>

      {/* Top Bar Contract (Section 2) */}
      <header className="sticky top-0 z-40 bg-[#fbfbf9]/95 backdrop-blur-md border-b border-[#e7e2d7] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                onSelectCategory('all');
                if (isAdminView) onToggleAdminView();
              }}
              className="text-left group cursor-pointer focus:outline-none"
            >
              <span className="text-xl sm:text-2xl font-serif font-bold tracking-tight text-[#1c1917] group-hover:text-[#9c6644] transition-colors">
                KOMOREBI LIVING
              </span>
            </button>
          </div>

          {/* Zone 2: Clean text navigation links */}
          <nav className="hidden lg:flex items-center space-x-7 text-sm font-medium text-[#44403c]">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  onSelectCategory(cat.id);
                  if (isAdminView) onToggleAdminView();
                }}
                className={`relative py-1 transition-colors hover:text-[#1c1917] cursor-pointer ${
                  activeCategory === cat.id && !isAdminView
                    ? 'text-[#1c1917] font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#1c1917]'
                    : 'text-[#57534e]'
                }`}
              >
                {cat.label}
              </button>
            ))}

            <button
              onClick={onOpenOrderTracker}
              className="flex items-center gap-1.5 text-[#57534e] hover:text-[#1c1917] transition-colors cursor-pointer py-1"
            >
              <PackageCheck className="w-4 h-4 text-[#9c6644]" />
              <span>Lacak Pesanan</span>
            </button>
          </nav>

          {/* Zone 3: 1-2 primary actions */}
          <div className="flex items-center gap-3">
            {/* Search Toggle */}
            <div className="relative">
              {isSearchOpen ? (
                <div className="flex items-center bg-white border border-[#d6cebf] rounded-md px-2.5 py-1.5 shadow-xs w-48 sm:w-64">
                  <Search className="w-4 h-4 text-[#78716c] mr-2 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Cari produk aesthetic..."
                    autoFocus
                    className="w-full text-xs bg-transparent focus:outline-none text-[#1c1917]"
                  />
                  <button
                    onClick={() => {
                      setIsSearchOpen(false);
                      onSearchChange('');
                    }}
                    className="text-[#a8a29e] hover:text-[#1c1917] ml-1 p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsSearchOpen(true)}
                  aria-label="Cari produk"
                  className="p-2 text-[#44403c] hover:text-[#1c1917] hover:bg-[#f4f1ea] rounded-full transition-colors cursor-pointer"
                >
                  <Search className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Shopping Bag Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              aria-label="Buka keranjang belanja"
              className="relative p-2 text-[#1c1917] hover:bg-[#f4f1ea] rounded-full transition-colors cursor-pointer"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#1c1917] text-[#fbfbf9] text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center tabular-nums shadow-sm animate-pulse">
                  {totalItemsCount}
                </span>
              )}
            </button>

            {/* Admin Switcher / Login */}
            {isAdmin ? (
              <button
                onClick={onToggleAdminView}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer border ${
                  isAdminView
                    ? 'bg-[#1c1917] text-[#fbfbf9] border-[#1c1917]'
                    : 'bg-[#f4f1ea] text-[#1c1917] border-[#d6cebf] hover:bg-[#ede7da]'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-[#9c6644]" />
                <span className="hidden sm:inline">
                  {isAdminView ? 'Kembali ke Toko' : 'Admin Panel'}
                </span>
                {pendingProofCount > 0 && (
                  <span className="bg-[#b91c1c] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full tabular-nums">
                    {pendingProofCount}
                  </span>
                )}
              </button>
            ) : (
              <button
                onClick={onOpenAdminLogin}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#f4f1ea] hover:bg-[#eae3d5] text-[#292524] rounded-md transition-colors border border-[#d6cebf] cursor-pointer"
              >
                <UserCheck className="w-3.5 h-3.5 text-[#78716c]" />
                <span className="hidden sm:inline">Login Admin</span>
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-[#44403c] hover:text-[#1c1917] rounded-md cursor-pointer"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-[#fbfbf9] border-b border-[#e7e2d7] px-4 pt-2 pb-6 space-y-3">
            <div className="text-xs font-semibold text-[#a8a29e] tracking-wider uppercase mb-1">
              Kategori
            </div>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  onSelectCategory(cat.id);
                  if (isAdminView) onToggleAdminView();
                  setIsMobileMenuOpen(false);
                }}
                className={`block w-full text-left py-2 text-sm font-medium ${
                  activeCategory === cat.id && !isAdminView
                    ? 'text-[#9c6644] font-semibold'
                    : 'text-[#44403c]'
                }`}
              >
                {cat.label}
              </button>
            ))}
            <div className="pt-2 border-t border-[#e7e2d7] flex flex-col gap-2">
              <button
                onClick={() => {
                  onOpenOrderTracker();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center gap-2 py-2 text-sm font-medium text-[#44403c]"
              >
                <PackageCheck className="w-4 h-4 text-[#9c6644]" />
                <span>Lacak Status Pesanan</span>
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
