import React from 'react';
import {
  UtensilsCrossed,
  ShieldCheck,
  Zap,
  QrCode,
  Heart,
  Clock,
  Gift,
  ChefHat,
  CreditCard,
  Headphones,
} from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#141A16] text-stone-300 border-t border-[#232F28] mt-auto">
      {/* Upper culinary ticker banner */}
      <div className="bg-red-700 text-white text-[11px] font-black uppercase tracking-widest py-2.5 overflow-hidden">
        <div className="animate-marquee whitespace-nowrap flex items-center gap-8">
          <span>🔥 FRESHLY PREPARED MEALS</span>
          <span>•</span>
          <span>CONTACTLESS QR TABLE CHECKOUT</span>
          <span>•</span>
          <span>LIVE KITCHEN TOKEN TRACKING</span>
          <span>•</span>
          <span>PROMO COUPONS & MILESTONE DISCOUNTS</span>
          <span>•</span>
          <span>ZERO QUEUE WAITING</span>
          <span>•</span>
          <span>SECURE INSTANT PAYMENT SETTLEMENT</span>
          <span>•</span>
          <span>🔥 FRESHLY PREPARED MEALS</span>
          <span>•</span>
          <span>CONTACTLESS QR TABLE CHECKOUT</span>
          <span>•</span>
          <span>LIVE KITCHEN TOKEN TRACKING</span>
          <span>•</span>
          <span>PROMO COUPONS & MILESTONE DISCOUNTS</span>
          <span>•</span>
          <span>ZERO QUEUE WAITING</span>
          <span>•</span>
          <span>SECURE INSTANT PAYMENT SETTLEMENT</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          {/* Col 1: Brand & Overview */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-700 flex items-center justify-center text-white shadow-md shadow-red-700/20">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-white text-2xl tracking-tight font-display">
                Scan<span className="text-red-500">Pay</span>Eat
              </span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              The modern contactless dining and restaurant management platform. Empowering diners to scan, order, and pay with zero delays, while giving kitchen teams real-time display tickets and automated sales analytics.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <span className="px-2.5 py-1 rounded-full bg-stone-800 text-stone-300 text-[10px] font-bold border border-stone-700">
                Contactless Dining
              </span>
              <span className="px-2.5 py-1 rounded-full bg-stone-800 text-stone-300 text-[10px] font-bold border border-stone-700">
                Kitchen KDS
              </span>
            </div>
          </div>

          {/* Col 2: Customer Experience */}
          <div>
            <h4 className="text-xs font-bold uppercase text-white tracking-widest mb-4 font-display flex items-center gap-1.5">
              <QrCode className="w-3.5 h-3.5 text-red-500" />
              <span>For Diners & Guests</span>
            </h4>
            <ul className="space-y-2.5 text-xs text-stone-400">
              <li className="flex items-start gap-2">
                <span className="text-red-400 font-bold">•</span>
                <span>Instant QR Table Ordering — no app installation needed</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 font-bold">•</span>
                <span>Fast UPI, Card & Netbanking Checkout</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 font-bold">•</span>
                <span>Live Token Display from Cooking to Ready for Pickup</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 font-bold">•</span>
                <span>Promotional Coupons & Milestone Customer Discounts</span>
              </li>
              <li className="pt-1">
                <a
                  href="/shop/abc"
                  className="inline-flex items-center gap-1 text-red-400 hover:text-red-300 font-bold text-xs transition"
                >
                  View ABC Restaurant Menu →
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Kitchen & Restaurant Management */}
          <div>
            <h4 className="text-xs font-bold uppercase text-white tracking-widest mb-4 font-display flex items-center gap-1.5">
              <ChefHat className="w-3.5 h-3.5 text-amber-500" />
              <span>For Restaurant Owners</span>
            </h4>
            <ul className="space-y-2.5 text-xs text-stone-400">
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">•</span>
                <span>Real-Time Kitchen Display System (KDS) with Audio Chimes</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">•</span>
                <span>Instant Menu Dish & Category Management with Photos</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">•</span>
                <span>Automated Daily, Weekly & Monthly Sales Revenue Reports</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">•</span>
                <span>Custom Promotional Coupon & Milestone Reward Controls</span>
              </li>
              <li className="pt-1">
                <a
                  href="/login?role=shopkeeper"
                  className="inline-flex items-center gap-1 text-amber-400 hover:text-amber-300 font-bold text-xs transition"
                >
                  Access Kitchen Display Portal →
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Trust, Reliability & Support */}
          <div>
            <h4 className="text-xs font-bold uppercase text-white tracking-widest mb-4 font-display flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Service & Reliability</span>
            </h4>
            <ul className="space-y-2.5 text-xs text-stone-400">
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Bank-Grade Payment Encryption</span>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>Zero-Delay Order Delivery Pipeline</span>
              </li>
              <li className="flex items-center gap-2">
                <CreditCard className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span>Verified Digital Counter Receipts</span>
              </li>
              <li className="flex items-center gap-2">
                <Headphones className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                <span>Dedicated Restaurant Partner Support</span>
              </li>
            </ul>
            <div className="mt-4 p-3 rounded-xl bg-stone-900/80 border border-stone-800 text-[11px] text-stone-400 leading-normal">
              Operating continuously across dining outlets, cafes, food courts, and express takeaway counters.
            </div>
          </div>
        </div>

        <div className="border-t border-[#232F28] mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-400 gap-3">
          <p>© {new Date().getFullYear()} ScanPayEat. Modern Hospitality & Contactless Dining Platform.</p>
          <div className="flex items-center space-x-3 font-medium">
            <span>Built for Diners & Restaurateurs</span>
            <span>•</span>
            <span className="text-red-400 flex items-center gap-1">
              <Heart className="w-3 h-3 fill-current" /> Fast, Fresh & Delicious
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
