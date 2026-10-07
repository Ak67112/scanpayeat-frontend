import React from 'react';
import { UtensilsCrossed, ShieldCheck, Zap, QrCode, Sparkles, Heart } from 'lucide-react';

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
          <span>ZERO QUEUE DELAYS</span>
          <span>•</span>
          <span>SECURE RAZORPAY SETTLEMENT</span>
          <span>•</span>
          <span>🔥 FRESHLY PREPARED MEALS</span>
          <span>•</span>
          <span>CONTACTLESS QR TABLE CHECKOUT</span>
          <span>•</span>
          <span>LIVE KITCHEN TOKEN TRACKING</span>
          <span>•</span>
          <span>ZERO QUEUE DELAYS</span>
          <span>•</span>
          <span>SECURE RAZORPAY SETTLEMENT</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1 */}
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
              The next-generation multi-shop dining & QR ordering experience. Built for fast turnaround,
              delightful culinary exploration, and real-time token tracking.
            </p>
          </div>

          {/* Col 2 */}
          <div>
            <h4 className="text-xs font-bold uppercase text-white tracking-widest mb-4 font-display">
              Platform Features
            </h4>
            <ul className="space-y-2.5 text-xs text-stone-400">
              <li className="flex items-center gap-2">
                <QrCode className="w-3.5 h-3.5 text-red-500" /> Multi-Tenant QR Routing
              </li>
              <li className="flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-amber-500" /> Real-time Kitchen Chime & KDS
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Anti-Tamper Checkout & Token
              </li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h4 className="text-xs font-bold uppercase text-white tracking-widest mb-4 font-display">
              Live Portals
            </h4>
            <ul className="space-y-2.5 text-xs text-stone-400">
              <li>
                <a href="/shop/abc" className="hover:text-red-400 transition font-medium">
                  Customer QR Menu (ABC Restaurant)
                </a>
              </li>
              <li>
                <a href="/shopkeeper" className="hover:text-red-400 transition font-medium">
                  Shopkeeper Kitchen Display
                </a>
              </li>
              <li>
                <a href="/admin/login" className="hover:text-red-400 transition font-medium">
                  Super Admin Management Portal
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4 */}
          <div>
            <h4 className="text-xs font-bold uppercase text-white tracking-widest mb-4 font-display">
              Backend Architecture
            </h4>
            <p className="text-xs text-stone-400 leading-relaxed">
              Express • TypeScript • Prisma • Aiven Cloud PostgreSQL • Razorpay Webhooks • Socket.io Engine
            </p>
            <div className="mt-3 text-[11px] text-stone-400">
              OpenAPI documentation available at{' '}
              <a
                href={typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:5001/api-docs' : 'https://scanpayeat-backend.vercel.app/api-docs'}
                target="_blank"
                rel="noreferrer"
                className="text-amber-400 underline font-bold"
              >
                /api-docs
              </a>.
            </div>
          </div>
        </div>

        <div className="border-t border-[#232F28] mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-400">
          <p>© {new Date().getFullYear()} Scan-Pay-Eat. Gourmet Multi-Shop QR Platform.</p>
          <div className="flex items-center space-x-3 mt-3 sm:mt-0 font-medium">
            <span>Crafted for Foodies & Chefs</span>
            <span>•</span>
            <span className="text-red-400 flex items-center gap-1">
              <Heart className="w-3 h-3 fill-current" /> Tasty & Seamless
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
