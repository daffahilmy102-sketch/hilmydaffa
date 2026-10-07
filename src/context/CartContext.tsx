import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product, Coupon } from '../types';
import { AVAILABLE_COUPONS } from '../data/initialProducts';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number, selectedVariant?: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  appliedCoupon: Coupon | null;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  orderNote: string;
  setOrderNote: (note: string) => void;
  totalItemsCount: number;
  subtotal: number;
  discountAmount: number;
  freeShippingThreshold: number;
  amountNeededForFreeShipping: number;
  isFreeShipping: boolean;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'komorebi_cart_v1';
const CART_NOTE_KEY = 'komorebi_cart_note_v1';
const FREE_SHIPPING_THRESHOLD = 750000; // Rp 750.000

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [orderNote, setOrderNoteState] = useState<string>(() => {
    try {
      return localStorage.getItem(CART_NOTE_KEY) || '';
    } catch {
      return '';
    }
  });

  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [items]);

  useEffect(() => {
    try {
      localStorage.setItem(CART_NOTE_KEY, orderNote);
    } catch (e) {
      console.error('Failed to save note to localStorage', e);
    }
  }, [orderNote]);

  // Auto-sync across multiple browser tabs via StorageEvent
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === CART_STORAGE_KEY && e.newValue) {
        try {
          setItems(JSON.parse(e.newValue));
        } catch {
          // ignore parsing error
        }
      }
      if (e.key === CART_NOTE_KEY && e.newValue !== null) {
        setOrderNoteState(e.newValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => (prev === msg ? null : prev));
    }, 2800);
  };

  const setOrderNote = (note: string) => {
    setOrderNoteState(note);
  };

  const addToCart = (product: Product, quantity = 1, selectedVariant?: string) => {
    if (product.stock <= 0) {
      showToast(`Maaf, stok ${product.name} sedang habis.`);
      return;
    }

    setItems(prevItems => {
      const existingIndex = prevItems.findIndex(item => item.product.id === product.id);

      if (existingIndex > -1) {
        const existingItem = prevItems[existingIndex];
        const newQuantity = Math.min(existingItem.quantity + quantity, product.stock);

        if (newQuantity === existingItem.quantity) {
          showToast(`Maksimal stok tercapai (${product.stock} unit).`);
          return prevItems;
        }

        const updated = [...prevItems];
        updated[existingIndex] = {
          ...existingItem,
          quantity: newQuantity,
          selectedVariant: selectedVariant || existingItem.selectedVariant
        };
        showToast(`Ditambahkan ke keranjang: ${product.name} (${newQuantity}x)`);
        return updated;
      } else {
        const newQuantity = Math.min(quantity, product.stock);
        showToast(`Ditambahkan ke keranjang: ${product.name}`);
        return [...prevItems, { product, quantity: newQuantity, selectedVariant }];
      }
    });

    setIsCartOpen(true);
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setItems(prevItems =>
      prevItems.map(item => {
        if (item.product.id === productId) {
          const maxStock = item.product.stock;
          const targetQty = Math.min(quantity, maxStock);
          return { ...item, quantity: targetQty };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId: string) => {
    setItems(prevItems => {
      const itemToRemove = prevItems.find(i => i.product.id === productId);
      if (itemToRemove) {
        showToast(`Dihapus dari keranjang: ${itemToRemove.product.name}`);
      }
      return prevItems.filter(item => item.product.id !== productId);
    });
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
    showToast('Keranjang belanja telah dikosongkan.');
  };

  // Subtotal calculation
  const subtotal = items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const totalItemsCount = items.reduce((acc, item) => acc + item.quantity, 0);

  // Free shipping calculations
  const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const amountNeededForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  // Coupon application logic
  const applyCoupon = (code: string): { success: boolean; message: string } => {
    const formattedCode = code.trim().toUpperCase();
    const found = AVAILABLE_COUPONS.find(c => c.code === formattedCode);

    if (!found) {
      return { success: false, message: 'Kode kupon tidak valid atau sudah kedaluwarsa.' };
    }

    if (subtotal < found.minSpend) {
      const diff = found.minSpend - subtotal;
      return { 
        success: false, 
        message: `Minimal belanja Rp ${found.minSpend.toLocaleString('id-ID')} untuk kupon ini (Kurang Rp ${diff.toLocaleString('id-ID')}).` 
      };
    }

    setAppliedCoupon(found);
    return { success: true, message: `Kupon ${found.code} berhasil digunakan!` };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  // Re-validate coupon if subtotal changes below threshold
  useEffect(() => {
    if (appliedCoupon && subtotal < appliedCoupon.minSpend) {
      setAppliedCoupon(null);
      showToast('Kupon dilepas karena total belanja di bawah batas minimal.');
    }
  }, [subtotal, appliedCoupon]);

  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'percentage') {
      discountAmount = Math.round((subtotal * appliedCoupon.discountValue) / 100);
    } else {
      discountAmount = appliedCoupon.discountValue;
    }
  }

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        orderNote,
        setOrderNote,
        totalItemsCount,
        subtotal,
        discountAmount,
        freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
        amountNeededForFreeShipping,
        isFreeShipping,
        isCartOpen,
        setIsCartOpen,
        toastMessage,
        showToast
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
