import React from 'react';
import { UtensilsCrossed, ShieldCheck, Zap, QrCode } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1 */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-white font-bold">
                <UtensilsCrossed className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-white text-lg tracking-tight">
                Scan<span className="text-amber-500">Pay</span>Eat
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Multi-shop QR food ordering engine with automated daily token counters,
              real-time kitchen display, and instant Razorpay settlement.
            </p>
          </div>

          {/* Col 2 */}
          <div>
            <h4 className="text-xs font-semibold uppercase text-slate-200 tracking-wider mb-3">
              Platform Features
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center gap-1.5">
                <QrCode className="w-3.5 h-3.5 text-amber-500" /> Multi-Tenant QR Routing
              </li>
              <li className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500" /> Socket.io Real-time KDS
              </li>
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-500" /> Anti-Tamper Checkout
              </li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h4 className="text-xs font-semibold uppercase text-slate-200 tracking-wider mb-3">
              Demo Access
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <a href="/shop/abc" className="hover:text-amber-400 transition">
                  Customer QR Menu (ABC Restaurant)
                </a>
              </li>
              <li>
                <a href="/shopkeeper" className="hover:text-amber-400 transition">
                  Shopkeeper Live Kitchen
                </a>
              </li>
              <li>
                <a href="/admin" className="hover:text-amber-400 transition">
                  Platform Admin Console
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4 */}
          <div>
            <h4 className="text-xs font-semibold uppercase text-slate-200 tracking-wider mb-3">
              Backend Specs
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Node.js • Express • TypeScript • Prisma ORM • Aiven PostgreSQL • Razorpay • Socket.io
            </p>
            <div className="mt-3 text-[11px] text-slate-500">
              REST API listening on port 5001 with OpenAPI documentation at <a href="http://localhost:5001/api-docs" target="_blank" rel="noreferrer" className="text-amber-400 underline">/api-docs</a>.
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Scan-Pay-Eat. Multi-shop QR Food Ordering Platform.</p>
          <div className="flex space-x-4 mt-2 sm:mt-0">
            <span>Customer</span>
            <span>•</span>
            <span>Shopkeeper</span>
            <span>•</span>
            <span>Admin</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
