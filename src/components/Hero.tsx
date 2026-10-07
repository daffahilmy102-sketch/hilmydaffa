import React from 'react';
import { ArrowDown, Sparkles, Shield, Truck, RefreshCw } from 'lucide-react';
import { HERO_IMAGE } from '../data/initialProducts';

interface HeroProps {
  onExploreClick: () => void;
  onOpenOrderTracker: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onExploreClick, onOpenOrderTracker }) => {
  return (
    <section className="relative overflow-hidden bg-[#fbfbf9] pt-6 pb-16 lg:py-20 border-b border-[#e7e2d7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Text Column */}
          <div className="lg:col-span-6 space-y-6 lg:pr-6">
            
            {/* Unboxed editorial category indicator (Anti-slop compliant) */}
            <div className="flex items-center gap-2 text-xs font-semibold text-[#8c6d52] tracking-wider uppercase">
              <span>Kurasi Musim Gugur 2026</span>
              <span aria-hidden="true">·</span>
              <span>Filosofi Japandi & Wabi-Sabi</span>
              <span aria-hidden="true">·</span>
              <span>12 Koleksi Terpilih</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-[#1c1917] tracking-tight leading-[1.15] text-balance">
              Keindahan Ruang, Ketenangan Jiwa.
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg text-[#57534e] leading-relaxed max-w-xl">
              Setiap sudut rumah menyimpan cerita. Komorebi Living menghadirkan perlengkapan rumah unik yang menggabungkan kehangatan kayu alami, keramik gerabah artisan, dan pencahayaan lembut untuk menciptakan hunian yang damai.
            </p>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={onExploreClick}
                className="px-6 py-3.5 text-sm font-semibold text-[#fbfbf9] bg-[#1c1917] hover:bg-[#292524] rounded-md transition-all shadow-sm hover:shadow-md cursor-pointer flex items-center gap-2"
              >
                <span>Jelajahi 12 Koleksi</span>
                <ArrowDown className="w-4 h-4" />
              </button>

              <button
                onClick={onOpenOrderTracker}
                className="px-6 py-3.5 text-sm font-semibold text-[#1c1917] bg-[#f4f1ea] hover:bg-[#eae3d5] rounded-md transition-all border border-[#d6cebf] cursor-pointer"
              >
                Lacak Status Pesanan
              </button>
            </div>

            {/* Subtle trust markers with unboxed typography (Anti-pill) */}
            <div className="pt-6 border-t border-[#e7e2d7] grid grid-cols-3 gap-4 text-[#78716c] text-xs">
              <div>
                <p className="font-semibold text-[#1c1917]">100% Artisan</p>
                <p className="text-[#78716c] mt-0.5">Kayu jati & gerabah asli</p>
              </div>
              <div>
                <p className="font-semibold text-[#1c1917]">Packing Peti Kayu</p>
                <p className="text-[#78716c] mt-0.5">Garansi tiba utuh & aman</p>
              </div>
              <div>
                <p className="font-semibold text-[#1c1917]">Real Database</p>
                <p className="text-[#78716c] mt-0.5">Stok & approval instan</p>
              </div>
            </div>

          </div>

          {/* Right Image Column */}
          <div className="lg:col-span-6 relative">
            <div className="relative aspect-4/3 sm:aspect-16/10 rounded-xl overflow-hidden shadow-xl border border-[#e7e2d7] bg-[#ede5d8]">
              <img
                src={HERO_IMAGE}
                alt="Komorebi Living Japandi Interior"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center transform hover:scale-102 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
              
              {/* Caption Overlay */}
              <div className="absolute bottom-4 left-4 right-4 p-4 bg-white/90 backdrop-blur-md rounded-lg border border-white/40 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wider text-[#8c6d52] font-semibold">Ruang Harmoni</p>
                  <p className="text-sm font-serif font-bold text-[#1c1917]">Japandi Living Room Set & Lighting</p>
                </div>
                <button
                  onClick={onExploreClick}
                  className="text-xs font-semibold text-[#1c1917] hover:text-[#9c6644] underline underline-offset-4 cursor-pointer"
                >
                  Lihat Item
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
