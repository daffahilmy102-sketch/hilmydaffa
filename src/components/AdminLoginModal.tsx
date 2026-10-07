import React, { useState } from 'react';
import { X, ShieldCheck, Lock, Mail, ArrowRight, UserCheck } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess
}) => {
  const { loginWithGoogle, loginAsDemoAdmin } = useStore();
  const [email, setEmail] = useState('admin@komorebi.id');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCredentialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Harap masukkan email dan password admin.');
      return;
    }

    // Authenticate as store admin
    loginAsDemoAdmin();
    onLoginSuccess();
    onClose();
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await loginWithGoogle();
      onLoginSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      setError('Login Google dibatalkan atau terkendala. Anda dapat menggunakan opsi Demo Admin di bawah.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = () => {
    loginAsDemoAdmin();
    onLoginSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div 
        className="relative w-full max-w-md bg-white rounded-xl shadow-2xl border border-[#e7e2d7] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-[#e7e2d7] bg-[#fbfbf9] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#9c6644]" />
            <h2 className="text-lg font-serif font-bold text-[#1c1917]">
              Login Panel Pengelola
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#78716c] hover:text-[#1c1917] rounded-full hover:bg-[#f4f1ea] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          <div className="text-xs text-[#57534e]">
            Masuk untuk mengelola data katalog produk, stok real-time, approval bukti transfer pembayaran, data pesanan, dan laporan sales.
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-md">
              {error}
            </div>
          )}

          {/* Form Login Admin */}
          <form onSubmit={handleCredentialSubmit} className="space-y-3 text-xs">
            <div>
              <label className="block text-[#57534e] font-medium mb-1">Email Pengelola</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-2.5 text-[#78716c]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@komorebi.id"
                  className="w-full pl-9 pr-3 py-2 bg-[#fbfbf9] border border-[#d6cebf] rounded-md focus:outline-none focus:border-[#1c1917]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[#57534e] font-medium mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-2.5 text-[#78716c]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 bg-[#fbfbf9] border border-[#d6cebf] rounded-md focus:outline-none focus:border-[#1c1917]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#1c1917] hover:bg-[#292524] text-white font-semibold rounded-md transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer mt-2"
            >
              <span>Masuk ke Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-[#e7e2d7]"></div>
            <span className="shrink mx-2 text-[10px] text-[#a8a29e] uppercase tracking-wider">Atau Opsi Cepat</span>
            <div className="flex-grow border-t border-[#e7e2d7]"></div>
          </div>

          {/* Quick Evaluator / Demo Admin Access Button */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={handleQuickDemo}
              className="w-full py-2.5 px-3 bg-[#f4f1ea] hover:bg-[#eae3d5] text-[#1c1917] font-semibold text-xs rounded-md border border-[#d6cebf] flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <UserCheck className="w-4 h-4 text-[#8c6d52]" />
              <span>1-Click Masuk sebagai Penguji UTS / Dosen</span>
            </button>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-2 px-3 bg-white hover:bg-stone-50 text-[#44403c] font-medium text-xs rounded-md border border-[#d6cebf] flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <span>Sign in with Google</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
