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
  ChefHat,
  Image as ImageIcon,
  X,
  ChevronLeft,
  ChevronRight,
  Heart,
  Quote,
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
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [isAmbienceOpen, setIsAmbienceOpen] = useState(false);

  // Ambience photo carousel state
  const [currentAmbienceIdx, setCurrentAmbienceIdx] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const scrollAmbience = (dir: 'prev' | 'next') => {
    if (!shop?.ambienceImages || shop.ambienceImages.length === 0) return;
    const count = shop.ambienceImages.length;
    let nextIdx = dir === 'next' ? currentAmbienceIdx + 1 : currentAmbienceIdx - 1;
    if (nextIdx >= count) nextIdx = 0;
    if (nextIdx < 0) nextIdx = count - 1;
    setCurrentAmbienceIdx(nextIdx);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (diff > 45) {
      scrollAmbience('next');
    } else if (diff < -45) {
      scrollAmbience('prev');
    }
    setTouchStartX(null);
  };

  useEffect(() => {
    if (!shop?.ambienceImages || shop.ambienceImages.length <= 1) return;
    const interval = setInterval(() => {
      scrollAmbience('next');
    }, 5000);
    return () => clearInterval(interval);
  }, [shop?.ambienceImages, currentAmbienceIdx]);

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

  const ambienceList = shop.ambienceImages || [];

  return (
    <div className="bg-[#FAF7F2] min-h-screen pb-32 overflow-x-hidden w-full max-w-full text-[#18181B]">
      <CartDrawer />

      {/* Shop Header Banner */}
      <div className="bg-white border-b border-[#E8DFC8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="flex items-center space-x-4 sm:space-x-5">
              {shop.logoUrl ? (
                <img
                  src={shop.logoUrl}
                  alt={shop.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl object-cover shadow-xl border-2 border-white shrink-0 ring-2 ring-red-100"
                />
              ) : (
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-red-700 to-rose-600 text-white flex items-center justify-center font-black text-3xl shadow-xl shadow-red-700/20 font-display shrink-0 border-2 border-white">
                  {shop.name.charAt(0)}
                </div>
              )}
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


          </div>
        </div>
      </div>

      {/* Restaurant Ambition & Ambience Showcase */}
      {(shop.description || (shop.ambienceImages && shop.ambienceImages.length > 0)) && (
        <div className="bg-[#F5EFE6] border-b border-[#E8DFC8]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-red-100 text-red-700">
                  <Sparkles className="w-4 h-4" />
                </span>
                <h2 className="text-sm sm:text-base font-black text-slate-900 font-display uppercase tracking-wide">
                  Dining Ambience &amp; Culinary Ambition
                </h2>
                {shop.ambienceImages && shop.ambienceImages.length > 0 && (
                  <span className="text-[11px] font-bold text-red-800 bg-red-100 px-2.5 py-0.5 rounded-full">
                    {shop.ambienceImages.length} Photos
                  </span>
                )}
              </div>

              {shop.description && (
                <button
                  onClick={() => setIsAmbienceOpen((prev) => !prev)}
                  className="text-xs font-bold text-red-700 hover:text-red-900 flex items-center gap-1 self-start md:self-auto cursor-pointer"
                >
                  <span>{isAmbienceOpen ? 'Hide Restaurant Story' : 'Read Our Culinary Story'}</span>
                  <ChevronRight
                    className={`w-3.5 h-3.5 transition-transform ${isAmbienceOpen ? 'rotate-90' : ''}`}
                  />
                </button>
              )}
            </div>

            {/* Expandable / Featured Culinary Philosophy Story */}
            {shop.description && (isAmbienceOpen || (!shop.ambienceImages || shop.ambienceImages.length === 0)) && (
              <div className="mb-4 p-4 sm:p-5 bg-white rounded-2xl border border-[#E8DFC8] shadow-xs relative overflow-hidden animate-in fade-in duration-200">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-red-50 text-red-700 shrink-0">
                    <Quote className="w-5 h-5" />
                  </div>
                  <div className="space-y-1.5 flex-1">
                    <p className="text-xs sm:text-sm text-stone-700 font-medium leading-relaxed italic">
                      &ldquo;{shop.description}&rdquo;
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-[11px] font-black text-slate-900">
                        — {shop.name} Culinary &amp; Hospitality Team
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Ambience Photos Carousel - True One-By-One Showcase */}
            {ambienceList.length > 0 && (
              <div className="relative pt-1 space-y-3">
                {/* Carousel Top Navigation Bar */}
                <div className="flex items-center justify-between">
                  <div className="text-xs text-stone-500 font-medium flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Swipe or click arrows to explore our dining space</span>
                  </div>

                  {ambienceList.length > 1 && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-stone-600 bg-white px-2.5 py-1 rounded-lg border border-[#E8DFC8]">
                        {currentAmbienceIdx + 1} / {ambienceList.length}
                      </span>
                      <button
                        type="button"
                        onClick={() => scrollAmbience('prev')}
                        className="p-2 rounded-xl bg-white hover:bg-stone-100 text-stone-700 border border-[#E8DFC8] shadow-xs transition cursor-pointer flex items-center justify-center hover:scale-105 active:scale-95"
                        title="Previous photo"
                        aria-label="Previous photo"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => scrollAmbience('next')}
                        className="p-2 rounded-xl bg-white hover:bg-stone-100 text-stone-700 border border-[#E8DFC8] shadow-xs transition cursor-pointer flex items-center justify-center hover:scale-105 active:scale-95"
                        title="Next photo"
                        aria-label="Next photo"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Hero Showcase Slide Track - One By One Image */}
                <div 
                  className="relative w-full h-64 sm:h-80 md:h-[420px] rounded-3xl overflow-hidden shadow-md border-2 border-white bg-stone-900 group"
                  onTouchStart={handleTouchStart}
                  onTouchEnd={handleTouchEnd}
                >
                  {/* Sliding Container - Glides 1 Image by 1 Image */}
                  <div
                    className="flex h-full w-full transition-transform duration-500 ease-out"
                    style={{ transform: `translateX(-${currentAmbienceIdx * 100}%)` }}
                  >
                    {ambienceList.map((imgUrl, i) => (
                      <div
                        key={i}
                        className="min-w-full w-full h-full relative shrink-0 cursor-pointer overflow-hidden"
                        onClick={() => setLightboxImage(imgUrl)}
                      >
                        <img
                          src={imgUrl}
                          alt={`Dining Ambience ${i + 1}`}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        {/* Slide Caption & Lightbox CTA */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-between p-4 sm:p-6 opacity-90 group-hover:opacity-100 transition-opacity">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white bg-black/55 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 flex items-center gap-1.5 shadow-xs">
                              <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                              <span>Photo {i + 1} of {ambienceList.length}</span>
                            </span>
                            <span className="hidden sm:inline-flex text-[11px] font-semibold text-white/90 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                              Click to view full screen
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-xs text-white/90 font-medium drop-shadow-md">
                              {shop.name} Atmosphere &amp; Dining Room
                            </span>
                            <span className="text-xs font-bold text-amber-300 flex items-center gap-1 bg-black/60 px-3 py-1 rounded-full backdrop-blur-xs">
                              Tap to View Large
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Floating Next/Prev Arrow Overlays on the Hero Slide */}
                  {ambienceList.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          scrollAmbience('prev');
                        }}
                        className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md border border-white/25 flex items-center justify-center transition hover:scale-110 active:scale-95 shadow-xl cursor-pointer"
                        title="Previous photo"
                        aria-label="Previous photo"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          scrollAmbience('next');
                        }}
                        className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md border border-white/25 flex items-center justify-center transition hover:scale-110 active:scale-95 shadow-xl cursor-pointer"
                        title="Next photo"
                        aria-label="Next photo"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </div>

                {/* Bottom Thumbnail Strip & Dot Indicators */}
                {ambienceList.length > 1 && (
                  <div className="flex flex-col items-center gap-2 pt-1">
                    {/* Thumbnail Row */}
                    <div className="flex items-center justify-center gap-2 sm:gap-2.5 overflow-x-auto max-w-full pb-1 scrollbar-none">
                      {ambienceList.map((imgUrl, thumbIdx) => (
                        <button
                          key={thumbIdx}
                          type="button"
                          onClick={() => setCurrentAmbienceIdx(thumbIdx)}
                          className={`relative shrink-0 w-14 h-10 sm:w-18 sm:h-12 rounded-xl overflow-hidden border-2 transition cursor-pointer ${
                            currentAmbienceIdx === thumbIdx
                              ? 'border-red-600 ring-2 ring-red-400 scale-105 opacity-100 shadow-md'
                              : 'border-stone-300 opacity-60 hover:opacity-100'
                          }`}
                          title={`Go to photo ${thumbIdx + 1}`}
                        >
                          <img
                            src={imgUrl}
                            alt={`Thumb ${thumbIdx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>

                    {/* Dot Indicators */}
                    <div className="flex items-center gap-1.5">
                      {ambienceList.map((_, dotIdx) => (
                        <button
                          key={dotIdx}
                          type="button"
                          onClick={() => setCurrentAmbienceIdx(dotIdx)}
                          className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                            currentAmbienceIdx === dotIdx
                              ? 'w-6 bg-red-700'
                              : 'w-1.5 bg-stone-300 hover:bg-stone-400'
                          }`}
                          title={`Slide ${dotIdx + 1}`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

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

      {/* Ambience Full-screen Lightbox Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setLightboxImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] w-full flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute -top-12 right-0 text-white/80 hover:text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition cursor-pointer"
              title="Close image"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={lightboxImage}
              alt="Ambience full preview"
              className="max-h-[82vh] w-auto max-w-full rounded-2xl object-contain shadow-2xl border border-white/20"
            />
            <p className="text-stone-300 text-xs font-medium mt-3">
              {shop.name} • Dining Ambience &amp; Interior Atmosphere
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
