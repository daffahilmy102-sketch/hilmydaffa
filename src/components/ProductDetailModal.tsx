import React, { useState } from 'react';
import { X, Star, Truck, ShieldCheck, Check, Minus, Plus, ShoppingBag } from 'lucide-react';
import { Product } from '../types';
import { formatRupiah } from '../lib/formatters';
import { useCart } from '../context/CartContext';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onBuyNow: (product: Product, quantity: number) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onBuyNow
}) => {
  if (!product) return null;

  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [imageError, setImageError] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1200);
  };

  const handleBuyNow = () => {
    onBuyNow(product, quantity);
    onClose();
  };

  const isOutOfStock = product.stock <= 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div 
        className="relative w-full max-w-4xl bg-white rounded-xl shadow-2xl border border-[#e7e2d7] overflow-hidden max-h-[90vh] flex flex-col md:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Tutup modal detail produk"
          className="absolute top-4 right-4 z-10 p-2 text-[#78716c] hover:text-[#1c1917] bg-white/80 hover:bg-white rounded-full transition-colors cursor-pointer shadow-xs"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Column: Large Image */}
        <div className="md:w-1/2 bg-[#f4f1ea] relative min-h-[300px] md:min-h-[480px]">
          {!imageError ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              referrerPolicy="no-referrer"
              onError={() => setImageError(true)}
              className="w-full h-full object-cover object-center"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center image-placeholder-fallback">
              <span className="text-4xl mb-3">🏺</span>
              <p className="text-sm font-serif text-[#78716c]">{product.name}</p>
            </div>
          )}

          {product.badge && (
            <div className="absolute top-4 left-4 bg-[#1c1917] text-white text-xs font-semibold px-2.5 py-1 rounded-sm">
              {product.badge}
            </div>
          )}
        </div>

        {/* Right Column: Contiguous Purchase Module */}
        <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-4">
            {/* Category & Rating */}
            <div className="flex items-center justify-between text-xs text-[#78716c]">
              <span className="uppercase tracking-wider font-semibold text-[#8c6d52]">
                {product.category}
              </span>
              <div className="flex items-center gap-1.5 text-[#1c1917]">
                <Star className="w-4 h-4 fill-[#d97706] text-[#d97706]" />
                <span className="font-semibold tabular-nums">{product.rating.toFixed(1)}</span>
                <span className="text-[#a8a29e]">({product.reviewsCount} Ulasan)</span>
              </div>
            </div>

            {/* Product Name */}
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1c1917] leading-snug">
              {product.name}
            </h2>

            {/* Pricing */}
            <div className="flex items-baseline gap-3 pt-1">
              <span className="text-2xl font-bold text-[#1c1917] tabular-nums">
                {formatRupiah(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-sm text-[#a8a29e] line-through tabular-nums">
                  {formatRupiah(product.originalPrice)}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-sm text-[#57534e] leading-relaxed">
              {product.description}
            </p>

            {/* Specs Breakdown */}
            <div className="bg-[#fbfbf9] border border-[#e7e2d7] rounded-lg p-3.5 space-y-2 text-xs">
              {product.dimensions && (
                <div className="flex justify-between">
                  <span className="text-[#78716c]">Dimensi / Ukuran</span>
                  <span className="font-medium text-[#1c1917]">{product.dimensions}</span>
                </div>
              )}
              {product.material && (
                <div className="flex justify-between">
                  <span className="text-[#78716c]">Material Utama</span>
                  <span className="font-medium text-[#1c1917]">{product.material}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-[#78716c]">Ketersediaan Stok</span>
                <span className={`font-semibold tabular-nums ${isOutOfStock ? 'text-rose-600' : 'text-emerald-700'}`}>
                  {isOutOfStock ? 'Stok Habis' : `${product.stock} unit siap kirim`}
                </span>
              </div>
            </div>
          </div>

          {/* Quantity Stepper & CTAs */}
          <div className="pt-6 border-t border-[#e7e2d7] space-y-4 mt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[#1c1917]">Jumlah Pesanan:</span>
              <div className="flex items-center border border-[#d6cebf] rounded-md bg-[#fbfbf9]">
                <button
                  type="button"
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  disabled={quantity <= 1 || isOutOfStock}
                  className="p-2 text-[#57534e] hover:text-[#1c1917] disabled:opacity-30 cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-4 py-1 text-sm font-semibold tabular-nums text-[#1c1917]">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                  disabled={quantity >= product.stock || isOutOfStock}
                  className="p-2 text-[#57534e] hover:text-[#1c1917] disabled:opacity-30 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`w-full py-3 px-4 rounded-md text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer border ${
                  isOutOfStock
                    ? 'bg-stone-100 text-stone-300 border-stone-200 cursor-not-allowed'
                    : isAdded
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-[#f4f1ea] hover:bg-[#eae3d5] text-[#1c1917] border-[#d6cebf]'
                }`}
              >
                {isAdded ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Ditambahkan</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>+ Keranjang</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className="w-full py-3 px-4 rounded-md text-sm font-semibold bg-[#1c1917] hover:bg-[#292524] text-white transition-all shadow-sm cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Beli Sekarang
              </button>
            </div>

            {/* Trust note */}
            <div className="flex items-center justify-center gap-4 text-[11px] text-[#78716c] pt-1">
              <span className="flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-[#8c6d52]" />
                Pengiriman Bergaransi
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#8c6d52]" />
                Kualitas Artisan Terjamin
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
