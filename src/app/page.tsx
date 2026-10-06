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
} from 'lucide-react';
import CartDrawer from '../components/shop/CartDrawer';

export default function HomePage() {
  return (
    <div className="bg-slate-50 min-h-screen">
      <CartDrawer />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-amber-500/10 via-amber-50/40 to-slate-50 py-16 sm:py-24 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100/80 border border-amber-300 text-amber-900 text-xs font-semibold mb-6 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Multi-Tenant QR Food Ordering Engine</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight">
            Scan. Pay. Eat.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-rose-600">
              Without Waiting.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Eliminate long lines and paper menus. Customers scan a shop-specific QR code,
            browse live availability, pay securely via Razorpay, and track their daily token in real time.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <a
              href="/shop/abc"
              className="px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-md hover:shadow-lg transition flex items-center gap-2 cursor-pointer"
            >
              <QrCode className="w-4 h-4" />
              <span>Try Customer QR Menu (ABC Restaurant)</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </a>

            <a
              href="/login"
              className="px-6 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-sm border border-slate-300 shadow-xs transition flex items-center gap-2 cursor-pointer"
            >
              <span>Unified Portal Login</span>
            </a>
          </div>
        </div>
      </section>

      {/* 3 Role Portals Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Select Your Role & Experience the Platform
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Full end-to-end functionality for Customers, Shopkeepers, and Platform Admins.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1: Customer */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xs hover:shadow-xl transition-all flex flex-col justify-between group">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <ShoppingBag className="w-7 h-7" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                Role 1: Customer
              </span>
              <h3 className="text-xl font-bold text-slate-900 mt-3 mb-2">
                Instant QR Ordering
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Scan table QR, browse categories, add items to cart, checkout with verified Razorpay payment, and watch live token progress without manual refresh.
              </p>

              <div className="mt-5 space-y-2 border-t border-slate-100 pt-4 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <CheckIcon /> Dynamic QR slug routing (`/shop/:slug`)
                </div>
                <div className="flex items-center gap-2">
                  <CheckIcon /> Server-side anti-tampering cart check
                </div>
                <div className="flex items-center gap-2">
                  <CheckIcon /> Live Socket.io token tracker
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100 flex flex-col gap-2">
              <a
                href="/shop/abc"
                className="w-full py-2.5 text-center bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-xs shadow-xs transition"
              >
                Scan & Order Demo Menu
              </a>
              <a
                href="/my-orders"
                className="w-full py-2 text-center text-slate-600 hover:text-slate-900 text-xs font-semibold"
              >
                View Customer Orders History →
              </a>
            </div>
          </div>

          {/* Card 2: Shopkeeper */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xs hover:shadow-xl transition-all flex flex-col justify-between group">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-orange-100 text-orange-700 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <ChefHat className="w-7 h-7" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-orange-700 bg-orange-50 px-2.5 py-1 rounded-md border border-orange-200">
                Role 2: Shopkeeper
              </span>
              <h3 className="text-xl font-bold text-slate-900 mt-3 mb-2">
                Live Kitchen Display (KDS)
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Dedicated multi-tenant dashboard. Hear live audio notifications for new orders, advance ticket status (`CONFIRMED` → `PREPARING` → `READY`), and manage menu availability.
              </p>

              <div className="mt-5 space-y-2 border-t border-slate-100 pt-4 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <CheckIcon /> Real-time sound chime on `new_order`
                </div>
                <div className="flex items-center gap-2">
                  <CheckIcon /> 1-Click stock availability toggle
                </div>
                <div className="flex items-center gap-2">
                  <CheckIcon /> Strict shop isolation (`JWT.shopId`)
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100 flex flex-col gap-2">
              <a
                href="/shopkeeper"
                className="w-full py-2.5 text-center bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold text-xs shadow-xs transition"
              >
                Open Kitchen Dashboard
              </a>
              <div className="text-[11px] text-center text-slate-400">
                Demo: `shop@abc.com` / `Shop@123`
              </div>
            </div>
          </div>

          {/* Card 3: Admin */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xs hover:shadow-xl transition-all flex flex-col justify-between group">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-1 rounded-md border border-purple-200">
                Role 3: Super Admin
              </span>
              <h3 className="text-xl font-bold text-slate-900 mt-3 mb-2">
                Platform Control Center
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Superadmin dashboard to provision new shops, generate unique QR links, create shopkeeper credentials, audit revenue, and toggle tenant statuses.
              </p>

              <div className="mt-5 space-y-2 border-t border-slate-100 pt-4 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <CheckIcon /> Create shops & unique QR codes
                </div>
                <div className="flex items-center gap-2">
                  <CheckIcon /> Securely provision shopkeepers
                </div>
                <div className="flex items-center gap-2">
                  <CheckIcon /> Platform-wide revenue & order audit
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100 flex flex-col gap-2">
              <a
                href="/admin"
                className="w-full py-2.5 text-center bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs shadow-xs transition"
              >
                Open Admin Console
              </a>
              <div className="text-[11px] text-center text-slate-400">
                Demo: `admin@scanpayeat.com` / `Admin@123`
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works / Workflow */}
      <section className="bg-white border-t border-b border-slate-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              The Scan-Pay-Eat Transaction Pipeline
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Designed for peak-hour restaurant environments with zero latency.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-center relative">
              <div className="w-10 h-10 rounded-full bg-amber-500 text-white font-extrabold flex items-center justify-center mx-auto mb-4 text-sm">
                1
              </div>
              <h4 className="font-bold text-slate-900 text-sm mb-1">Scan QR Code</h4>
              <p className="text-xs text-slate-500">
                Customer scans QR code at table or counter. Subdomain/slug resolves the shop instantly.
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-center relative">
              <div className="w-10 h-10 rounded-full bg-amber-500 text-white font-extrabold flex items-center justify-center mx-auto mb-4 text-sm">
                2
              </div>
              <h4 className="font-bold text-slate-900 text-sm mb-1">Select & Checkout</h4>
              <p className="text-xs text-slate-500">
                Selects food. Backend validates prices against PostgreSQL database preventing tampering.
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-center relative">
              <div className="w-10 h-10 rounded-full bg-amber-500 text-white font-extrabold flex items-center justify-center mx-auto mb-4 text-sm">
                3
              </div>
              <h4 className="font-bold text-slate-900 text-sm mb-1">Razorpay & Token</h4>
              <p className="text-xs text-slate-500">
                Customer pays. An atomic transaction records payment and issues the daily Token (e.g. A101).
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-center relative">
              <div className="w-10 h-10 rounded-full bg-amber-500 text-white font-extrabold flex items-center justify-center mx-auto mb-4 text-sm">
                4
              </div>
              <h4 className="font-bold text-slate-900 text-sm mb-1">Live KDS Notification</h4>
              <p className="text-xs text-slate-500">
                Shopkeeper gets instantaneous audio chime via Socket.io. Prepares food and notifies customer!
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function CheckIcon() {
  return (
    <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 text-[10px] font-bold">
      ✓
    </span>
  );
}
