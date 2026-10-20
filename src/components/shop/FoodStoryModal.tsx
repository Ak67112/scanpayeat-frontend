'use client';

import React, { useState, useRef, useEffect } from 'react';
import { toPng } from 'html-to-image';
import {
  X,
  Download,
  MapPin,
  UtensilsCrossed,
  Check,
  Smile,
  Loader2,
  Type,
  Palette,
  Sparkles,
} from 'lucide-react';
import { FoodStoryData } from '../../types';

interface FoodStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  storyData: FoodStoryData | null;
  isLoading?: boolean;
}

type StoryTemplateType = 'LOCATION' | 'CRAVING';

// Font styles inspired by Instagram Stories
export interface StoryFont {
  id: string;
  name: string;
  label: string;
  fontFamily: string;
  extraClass: string;
}

const STORY_FONTS: StoryFont[] = [
  {
    id: 'MODERN',
    name: 'Modern',
    label: 'Modern',
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    extraClass: 'font-black tracking-tight',
  },
  {
    id: 'RETRO',
    name: 'Retro',
    label: 'Retro',
    fontFamily:
      '"Impact", "Arial Black", "Trebuchet MS", "Cooper Black", fantasy, sans-serif',
    extraClass: 'font-black tracking-wider uppercase',
  },
  {
    id: 'SERIF',
    name: 'Serif',
    label: 'Editorial',
    fontFamily: 'Georgia, "Playfair Display", "Times New Roman", serif',
    extraClass: 'font-serif font-black italic tracking-normal',
  },
  {
    id: 'TYPEWRITER',
    name: 'Mono',
    label: 'Typewriter',
    fontFamily: '"Courier New", Courier, monospace',
    extraClass: 'font-mono font-bold tracking-widest uppercase',
  },
  {
    id: 'SCRIPT',
    name: 'Script',
    label: 'Handwritten',
    fontFamily: '"Brush Script MT", "Caveat", "Comic Sans MS", cursive',
    extraClass: 'font-bold italic tracking-wide',
  },
];

// Color options (like Instagram Story color palette)
export interface StoryColor {
  id: string;
  name: string;
  colorHex: string;
  textClass: string;
  bgClass: string;
}

const STORY_COLORS: StoryColor[] = [
  {
    id: 'WHITE',
    name: 'White',
    colorHex: '#FFFFFF',
    textClass: 'text-white',
    bgClass: 'bg-white',
  },
  {
    id: 'YELLOW',
    name: 'Amber',
    colorHex: '#FACC15',
    textClass: 'text-amber-300',
    bgClass: 'bg-amber-400',
  },
  {
    id: 'PINK',
    name: 'Neon Pink',
    colorHex: '#F43F5E',
    textClass: 'text-rose-400',
    bgClass: 'bg-rose-500',
  },
  {
    id: 'CYAN',
    name: 'Cyan',
    colorHex: '#38BDF8',
    textClass: 'text-sky-300',
    bgClass: 'bg-sky-400',
  },
  {
    id: 'LIME',
    name: 'Lime',
    colorHex: '#4ADE80',
    textClass: 'text-emerald-300',
    bgClass: 'bg-emerald-400',
  },
  {
    id: 'ORANGE',
    name: 'Orange',
    colorHex: '#FB923C',
    textClass: 'text-orange-400',
    bgClass: 'bg-orange-500',
  },
];

// Text display modes (like Instagram's "A" background button)
type TextMode = 'SHADOW' | 'PILL' | 'HIGHLIGHT' | 'GLOW';

const STICKER_OPTIONS = [
  '🤤', '🔥', '✨', '🍔', '🍕', '😋',
  '🧡', '🌮', '🍟', '🥤', '💯', '🎉',
];

const HEADLINE_PRESETS = [
  "Today's Craving 🤤",
  'Eat eat 💪',
  'Cheat Meal Mode 🔥',
  'Pure Food Bliss ✨',
  'Midnight Craving 🍕',
  'Best In Town 😋',
];

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

const WhatsAppIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

const SnapchatIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.002 0c-4.482 0-7.393 3.32-7.393 6.845 0 .97.31 2.378.85 3.364.21.386.29.61.17.83-.11.2-.41.31-.77.41-1.04.28-2.14.92-2.14 2.35 0 .95.63 1.71 1.49 2.06.45.18.7.27.7.46 0 .14-.15.35-.45.65-.63.63-1.67 1.68-1.67 3.34 0 1.93 1.55 3.1 4.54 3.44.38.04.7.27.88.58.62 1.08 1.96 1.67 3.79 1.67 1.83 0 3.17-.59 3.79-1.67.18-.31.5-.54.88-.58 2.99-.34 4.54-1.51 4.54-3.44 0-1.66-1.04-2.71-1.67-3.34-.3-.3-.45-.51-.45-.65 0-.19.25-.28.7-.46.86-.35 1.49-1.11 1.49-2.06 0-1.43-1.1-2.07-2.14-2.35-.36-.1-.66-.21-.77-.41-.12-.22-.04-.44.17-.83.54-.986.85-2.394.85-3.364C19.395 3.32 16.484 0 12.002 0z" />
  </svg>
);

export default function FoodStoryModal({
  isOpen,
  onClose,
  storyData,
  isLoading = false,
}: FoodStoryModalProps) {
  const storyRef = useRef<HTMLDivElement>(null);

  // Template state: Template 1 (Location & Food) vs Template 2 (Today's Craving)
  const [template, setTemplate] = useState<StoryTemplateType>('CRAVING');

  // Editable headline
  const [headline, setHeadline] = useState("Today's Craving 🤤");

  // Font typography & styling states
  const [selectedFont, setSelectedFont] = useState<StoryFont>(STORY_FONTS[0]);
  const [selectedColor, setSelectedColor] = useState<StoryColor>(STORY_COLORS[0]);
  const [textMode, setTextMode] = useState<TextMode>('PILL');

  // Emojis & item selection
  const [selectedStickers, setSelectedStickers] = useState<string[]>(['🔥', '✨']);
  const [selectedItemIndex, setSelectedItemIndex] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [currentTimeStr, setCurrentTimeStr] = useState('2:30 PM');

  // Export / Share state
  const [isExporting, setIsExporting] = useState(false);
  const [shareSuccessMessage, setShareSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setShareSuccessMessage(null);
      setIsExporting(false);
      setImageError(false);
      setHeadline("Today's Craving 🤤");
      try {
        const time = new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        });
        setCurrentTimeStr(time);
      } catch (e) {
        setCurrentTimeStr('Today');
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Data
  const customerName = storyData?.customer?.name || 'Foodie';
  const customerAvatar = storyData?.customer?.profileImage;
  const restaurantName = storyData?.restaurant?.name || 'Restaurant';
  const restaurantLocation = storyData?.restaurant?.location || '';

  const items =
    storyData?.order?.items && storyData.order.items.length > 0
      ? storyData.order.items
      : [{ name: 'Delicious Special', image: null, quantity: 1, unitPrice: 0 }];

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

  // Convert base64 DataURL to Blob
  const dataUrlToBlob = (dataUrl: string): Blob => {
    const parts = dataUrl.split(';base64,');
    const contentType = parts[0].split(':')[1] || 'image/png';
    const raw = window.atob(parts[1]);
    const rawLength = raw.length;
    const uInt8Array = new Uint8Array(rawLength);
    for (let i = 0; i < rawLength; ++i) {
      uInt8Array[i] = raw.charCodeAt(i);
    }
    return new Blob([uInt8Array], { type: contentType });
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
        skipFonts: true,
        fontEmbedCSS: '',
      });
      return dataUrl;
    } catch (err) {
      console.error('Error generating food story image:', err);
      try {
        if (storyRef.current) {
          return await toPng(storyRef.current, {
            pixelRatio: 2,
            skipFonts: true,
            fontEmbedCSS: '',
          });
        }
      } catch (retryErr) {
        console.error('Retry generation failed:', retryErr);
      }
      return null;
    } finally {
      setIsExporting(false);
    }
  };

  // Unified Social Sharing Handler
  const handleShareApp = async (app: 'WHATSAPP' | 'INSTAGRAM' | 'SNAPCHAT') => {
    const dataUrl = await generateStoryPng();
    if (!dataUrl) {
      alert('Failed to generate story image. Please try downloading instead.');
      return;
    }

    const sanitizedName = activeItem.name.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `FoodStory_${sanitizedName}.png`;

    try {
      const blob = dataUrlToBlob(dataUrl);
      const file = new File([blob], filename, { type: 'image/png' });
      const shareTitle = `${headline} - ${activeItem.name}`;
      const shareText = `${headline} at ${restaurantName}! 🍔✨`;

      // 1. Mobile Native Web Share API (Directly opens OS share sheet with WhatsApp Status, Instagram Stories, Snapchat)
      if (
        typeof navigator !== 'undefined' &&
        navigator.canShare &&
        navigator.canShare({ files: [file] })
      ) {
        await navigator.share({
          files: [file],
          title: shareTitle,
          text: shareText,
        });
        setShareSuccessMessage(
          app === 'WHATSAPP'
            ? 'Shared to WhatsApp!'
            : app === 'INSTAGRAM'
            ? 'Shared to Instagram Story!'
            : 'Shared to Snapchat!'
        );
        setTimeout(() => setShareSuccessMessage(null), 4000);
        return;
      }

      // 2. Desktop / Browser Fallback: download PNG, copy to clipboard, and open target app
      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      try {
        if (navigator.clipboard && window.ClipboardItem) {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob }),
          ]);
        }
      } catch (clipErr) {
        // Clipboard fallback
      }

      if (app === 'WHATSAPP') {
        const encoded = encodeURIComponent(`${shareText}\n\n${restaurantName}`);
        window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
        setShareSuccessMessage(
          'Image downloaded & copied! Paste directly into your WhatsApp Status.'
        );
      } else if (app === 'INSTAGRAM') {
        window.open('https://www.instagram.com', '_blank');
        setShareSuccessMessage(
          'Image downloaded & copied! Open Instagram to post to your Story.'
        );
      } else if (app === 'SNAPCHAT') {
        window.open('https://web.snapchat.com', '_blank');
        setShareSuccessMessage(
          'Image downloaded & copied! Paste or send on Snapchat.'
        );
      }
      setTimeout(() => setShareSuccessMessage(null), 5000);
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        handleDownload();
      }
    }
  };

  // Direct PNG Download
  const handleDownload = async () => {
    const dataUrl = await generateStoryPng();
    if (!dataUrl) {
      alert('Could not render story image. Please try again.');
      return;
    }

    const sanitizedName = activeItem.name.replace(/[^a-zA-Z0-9]/g, '_');
    const link = document.createElement('a');
    link.download = `FoodStory_${sanitizedName}.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setShareSuccessMessage('High-res image downloaded! Ready to share.');
    setTimeout(() => setShareSuccessMessage(null), 4000);
  };

  // Helper to render the styled headline based on textMode, font, and color
  const renderStyledHeadline = () => {
    const textStyle = {
      fontFamily: selectedFont.fontFamily,
    };

    if (textMode === 'PILL') {
      // Instagram style pill badge (Like Screenshot 1)
      return (
        <div className="inline-block max-w-full px-4 py-2 bg-black/75 backdrop-blur-md rounded-full border border-white/20 shadow-2xl">
          <span
            style={textStyle}
            className={`text-base sm:text-lg block truncate ${selectedFont.extraClass} ${selectedColor.textClass} drop-shadow-md`}
          >
            {headline}
          </span>
        </div>
      );
    }

    if (textMode === 'HIGHLIGHT') {
      // Solid highlight banner
      return (
        <div
          className={`inline-block max-w-full px-4 py-1.5 rounded-xl shadow-2xl ${
            selectedColor.id === 'WHITE'
              ? 'bg-white text-stone-950'
              : `${selectedColor.bgClass} text-stone-950`
          }`}
        >
          <span
            style={textStyle}
            className={`text-base sm:text-lg block truncate ${selectedFont.extraClass} font-black`}
          >
            {headline}
          </span>
        </div>
      );
    }

    if (textMode === 'GLOW') {
      // Neon glow text (Like Screenshot 2)
      return (
        <span
          style={{
            ...textStyle,
            textShadow: `0 0 16px ${selectedColor.colorHex}, 0 0 28px ${selectedColor.colorHex}`,
          }}
          className={`text-xl sm:text-2xl block leading-tight ${selectedFont.extraClass} ${selectedColor.textClass}`}
        >
          {headline}
        </span>
      );
    }

    // Default 'SHADOW': Clean bold text with deep shadow (Like Screenshot 4)
    return (
      <span
        style={textStyle}
        className={`text-xl sm:text-2xl block leading-tight ${selectedFont.extraClass} ${selectedColor.textClass} drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)]`}
      >
        {headline}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      {/* Dark overlay backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/85 backdrop-blur-md transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Main Container - Stacks vertically on mobile (Preview on top, Controls below) & side-by-side on desktop */}
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl z-10 overflow-hidden flex flex-col md:flex-row max-h-[96vh]">
        {/* Close Button Top Right */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-30 p-2 bg-black/60 hover:bg-black/90 text-white rounded-full backdrop-blur-md transition cursor-pointer border border-white/20 shadow-lg"
          title="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ================= LEFT / TOP: 9:16 Full Screen Story Canvas Preview ================= */}
        <div className="w-full md:flex-1 bg-slate-950 p-3 sm:p-5 flex flex-col items-center justify-center overflow-y-auto shrink-0 border-b md:border-b-0 md:border-r border-slate-800">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center space-y-3 py-20 text-white">
              <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
              <p className="text-sm font-semibold text-slate-300">
                Loading food photo...
              </p>
            </div>
          ) : (
            <div className="w-full flex flex-col items-center">
              {/* 9:16 Story Canvas - FULL SCREEN FOOD IMAGE EDGE-TO-EDGE */}
              <div
                ref={storyRef}
                className="relative aspect-[9/16] w-full max-w-[305px] sm:max-w-[335px] rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between select-none bg-stone-950 text-white shrink-0 border border-white/10 p-4 sm:p-5"
              >
                {/* 1. Full Bleed Food Background (Covers 100% of the canvas) */}
                <div className="absolute inset-0 z-0">
                  {activeItem?.image && !imageError ? (
                    <img
                      src={activeItem.image}
                      alt={activeItem.name}
                      crossOrigin="anonymous"
                      onError={() => setImageError(true)}
                      className="w-full h-full object-cover object-center filter brightness-95"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-amber-600 via-orange-600 to-rose-700 flex flex-col items-center justify-center p-6 text-center">
                      <UtensilsCrossed className="w-16 h-16 text-white/40 mb-2" />
                      <h4 className="font-black text-base text-white/90 drop-shadow-md">
                        {activeItem?.name}
                      </h4>
                    </div>
                  )}

                  {/* Gradient shading top & bottom for high contrast readability like Instagram */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-black/60 pointer-events-none" />
                </div>

                {/* Floating mood stickers (Top Right) */}
                {selectedStickers.length > 0 && (
                  <div className="absolute top-4 right-4 z-10 flex items-center gap-1 pointer-events-none">
                    {selectedStickers.map((s, idx) => (
                      <span
                        key={idx}
                        className="text-2xl sm:text-3xl drop-shadow-2xl filter transform hover:scale-125 transition"
                        style={{
                          transform: `rotate(${idx % 2 === 0 ? '-8deg' : '8deg'})`,
                        }}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                )}

                {/* ================= TEMPLATE 1: LOCATION & FOOD ================= */}
                {template === 'LOCATION' && (
                  <>
                    {/* Top: Instagram-Style Location Badge */}
                    <div className="relative z-10 space-y-1.5 pt-1 text-left">
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 shadow-lg max-w-[85%]">
                        <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-white shrink-0 shadow-xs">
                          <MapPin className="w-2.5 h-2.5 text-white" />
                        </div>
                        <div className="text-left leading-tight min-w-0">
                          <span className="font-black text-[11px] text-white tracking-tight truncate block">
                            {restaurantName}
                          </span>
                          {restaurantLocation && (
                            <span className="text-[9px] text-amber-200/80 font-medium truncate block">
                              {restaurantLocation}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Center: Editable Headline + Dish Pill */}
                    <div className="relative z-10 my-auto text-center px-2 space-y-2">
                      <div className="flex justify-center">
                        {renderStyledHeadline()}
                      </div>

                      {activeItem?.name && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full border border-white/15 shadow-md">
                          <span className="text-[11px] font-black text-amber-300 truncate max-w-[190px]">
                            {activeItem.name}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Bottom: Customer Profile & Brand Logo */}
                    <div className="relative z-10 pt-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 p-0.5 shadow-md shrink-0">
                          <div className="w-full h-full rounded-full bg-stone-900 flex items-center justify-center overflow-hidden">
                            {customerAvatar ? (
                              <img
                                src={customerAvatar}
                                alt={customerName}
                                crossOrigin="anonymous"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-[11px] font-black text-amber-300">
                                {customerName.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-left leading-tight min-w-0">
                          <div className="flex items-center gap-1">
                            <span className="text-xs font-black text-white truncate max-w-[120px]">
                              {customerName}
                            </span>
                            <span className="w-3.5 h-3.5 rounded-full bg-amber-400 text-stone-950 text-[9px] font-black inline-flex items-center justify-center shrink-0">
                              ✓
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Small Brand Logo */}
                      <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20 shadow-xs">
                        <img
                          src="/logo-icon.png"
                          alt="ScanPayEat"
                          className="w-4 h-4 rounded-full object-contain shrink-0"
                        />
                        <span className="text-[10px] font-black text-white tracking-tight">
                          ScanPayEat
                        </span>
                      </div>
                    </div>
                  </>
                )}

                {/* ================= TEMPLATE 2: TODAY'S CRAVING (FULL STORY VIBE) ================= */}
                {template === 'CRAVING' && (
                  <>
                    {/* Top: Timestamp / Mood Sticker */}
                    <div className="relative z-10 pt-1 text-left">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 shadow-md">
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        <span className="text-[10px] font-black text-white tracking-wide">
                          {currentTimeStr}
                        </span>
                      </div>
                    </div>

                    {/* Center / Lower Center: Full Editable Headline & Dish Tag */}
                    <div className="relative z-10 my-auto text-center px-2 space-y-2">
                      <div className="flex justify-center">
                        {renderStyledHeadline()}
                      </div>

                      {activeItem?.name && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full border border-white/15 shadow-md">
                          <span className="text-[11px] font-black text-amber-300 truncate max-w-[190px]">
                            {activeItem.name}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Bottom: Customer Profile & Small Brand Logo */}
                    <div className="relative z-10 pt-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-400 to-rose-500 p-0.5 shadow-md shrink-0">
                          <div className="w-full h-full rounded-full bg-stone-900 flex items-center justify-center overflow-hidden">
                            {customerAvatar ? (
                              <img
                                src={customerAvatar}
                                alt={customerName}
                                crossOrigin="anonymous"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-[11px] font-black text-amber-300">
                                {customerName.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-black text-white truncate max-w-[120px]">
                            {customerName}
                          </span>
                          <span className="w-3.5 h-3.5 rounded-full bg-amber-400 text-stone-950 text-[9px] font-black inline-flex items-center justify-center shrink-0">
                            ✓
                          </span>
                        </div>
                      </div>

                      {/* Small Brand Logo */}
                      <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20 shadow-xs">
                        <img
                          src="/logo-icon.png"
                          alt="ScanPayEat"
                          className="w-4 h-4 rounded-full object-contain shrink-0"
                        />
                        <span className="text-[10px] font-black text-white tracking-tight">
                          ScanPayEat
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ================= RIGHT / BOTTOM: Controls & Typography Customization ================= */}
        <div className="w-full md:w-96 bg-slate-900 p-4 sm:p-5 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-4">
            <div>
              <span className="inline-block text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                Story Editor
              </span>
              <h2 className="text-lg font-black text-white mt-1">
                Customize Your Story
              </h2>
              <p className="text-xs text-slate-400">
                Full-screen photo, custom fonts, colors &amp; instant social sharing.
              </p>
            </div>

            {/* Template Switcher: 2 Templates */}
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-wider text-slate-200 block">
                Template:
              </label>
              <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setTemplate('LOCATION')}
                  className={`py-2 px-2.5 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    template === 'LOCATION'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md'
                      : 'text-slate-400 hover:text-white bg-transparent'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Location &amp; Food</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTemplate('CRAVING')}
                  className={`py-2 px-2.5 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    template === 'CRAVING'
                      ? 'bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 text-white shadow-md'
                      : 'text-slate-400 hover:text-white bg-transparent'
                  }`}
                >
                  <span>🤤</span>
                  <span>Today&apos;s Craving</span>
                </button>
              </div>
            </div>

            {/* Editable Headline Input & Quick Presets */}
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                <Type className="w-3.5 h-3.5 text-amber-400" />
                <span>Edit Headline Text:</span>
              </label>

              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                maxLength={45}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:border-amber-400 focus:ring-1 focus:ring-amber-400 font-bold"
                placeholder="Type your craving text..."
              />

              <div className="flex flex-wrap gap-1 pt-0.5">
                {HEADLINE_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setHeadline(preset)}
                    className={`text-[10px] px-2 py-0.5 rounded-lg font-bold transition cursor-pointer ${
                      headline === preset
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700/60'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Font Style Picker (Modern, Retro, Serif, Typewriter, Script) */}
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-wider text-slate-200 block">
                Choose Font Style:
              </label>
              <div className="grid grid-cols-5 gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
                {STORY_FONTS.map((font) => (
                  <button
                    key={font.id}
                    type="button"
                    onClick={() => setSelectedFont(font)}
                    style={{ fontFamily: font.fontFamily }}
                    className={`py-1.5 px-1 rounded-xl text-xs font-bold transition text-center cursor-pointer truncate ${
                      selectedFont.id === font.id
                        ? 'bg-amber-500 text-white shadow-md ring-2 ring-amber-400/50'
                        : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {font.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Text Color & Style Mode Picker */}
            <div className="grid grid-cols-2 gap-2">
              {/* Color dots */}
              <div className="space-y-1">
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-300 flex items-center gap-1">
                  <Palette className="w-3 h-3 text-amber-400" />
                  <span>Color:</span>
                </label>
                <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
                  {STORY_COLORS.map((col) => (
                    <button
                      key={col.id}
                      type="button"
                      onClick={() => setSelectedColor(col)}
                      className={`w-6 h-6 rounded-full transition cursor-pointer flex items-center justify-center shrink-0 ${
                        col.bgClass
                      } ${
                        selectedColor.id === col.id
                          ? 'ring-2 ring-white scale-110 shadow-md'
                          : 'opacity-70 hover:opacity-100'
                      }`}
                      title={col.name}
                    >
                      {selectedColor.id === col.id && (
                        <Check className="w-3.5 h-3.5 text-stone-950 stroke-[3]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Text Mode Selector (Shadow, Pill, Highlight, Glow) */}
              <div className="space-y-1">
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-300 block">
                  Text Style:
                </label>
                <div className="grid grid-cols-4 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[10px] font-black">
                  <button
                    type="button"
                    onClick={() => setTextMode('SHADOW')}
                    className={`py-1.5 rounded-lg transition cursor-pointer text-center ${
                      textMode === 'SHADOW'
                        ? 'bg-amber-500 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title="Shadow Text"
                  >
                    Aa
                  </button>
                  <button
                    type="button"
                    onClick={() => setTextMode('PILL')}
                    className={`py-1.5 rounded-lg transition cursor-pointer text-center ${
                      textMode === 'PILL'
                        ? 'bg-amber-500 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title="Frosted Pill Bar"
                  >
                    (Aa)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTextMode('HIGHLIGHT')}
                    className={`py-1.5 rounded-lg transition cursor-pointer text-center ${
                      textMode === 'HIGHLIGHT'
                        ? 'bg-amber-500 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title="Highlight Box"
                  >
                    [Aa]
                  </button>
                  <button
                    type="button"
                    onClick={() => setTextMode('GLOW')}
                    className={`py-1.5 rounded-lg transition cursor-pointer text-center ${
                      textMode === 'GLOW'
                        ? 'bg-amber-500 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title="Neon Glow"
                  >
                    ✨
                  </button>
                </div>
              </div>
            </div>

            {/* Multiple Items Selector (if order has >1 dish) */}
            {items.length > 1 && (
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-slate-200 block">
                  Select Featured Dish:
                </label>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {items.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedItemIndex(idx)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer ${
                        selectedItemIndex === idx
                          ? 'bg-amber-500 text-white shadow-xs ring-2 ring-amber-400/40'
                          : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                      }`}
                    >
                      {item.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sticker / Emoji Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                <Smile className="w-3.5 h-3.5 text-amber-400" />
                <span>Tap Emojis to Add/Remove:</span>
              </label>
              <div className="grid grid-cols-6 gap-1 bg-slate-950 p-2 rounded-xl border border-slate-800">
                {STICKER_OPTIONS.map((stk, idx) => {
                  const isSelected = selectedStickers.includes(stk);
                  return (
                    <button
                      key={idx}
                      onClick={() => toggleSticker(stk)}
                      className={`h-8 rounded-lg text-lg flex items-center justify-center transition cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500/30 border-2 border-amber-400 scale-105 shadow-md'
                          : 'hover:bg-slate-800 text-slate-300'
                      }`}
                    >
                      {stk}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Notification Banner */}
            {shareSuccessMessage && (
              <div className="p-2.5 bg-emerald-950/80 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 font-bold flex items-center gap-2 animate-in fade-in">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{shareSuccessMessage}</span>
              </div>
            )}
          </div>

          {/* ================= Social Share Flow Buttons (WhatsApp, Insta, Snapchat, Download) ================= */}
          <div className="space-y-2 pt-3 border-t border-slate-800 mt-4">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block text-center">
              Share to your favorite platform:
            </span>

            {/* Row of 3 App Share Buttons */}
            <div className="grid grid-cols-3 gap-2">
              {/* 1. WhatsApp Status */}
              <button
                type="button"
                onClick={() => handleShareApp('WHATSAPP')}
                disabled={isExporting || isLoading}
                className="py-2.5 px-2 bg-[#25D366] hover:bg-[#20ba59] text-white font-extrabold rounded-2xl shadow-lg shadow-emerald-950/20 transition flex flex-col items-center justify-center gap-1 cursor-pointer disabled:opacity-50 group"
                title="Share to WhatsApp Status"
              >
                <WhatsAppIcon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                <span className="text-[10px] sm:text-[11px] font-black leading-tight">
                  WhatsApp Status
                </span>
              </button>

              {/* 2. Instagram Story */}
              <button
                type="button"
                onClick={() => handleShareApp('INSTAGRAM')}
                disabled={isExporting || isLoading}
                className="py-2.5 px-2 bg-gradient-to-tr from-purple-600 via-pink-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 text-white font-extrabold rounded-2xl shadow-lg shadow-pink-950/20 transition flex flex-col items-center justify-center gap-1 cursor-pointer disabled:opacity-50 group"
                title="Add to Instagram Story"
              >
                <InstagramIcon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                <span className="text-[10px] sm:text-[11px] font-black leading-tight">
                  Insta Story
                </span>
              </button>

              {/* 3. Snapchat */}
              <button
                type="button"
                onClick={() => handleShareApp('SNAPCHAT')}
                disabled={isExporting || isLoading}
                className="py-2.5 px-2 bg-[#FFFC00] hover:bg-[#ffe600] text-black font-extrabold rounded-2xl shadow-lg shadow-amber-950/20 transition flex flex-col items-center justify-center gap-1 cursor-pointer disabled:opacity-50 group"
                title="Share to Snapchat"
              >
                <SnapchatIcon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110 fill-black text-black" />
                <span className="text-[10px] sm:text-[11px] font-black leading-tight">
                  Snapchat
                </span>
              </button>
            </div>

            {/* Direct High-Res Download Button */}
            <button
              type="button"
              onClick={handleDownload}
              disabled={isExporting || isLoading}
              className="w-full py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 border border-slate-700"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                  <span>Generating High-Res Image...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-slate-400" />
                  <span>Download High-Res Story (1080×1920)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
