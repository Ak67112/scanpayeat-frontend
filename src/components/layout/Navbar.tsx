'use client';

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import {
  ShoppingCart,
  LogOut,
  ShoppingBag,
  Menu,
  X,
  Sparkles,
  ArrowRight,
  Clock,
  Compass,
} from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { totalItems, setIsCartOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#E8DFC8] shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Official Brand Logo */}
          <div className="flex items-center space-x-3">
            <a href="/" className="flex items-center group py-1">
              <img
                src="/logo.png"
                alt="Scanner Pay Eat"
                className="h-10 sm:h-12 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
              />
            </a>

            {/* Logged in customer badge */}
            {user && user.role === 'CUSTOMER' && (
              <span className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Diner Member</span>
              </span>
            )}
          </div>

          {/* Customer-First Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-6">
            <a
              href="/#how-it-works"
              className="text-xs font-bold uppercase tracking-wider text-stone-700 hover:text-emerald-700 transition"
            >
              How It Works
            </a>

            <a
              href="/#featured-dishes"
              className="text-xs font-bold uppercase tracking-wider text-stone-700 hover:text-emerald-700 transition"
            >
              Featured Dishes
            </a>

            <a
              href="/#offers-rewards"
              className="text-xs font-bold uppercase tracking-wider text-stone-700 hover:text-emerald-700 transition flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Offers & Deals</span>
            </a>

            <a
              href="/my-orders"
              className="text-xs font-bold uppercase tracking-wider text-stone-700 hover:text-emerald-700 transition flex items-center gap-1.5"
            >
              <Clock className="w-3.5 h-3.5 text-emerald-700" />
              <span>Track Order</span>
            </a>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl transition cursor-pointer border border-[#E8DFC8]"
              aria-label="View Cart"
            >
              <ShoppingCart className="w-4 h-4 text-emerald-700" />
              <span className="text-xs font-bold">Cart</span>
              {totalItems > 0 && (
                <span className="bg-emerald-600 text-white text-[11px] font-black rounded-full min-w-5 h-5 px-1.5 flex items-center justify-center animate-pulse">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Customer Auth Actions */}
            {user ? (
              <div className="flex items-center space-x-3 pl-3 border-l border-[#E8DFC8]">
                {user.role === 'SHOPKEEPER' && (
                  <a
                    href="/shopkeeper"
                    className="text-xs font-bold uppercase tracking-wider text-amber-900 bg-amber-100/80 px-3 py-1.5 rounded-xl border border-amber-300 hover:bg-amber-200 transition"
                  >
                    Staff Dashboard
                  </a>
                )}
                {user.role === 'ADMIN' && (
                  <a
                    href="/admin"
                    className="text-xs font-bold uppercase tracking-wider text-purple-900 bg-purple-100/80 px-3 py-1.5 rounded-xl border border-purple-300 hover:bg-purple-200 transition"
                  >
                    Admin Console
                  </a>
                )}
                <div className="flex flex-col text-right">
                  <span className="text-xs font-bold text-stone-900 line-clamp-1">
                    {user.name}
                  </span>
                  <span className="text-[10px] text-stone-500">{user.email}</span>
                </div>
                <button
                  onClick={() => logout()}
                  title="Logout"
                  className="p-2 text-stone-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2 pl-2 border-l border-[#E8DFC8]">
                <a
                  href="/login"
                  className="text-xs font-bold uppercase tracking-wider text-stone-800 hover:text-emerald-700 px-3.5 py-2 rounded-xl transition font-medium"
                >
                  Sign In
                </a>
                <a
                  href="/register"
                  className="text-xs font-bold uppercase tracking-wider text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-xl shadow-md shadow-emerald-600/20 transition flex items-center gap-1.5"
                >
                  <span>Sign Up</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </nav>

          {/* Mobile Menu & Cart Button */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 text-stone-800 bg-stone-100 rounded-xl border border-[#E8DFC8]"
              aria-label="Open Cart"
            >
              <ShoppingCart className="w-5 h-5 text-emerald-700" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 text-stone-800 bg-stone-100 hover:bg-stone-200 rounded-xl border border-[#E8DFC8]"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E8DFC8] bg-[#FAF7F2] px-4 pt-3 pb-6 space-y-3">
          {user && (
            <div className="p-3 bg-white border border-[#E8DFC8] rounded-xl flex items-center justify-between">
              <div>
                <p className="font-bold text-stone-900 text-xs">{user.name}</p>
                <p className="text-[10px] text-stone-500">{user.email}</p>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900">
                {user.role}
              </span>
            </div>
          )}

          <div className="flex flex-col space-y-2">
            <a
              href="/#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3.5 py-2.5 text-xs font-bold text-stone-800 rounded-xl hover:bg-white border border-transparent hover:border-[#E8DFC8] transition"
            >
              How It Works
            </a>

            <a
              href="/#featured-dishes"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3.5 py-2.5 text-xs font-bold text-stone-800 rounded-xl hover:bg-white border border-transparent hover:border-[#E8DFC8] transition"
            >
              Featured Dishes
            </a>

            <a
              href="/#offers-rewards"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3.5 py-2.5 text-xs font-bold text-stone-800 rounded-xl hover:bg-white border border-transparent hover:border-[#E8DFC8] transition flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Offers & Deals</span>
            </a>

            <a
              href="/my-orders"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3.5 py-2.5 text-xs font-bold text-stone-800 rounded-xl hover:bg-white border border-transparent hover:border-[#E8DFC8] transition flex items-center gap-1.5"
            >
              <Clock className="w-3.5 h-3.5 text-emerald-700" />
              <span>Track My Order</span>
            </a>

            {user?.role === 'SHOPKEEPER' && (
              <a
                href="/shopkeeper"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3.5 py-2.5 text-xs font-bold text-amber-900 bg-amber-100/80 rounded-xl"
              >
                Staff Dashboard
              </a>
            )}

            {user?.role === 'ADMIN' && (
              <a
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3.5 py-2.5 text-xs font-bold text-purple-900 bg-purple-100/80 rounded-xl"
              >
                Admin Console
              </a>
            )}

            {user ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="w-full text-left px-3.5 py-2.5 text-xs font-bold text-rose-700 rounded-xl hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            ) : (
              <div className="pt-2 flex flex-col gap-2">
                <a
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 text-xs font-bold uppercase tracking-wider text-stone-800 bg-white border border-[#E8DFC8] rounded-xl"
                >
                  Sign In
                </a>
                <a
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-emerald-600 rounded-xl shadow-md"
                >
                  Sign Up as Diner
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
