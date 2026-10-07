import React, { useState } from 'react';
import { Star, Plus, Check, Eye } from 'lucide-react';
import { Product } from '../types';
import { formatRupiah } from '../lib/formatters';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
  onOpenDetail: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onOpenDetail }) => {
  const { addToCart } = useCart();
  const [imageError, setImageError] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.stock <= 0) return;

    setIsAdding(true);
    addToCart(product, 1);
    setTimeout(() => setIsAdding(false), 800);
  };

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  return (
    <div
      onClick={() => onOpenDetail(product)}
      className="group relative flex flex-col bg-white rounded-lg border border-[#e7e2d7] overflow-hidden hover:border-[#c8beab] hover:shadow-md transition-all duration-300 cursor-pointer"
    >
      {/* 1. Image Container (takes 65-70% visual height) */}
      <div className="relative aspect-4/3 w-full bg-[#f4f1ea] overflow-hidden">
        {!imageError ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover object-center group-hover:scale-104 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center image-placeholder-fallback">
            <span className="text-2xl mb-2">🏺</span>
            <p className="text-xs font-serif text-[#78716c] line-clamp-2">{product.name}</p>
          </div>
        )}

        {/* Subtle Badge (at most 1 subtle badge) */}
        {product.badge && (
          <div className="absolute top-3 left-3 bg-[#1c1917]/85 backdrop-blur-xs text-[#fbfbf9] text-[11px] font-medium px-2 py-0.5 rounded-sm">
            {product.badge}
          </div>
        )}

        {/* Quick View Pill overlay on hover */}
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <span className="bg-white/95 text-[#1c1917] text-xs font-semibold px-3 py-1.5 rounded shadow-sm flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-transform">
            <Eye className="w-3.5 h-3.5" />
            <span>Lihat Detail</span>
          </span>
        </div>
      </div>

      {/* 2. Content & Purchase Metadata */}
      <div className="p-4 flex flex-col flex-grow justify-between space-y-3">
        <div>
          {/* Unboxed Metadata (Anti-pill compliant) */}
          <div className="flex items-center justify-between text-xs text-[#78716c] mb-1">
            <span className="uppercase tracking-wider font-medium text-[11px] text-[#9c6644]">
              {product.category}
            </span>
            <div className="flex items-center gap-1 text-[#1c1917] font-medium">
              <Star className="w-3.5 h-3.5 fill-[#d97706] text-[#d97706]" />
              <span className="tabular-nums">{product.rating.toFixed(1)}</span>
              <span className="text-[#a8a29e] text-[10px]">({product.reviewsCount})</span>
            </div>
          </div>

          {/* Product Name */}
          <h3 className="font-serif font-semibold text-base text-[#1c1917] group-hover:text-[#9c6644] transition-colors line-clamp-1">
            {product.name}
          </h3>

          {/* Short specs if present */}
          <p className="text-xs text-[#78716c] line-clamp-1 mt-0.5">
            {product.material || product.dimensions}
          </p>
        </div>

        {/* Price & Action Row */}
        <div className="pt-2 border-t border-[#f4f1ea] flex items-end justify-between">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-semibold text-base text-[#1c1917] tabular-nums">
                {formatRupiah(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-xs text-[#a8a29e] line-through tabular-nums">
                  {formatRupiah(product.originalPrice)}
                </span>
              )}
            </div>
            
            {/* Stock indicator */}
            <p className="text-[11px] mt-0.5">
              {isOutOfStock ? (
                <span className="text-rose-600 font-medium">Stok Habis</span>
              ) : isLowStock ? (
                <span className="text-amber-600 font-medium">Sisa {product.stock} unit</span>
              ) : (
                <span className="text-emerald-700">Tersedia ({product.stock})</span>
              )}
            </p>
          </div>

          {/* Quick Add Button */}
          <button
            onClick={handleQuickAdd}
            disabled={isOutOfStock}
            aria-label={`Tambah ${product.name} ke keranjang`}
            className={`p-2 rounded-md transition-all cursor-pointer ${
              isOutOfStock
                ? 'bg-stone-100 text-stone-300 cursor-not-allowed'
                : isAdding
                ? 'bg-emerald-600 text-white'
                : 'bg-[#1c1917] hover:bg-[#292524] text-white shadow-xs'
            }`}
          >
            {isAdding ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
