import React from 'react';
import { ShieldCheck, Truck, RefreshCw, Mail, Phone, MapPin } from 'lucide-react';

export const Footer: React.FC<{ onOpenAdminLogin: () => void }> = ({ onOpenAdminLogin }) => {
  return (
    <footer className="bg-[#1c1917] text-[#f4f1ea] border-t border-[#292524] pt-14 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top 3 Value Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-12 border-b border-[#2e2a27]">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-full bg-[#292524] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-[#8c6d52]" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Kerajinan Tangan Terpilih</h4>
              <p className="text-xs text-[#a8a29e] mt-1 leading-relaxed">
                Diproduksi oleh perajin lokal Indonesia & pengrajin internasional dengan bahan ramah lingkungan berkualitas tinggi.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-full bg-[#292524] flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5 text-[#8c6d52]" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Pengemasan Peti Kayu & Bubble</h4>
              <p className="text-xs text-[#a8a29e] mt-1 leading-relaxed">
                Setiap keramik dan kaca dilapisi pelindung ekstra dengan garansi penggantian barang baru bila terjadi kerusakan transit.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-full bg-[#292524] flex items-center justify-center shrink-0">
              <RefreshCw className="w-5 h-5 text-[#8c6d52]" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Cloud Real Database</h4>
              <p className="text-xs text-[#a8a29e] mt-1 leading-relaxed">
                Sistem inventaris dan approval bukti pembayaran terhubung langsung ke Google Cloud Firestore.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Navigation & Brand */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 py-10">
          
          {/* Brand Bio (5 cols) */}
          <div className="md:col-span-5 space-y-3">
            <span className="font-serif font-bold text-xl tracking-wider text-white">
              KOMOREBI LIVING
            </span>
            <p className="text-xs text-[#a8a29e] leading-relaxed max-w-sm">
              Toko perlengkapan rumah & home living berkonsep wabi-sabi Japandi. Menghadirkan keseimbangan estetika, fungsi, dan kehangatan alami untuk setiap ruang tinggal.
            </p>
            <div className="text-xs text-[#d6cebf] pt-1">
              <span>Jakarta Selatan, Indonesia · Hubungi kami: hello@komorebi.id</span>
            </div>
          </div>

          {/* Categories Links (3 cols) */}
          <div className="md:col-span-3 space-y-2 text-xs">
            <p className="font-semibold text-white uppercase tracking-wider text-[11px] mb-3">
              Kategori Koleksi
            </p>
            <p className="text-[#a8a29e] hover:text-white transition-colors cursor-pointer">Living & Dekorasi Ruang</p>
            <p className="text-[#a8a29e] hover:text-white transition-colors cursor-pointer">Dapur & Peralatan Makan</p>
            <p className="text-[#a8a29e] hover:text-white transition-colors cursor-pointer">Kamar Tidur & Kamar Mandi</p>
            <p className="text-[#a8a29e] hover:text-white transition-colors cursor-pointer">Lilin Aromaterapi & Diffuser</p>
          </div>

          {/* Payments & Admin Access (4 cols) */}
          <div className="md:col-span-4 space-y-3 text-xs">
            <p className="font-semibold text-white uppercase tracking-wider text-[11px]">
              Metode Pembayaran Resmi
            </p>
            <p className="text-xs text-[#a8a29e]">
              BCA, Mandiri, dan QRIS Instant (GoPay, OVO, ShopeePay, DANA).
            </p>
            <div className="pt-2">
              <button
                onClick={onOpenAdminLogin}
                className="text-xs text-[#8c6d52] hover:text-[#d6cebf] underline cursor-pointer"
              >
                Masuk ke Panel Pengelola Toko
              </button>
            </div>
          </div>

        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 border-t border-[#292524] flex flex-col sm:flex-row items-center justify-between text-xs text-[#78716c]">
          <p>© 2026 Komorebi Living. Hak cipta dilindungi undang-undang.</p>
          <p className="mt-2 sm:mt-0">Proyek Webstore Marketplace UTS — AI Studio Production</p>
        </div>

      </div>
    </footer>
  );
};
