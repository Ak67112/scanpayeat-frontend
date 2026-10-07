'use client';

import React from 'react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { Plus, Minus, Utensils, Star, Sparkles } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  shopId: number;
  shopSlug: string;
}

export default function ProductCard({ product, shopId, shopSlug }: ProductCardProps) {
  const { addToCart, updateQuantity, getItemQuantity } = useCart();
  const quantity = getItemQuantity(product.id);

  return (
    <div className="bg-white rounded-3xl border border-[#E8DFC8] shadow-xs hover:shadow-xl transition-all flex flex-col overflow-hidden group relative">
      {/* Product Image Container */}
      <div className="relative h-48 w-full bg-[#F5EFEB] overflow-hidden">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500';
            }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-stone-400 bg-[#F5EFEB]">
            <Utensils className="w-10 h-10 stroke-1 mb-1 text-stone-300" />
            <span className="text-xs font-medium">Chef Preparation</span>
          </div>
        )}

        {/* Floating Price Badge (Matching Eatopia circular badge) */}
        <div className="absolute top-3 right-3 bg-red-700 text-white rounded-full min-w-12 h-12 px-2 flex flex-col items-center justify-center shadow-lg shadow-red-700/30 border-2 border-white transform group-hover:scale-110 transition-transform">
          <span className="text-[8px] font-black uppercase tracking-wider text-red-200">PRICE</span>
          <span className="text-xs sm:text-sm font-black font-display leading-none">₹{product.price}</span>
        </div>

        {/* Availability Badge */}
        {!product.isAvailable && (
          <div className="absolute inset-0 bg-stone-900/75 backdrop-blur-xs flex items-center justify-center">
            <span className="bg-red-700 text-white text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-wider shadow-lg">
              Sold Out
            </span>
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-red-800 bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200">
              Kitchen Fresh
            </span>
            <div className="flex items-center gap-1 text-amber-600 font-bold text-xs">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>4.9</span>
            </div>
          </div>

          <h3 className="font-extrabold text-slate-900 text-base font-display group-hover:text-red-700 transition line-clamp-1">
            {product.name}
          </h3>

          {product.description && (
            <p className="text-xs text-stone-600 mt-1 line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          )}
        </div>

        {/* Action Controls */}
        <div className="pt-3 border-t border-[#E8DFC8] flex items-center justify-between">
          <span className="text-[11px] font-bold text-stone-500">
            {product.isAvailable ? 'Cooked to order' : 'Out of stock'}
          </span>

          {product.isAvailable ? (
            quantity > 0 ? (
              <div className="flex items-center space-x-2 bg-red-50 border border-red-200 rounded-2xl p-1 shadow-xs">
                <button
                  onClick={() => updateQuantity(product.id, quantity - 1)}
                  className="w-7 h-7 flex items-center justify-center text-red-800 hover:bg-red-100 rounded-xl transition cursor-pointer font-bold"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-6 text-center text-xs font-black text-red-900 font-display">
                  {quantity}
                </span>
                <button
                  onClick={() => updateQuantity(product.id, quantity + 1)}
                  className="w-7 h-7 flex items-center justify-center text-red-800 hover:bg-red-100 rounded-xl transition cursor-pointer font-bold"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => addToCart(product, shopId, shopSlug)}
                className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white text-xs font-extrabold uppercase tracking-wider rounded-xl shadow-md shadow-red-700/20 hover:shadow-lg transition flex items-center space-x-1.5 cursor-pointer transform active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>ADD</span>
              </button>
            )
          ) : (
            <span className="text-xs text-stone-400 italic font-semibold">Unavailable</span>
          )}
        </div>
      </div>
    </div>
  );
}
