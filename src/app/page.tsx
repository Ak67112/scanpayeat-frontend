'use client';

import React from 'react';
import {
  QrCode,
  ChefHat,
  ShieldCheck,
  ShoppingBag,
  ArrowRight,
  Zap,
  Clock,
  Sparkles,
  Store,
  DollarSign,
  Star,
  CheckCircle2,
  TrendingUp,
  Heart,
  Flame,
  Award,
  Utensils,
  ChevronRight,
  Shield,
  Smile,
} from 'lucide-react';
import CartDrawer from '../components/shop/CartDrawer';
import { useCart } from '../context/CartContext';

export default function HomePage() {
  const { addToCart } = useCart();

  // Signature mock items for instant interactive tasting on home page
  const featuredMenu = [
    {
      id: 991,
      name: 'Roasted Herb Platter',
      category: 'Signature Mains',
      price: 180,
      description: 'Slow-roasted chicken breast glazed with rosemary, garlic butter, and char-grilled lemon.',
      image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=600&auto=format&fit=crop&q=80',
      rating: 4.9,
      prepTime: '8 min',
      tag: 'Chef Special',
    },
    {
      id: 992,
      name: 'Spicy Dip Chicken Bites',
      category: 'Hot Deals',
      price: 150,
      description: 'Crispy grilled tender cuts served with homemade roasted paprika sauce and dipping dips.',
      image: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=600&auto=format&fit=crop&q=80',
      rating: 4.8,
      prepTime: '6 min',
      tag: 'Best Seller',
    },
    {
      id: 993,
      name: 'Artisan Gourmet Cheeseburger',
      category: 'Burgers',
      price: 130,
      description: 'Double melted cheddar, caramelized red onion, brioche bun, and signature smoked glaze.',
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
      rating: 4.9,
      prepTime: '7 min',
      tag: 'Popular',
    },
    {
      id: 994,
      name: 'Mediterranean Salad Bowl',
      category: 'Healthy & Fresh',
      price: 110,
      description: 'Cherry tomatoes, sliced cucumber, kalamata olives, feta crumbles, and lemon oregano vinaigrette.',
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=80',
      rating: 4.7,
      prepTime: '5 min',
      tag: 'Farm Fresh',
    },
  ];

  return (
    <div className="bg-[#FAF7F2] min-h-screen text-[#18181B] selection:bg-red-700 selection:text-white">
      <CartDrawer />

      {/* ================= HERO SECTION (MATCHING EATOPIA VIBE) ================= */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-16 md:pb-28 border-b border-[#E8DFC8]">
        {/* Giant background typography watermark */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 text-[15vw] font-black uppercase text-red-950/4 select-none pointer-events-none tracking-widest font-display whitespace-nowrap z-0">
          EATOPIA
        </div>

        {/* Ambient background blur spots */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -right-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
              {/* Kicker badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-100/90 border border-red-300 text-red-800 text-xs font-black uppercase tracking-wider shadow-xs">
                <Flame className="w-3.5 h-3.5 text-red-700" />
                <span>A Bite of Happiness</span>
              </div>

              {/* Huge Trending Display Title */}
              <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-slate-950 tracking-tight font-display leading-[1.03]">
                DELICIOUS DEALS <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-700 via-rose-600 to-amber-600">
                  IN ONE CLICK
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-stone-600 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
                Skip long queues with contactless table QR scanning. Browse live kitchen availability,
                pay with instant Razorpay checkout, and track your food token from pan to table.
              </p>

              {/* CTA Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4">
                <a
                  href="/shop/abc"
                  className="px-8 py-4 bg-red-700 hover:bg-red-800 text-white font-extrabold text-sm uppercase tracking-wider rounded-2xl shadow-xl shadow-red-700/25 transition-all transform hover:-translate-y-0.5 flex items-center gap-2 group cursor-pointer"
                >
                  <span>TASTE IT TODAY</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>

                <a
                  href="/login?role=shopkeeper"
                  className="px-7 py-4 bg-white hover:bg-stone-50 text-stone-800 font-bold text-sm rounded-2xl border border-[#E0D5C1] shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>Kitchen Staff Portal</span>
                  <ChevronRight className="w-4 h-4 text-stone-400" />
                </a>
              </div>

              {/* Highlights Micro-stats */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-[#E8DFC8]/80 max-w-lg mx-auto lg:mx-0">
                <div className="text-center lg:text-left">
                  <p className="text-2xl font-black text-slate-900 font-display">40+</p>
                  <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider mt-0.5">Daily Dishes</p>
                </div>
                <div className="text-center lg:text-left">
                  <p className="text-2xl font-black text-slate-900 font-display">&lt; 8 min</p>
                  <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider mt-0.5">Kitchen Prep</p>
                </div>
                <div className="text-center lg:text-left">
                  <p className="text-2xl font-black text-red-700 font-display">100%</p>
                  <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider mt-0.5">Contactless</p>
                </div>
              </div>
            </div>

            {/* Right Hero Visual Showcase (Matching roasted chicken platter with price badge) */}
            <div className="lg:col-span-6 relative flex items-center justify-center">
              <div className="relative w-full max-w-lg">
                {/* Decorative background plate glow */}
                <div className="absolute inset-0 bg-radial from-amber-400/20 via-red-500/10 to-transparent rounded-full blur-2xl transform scale-90" />

                {/* Main Culinary Feast Image */}
                <div className="relative rounded-3xl overflow-hidden border-4 border-white shadow-2xl shadow-stone-900/15 group">
                  <img
                    src="https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=900&auto=format&fit=crop&q=85"
                    alt="Delicious Roasted Feast Platter"
                    className="w-full h-80 sm:h-96 object-cover transform group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                </div>

                {/* Overlapping Price Circular Badge (Like reference $10.03 tag) */}
                <div className="absolute -top-4 -left-4 sm:top-2 sm:left-2 w-20 h-20 sm:w-24 sm:h-24 bg-red-700 text-white rounded-full flex flex-col items-center justify-center shadow-xl shadow-red-700/40 border-2 border-white transform -rotate-12 hover:rotate-0 transition-transform">
                  <span className="text-[9px] uppercase font-black tracking-widest text-red-200">PRICE</span>
                  <span className="text-lg sm:text-xl font-black font-display leading-none">₹180</span>
                </div>

                {/* Floating "Hot & Crispy" pill */}
                <div className="absolute -bottom-4 right-4 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-lg border border-[#E8DFC8] flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                    ★
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-900 leading-tight">Handcrafted Gourmet</p>
                    <p className="text-[10px] text-stone-500">Live order ready in 8m</p>
                  </div>
                </div>

                {/* Floating Garnish Basil/Herb badge */}
                <div className="absolute top-1/2 -right-4 bg-amber-500/90 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-md transform rotate-6">
                  Chef Choice
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= CONTINUOUS CULINARY MARQUEE TICKER ================= */}
      <div className="bg-red-700 text-white text-xs font-black uppercase tracking-widest py-3 overflow-hidden shadow-inner border-y border-red-800">
        <div className="animate-marquee whitespace-nowrap flex items-center gap-8">
          <span>🔥 FRESHLY PREPARED MEALS</span>
          <span>•</span>
          <span>TABLE QR CODE ORDERING</span>
          <span>•</span>
          <span>INSTANT RAZORPAY SETTLEMENT</span>
          <span>•</span>
          <span>REAL-TIME KITCHEN TOKENS</span>
          <span>•</span>
          <span>ZERO LINE WAITING</span>
          <span>•</span>
          <span>MULTI-TENANT RESTAURANTS</span>
          <span>•</span>
          <span>🔥 FRESHLY PREPARED MEALS</span>
          <span>•</span>
          <span>TABLE QR CODE ORDERING</span>
          <span>•</span>
          <span>INSTANT RAZORPAY SETTLEMENT</span>
          <span>•</span>
          <span>REAL-TIME KITCHEN TOKENS</span>
          <span>•</span>
          <span>ZERO LINE WAITING</span>
          <span>•</span>
          <span>MULTI-TENANT RESTAURANTS</span>
        </div>
      </div>

      {/* ================= DUAL PROMO BANNER SECTION (MATCHING REFERENCE CARDS) ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card 1: Hot Deals for Hungry Moments */}
          <div className="bg-[#F5EFEB] rounded-3xl p-8 border border-[#E2D7C3] shadow-xs hover:shadow-lg transition-all flex flex-col justify-between relative overflow-hidden group">
            <div className="space-y-4 relative z-10">
              <span className="text-[11px] font-black uppercase tracking-widest text-red-800 bg-red-100 px-3 py-1 rounded-full border border-red-200">
                Savor Every Bite
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-950 font-display leading-tight">
                HOT DEALS FOR <br />HUNGRY MOMENTS
              </h2>
              <p className="text-xs text-stone-600 leading-relaxed max-w-sm">
                Crispy hand-breaded delicacies cooked fresh to order. Pair with refreshing cold shakes and signature dips.
              </p>

              <div className="flex items-center gap-6 pt-2">
                <div>
                  <p className="text-2xl font-black text-slate-900 font-display">40+</p>
                  <p className="text-[10px] font-bold text-stone-500 uppercase">Daily Dishes</p>
                </div>
                <div className="w-px h-8 bg-stone-300" />
                <div>
                  <p className="text-2xl font-black text-red-700 font-display">52</p>
                  <p className="text-[10px] font-bold text-stone-500 uppercase">Items Available</p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 flex items-center justify-between relative z-10 border-t border-[#E2D7C3]">
              <a
                href="/shop/abc"
                className="px-5 py-2.5 bg-red-700 hover:bg-red-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center gap-1.5"
              >
                <span>Order Combo</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>

              <div className="flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=160&auto=format&fit=crop&q=80"
                  alt="Platter mini"
                  className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md group-hover:scale-110 transition-transform"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Grilled to Perfection with Spicy Dipping Sauce */}
          <div className="bg-[#FAF3EA] rounded-3xl p-8 border border-[#E2D7C3] shadow-xs hover:shadow-lg transition-all flex flex-col justify-between relative overflow-hidden group">
            <div className="space-y-4 relative z-10">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-widest text-amber-900 bg-amber-100 px-3 py-1 rounded-full border border-amber-200">
                  Chef Highlight
                </span>
                <span className="px-2.5 py-1 rounded-full bg-red-700 text-white font-black text-xs font-display">
                  UP TO 40% OFF
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-slate-950 font-display leading-tight">
                GRILLED TO PERFECTION <br />WITH SPICY DIPS
              </h2>
              <p className="text-xs text-stone-600 leading-relaxed max-w-sm">
                Marinated in aromatic herbs, flame-charred to seal in tenderness, and served with tangy piri-piri sauce.
              </p>

              <div className="flex items-center gap-3 text-xs text-stone-700 font-semibold pt-1">
                <span className="flex items-center gap-1 text-emerald-700">
                  <CheckCircle2 className="w-4 h-4" /> 100% Halal & Fresh
                </span>
                <span>•</span>
                <span className="text-stone-500">Served with Mint Dip</span>
              </div>
            </div>

            <div className="mt-8 pt-4 flex items-center justify-between relative z-10 border-t border-[#E2D7C3]">
              <a
                href="/shop/abc"
                className="px-5 py-2.5 bg-stone-900 hover:bg-black text-white font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center gap-1.5"
              >
                <span>Browse Menu</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>

              <div className="flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=160&auto=format&fit=crop&q=80"
                  alt="Grilled mini"
                  className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md group-hover:scale-110 transition-transform"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= SIGNATURE SPECIAL MENU SHOWCASE ================= */}
      <section className="bg-white py-16 sm:py-24 border-y border-[#E8DFC8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-red-700">
              Our Special Menu
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-950 font-display">
              FOOD & DRINKS YOU LOVE, DELIVERED FAST.
            </h2>
            <p className="text-sm text-stone-600">
              Hand-crafted daily with wholesome ingredients. Try these favorites right now at ABC Restaurant.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredMenu.map((item) => (
              <div
                key={item.id}
                className="bg-[#FAF7F2] rounded-3xl p-5 border border-[#E8DFC8] shadow-xs hover:shadow-xl transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Circular Plate Presentation */}
                  <div className="relative mb-5 flex justify-center">
                    <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-white shadow-lg group-hover:rotate-3 transition-transform duration-300">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {/* Floating circular price tag */}
                    <div className="absolute top-0 right-4 bg-red-700 text-white rounded-full w-12 h-12 flex flex-col items-center justify-center font-display font-black text-xs shadow-md border-2 border-white">
                      <span>₹{item.price}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-stone-500 font-bold uppercase tracking-wider text-[10px]">
                      {item.category}
                    </span>
                    <span className="flex items-center gap-1 text-amber-600 font-bold text-[11px]">
                      <Star className="w-3.5 h-3.5 fill-current" /> {item.rating}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-slate-900 text-base font-display group-hover:text-red-700 transition">
                    {item.name}
                  </h3>
                  <p className="text-xs text-stone-600 mt-1.5 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#E8DFC8] flex items-center justify-between">
                  <span className="text-[10px] font-bold text-stone-500 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-red-600" /> {item.prepTime}
                  </span>

                  <a
                    href="/shop/abc"
                    className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-xs hover:shadow cursor-pointer"
                  >
                    ORDER NOW
                  </a>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <a
              href="/shop/abc"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-stone-900 hover:bg-black text-white font-extrabold text-xs uppercase tracking-wider transition shadow-md"
            >
              <span>Explore Full ABC Restaurant Menu (7 Dishes)</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* ================= QUALITY & CLEANLINESS 3-PILLAR SECTION ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="bg-[#F5EFEB] rounded-3xl p-8 sm:p-12 border border-[#E2D7C3] grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 relative flex justify-center">
            <div className="w-64 h-64 sm:w-72 sm:h-72 rounded-full overflow-hidden border-4 border-white shadow-xl">
              <img
                src="https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80"
                alt="Care and Cleanliness"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-2 bg-red-700 text-white px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider shadow-md">
              100% Hygenic Kitchen
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-red-800">
                About Our Standards
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-950 font-display mt-1">
                PACKED WITH CARE & CLEANLINESS
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 mt-2 leading-relaxed">
                From contactless ordering to real-time order tokens, every process is designed for zero cross-contact,
                flawless turnaround, and delicious dining satisfaction.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="bg-white/80 p-4 rounded-2xl border border-[#E2D7C3] text-center">
                <div className="w-10 h-10 rounded-xl bg-red-100 text-red-800 mx-auto flex items-center justify-center mb-2 font-bold">
                  ⚡
                </div>
                <h4 className="font-extrabold text-xs text-slate-900 font-display">FAST DISPATCH</h4>
                <p className="text-[10px] text-stone-500 mt-1">Chimed directly to chef screens</p>
              </div>

              <div className="bg-white/80 p-4 rounded-2xl border border-[#E2D7C3] text-center">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 mx-auto flex items-center justify-center mb-2 font-bold">
                  🛡️
                </div>
                <h4 className="font-extrabold text-xs text-slate-900 font-display">SAFE PACKING</h4>
                <p className="text-[10px] text-stone-500 mt-1">Sealed fresh with hygienic care</p>
              </div>

              <div className="bg-white/80 p-4 rounded-2xl border border-[#E2D7C3] text-center">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 mx-auto flex items-center justify-center mb-2 font-bold">
                  💳
                </div>
                <h4 className="font-extrabold text-xs text-slate-900 font-display">SECURE PAYMENTS</h4>
                <p className="text-[10px] text-stone-500 mt-1">Instant verified Razorpay receipts</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= DARK GOURMET TESTIMONIAL BANNER ================= */}
      <section className="bg-[#141A16] text-stone-200 py-16 sm:py-20 border-t border-[#232F28] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 space-y-4 text-center lg:text-left">
              <span className="text-[11px] font-black uppercase tracking-widest text-amber-400">
                Delivered Anytime
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white font-display leading-tight">
                TASTY BITES & DAILY BUYS, <br />DELIVERED ANYTIME.
              </h2>
              <p className="text-xs sm:text-sm text-stone-400 leading-relaxed max-w-lg">
                Multi-tenant restaurant engine that scales from single cafes to food-court chains.
                Real-time synchronized orders, sound alerts for kitchen staff, and instant token tracking for diners.
              </p>
            </div>

            <div className="lg:col-span-6 flex justify-center">
              <div className="bg-[#212B23] p-7 rounded-3xl border border-[#2E3C31] shadow-2xl max-w-md w-full relative">
                <div className="text-red-500 text-4xl font-serif leading-none mb-2">“</div>
                <p className="text-xs text-stone-200 leading-relaxed font-medium">
                  Scan-Pay-Eat eliminated the long queue headaches during our peak lunch rush.
                  Customers scan our table QR code, pay instantly, and our kitchen chime alerts chefs right away.
                  Sales jumped 35% in our first two weeks!
                </p>

                <div className="mt-5 pt-4 border-t border-[#2E3C31] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-700 text-white flex items-center justify-center font-bold text-xs font-display">
                      JA
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">John ABC</p>
                      <p className="text-[10px] text-stone-400">Owner, ABC Restaurant</p>
                    </div>
                  </div>

                  <div className="flex text-amber-400 text-xs">
                    ★★★★★
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 3 ROLE ENTRY TILES ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-10 space-y-1">
          <span className="text-xs font-black uppercase tracking-widest text-stone-500">
            Platform Portals
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-950 font-display">
            CHOOSE YOUR EXPERIENCE
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Customer */}
          <a
            href="/shop/abc"
            className="bg-white rounded-3xl p-6 border border-[#E8DFC8] shadow-xs hover:shadow-xl transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-red-800 bg-red-50 px-2 py-0.5 rounded-md border border-red-200">
                PORTAL 1: CUSTOMER
              </span>
              <h3 className="text-lg font-black text-slate-900 font-display mt-2 mb-1">
                Instant Table QR Ordering
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Scan table QR, select delicious dishes, apply discount coupons, pay securely via UPI/Card, and track live food tokens.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-[#E8DFC8] flex items-center justify-between text-xs font-bold text-red-700">
              <span>Open Customer Menu</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </a>

          {/* Shopkeeper */}
          <a
            href="/shopkeeper"
            className="bg-white rounded-3xl p-6 border border-[#E8DFC8] shadow-xs hover:shadow-xl transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <ChefHat className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                PORTAL 2: SHOPKEEPER
              </span>
              <h3 className="text-lg font-black text-slate-900 font-display mt-2 mb-1">
                Kitchen Display System (KDS)
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Manage dishes, categories, stock availability, order workflow status, and hear harmonic kitchen chimes.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-[#E8DFC8] flex items-center justify-between text-xs font-bold text-amber-700">
              <span>Open Kitchen Display</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </a>

          {/* Admin */}
          <a
            href="/admin/login"
            className="bg-white rounded-3xl p-6 border border-[#E8DFC8] shadow-xs hover:shadow-xl transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-purple-800 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                PORTAL 3: SUPER ADMIN
              </span>
              <h3 className="text-lg font-black text-slate-900 font-display mt-2 mb-1">
                Platform Multi-Tenant Admin
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Provision new outlets, generate dynamic QR codes, track per-shop sales metrics, and view real-time platform revenue.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-[#E8DFC8] flex items-center justify-between text-xs font-bold text-purple-700">
              <span>Access Super Admin</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </a>
        </div>
      </section>
    </div>
  );
}
