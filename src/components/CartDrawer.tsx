import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, ArrowRight, Tag, Truck, Check, AlertCircle, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatRupiah } from '../lib/formatters';

interface CartDrawerProps {
  onProceedToCheckout: () => void;
  onExploreProducts: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  onProceedToCheckout,
  onExploreProducts
}) => {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    totalItemsCount,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    discountAmount,
    freeShippingThreshold,
    amountNeededForFreeShipping,
    isFreeShipping,
    orderNote,
    setOrderNote
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [couponFeedback, setCouponFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isNoteOpen, setIsNoteOpen] = useState(false);

  if (!isCartOpen) return null;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    const res = applyCoupon(couponInput);
    if (res.success) {
      setCouponFeedback({ type: 'success', text: res.message });
      setCouponInput('');
    } else {
      setCouponFeedback({ type: 'error', text: res.message });
    }
  };

  const handleQuickCoupon = (code: string) => {
    const res = applyCoupon(code);
    if (res.success) {
      setCouponFeedback({ type: 'success', text: res.message });
    } else {
      setCouponFeedback({ type: 'error', text: res.message });
    }
  };

  // Progress percentage for free shipping
  const shippingProgress = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  const finalTotal = Math.max(0, subtotal - discountAmount);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fadeIn">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#fbfbf9] shadow-2xl border-l border-[#e7e2d7] flex flex-col justify-between">
          
          {/* Header */}
          <div className="p-5 border-b border-[#e7e2d7] bg-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5 text-[#9c6644]" />
              <h2 className="text-lg font-serif font-bold text-[#1c1917]">
                Keranjang Belanja
              </h2>
              <span className="text-xs bg-[#f4f1ea] text-[#57534e] px-2 py-0.5 rounded-full font-medium tabular-nums">
                {totalItemsCount} item
              </span>
            </div>

            <div className="flex items-center gap-2">
              {items.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-xs text-[#a8a29e] hover:text-rose-600 transition-colors cursor-pointer mr-2"
                >
                  Kosongkan
                </button>
              )}
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-1.5 text-[#78716c] hover:text-[#1c1917] hover:bg-[#f4f1ea] rounded-full transition-colors cursor-pointer"
                aria-label="Tutup keranjang"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Free Shipping Progress Bar */}
          <div className="bg-[#f5f2eb] px-5 py-3 border-b border-[#e7e2d7]">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="flex items-center gap-1.5 font-medium text-[#1c1917]">
                <Truck className="w-3.5 h-3.5 text-[#8c6d52]" />
                {isFreeShipping ? (
                  <span className="text-emerald-700 font-semibold">Selamat! Anda Mendapatkan Gratis Ongkir</span>
                ) : (
                  <span>
                    Tambah <strong className="text-[#1c1917]">{formatRupiah(amountNeededForFreeShipping)}</strong> lagi untuk Gratis Ongkir
                  </span>
                )}
              </span>
              <span className="font-semibold tabular-nums text-[#8c6d52]">{shippingProgress}%</span>
            </div>
            <div className="w-full bg-[#e2dbce] rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  isFreeShipping ? 'bg-emerald-600' : 'bg-[#9c6644]'
                }`}
                style={{ width: `${shippingProgress}%` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 px-4 space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#f4f1ea] flex items-center justify-center text-3xl">
                  🛒
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#1c1917]">
                    Keranjang Belanja Kosong
                  </h3>
                  <p className="text-xs text-[#78716c] max-w-xs mt-1">
                    Belum ada perlengkapan rumah unik yang dipilih. Temukan koleksi aesthetic untuk hunian Anda.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    onExploreProducts();
                  }}
                  className="px-5 py-2.5 bg-[#1c1917] hover:bg-[#292524] text-white text-xs font-semibold rounded-md shadow-xs transition-colors cursor-pointer"
                >
                  Mulai Jelajahi Produk
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.product.id}
                  className="flex gap-3 bg-white p-3 rounded-lg border border-[#e7e2d7] shadow-2xs group"
                >
                  {/* Thumbnail */}
                  <div className="w-20 h-20 bg-[#f4f1ea] rounded-md overflow-hidden shrink-0 border border-[#f0ede6]">
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div className="pr-4">
                      <span className="text-[10px] text-[#8c6d52] font-semibold uppercase tracking-wider block">
                        {item.product.category}
                      </span>
                      <h4 className="text-xs font-semibold text-[#1c1917] truncate font-serif">
                        {item.product.name}
                      </h4>
                      <p className="text-xs font-semibold text-[#1c1917] tabular-nums mt-0.5">
                        {formatRupiah(item.product.price)}
                      </p>
                    </div>

                    {/* Quantity Stepper & Remove */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center border border-[#d6cebf] rounded bg-[#fbfbf9]">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="p-1 text-[#78716c] hover:text-[#1c1917] cursor-pointer"
                          aria-label="Kurangi jumlah"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2.5 py-0.5 text-xs font-semibold tabular-nums text-[#1c1917]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          disabled={item.quantity >= item.product.stock}
                          className="p-1 text-[#78716c] hover:text-[#1c1917] disabled:opacity-30 cursor-pointer"
                          aria-label="Tambah jumlah"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-[#a8a29e] hover:text-rose-600 transition-colors p-1 cursor-pointer"
                        aria-label="Hapus produk"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}

            {/* Order Note Collapsible */}
            {items.length > 0 && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setIsNoteOpen(!isNoteOpen)}
                  className="text-xs font-medium text-[#78716c] hover:text-[#1c1917] flex items-center justify-between w-full py-1.5 cursor-pointer border-t border-[#e7e2d7]"
                >
                  <span>{orderNote ? 'Catatan Pesanan Tersimpan ✓' : '+ Tambah Catatan Pesanan (opsional)'}</span>
                  <span className="text-xs">{isNoteOpen ? '▲' : '▼'}</span>
                </button>
                {isNoteOpen && (
                  <textarea
                    value={orderNote}
                    onChange={(e) => setOrderNote(e.target.value)}
                    placeholder="Contoh: Tolong packing kado, kartu ucapan 'Happy Housewarming', dll."
                    rows={2}
                    className="w-full mt-2 text-xs p-2.5 bg-white border border-[#d6cebf] rounded-md focus:outline-none focus:border-[#1c1917] text-[#1c1917]"
                  />
                )}
              </div>
            )}
          </div>

          {/* Footer & Checkout Summary */}
          {items.length > 0 && (
            <div className="p-5 bg-white border-t border-[#e7e2d7] space-y-4">
              
              {/* Coupon Box */}
              <div>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-md p-2.5 text-xs">
                    <div className="flex items-center gap-2">
                      <Tag className="w-3.5 h-3.5 text-emerald-600" />
                      <div>
                        <span className="font-semibold text-emerald-800">{appliedCoupon.code}</span>
                        <p className="text-[11px] text-emerald-600">Hemat {formatRupiah(discountAmount)}</p>
                      </div>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-[11px] text-rose-600 hover:underline cursor-pointer"
                    >
                      Hapus
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="space-y-1.5">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => {
                          setCouponInput(e.target.value);
                          setCouponFeedback(null);
                        }}
                        placeholder="Kode kupon diskon..."
                        className="flex-1 text-xs px-3 py-2 border border-[#d6cebf] rounded-md uppercase bg-[#fbfbf9] focus:outline-none focus:border-[#1c1917]"
                      />
                      <button
                        type="submit"
                        className="px-3 py-2 bg-[#f4f1ea] hover:bg-[#eae3d5] text-[#1c1917] border border-[#d6cebf] text-xs font-semibold rounded-md transition-colors cursor-pointer"
                      >
                        Terapkan
                      </button>
                    </div>

                    {/* Quick coupon buttons */}
                    <div className="flex items-center gap-1.5 text-[10px] text-[#78716c]">
                      <span>Kupon:</span>
                      <button
                        type="button"
                        onClick={() => handleQuickCoupon('UTS2026')}
                        className="underline text-[#8c6d52] hover:text-[#1c1917] cursor-pointer"
                      >
                        UTS2026 (15%)
                      </button>
                      <span>·</span>
                      <button
                        type="button"
                        onClick={() => handleQuickCoupon('KOMOREBI10')}
                        className="underline text-[#8c6d52] hover:text-[#1c1917] cursor-pointer"
                      >
                        KOMOREBI10
                      </button>
                    </div>

                    {couponFeedback && (
                      <p className={`text-[11px] ${couponFeedback.type === 'success' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {couponFeedback.text}
                      </p>
                    )}
                  </form>
                )}
              </div>

              {/* Price Calculation */}
              <div className="space-y-1.5 text-xs text-[#57534e]">
                <div className="flex justify-between">
                  <span>Subtotal Produk</span>
                  <span className="font-semibold text-[#1c1917] tabular-nums">
                    {formatRupiah(subtotal)}
                  </span>
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Diskon Kupon ({appliedCoupon.code})</span>
                    <span className="font-semibold tabular-nums">
                      - {formatRupiah(discountAmount)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Estimasi Ongkir</span>
                  <span className="font-semibold tabular-nums">
                    {isFreeShipping ? (
                      <span className="text-emerald-700 font-bold uppercase text-[10px]">Gratis</span>
                    ) : (
                      'Dihitung saat checkout'
                    )}
                  </span>
                </div>

                <div className="flex justify-between text-sm font-bold text-[#1c1917] pt-2 border-t border-[#e7e2d7]">
                  <span>Total Sementara</span>
                  <span className="tabular-nums text-base">
                    {formatRupiah(finalTotal)}
                  </span>
                </div>
              </div>

              {/* Checkout Trigger */}
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  onProceedToCheckout();
                }}
                className="w-full py-3.5 px-4 bg-[#1c1917] hover:bg-[#292524] text-white font-semibold text-sm rounded-md shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Lanjut ke Pembayaran</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
