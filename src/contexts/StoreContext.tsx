'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '@/data/products';

export type Currency = 'SAR' | 'YER' | 'USD';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface StoreContextType {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  wishlistCount: number;
  formatPrice: (prices: { SAR: number; YER: number; USD: number }) => string;
  toastMessage: string | null;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>('SAR');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load persisted currency, cart, and wishlist from localStorage
  useEffect(() => {
    try {
      const savedCurrency = localStorage.getItem('drberry_currency') as Currency;
      if (savedCurrency && ['SAR', 'YER', 'USD'].includes(savedCurrency)) {
        setCurrencyState(savedCurrency);
      }
      const savedCart = localStorage.getItem('drberry_cart');
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
      const savedWishlist = localStorage.getItem('drberry_wishlist');
      if (savedWishlist) {
        setWishlist(JSON.parse(savedWishlist));
      }
    } catch {
      // Ignore storage errors in SSR / private mode
    }
  }, []);

  const setCurrency = (c: Currency) => {
    setCurrencyState(c);
    try {
      localStorage.setItem('drberry_currency', c);
    } catch {}
  };

  const addToCart = (product: Product, quantity: number = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      let updated: CartItem[];
      if (existing) {
        updated = prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        updated = [...prev, { product, quantity }];
      }
      try {
        localStorage.setItem('drberry_cart', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    // Show toast
    setToastMessage(`تمت إضافة "${product.titleAr.split('|')[0].trim()}" إلى السلة`);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => {
      const updated = prev.filter((item) => item.product.id !== productId);
      try {
        localStorage.setItem('drberry_cart', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) => {
      const updated = prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      );
      try {
        localStorage.setItem('drberry_cart', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const clearCart = () => {
    setCart([]);
    try {
      localStorage.removeItem('drberry_cart');
    } catch {}
  };

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) => {
      const exists = prev.includes(productId);
      const updated = exists ? prev.filter((id) => id !== productId) : [...prev, productId];
      try {
        localStorage.setItem('drberry_wishlist', JSON.stringify(updated));
      } catch {}
      setToastMessage(exists ? 'تمت الإزالة من المفضلة' : 'تمت الإضافة إلى المفضلة ❤️');
      setTimeout(() => setToastMessage(null), 2500);
      return updated;
    });
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const wishlistCount = wishlist.length;

  const formatPrice = (prices: { SAR: number; YER: number; USD: number }) => {
    switch (currency) {
      case 'YER':
        return `${prices.YER.toLocaleString('ar-YE')} ر.ي`;
      case 'USD':
        return `$${prices.USD.toFixed(2)}`;
      case 'SAR':
      default:
        return `${prices.SAR.toLocaleString('ar-SA')} ر.س`;
    }
  };

  return (
    <StoreContext.Provider
      value={{
        currency,
        setCurrency,
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        wishlist,
        toggleWishlist,
        isInWishlist,
        wishlistCount,
        formatPrice,
        toastMessage,
      }}
    >
      {children}
      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-primary text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-secondary/30 animate-bounce">
          <svg className="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          <span className="font-bold text-sm">{toastMessage}</span>
        </div>
      )}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
