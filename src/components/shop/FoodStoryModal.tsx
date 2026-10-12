'use client';

import React, { useState, useRef, useEffect } from 'react';
import { toPng } from 'html-to-image';
import {
  X,
  Share2,
  Download,
  Sparkles,
  Camera,
  MapPin,
  UtensilsCrossed,
  Check,
  Smile,
  MessageCircle,
  Loader2,
  RefreshCw,
  Edit3,
  Flame,
  Heart,
  Palette,
} from 'lucide-react';
import { FoodStoryData } from '../../types';

interface FoodStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  storyData: FoodStoryData | null;
  isLoading?: boolean;
}

const STICKER_OPTIONS = [
  '🍔', '🔥', '🧡', '🍕', '✨', '🤤',
  '😋', '🌮', '🍟', '🥤', '💯', '🎉',
];

const CAPTION_PRESETS = [
  "Today's Craving 🍔✨",
  "Cheat Meal of the Century! 🤤",
  "Pure Food Bliss 🧡🔥",
  "Freshly cooked & unbeatable! ✨",
  "Best food in town! 😋",
];

type StoryStyle = 'STICKER' | 'POLAROID' | 'MINIMAL';

const InstagramIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

export default function FoodStoryModal({
  isOpen,
  onClose,
  storyData,
  isLoading = false,
}: FoodStoryModalProps) {
  const storyRef = useRef<HTMLDivElement>(null);

  // Customization states
  const [caption, setCaption] = useState("Today's Craving 🍔✨");
  const [isEditingCaption, setIsEditingCaption] = useState(false);
  const [selectedStickers, setSelectedStickers] = useState<string[]>(['🔥', '✨']);
  const [selectedItemIndex, setSelectedItemIndex] = useState(0);
  const [activeStyle, setActiveStyle] = useState<StoryStyle>('STICKER');
  const [imageError, setImageError] = useState(false);

  // Sharing states
  const [isExporting, setIsExporting] = useState(false);
  const [shareSuccessMessage, setShareSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setShareSuccessMessage(null);
      setIsExporting(false);
      setImageError(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Fallbacks
  const customerName = storyData?.customer?.name || 'Foodie';
  const customerAvatar = storyData?.customer?.profileImage;
  const restaurantName = storyData?.restaurant?.name || 'ScanPayEat Diner';
  const restaurantLocation = storyData?.restaurant?.location || 'Gourmet Dine-In';
  const restaurantLogo = storyData?.restaurant?.logo;
  const tokenNumber = storyData?.order?.tokenNumber || 'ORD-01';
  const orderNumber = storyData?.order?.orderNumber || '101';

  const items = storyData?.order?.items && storyData.order.items.length > 0
    ? storyData.order.items
    : [{ name: 'Delicious Chef Special', image: null, quantity: 1, unitPrice: 0 }];

  const activeItem = items[selectedItemIndex] || items[0];

  const toggleSticker = (sticker: string) => {
    setSelectedStickers((prev) =>
      prev.includes(sticker)
        ? prev.filter((s) => s !== sticker)
        : prev.length >= 4
        ? [...prev.slice(1), sticker]
        : [...prev, sticker]
    );
  };

  // Generate PNG Data URL from storyRef
  const generateStoryPng = async (): Promise<string | null> => {
    if (!storyRef.current) return null;
    try {
      setIsExporting(true);
      const dataUrl = await toPng(storyRef.current, {
        cacheBust: true,
        pixelRatio: 2.5,
        quality: 0.98,
        skipFonts: false,
      });
      return dataUrl;
    } catch (err) {
      console.error('Error generating food story image:', err);
      try {
        if (storyRef.current) {
          return await toPng(storyRef.current, { pixelRatio: 2 });
        }
      } catch (retryErr) {
        console.error('Retry generation failed:', retryErr);
      }
      return null;
    } finally {
      setIsExporting(false);
    }
  };

  // 1. Direct Download
  const handleDownload = async () => {
    const dataUrl = await generateStoryPng();
    if (!dataUrl) {
      alert('Could not render story image. Please try again.');
      return;
    }

    const link = document.createElement('a');
    link.download = `ScanPayEat-Story-${tokenNumber}.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setShareSuccessMessage('Image downloaded! You can now post it to your Story.');
    setTimeout(() => setShareSuccessMessage(null), 4000);
  };

  // 2. Add to Instagram Story (Native Web Share API with File)
  const handleShareInstagram = async () => {
    const dataUrl = await generateStoryPng();
    if (!dataUrl) {
      alert('Failed to generate story image. Please try downloading instead.');
      return;
    }

    try {
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const file = new File([blob], `ScanPayEat-Story-${tokenNumber}.png`, {
        type: 'image/png',
      });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `${restaurantName} - Food Story`,
          text: `Dining at ${restaurantName}! Token #${tokenNumber} • Scanned. Ordered. Loved. 🧡 #ScanPayEat`,
        });
        setShareSuccessMessage('Shared successfully!');
      } else {
        handleDownload();
        setShareSuccessMessage('Image saved! Open Instagram and add it to your Story.');
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        handleDownload();
      }
    }
  };

  // 3. Share to WhatsApp
  const handleShareWhatsApp = async () => {
    const dataUrl = await generateStoryPng();
    if (dataUrl) {
      const link = document.createElement('a');
      link.download = `ScanPayEat-Story-${tokenNumber}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    const message = encodeURIComponent(
      `Just ordered delicious food at *${restaurantName}*! 🍔✨\nOrder #${orderNumber} • Token #${tokenNumber}\n\nScanned. Ordered. Loved. 🧡\n#ScanPayEat`
    );
    window.open(`https://api.whatsapp.com/send?text=${message}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Dark overlay backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/85 backdrop-blur-md transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Main Container */}
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl z-10 overflow-hidden flex flex-col md:flex-row max-h-[92vh]">
        {/* Close Button Top Right */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-30 p-2 bg-black/50 hover:bg-black/80 text-white rounded-full backdrop-blur-sm transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ================= LEFT: 9:16 Story Canvas Preview ================= */}
        <div className="flex-1 bg-slate-950 p-4 sm:p-6 flex items-center justify-center overflow-hidden">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center space-y-3 py-20 text-white">
              <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
              <p className="text-sm font-semibold text-slate-300">
                Generating your personalized Food Story...
              </p>
            </div>
          ) : (
            /* 9:16 Canvas (Instagram Story aspect ratio) */
            <div
              ref={storyRef}
              className="relative w-[340px] sm:w-[360px] aspect-[9/16] rounded-2xl overflow-hidden shadow-2xl flex flex-col justify-between select-none bg-slate-950 text-white"
              style={{
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
              }}
            >
              {/* STYLE 1: NATIVE IG STICKER STYLE (Focus on Food & Location) */}
              {activeStyle === 'STICKER' && (
                <>
                  {/* Food Hero Background */}
                  <div className="absolute inset-0 z-0 overflow-hidden">
                    {activeItem?.image && !imageError ? (
                      <img
                        src={activeItem.image}
                        alt={activeItem.name}
                        crossOrigin="anonymous"
                        onError={() => setImageError(true)}
                        className="w-full h-full object-cover object-center filter brightness-95 transform scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-amber-600 via-orange-600 to-rose-700 flex flex-col items-center justify-center p-6 text-center">
                        <UtensilsCrossed className="w-24 h-24 text-white/30 mb-2" />
                        <h4 className="font-black text-xl text-white/90">{activeItem.name}</h4>
                      </div>
                    )}
                    {/* Atmospheric Vignette Gradients */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-black/50" />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />
                  </div>

                  {/* Top Area: Clean breathing room with Instagram-Style Location & Token Stickers */}
                  <div className="relative z-10 pt-8 px-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      {/* Native Instagram Location Sticker */}
                      <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/95 text-slate-900 shadow-2xl backdrop-blur-md border border-white/60 transform -rotate-1 hover:rotate-0 transition max-w-[230px]">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-rose-500 via-pink-500 to-amber-500 flex items-center justify-center text-white shrink-0 shadow-xs">
                          <MapPin className="w-3.5 h-3.5" />
                        </div>
                        <div className="text-left leading-tight min-w-0">
                          <div className="font-black text-xs text-slate-900 tracking-tight truncate">
                            {restaurantName}
                          </div>
                          {restaurantLocation && (
                            <div className="text-[10px] text-slate-500 font-semibold truncate">
                              {restaurantLocation}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Daily Counter Token Sticker */}
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-2xl border border-white/20 transform rotate-2 shrink-0">
                        <span className="text-[9px] font-black uppercase tracking-wider text-amber-100">
                          TOKEN
                        </span>
                        <span className="text-xs font-mono font-black text-white">
                          {tokenNumber}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Center: Floating Stickers & Caption Callout */}
                  <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-4 space-y-3 pointer-events-none">
                    {/* User Emojis */}
                    <div className="flex flex-wrap gap-3 justify-center items-center">
                      {selectedStickers.map((sticker, idx) => (
                        <span
                          key={idx}
                          className="text-4xl sm:text-5xl drop-shadow-2xl filter transform hover:scale-125 transition"
                          style={{
                            transform: `rotate(${idx % 2 === 0 ? '-10deg' : '10deg'})`,
                          }}
                        >
                          {sticker}
                        </span>
                      ))}
                    </div>

                    {/* Interactive Text Sticker */}
                    <div className="inline-block px-4 py-2 bg-black/75 backdrop-blur-md rounded-2xl border border-white/25 shadow-2xl text-center transform -rotate-1">
                      <span className="font-black text-sm text-amber-300 tracking-wide drop-shadow-sm">
                        {caption}
                      </span>
                    </div>
                  </div>

                  {/* Bottom: Dish Info + Customer Profile Below + ScanPayEat Branding */}
                  <div className="relative z-10 p-4 space-y-2.5 bg-gradient-to-t from-black via-black/85 to-transparent">
                    {/* Dish Title Banner */}
                    <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3 flex items-center justify-between shadow-xl">
                      <div className="min-w-0">
                        <span className="text-[9px] uppercase tracking-wider font-extrabold text-amber-300 block">
                          Today&apos;s Pick
                        </span>
                        <h3 className="font-black text-sm sm:text-base text-white truncate">
                          {activeItem?.name}
                        </h3>
                      </div>
                      <span className="text-[10px] font-extrabold bg-amber-500 text-white px-2.5 py-1 rounded-xl shadow-xs shrink-0 ml-2">
                        ×{activeItem?.quantity || 1}
                      </span>
                    </div>

                    {/* Customer Profile & Restaurant Brand Footer (Added Below) */}
                    <div className="flex items-center justify-between pt-1 border-t border-white/10">
                      {/* Customer Profile Avatar + Name */}
                      <div className="flex items-center gap-2">
                        <div className="p-0.5 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 shadow-md shrink-0">
                          <div className="w-7 h-7 rounded-full bg-slate-800 p-0.5 flex items-center justify-center overflow-hidden">
                            {customerAvatar ? (
                              <img
                                src={customerAvatar}
                                alt={customerName}
                                crossOrigin="anonymous"
                                className="w-full h-full object-cover rounded-full"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-tr from-amber-500 to-orange-500 text-white font-black text-[11px] flex items-center justify-center rounded-full">
                                {customerName.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="leading-tight">
                          <span className="text-[11px] font-bold text-white block truncate max-w-[130px]">
                            {customerName}
                          </span>
                          <span className="text-[9px] text-amber-300/90 font-medium">
                            Feasting on good food
                          </span>
                        </div>
                      </div>

                      {/* ScanPayEat Official Brand Stamp */}
                      <div className="text-right">
                        <div className="flex items-center justify-end gap-1 font-black text-[10px] text-white/95">
                          <span className="w-3.5 h-3.5 rounded-sm bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white text-[8px] font-black">
                            ⚡
                          </span>
                          <span>ScanPayEat</span>
                        </div>
                        <span className="text-[8px] font-extrabold text-amber-300/80 tracking-wide block">
                          Scanned. Ordered. Loved. 🧡
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* STYLE 2: POLAROID FOOD CARD (Instagram Aesthetic Photo Frame) */}
              {activeStyle === 'POLAROID' && (
                <div className="relative w-full h-full bg-gradient-to-b from-slate-900 via-neutral-900 to-black p-4 flex flex-col justify-between">
                  {/* Top: Location & Token Header */}
                  <div className="pt-6 space-y-2">
                    <div className="flex items-center justify-between">
                      {/* Clean Location Tag */}
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-slate-900 shadow-lg font-bold text-xs">
                        <MapPin className="w-3.5 h-3.5 text-rose-500" />
                        <span className="truncate max-w-[180px]">{restaurantName}</span>
                      </div>

                      {/* Token Stamp */}
                      <div className="px-2.5 py-1 bg-amber-500 text-white font-mono font-black text-xs rounded-xl shadow-md">
                        #{tokenNumber}
                      </div>
                    </div>
                  </div>

                  {/* Center: Aesthetic Polaroid Photo Frame */}
                  <div className="bg-white p-3 pb-5 rounded-2xl shadow-2xl transform rotate-1 space-y-2.5 text-slate-900">
                    <div className="aspect-[4/3] w-full bg-slate-100 rounded-xl overflow-hidden relative shadow-inner">
                      {activeItem?.image && !imageError ? (
                        <img
                          src={activeItem.image}
                          alt={activeItem.name}
                          crossOrigin="anonymous"
                          onError={() => setImageError(true)}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center">
                          <UtensilsCrossed className="w-16 h-16 text-white/40" />
                        </div>
                      )}

                      {/* Emojis floating on Polaroid */}
                      <div className="absolute top-2 right-2 flex gap-1">
                        {selectedStickers.map((s, idx) => (
                          <span key={idx} className="text-2xl drop-shadow-md">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="px-1 text-center">
                      <h3 className="font-black text-sm text-slate-900 truncate">
                        {activeItem?.name}
                      </h3>
                      <p className="text-xs font-semibold text-amber-600 mt-0.5">
                        {caption}
                      </p>
                    </div>
                  </div>

                  {/* Bottom: Customer Profile & Branding */}
                  <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 to-rose-500 p-0.5 shadow-sm">
                        <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-white text-xs font-black overflow-hidden">
                          {customerAvatar ? (
                            <img src={customerAvatar} alt={customerName} crossOrigin="anonymous" className="w-full h-full object-cover" />
                          ) : (
                            customerName.charAt(0).toUpperCase()
                          )}
                        </div>
                      </div>
                      <span className="text-xs font-bold text-white">{customerName}</span>
                    </div>

                    <span className="text-[10px] font-extrabold text-amber-300">
                      Scanned. Ordered. Loved. 🧡
                    </span>
                  </div>
                </div>
              )}

              {/* STYLE 3: MINIMAL EDITORIAL (Food & Location Focused) */}
              {activeStyle === 'MINIMAL' && (
                <div className="relative w-full h-full bg-slate-950 p-5 flex flex-col justify-between">
                  {/* Top Food Headline */}
                  <div className="pt-6 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-widest font-black text-amber-400">
                        FOOD STORY
                      </span>
                      <span className="text-xs font-mono font-black text-white/80 bg-white/10 px-2.5 py-0.5 rounded-full">
                        TOKEN {tokenNumber}
                      </span>
                    </div>
                    <h2 className="text-2xl font-black text-white leading-tight">
                      {activeItem?.name}
                    </h2>
                    <div className="inline-flex items-center gap-1.5 text-xs text-rose-300 font-semibold pt-1">
                      <MapPin className="w-3.5 h-3.5 text-rose-400" />
                      <span>{restaurantName} • {restaurantLocation}</span>
                    </div>
                  </div>

                  {/* Center Hero Image */}
                  <div className="aspect-square w-full rounded-3xl overflow-hidden shadow-2xl relative border border-white/10">
                    {activeItem?.image && !imageError ? (
                      <img
                        src={activeItem.image}
                        alt={activeItem.name}
                        crossOrigin="anonymous"
                        onError={() => setImageError(true)}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-amber-600 to-rose-700 flex items-center justify-center">
                        <UtensilsCrossed className="w-20 h-20 text-white/30" />
                      </div>
                    )}
                    <div className="absolute bottom-3 left-3 right-3 p-3 bg-black/70 backdrop-blur-md rounded-2xl border border-white/20 text-center">
                      <span className="text-xs font-extrabold text-white">
                        {caption}
                      </span>
                    </div>
                  </div>

                  {/* Bottom: Profile & Brand */}
                  <div className="flex items-center justify-between pt-3 border-t border-white/10">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-slate-800 border border-amber-400/50 flex items-center justify-center text-xs font-black overflow-hidden">
                        {customerAvatar ? (
                          <img src={customerAvatar} alt={customerName} crossOrigin="anonymous" className="w-full h-full object-cover" />
                        ) : (
                          customerName.charAt(0).toUpperCase()
                        )}
                      </div>
                      <span className="text-xs font-bold text-white">{customerName}</span>
                    </div>

                    <span className="text-[10px] font-black text-amber-300">
                      ScanPayEat 🧡
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ================= RIGHT: Controls & Share Flow ================= */}
        <div className="w-full md:w-84 bg-slate-900 p-5 sm:p-6 flex flex-col justify-between space-y-4 border-t md:border-t-0 md:border-l border-slate-800">
          <div className="space-y-4">
            <div>
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-pink-500/20 to-amber-500/20 text-pink-300 border border-pink-500/30 text-[10px] font-black uppercase tracking-wider">
                <Camera className="w-3 h-3" />
                Instagram Story Ready
              </div>
              <h2 className="text-lg font-black text-white mt-1">
                Customize Food Story
              </h2>
              <p className="text-xs text-slate-400">
                Share your food &amp; location directly to your Story.
              </p>
            </div>

            {/* Design Style Selector */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                <Palette className="w-3.5 h-3.5 text-amber-400" />
                Story Design Style:
              </label>
              <div className="grid grid-cols-3 gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveStyle('STICKER')}
                  className={`py-1.5 px-2 rounded-lg text-xs font-black transition cursor-pointer text-center ${
                    activeStyle === 'STICKER'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  📍 IG Sticker
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStyle('POLAROID')}
                  className={`py-1.5 px-2 rounded-lg text-xs font-black transition cursor-pointer text-center ${
                    activeStyle === 'POLAROID'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  📸 Polaroid
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStyle('MINIMAL')}
                  className={`py-1.5 px-2 rounded-lg text-xs font-black transition cursor-pointer text-center ${
                    activeStyle === 'MINIMAL'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  ✨ Editorial
                </button>
              </div>
            </div>

            {/* Multiple Items Selector (if order has >1 dish) */}
            {items.length > 1 && (
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                  Select Featured Dish:
                </label>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {items.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedItemIndex(idx)}
                      className={`px-2.5 py-1 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer ${
                        selectedItemIndex === idx
                          ? 'bg-amber-500 text-white shadow-xs'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {item.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Caption Customizer */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                  Story Caption:
                </label>
                <button
                  type="button"
                  onClick={() => setIsEditingCaption(!isEditingCaption)}
                  className="text-[11px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="w-3 h-3" />
                  {isEditingCaption ? 'Done' : 'Edit'}
                </button>
              </div>

              {isEditingCaption ? (
                <input
                  type="text"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  maxLength={60}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  placeholder="Enter custom caption..."
                />
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {CAPTION_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCaption(preset)}
                      className={`text-[10px] px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${
                        caption === preset
                          ? 'bg-amber-500 text-white'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Sticker Picker */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                <Smile className="w-3.5 h-3.5 text-amber-400" />
                Add Stickers:
              </label>
              <div className="grid grid-cols-6 gap-1 bg-slate-950 p-2 rounded-xl border border-slate-800">
                {STICKER_OPTIONS.map((stk, idx) => {
                  const isSelected = selectedStickers.includes(stk);
                  return (
                    <button
                      key={idx}
                      onClick={() => toggleSticker(stk)}
                      className={`h-9 rounded-lg text-lg flex items-center justify-center transition cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500/30 border border-amber-500 scale-110 shadow-xs'
                          : 'hover:bg-slate-800 text-slate-400'
                      }`}
                    >
                      {stk}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Feedback notification banner */}
            {shareSuccessMessage && (
              <div className="p-2.5 bg-emerald-950/80 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 font-bold flex items-center gap-2 animate-in fade-in">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{shareSuccessMessage}</span>
              </div>
            )}
          </div>

          {/* Action Sharing Buttons */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            {/* 1. Add to Instagram Story Button */}
            <button
              onClick={handleShareInstagram}
              disabled={isExporting || isLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 hover:from-purple-700 hover:via-pink-700 hover:to-orange-600 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-pink-600/25 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Preparing Story Image...</span>
                </>
              ) : (
                <>
                  <InstagramIcon className="w-4 h-4" />
                  <span>Add to Instagram Story</span>
                </>
              )}
            </button>

            {/* 2. Share to WhatsApp Button */}
            <button
              onClick={handleShareWhatsApp}
              disabled={isExporting || isLoading}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Share to WhatsApp Status</span>
            </button>

            {/* 3. Direct Download PNG Button */}
            <button
              onClick={handleDownload}
              disabled={isExporting || isLoading}
              className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 border border-slate-700"
            >
              <Download className="w-4 h-4 text-slate-400" />
              <span>Download High-Res PNG (1080×1920)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
