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
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        <p className="text-sm font-semibold text-slate-600">
          Scanning menu & loading shop details...
        </p>
      </div>
    );
  }

  if (errorMessage || !shop) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
        <div className="p-4 bg-rose-100 text-rose-700 rounded-full mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Shop Not Found or Inactive</h2>
        <p className="text-xs text-slate-500 max-w-sm mt-2">{errorMessage}</p>
        <a
          href="/"
          className="mt-6 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold"
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
    <div className="bg-slate-50 min-h-screen pb-28 overflow-x-hidden w-full max-w-full">
      <CartDrawer />

      {/* Shop Header Banner */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-3.5 sm:space-x-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 text-white flex items-center justify-center font-black text-2xl shadow-md shrink-0">
                {shop.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-3xl font-black text-slate-900 truncate">
                    {shop.name}
                  </h1>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1 shrink-0">
                    <Sparkles className="w-3 h-3" /> Open Now
                  </span>
                </div>

                <div className="mt-1 flex flex-wrap items-center gap-y-1 gap-x-3 sm:gap-x-4 text-xs text-slate-500">
                  {shop.address && (
                    <span className="flex items-center gap-1 truncate max-w-xs sm:max-w-none">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{shop.address}</span>
                    </span>
                  )}
                  {shop.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{shop.phone}</span>
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Kitchen Active</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Quick QR badge */}
            <div className="hidden md:flex flex-col items-end text-right">
              <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg border border-slate-200">
                slug: {shop.slug}
              </span>
              <span className="text-[11px] text-slate-400 mt-1">
                Scanned via Table QR
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar & Search */}
      <div className="sticky top-14 sm:top-16 z-30 bg-slate-50/95 backdrop-blur-md border-b border-slate-200 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex items-center space-x-2 overflow-x-auto w-full sm:w-auto pb-1.5 sm:pb-0 scrollbar-none">
            <button
              onClick={() => setSelectedCategoryId(null)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer shrink-0 ${
                selectedCategoryId === null
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
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
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer shrink-0 ${
                    selectedCategoryId === cat.id
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {cat.name} ({count})
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search burgers, drinks..."
              className="w-full text-xs pl-8 pr-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8">
            <Store className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No items match your search</h3>
            <p className="text-xs text-slate-500 mt-1">
              Try selecting a different category or clear the search filter.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
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

      {/* Mobile Floating Sticky Cart Bar */}
      {totalItems > 0 && (
        <div className="fixed bottom-4 left-4 right-4 z-40 max-w-lg mx-auto">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-gradient-to-r from-amber-500 to-rose-500 text-white rounded-2xl p-4 shadow-xl hover:shadow-2xl transition flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center font-bold text-sm">
                {totalItems}
              </div>
              <div className="text-left">
                <p className="text-xs font-medium text-white/90">View Current Order</p>
                <p className="text-sm font-black">₹{subtotal}</p>
              </div>
            </div>
            <div className="flex items-center space-x-1.5 font-bold text-xs bg-white text-slate-900 px-3.5 py-2 rounded-xl">
              <span>Checkout</span>
              <ShoppingCart className="w-3.5 h-3.5 text-amber-600" />
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
