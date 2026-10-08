'use client';

import React from 'react';
import {
  QrCode,
  ShieldCheck,
  ShoppingBag,
  ArrowRight,
  Zap,
  Clock,
  Sparkles,
  DollarSign,
  Star,
  CheckCircle2,
  Heart,
  Flame,
  Award,
  ChevronRight,
  Shield,
  Smartphone,
  Gift,
  CreditCard,
  BellRing,
  UtensilsCrossed,
} from 'lucide-react';
import CartDrawer from '../components/shop/CartDrawer';

export default function HomePage() {
  // Signature dishes preview for diners
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
    <div className="bg-[#FAF7F2] min-h-screen text-[#18181B] selection:bg-emerald-600 selection:text-white">
      <CartDrawer />

      {/* ================= HERO SECTION ================= */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-16 md:pb-28 border-b border-[#E8DFC8]">
        {/* Ambient background watermark */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 text-[13vw] font-black uppercase text-emerald-950/4 select-none pointer-events-none tracking-widest font-display whitespace-nowrap z-0">
          SCAN PAY EAT
        </div>

        {/* Ambient background blur spots */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -right-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
              {/* Kicker badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/90 border border-emerald-300 text-emerald-900 text-xs font-black uppercase tracking-wider shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                <span>Contactless Table Dining</span>
              </div>

              {/* Display Title */}
              <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-slate-950 tracking-tight font-display leading-[1.03]">
                DELICIOUS BITES, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-amber-600">
                  SCAN, PAY & ENJOY
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-stone-600 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
                Skip long queues and waiting for waiters. Scan the QR code at your table, customize your dishes with photos, pay with instant UPI or card checkout, and track your kitchen order token in real time.
              </p>

              {/* Customer CTA Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4">
                <a
                  href="#featured-dishes"
                  className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm uppercase tracking-wider rounded-2xl shadow-xl shadow-emerald-600/25 transition-all transform hover:-translate-y-0.5 flex items-center gap-2 group cursor-pointer"
                >
                  <span>EXPLORE DISHES</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>

                <a
                  href="#how-it-works"
                  className="px-7 py-4 bg-white hover:bg-stone-50 text-stone-800 font-bold text-sm rounded-2xl border border-[#E0D5C1] shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                >
                  <QrCode className="w-4 h-4 text-emerald-600" />
                  <span>How QR Dining Works</span>
                </a>
              </div>

              {/* Highlights Micro-stats */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-[#E8DFC8]/80 max-w-lg mx-auto lg:mx-0">
                <div className="text-center lg:text-left">
                  <p className="text-2xl font-black text-slate-900 font-display">100%</p>
                  <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider mt-0.5">Contactless</p>
                </div>
                <div className="text-center lg:text-left">
                  <p className="text-2xl font-black text-slate-900 font-display">&lt; 8 min</p>
                  <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider mt-0.5">Avg. Prep Time</p>
                </div>
                <div className="text-center lg:text-left">
                  <p className="text-2xl font-black text-emerald-600 font-display">Instant</p>
                  <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider mt-0.5">UPI Checkout</p>
                </div>
              </div>
            </div>

            {/* Right Hero Visual Showcase */}
            <div className="lg:col-span-6 relative flex items-center justify-center">
              <div className="relative w-full max-w-lg">
                {/* Decorative background plate glow */}
                <div className="absolute inset-0 bg-radial from-amber-400/20 via-emerald-500/10 to-transparent rounded-full blur-2xl transform scale-90" />

                {/* Main Culinary Feast Image */}
                <div className="relative rounded-3xl overflow-hidden border-4 border-white shadow-2xl shadow-stone-900/15 group">
                  <img
                    src="https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=900&auto=format&fit=crop&q=85"
                    alt="Delicious Roasted Feast Platter"
                    className="w-full h-80 sm:h-96 object-cover transform group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                </div>

                {/* Overlapping Price Circular Badge */}
                <div className="absolute -top-4 -left-4 sm:top-2 sm:left-2 w-20 h-20 sm:w-24 sm:h-24 bg-emerald-600 text-white rounded-full flex flex-col items-center justify-center shadow-xl shadow-emerald-600/40 border-2 border-white transform -rotate-12 hover:rotate-0 transition-transform">
                  <span className="text-[9px] uppercase font-black tracking-widest text-emerald-200">SPECIAL</span>
                  <span className="text-lg sm:text-xl font-black font-display leading-none">₹180</span>
                </div>

                {/* Floating "Hot & Crispy" pill */}
                <div className="absolute -bottom-4 right-4 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-lg border border-[#E8DFC8] flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                    ★
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-900 leading-tight">Freshly Prepared</p>
                    <p className="text-[10px] text-stone-500">Live order ready in ~8m</p>
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

      {/* ================= CONTINUOUS TICKER MARQUEE ================= */}
      <div className="bg-emerald-700 text-white text-xs font-black uppercase tracking-widest py-3 overflow-hidden shadow-inner border-y border-emerald-800">
        <div className="animate-marquee whitespace-nowrap flex items-center gap-8">
          <span>⚡ INSTANT CONTACTLESS QR DINING</span>
          <span>•</span>
          <span>TABLE QR CODE ORDERING</span>
          <span>•</span>
          <span>INSTANT UPI & RAZORPAY SETTLEMENT</span>
          <span>•</span>
          <span>REAL-TIME KITCHEN TOKENS</span>
          <span>•</span>
          <span>ZERO LINE WAITING</span>
          <span>•</span>
          <span>DISCOUNT COUPONS & MILESTONE OFFERS</span>
          <span>•</span>
          <span>⚡ INSTANT CONTACTLESS QR DINING</span>
          <span>•</span>
          <span>TABLE QR CODE ORDERING</span>
          <span>•</span>
          <span>INSTANT UPI & RAZORPAY SETTLEMENT</span>
          <span>•</span>
          <span>REAL-TIME KITCHEN TOKENS</span>
          <span>•</span>
          <span>ZERO LINE WAITING</span>
          <span>•</span>
          <span>DISCOUNT COUPONS & MILESTONE OFFERS</span>
        </div>
      </div>

      {/* ================= HOW IT WORKS (3-STEP CUSTOMER GUIDE) ================= */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
          <span className="text-xs font-black uppercase tracking-widest text-emerald-700">
            Effortless Dining Experience
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-950 font-display">
            HOW SCAN-PAY-EAT WORKS
          </h2>
          <p className="text-sm text-stone-600">
            Enjoy your meal in 3 simple steps without waving down waiters or standing in billing queues.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="bg-white rounded-3xl p-8 border border-[#E8DFC8] shadow-xs hover:shadow-xl transition-all relative overflow-hidden group">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Smartphone className="w-7 h-7" />
            </div>
            <span className="text-[11px] font-black uppercase tracking-widest text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
              STEP 1
            </span>
            <h3 className="text-xl font-black text-slate-900 font-display mt-3 mb-2">
              Scan Table QR Code
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Find the QR standee on your dining table. Open your phone camera to scan—the digital kitchen menu launches immediately with zero app downloads.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-3xl p-8 border border-[#E8DFC8] shadow-xs hover:shadow-xl transition-all relative overflow-hidden group">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <ShoppingBag className="w-7 h-7" />
            </div>
            <span className="text-[11px] font-black uppercase tracking-widest text-amber-800 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
              STEP 2
            </span>
            <h3 className="text-xl font-black text-slate-900 font-display mt-3 mb-2">
              Choose Dishes & Offers
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Explore authentic dish photos, prices, and chef specials. Add items to your cart, apply promo coupons, and claim surprise milestone customer discounts!
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-3xl p-8 border border-[#E8DFC8] shadow-xs hover:shadow-xl transition-all relative overflow-hidden group">
            <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <CreditCard className="w-7 h-7" />
            </div>
            <span className="text-[11px] font-black uppercase tracking-widest text-blue-800 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
              STEP 3
            </span>
            <h3 className="text-xl font-black text-slate-900 font-display mt-3 mb-2">
              Instant Pay & Track
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Pay securely via UPI (GPay, PhonePe, Paytm) or Cards. Receive an instant order token and watch live kitchen status update as your meal is cooked fresh!
            </p>
          </div>
        </div>
      </section>

      {/* ================= DUAL PROMO HIGHLIGHTS ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card 1 */}
          <div className="bg-[#F5EFEB] rounded-3xl p-8 border border-[#E2D7C3] shadow-xs hover:shadow-lg transition-all flex flex-col justify-between relative overflow-hidden group">
            <div className="space-y-4 relative z-10">
              <span className="text-[11px] font-black uppercase tracking-widest text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200">
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
                  <p className="text-2xl font-black text-emerald-700 font-display">Instant</p>
                  <p className="text-[10px] font-bold text-stone-500 uppercase">Prep Kitchen</p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 flex items-center justify-between relative z-10 border-t border-[#E2D7C3]">
              <a
                href="#featured-dishes"
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center gap-1.5"
              >
                <span>View Dishes</span>
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

          {/* Card 2 */}
          <div className="bg-[#FAF3EA] rounded-3xl p-8 border border-[#E2D7C3] shadow-xs hover:shadow-lg transition-all flex flex-col justify-between relative overflow-hidden group">
            <div className="space-y-4 relative z-10">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-widest text-amber-900 bg-amber-100 px-3 py-1 rounded-full border border-amber-200">
                  Chef Highlight
                </span>
                <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white font-black text-xs font-display">
                  SPECIAL OFFERS
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-slate-950 font-display leading-tight">
                FLAME-CHARRED <br />GOURMET FLAVORS
              </h2>
              <p className="text-xs text-stone-600 leading-relaxed max-w-sm">
                Marinated in aromatic herbs, flame-charred to seal in tenderness, and served with tangy signature house dips.
              </p>

              <div className="flex items-center gap-3 text-xs text-stone-700 font-semibold pt-1">
                <span className="flex items-center gap-1 text-emerald-700">
                  <CheckCircle2 className="w-4 h-4" /> 100% Fresh Ingredients
                </span>
                <span>•</span>
                <span className="text-stone-500">Artisan Recipes</span>
              </div>
            </div>

            <div className="mt-8 pt-4 flex items-center justify-between relative z-10 border-t border-[#E2D7C3]">
              <a
                href="#featured-dishes"
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
      <section id="featured-dishes" className="bg-white py-16 sm:py-24 border-y border-[#E8DFC8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-emerald-700">
              Our Signature Delicacies
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-950 font-display">
              FOOD YOU LOVE, PREPARED FRESH
            </h2>
            <p className="text-sm text-stone-600">
              Hand-crafted daily with wholesome, high quality ingredients. Experience top dishes available across our partner restaurant network.
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
                    <div className="absolute top-0 right-4 bg-emerald-600 text-white rounded-full w-12 h-12 flex flex-col items-center justify-center font-display font-black text-xs shadow-md border-2 border-white">
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

                  <h3 className="font-extrabold text-slate-900 text-base font-display group-hover:text-emerald-700 transition">
                    {item.name}
                  </h3>
                  <p className="text-xs text-stone-600 mt-1.5 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#E8DFC8] flex items-center justify-between">
                  <span className="text-[10px] font-bold text-stone-500 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-emerald-600" /> {item.prepTime}
                  </span>

                  <a
                    href="#how-it-works"
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-xs hover:shadow cursor-pointer flex items-center gap-1.5"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>Scan to Order</span>
                  </a>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-stone-100 border border-stone-200 text-stone-700 text-xs font-bold">
              <QrCode className="w-4 h-4 text-emerald-600" />
              <span>To order at your table, scan the QR code located on your dining standee</span>
            </div>
          </div>
        </div>
      </section>

      {/* ================= DINER PERKS & REWARDS ================= */}
      <section id="offers-rewards" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
          <span className="text-xs font-black uppercase tracking-widest text-emerald-700">
            Exclusive Diner Rewards
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-950 font-display">
            MORE VALUE ON EVERY MEAL
          </h2>
          <p className="text-sm text-stone-600">
            Scan-Pay-Eat rewards you every time you dine with coupons, milestone celebrations, and zero hidden charges.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-[#E8DFC8] shadow-xs hover:shadow-lg transition">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
              <Gift className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-base font-display">
              Milestone Rewards
            </h3>
            <p className="text-xs text-stone-600 mt-2 leading-relaxed">
              Be today’s 10th or 100th customer and unlock surprise instant cash discounts applied directly to your bill.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-[#E8DFC8] shadow-xs hover:shadow-lg transition">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-base font-display">
              Promo Coupons
            </h3>
            <p className="text-xs text-stone-600 mt-2 leading-relaxed">
              Redeem restaurant-exclusive deals and platform-wide promo codes for flat ₹ off or percentage savings.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-[#E8DFC8] shadow-xs hover:shadow-lg transition">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center mb-4">
              <BellRing className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-base font-display">
              Live Token Tracking
            </h3>
            <p className="text-xs text-stone-600 mt-2 leading-relaxed">
              Watch your food token advance in real time. Know the exact moment your dish is plated and ready.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-[#E8DFC8] shadow-xs hover:shadow-lg transition">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-base font-display">
              Verified Receipts
            </h3>
            <p className="text-xs text-stone-600 mt-2 leading-relaxed">
              Keep your digital receipts organized. Instant GST-compliant receipts stored under your diner account.
            </p>
          </div>
        </div>
      </section>

      {/* ================= QUALITY & CLEANLINESS 3-PILLAR SECTION ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <div className="bg-[#F5EFEB] rounded-3xl p-8 sm:p-12 border border-[#E2D7C3] grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 relative flex justify-center">
            <div className="w-64 h-64 sm:w-72 sm:h-72 rounded-full overflow-hidden border-4 border-white shadow-xl">
              <img
                src="https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80"
                alt="Care and Cleanliness"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-2 bg-emerald-600 text-white px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider shadow-md">
              100% Hygienic Service
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-emerald-800">
                Our Standards
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
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 mx-auto flex items-center justify-center mb-2 font-bold">
                  ⚡
                </div>
                <h4 className="font-extrabold text-xs text-slate-900 font-display">FAST DISPATCH</h4>
                <p className="text-[10px] text-stone-500 mt-1">Orders sent directly to kitchen chefs</p>
              </div>

              <div className="bg-white/80 p-4 rounded-2xl border border-[#E2D7C3] text-center">
                <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 mx-auto flex items-center justify-center mb-2 font-bold">
                  🛡️
                </div>
                <h4 className="font-extrabold text-xs text-slate-900 font-display">SAFE & FRESH</h4>
                <p className="text-[10px] text-stone-500 mt-1">Prepared fresh with hygienic standards</p>
              </div>

              <div className="bg-white/80 p-4 rounded-2xl border border-[#E2D7C3] text-center">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 mx-auto flex items-center justify-center mb-2 font-bold">
                  💳
                </div>
                <h4 className="font-extrabold text-xs text-slate-900 font-display">SECURE PAYMENTS</h4>
                <p className="text-[10px] text-stone-500 mt-1">Instant verified Razorpay receipts</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= DINER TESTIMONIAL BANNER ================= */}
      <section className="bg-[#0D151E] text-stone-200 py-16 sm:py-20 border-t border-[#1E293B] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 space-y-4 text-center lg:text-left">
              <span className="text-[11px] font-black uppercase tracking-widest text-amber-400">
                Loved by Diners
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white font-display leading-tight">
                FASTER SERVICE, <br />HAPPIER FOOD LOVERS.
              </h2>
              <p className="text-xs sm:text-sm text-stone-400 leading-relaxed max-w-lg">
                Scanner Pay Eat removes the stress of crowded dining. Scan the QR code at your table, choose your favorite dishes, pay via UPI, and enjoy hot food delivered right to your table.
              </p>
            </div>

            <div className="lg:col-span-6 flex justify-center">
              <div className="bg-[#16202C] p-7 rounded-3xl border border-[#223142] shadow-2xl max-w-md w-full relative">
                <div className="text-emerald-500 text-4xl font-serif leading-none mb-2">“</div>
                <p className="text-xs text-stone-200 leading-relaxed font-medium">
                  Scanner Pay Eat completely revolutionized dining out for us! We sat down, scanned the QR code on our table, applied a coupon code, and completed UPI payment in 15 seconds. In less than 8 minutes, piping hot food arrived. No bill waiting, zero line hassles!
                </p>

                <div className="mt-5 pt-4 border-t border-[#223142] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs font-display">
                      AS
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Aarav Sharma</p>
                      <p className="text-[10px] text-stone-400">Daily Diner & Foodie</p>
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

      {/* ================= FINAL CUSTOMER CALL TO ACTION ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="bg-gradient-to-tr from-slate-950 via-slate-900 to-emerald-950 text-white rounded-3xl p-8 sm:p-14 border border-slate-800 shadow-2xl relative overflow-hidden text-center space-y-6">
          <div className="max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-black uppercase tracking-widest text-emerald-400 bg-emerald-950/80 px-3.5 py-1 rounded-full border border-emerald-800">
              Zero Wait Time Dining
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-display tracking-tight">
              READY FOR DELICIOUS DINING?
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              When dining at any partner restaurant, simply look for the Scanner Pay Eat QR code on your table to browse the menu, apply offers, and order instantly.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <a
              href="/my-orders"
              className="px-8 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-xs uppercase tracking-wider rounded-xl transition shadow-lg shadow-emerald-500/20 flex items-center gap-2"
            >
              <span>Track Existing Order</span>
              <Clock className="w-4 h-4" />
            </a>

            <a
              href="/register"
              className="px-8 py-3.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-extrabold text-xs uppercase tracking-wider rounded-xl transition flex items-center gap-2"
            >
              <span>Create Diner Account</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
