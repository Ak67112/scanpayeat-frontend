'use client';

import React from 'react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { Plus, Minus, Utensils } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  shopId: number;
  shopSlug: string;
}

export default function ProductCard({ product, shopId, shopSlug }: ProductCardProps) {
  const { addToCart, updateQuantity, getItemQuantity } = useCart();
  const quantity = getItemQuantity(product.id);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col overflow-hidden group">
      {/* Product Image */}
      <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              // Fallback if image fails to load
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500';
            }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-100">
            <Utensils className="w-10 h-10 stroke-1 mb-1 text-slate-300" />
            <span className="text-xs">No image</span>
          </div>
        )}

        {/* Availability Badge */}
        {!product.isAvailable && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center">
            <span className="bg-rose-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Sold Out
            </span>
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-slate-900 text-base leading-snug line-clamp-1">
              {product.name}
            </h3>
            <span className="font-extrabold text-amber-700 text-base shrink-0">
              ₹{product.price}
            </span>
          </div>

          {product.description && (
            <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          )}
        </div>

        {/* Action Button */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] font-medium text-slate-400">
            {product.isAvailable ? 'Freshly prepared' : 'Unavailable'}
          </span>

          {product.isAvailable ? (
            quantity > 0 ? (
              <div className="flex items-center space-x-2 bg-amber-50 border border-amber-200 rounded-xl p-1">
                <button
                  onClick={() => updateQuantity(product.id, quantity - 1)}
                  className="w-7 h-7 flex items-center justify-center text-amber-800 hover:bg-amber-100 rounded-lg transition cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-6 text-center text-xs font-bold text-amber-900">
                  {quantity}
                </span>
                <button
                  onClick={() => updateQuantity(product.id, quantity + 1)}
                  className="w-7 h-7 flex items-center justify-center text-amber-800 hover:bg-amber-100 rounded-lg transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => addToCart(product, shopId, shopSlug)}
                className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-xs hover:shadow transition flex items-center space-x-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>ADD</span>
              </button>
            )
          ) : (
            <span className="text-xs text-slate-400 italic font-medium">Out of Stock</span>
          )}
        </div>
      </div>
    </div>
  );
}
