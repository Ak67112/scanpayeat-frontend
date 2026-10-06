'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem } from '../types';

interface CartContextType {
  items: CartItem[];
  shopId: number | null;
  shopSlug: string | null;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (product: Product, shopId: number, shopSlug: string) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  getItemQuantity: (productId: number) => number;
  subtotal: number;
  totalItems: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [shopId, setShopId] = useState<number | null>(null);
  const [shopSlug, setShopSlug] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    // Restore cart from localStorage
    const saved = localStorage.getItem('scanpayeat_cart');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.items && Array.isArray(parsed.items)) {
          setItems(parsed.items);
          setShopId(parsed.shopId ?? null);
          setShopSlug(parsed.shopSlug ?? null);
        }
      } catch (e) {
        // ignore
      }
    }
  }, []);

  const saveCart = (newItems: CartItem[], newShopId: number | null, newShopSlug: string | null) => {
    setItems(newItems);
    setShopId(newShopId);
    setShopSlug(newShopSlug);
    localStorage.setItem(
      'scanpayeat_cart',
      JSON.stringify({ items: newItems, shopId: newShopId, shopSlug: newShopSlug })
    );
  };

  const addToCart = (product: Product, targetShopId: number, targetShopSlug: string) => {
    // If cart has items from another shop, confirm replace
    if (shopId !== null && shopId !== targetShopId && items.length > 0) {
      const confirmReplace = window.confirm(
        'Your cart contains items from another shop. Clear your cart and start a new order at this shop?'
      );
      if (!confirmReplace) return;
      saveCart([{ product, quantity: 1 }], targetShopId, targetShopSlug);
      setIsCartOpen(true);
      return;
    }

    const existingIndex = items.findIndex((i) => i.product.id === product.id);
    let nextItems: CartItem[];

    if (existingIndex > -1) {
      nextItems = items.map((item, idx) =>
        idx === existingIndex ? { ...item, quantity: item.quantity + 1 } : item
      );
    } else {
      nextItems = [...items, { product, quantity: 1 }];
    }

    saveCart(nextItems, targetShopId, targetShopSlug);
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: number) => {
    const nextItems = items.filter((i) => i.product.id !== productId);
    if (nextItems.length === 0) {
      saveCart([], null, null);
    } else {
      saveCart(nextItems, shopId, shopSlug);
    }
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    const nextItems = items.map((i) =>
      i.product.id === productId ? { ...i, quantity } : i
    );
    saveCart(nextItems, shopId, shopSlug);
  };

  const clearCart = () => {
    saveCart([], null, null);
    setIsCartOpen(false);
  };

  const getItemQuantity = (productId: number) => {
    const item = items.find((i) => i.product.id === productId);
    return item ? item.quantity : 0;
  };

  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        shopId,
        shopSlug,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getItemQuantity,
        subtotal,
        totalItems,
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
