import React from 'react';
import {
  ShieldCheck,
  Zap,
  QrCode,
  Heart,
  Clock,
  Gift,
  CreditCard,
  Headphones,
  Store,
  Sparkles,
} from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#0D151E] text-stone-300 border-t border-[#1E293B] mt-auto">
      {/* Upper culinary ticker banner */}
      <div className="bg-emerald-700 text-white text-[11px] font-black uppercase tracking-widest py-2.5 overflow-hidden">
        <div className="animate-marquee whitespace-nowrap flex items-center gap-8">
          <span>⚡ INSTANT CONTACTLESS QR DINING</span>
          <span>•</span>
          <span>FAST UPI & RAZORPAY CHECKOUT</span>
          <span>•</span>
          <span>LIVE KITCHEN TOKEN TRACKING</span>
          <span>•</span>
          <span>DISCOUNT COUPONS & MILESTONE REWARDS</span>
          <span>•</span>
          <span>ZERO LINE WAITING</span>
          <span>•</span>
          <span>FRESH MEALS PREPARED TO PERFECTION</span>
          <span>•</span>
          <span>⚡ INSTANT CONTACTLESS QR DINING</span>
          <span>•</span>
          <span>FAST UPI & RAZORPAY CHECKOUT</span>
          <span>•</span>
          <span>LIVE KITCHEN TOKEN TRACKING</span>
          <span>•</span>
          <span>DISCOUNT COUPONS & MILESTONE REWARDS</span>
          <span>•</span>
          <span>ZERO LINE WAITING</span>
          <span>•</span>
          <span>FRESH MEALS PREPARED TO PERFECTION</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          {/* Col 1: Brand & Overview */}
          <div className="space-y-4">
            <a href="/" className="inline-block bg-white/95 px-3 py-1.5 rounded-2xl shadow-md border border-slate-700/50 hover:bg-white transition">
              <img
                src="/logo.png"
                alt="Scanner Pay Eat"
                className="h-9 w-auto object-contain"
              />
            </a>
            <p className="text-xs text-stone-400 leading-relaxed">
              The modern contactless dining platform. Scan any table QR, customize your order, pay with instant UPI or Cards, and track your kitchen tokens in real-time with zero queue delays.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <span className="px-2.5 py-1 rounded-full bg-slate-800 text-emerald-400 text-[10px] font-bold border border-slate-700 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Contactless Dining
              </span>
              <span className="px-2.5 py-1 rounded-full bg-slate-800 text-stone-300 text-[10px] font-bold border border-slate-700">
                Live Kitchen Sync
              </span>
            </div>
          </div>

          {/* Col 2: Customer Experience */}
          <div>
            <h4 className="text-xs font-bold uppercase text-white tracking-widest mb-4 font-display flex items-center gap-1.5">
              <QrCode className="w-3.5 h-3.5 text-emerald-400" />
              <span>For Diners & Guests</span>
            </h4>
            <ul className="space-y-2.5 text-xs text-stone-400">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span>Instant QR Table Ordering — no app installation needed</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span>Fast UPI, Card & Netbanking Checkout via Razorpay</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span>Live Kitchen Token Tracking from Prep to Pickup</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span>Promotional Coupons & Milestone Diner Discounts</span>
              </li>
              <li className="pt-2">
                <a
                  href="/my-orders"
                  className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-bold text-xs transition"
                >
                  Track Existing Orders →
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Quick Navigation */}
          <div>
            <h4 className="text-xs font-bold uppercase text-white tracking-widest mb-4 font-display flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Explore Platform</span>
            </h4>
            <ul className="space-y-2.5 text-xs text-stone-400">
              <li>
                <a href="/#how-it-works" className="hover:text-emerald-400 transition">
                  How QR Ordering Works
                </a>
              </li>
              <li>
                <a href="/#featured-dishes" className="hover:text-emerald-400 transition">
                  Featured Specialties & Combos
                </a>
              </li>
              <li>
                <a href="/#offers-rewards" className="hover:text-emerald-400 transition">
                  Diner Rewards & Coupons
                </a>
              </li>
              <li>
                <a href="/login" className="hover:text-emerald-400 transition">
                  Customer Account Login
                </a>
              </li>
              <li>
                <a href="/register" className="hover:text-emerald-400 transition">
                  Sign Up as Diner
                </a>
              </li>
              <li className="pt-2 border-t border-slate-800">
                <a
                  href="/login?role=shopkeeper"
                  className="inline-flex items-center gap-1.5 text-stone-500 hover:text-amber-400 text-[11px] transition"
                >
                  <Store className="w-3 h-3" />
                  <span>Restaurant Partner Portal</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Trust, Reliability & Support */}
          <div>
            <h4 className="text-xs font-bold uppercase text-white tracking-widest mb-4 font-display flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Service & Reliability</span>
            </h4>
            <ul className="space-y-2.5 text-xs text-stone-400">
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Bank-Grade 256-Bit Payment Encryption</span>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Zero Wait Time Table Service</span>
              </li>
              <li className="flex items-center gap-2">
                <CreditCard className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>Instant Digital Token Receipts</span>
              </li>
              <li className="flex items-center gap-2">
                <Headphones className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span>24/7 Dedicated Support</span>
              </li>
            </ul>
            <div className="mt-4 p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] text-stone-400 leading-normal">
              Operating seamlessly across restaurants, cafes, food courts, and express food outlets.
            </div>
          </div>
        </div>

        <div className="border-t border-[#1E293B] mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-400 gap-3">
          <p>© {new Date().getFullYear()} Scanner Pay Eat. All rights reserved.</p>
          <div className="flex items-center space-x-3 font-medium">
            <span>Contactless Dining Made Effortless</span>
            <span>•</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <Heart className="w-3 h-3 fill-current text-rose-500" /> Fast, Fresh & Delicious
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
