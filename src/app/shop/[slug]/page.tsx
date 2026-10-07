'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { publicApi } from '../../../lib/api';
import { Shop, Category, Product } from '../../../types';
import ProductCard from '../../../components/shop/ProductCard';
import CartDrawer from '../../../components/shop/CartDrawer';
import { useCart } from '../../../context/CartContext';
import {
  Store,
  MapPin,
  Phone,
  Search,
  ShoppingCart,
  Loader2,
  AlertCircle,
  Clock,
  Sparkles,
  ArrowRight,
  Flame,
} from 'lucide-react';

export default function ShopMenuPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const { totalItems, subtotal, setIsCartOpen } = useCart();

  const [shop, setShop] = useState<Shop | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!slug) return;

    setIsLoading(true);
    publicApi
      .getShopMenu(slug)
      .then((data: any) => {
        setShop(data.shop);
        setCategories(data.categories || []);

        // Robust product extraction from either flat products array or nested category.products
        let prodsList: Product[] = [];
        if (Array.isArray(data.products) && data.products.length > 0) {
          prodsList = data.products.map((p: any) => ({
            ...p,
            price: Number(p.price),
          }));
        } else if (Array.isArray(data.categories)) {
          prodsList = data.categories.flatMap((cat: any) =>
            (cat.products || []).map((p: any) => ({
              ...p,
              categoryId: p.categoryId || cat.id,
              price: Number(p.price),
            }))
          );
        }

        setProducts(prodsList);
      })
      .catch((err) => {
        setErrorMessage(
          err.message || 'Unable to load shop menu. Please check the QR link.'
        );
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3 bg-[#FAF7F2]">
        <Loader2 className="w-9 h-9 animate-spin text-red-700" />
        <p className="text-sm font-bold text-stone-700 font-display">
          Scanning table QR & fetching kitchen menu...
        </p>
      </div>
    );
  }

  if (errorMessage || !shop) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center bg-[#FAF7F2]">
        <div className="p-4 bg-red-100 text-red-800 rounded-full mb-4 border border-red-200">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-950 font-display">Outlet Not Found or Inactive</h2>
        <p className="text-xs text-stone-600 max-w-sm mt-2">{errorMessage}</p>
        <a
          href="/"
          className="mt-6 px-6 py-3 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md transition"
        >
          Return to Home
        </a>
      </div>
    );
  }

  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      selectedCategoryId === null || p.categoryId === selectedCategoryId;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="bg-[#FAF7F2] min-h-screen pb-32 overflow-x-hidden w-full max-w-full text-[#18181B]">
      <CartDrawer />

      {/* Shop Header Banner */}
      <div className="bg-white border-b border-[#E8DFC8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="flex items-center space-x-4 sm:space-x-5">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-red-700 to-rose-600 text-white flex items-center justify-center font-black text-3xl shadow-xl shadow-red-700/20 font-display shrink-0 border-2 border-white">
                {shop.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl sm:text-4xl font-black text-slate-950 truncate font-display">
                    {shop.name}
                  </h1>
                  <span className="bg-emerald-100 text-emerald-900 text-[10px] sm:text-[11px] font-extrabold px-3 py-1 rounded-full border border-emerald-300 flex items-center gap-1.5 shrink-0">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-700" /> Kitchen Open
                  </span>
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-y-1.5 gap-x-4 text-xs text-stone-500 font-medium">
                  {shop.address && (
                    <span className="flex items-center gap-1.5 truncate max-w-xs sm:max-w-none">
                      <MapPin className="w-3.5 h-3.5 text-red-700 shrink-0" />
                      <span className="truncate">{shop.address}</span>
                    </span>
                  )}
                  {shop.phone && (
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-red-700 shrink-0" />
                      <span>{shop.phone}</span>
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-red-700 shrink-0" />
                    <span>Table QR Activated</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Quick QR badge */}
            <div className="hidden md:flex flex-col items-end text-right">
              <span className="text-xs font-mono font-bold bg-[#FAF7F2] text-red-900 px-3 py-1.5 rounded-xl border border-[#E8DFC8]">
                qr: {shop.slug}
              </span>
              <span className="text-[11px] text-stone-400 mt-1 font-medium">
                Live Kitchen Sync Active
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar & Search */}
      <div className="sticky top-20 z-30 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#E8DFC8] py-3.5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex items-center space-x-2 overflow-x-auto w-full sm:w-auto pb-1.5 sm:pb-0 scrollbar-none">
            <button
              onClick={() => setSelectedCategoryId(null)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition whitespace-nowrap cursor-pointer shrink-0 font-display ${
                selectedCategoryId === null
                  ? 'bg-red-700 text-white shadow-md shadow-red-700/25'
                  : 'bg-white text-stone-700 hover:bg-stone-50 border border-[#E8DFC8]'
              }`}
            >
              All Items ({products.length})
            </button>
            {categories.map((cat) => {
              const count = products.filter((p) => p.categoryId === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategoryId(cat.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition whitespace-nowrap cursor-pointer shrink-0 font-display ${
                    selectedCategoryId === cat.id
                      ? 'bg-red-700 text-white shadow-md shadow-red-700/25'
                      : 'bg-white text-stone-700 hover:bg-stone-50 border border-[#E8DFC8]'
                  }`}
                >
                  {cat.name} ({count})
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dishes, burgers, juice..."
              className="w-full text-xs pl-9 pr-4 py-2.5 bg-white border border-[#E8DFC8] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-red-700"
            />
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-[#E8DFC8] p-8 shadow-xs">
            <Store className="w-14 h-14 text-stone-300 mx-auto mb-3" />
            <h3 className="text-lg font-black text-slate-900 font-display">No Dishes Found</h3>
            <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
              {searchQuery
                ? `No dishes matched "${searchQuery}". Try a different keyword.`
                : 'No dishes currently listed in this category.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-7">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                shopId={shop.id}
                shopSlug={shop.slug}
              />
            ))}
          </div>
        )}
      </div>

      {/* Sticky Floating Cart Indicator for Mobile / Quick Access */}
      {totalItems > 0 && (
        <div className="fixed bottom-6 inset-x-4 max-w-md mx-auto z-40">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full py-4 px-6 bg-red-700 hover:bg-red-800 text-white rounded-2xl shadow-2xl shadow-red-900/40 flex items-center justify-between border-2 border-white transform active:scale-98 transition cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center font-bold text-xs font-display">
                {totalItems}
              </div>
              <div className="text-left">
                <p className="text-xs uppercase font-black tracking-wider text-red-100">Your Tray</p>
                <p className="text-sm font-black font-display leading-tight">₹{subtotal.toFixed(2)}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-xs font-black uppercase tracking-wider">
              <span>View Cart & Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
