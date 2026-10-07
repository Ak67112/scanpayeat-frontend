'use client';

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import {
  UtensilsCrossed,
  ShoppingCart,
  User,
  LogOut,
  ShieldAlert,
  ChefHat,
  ShoppingBag,
  Menu,
  X,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { totalItems, setIsCartOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#E8DFC8] shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <div className="flex items-center space-x-3">
            <a href="/" className="flex items-center space-x-3 group">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-red-700 to-rose-600 flex items-center justify-center text-white shadow-md shadow-red-700/25 group-hover:scale-105 transition-transform duration-200">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-2xl tracking-tight text-[#18181B] font-display leading-none">
                  Scan<span className="text-red-700">Pay</span>Eat
                </span>
                <span className="text-[10px] text-red-900/60 font-bold uppercase tracking-widest mt-0.5">
                  Culinary QR Platform
                </span>
              </div>
            </a>

            {/* Role indicator pill */}
            {user && (
              <span
                className={`hidden lg:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                  user.role === 'ADMIN'
                    ? 'bg-purple-100 text-purple-900 border border-purple-300'
                    : user.role === 'SHOPKEEPER'
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                }`}
              >
                {user.role === 'ADMIN' && <ShieldAlert className="w-3.5 h-3.5" />}
                {user.role === 'SHOPKEEPER' && <ChefHat className="w-3.5 h-3.5" />}
                {user.role === 'CUSTOMER' && <ShoppingBag className="w-3.5 h-3.5" />}
                {user.role === 'SHOPKEEPER'
                  ? `${user.shopName || 'Shopkeeper'}`
                  : user.role}
              </span>
            )}
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-6">
            <a
              href="/shop/abc"
              className="text-xs font-bold uppercase tracking-wider text-stone-700 hover:text-red-700 transition flex items-center gap-1.5"
            >
              <span>ABC Restaurant Menu</span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[9px] font-extrabold">OPEN</span>
            </a>

            {user?.role === 'CUSTOMER' && (
              <a
                href="/my-orders"
                className="text-xs font-bold uppercase tracking-wider text-stone-700 hover:text-red-700 transition"
              >
                My Orders
              </a>
            )}

            {user?.role === 'SHOPKEEPER' && (
              <a
                href="/shopkeeper"
                className="text-xs font-bold uppercase tracking-wider text-amber-900 bg-amber-100/80 px-3.5 py-2 rounded-xl border border-amber-300 hover:bg-amber-200 transition"
              >
                Kitchen Dashboard
              </a>
            )}

            {user?.role === 'ADMIN' && (
              <a
                href="/admin"
                className="text-xs font-bold uppercase tracking-wider text-purple-900 bg-purple-100/80 px-3.5 py-2 rounded-xl border border-purple-300 hover:bg-purple-200 transition"
              >
                Admin Console
              </a>
            )}

            {/* Cart Button with trending pill style */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl transition cursor-pointer border border-[#E8DFC8]"
              aria-label="View Cart"
            >
              <ShoppingCart className="w-4 h-4 text-red-700" />
              <span className="text-xs font-bold">Cart</span>
              {totalItems > 0 && (
                <span className="bg-red-700 text-white text-[11px] font-black rounded-full min-w-5 h-5 px-1.5 flex items-center justify-center animate-pulse">
                  {totalItems}
                </span>
              )}
            </button>

            {/* User Profile / Auth Action */}
            {user ? (
              <div className="flex items-center space-x-3 pl-3 border-l border-[#E8DFC8]">
                <div className="flex flex-col text-right">
                  <span className="text-xs font-bold text-stone-900 line-clamp-1">
                    {user.name}
                  </span>
                  <span className="text-[10px] text-stone-500">{user.email}</span>
                </div>
                <button
                  onClick={() => logout()}
                  title="Logout"
                  className="p-2 text-stone-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2 pl-2 border-l border-[#E8DFC8]">
                <a
                  href="/login?role=customer"
                  className="text-xs font-bold uppercase tracking-wider text-stone-800 hover:text-red-700 px-3 py-2 rounded-xl transition"
                >
                  Customer Login
                </a>
                <a
                  href="/login?role=shopkeeper"
                  className="text-xs font-bold uppercase tracking-wider text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-2 rounded-xl transition flex items-center gap-1"
                >
                  <ChefHat className="w-3.5 h-3.5 text-amber-700" />
                  <span>Kitchen Staff</span>
                </a>
                <a
                  href="/register"
                  className="text-xs font-bold uppercase tracking-wider text-white bg-red-700 hover:bg-red-800 px-3.5 py-2 rounded-xl shadow-md shadow-red-700/20 transition flex items-center gap-1"
                >
                  <span>Sign Up</span>
                  <ArrowRight className="w-3 h-3" />
                </a>
              </div>
            )}
          </nav>

          {/* Mobile Menu & Cart Button */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 text-stone-800 bg-stone-100 rounded-xl"
            >
              <ShoppingCart className="w-5 h-5 text-red-700" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-700 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 text-stone-800 bg-stone-100 hover:bg-stone-200 rounded-xl"
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
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-900">
                {user.role}
              </span>
            </div>
          )}

          <div className="flex flex-col space-y-2">
            <a
              href="/shop/abc"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3.5 py-2.5 text-xs font-bold text-stone-800 rounded-xl hover:bg-white border border-transparent hover:border-[#E8DFC8] transition flex items-center justify-between"
            >
              <span>ABC Restaurant Menu</span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[9px] font-extrabold">OPEN</span>
            </a>

            {user?.role === 'CUSTOMER' && (
              <a
                href="/my-orders"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3.5 py-2.5 text-xs font-bold text-stone-800 rounded-xl hover:bg-white border border-transparent hover:border-[#E8DFC8] transition"
              >
                My Orders
              </a>
            )}

            {user?.role === 'SHOPKEEPER' && (
              <a
                href="/shopkeeper"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3.5 py-2.5 text-xs font-bold text-amber-900 bg-amber-100/80 rounded-xl"
              >
                Kitchen Dashboard
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
                className="w-full text-left px-3.5 py-2.5 text-xs font-bold text-red-700 rounded-xl hover:bg-red-50 flex items-center gap-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            ) : (
              <div className="pt-2 flex flex-col gap-2">
                <a
                  href="/login?role=customer"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 text-xs font-bold uppercase tracking-wider text-stone-800 bg-white border border-[#E8DFC8] rounded-xl"
                >
                  Customer Login
                </a>
                <a
                  href="/login?role=shopkeeper"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 text-xs font-bold uppercase tracking-wider text-amber-900 bg-amber-100/80 border border-amber-300 rounded-xl flex items-center justify-center gap-1.5"
                >
                  <ChefHat className="w-3.5 h-3.5 text-amber-700" />
                  <span>Kitchen Staff Login</span>
                </a>
                <a
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-red-700 rounded-xl shadow-md"
                >
                  Sign Up as Customer
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
