'use client';

import React, { useState } from 'react';
import Link from 'next/navigation';
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
} from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { totalItems, setIsCartOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center space-x-3">
            <a href="/" className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-white shadow-md shadow-rose-500/20">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-xl tracking-tight text-slate-900 leading-none">
                  Scan<span className="text-amber-600">Pay</span>Eat
                </span>
                <span className="text-[10px] text-slate-500 font-medium tracking-wide">
                  MULTI-SHOP QR FOOD
                </span>
              </div>
            </a>

            {/* Role indicator pill */}
            {user && (
              <span
                className={`hidden md:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  user.role === 'ADMIN'
                    ? 'bg-purple-100 text-purple-800 border border-purple-200'
                    : user.role === 'SHOPKEEPER'
                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
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
              className="text-sm font-medium text-slate-600 hover:text-amber-600 transition"
            >
              Demo Shop (ABC)
            </a>

            {user?.role === 'CUSTOMER' && (
              <a
                href="/my-orders"
                className="text-sm font-medium text-slate-600 hover:text-amber-600 transition"
              >
                My Orders
              </a>
            )}

            {user?.role === 'SHOPKEEPER' && (
              <a
                href="/shopkeeper"
                className="text-sm font-medium text-amber-700 font-semibold bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200 hover:bg-amber-100 transition"
              >
                Kitchen Dashboard
              </a>
            )}

            {user?.role === 'ADMIN' && (
              <a
                href="/admin"
                className="text-sm font-medium text-purple-700 font-semibold bg-purple-50 px-3 py-1.5 rounded-lg border border-purple-200 hover:bg-purple-100 transition"
              >
                Admin Console
              </a>
            )}

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-slate-700 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition cursor-pointer"
              aria-label="View Cart"
            >
              <ShoppingCart className="w-6 h-6" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[11px] font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                  {totalItems}
                </span>
              )}
            </button>

            {/* User Profile / Auth Action */}
            {user ? (
              <div className="flex items-center space-x-3 pl-3 border-l border-slate-200">
                <div className="flex flex-col text-right">
                  <span className="text-sm font-semibold text-slate-800 line-clamp-1">
                    {user.name}
                  </span>
                  <span className="text-xs text-slate-500">{user.email}</span>
                </div>
                <button
                  onClick={() => logout()}
                  title="Logout"
                  className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
                <a
                  href="/login"
                  className="text-sm font-semibold text-slate-700 hover:text-amber-600 px-3 py-1.5 rounded-lg transition"
                >
                  Login
                </a>
                <a
                  href="/register"
                  className="text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 px-3.5 py-1.5 rounded-lg shadow-sm transition"
                >
                  Register
                </a>
              </div>
            )}
          </nav>

          {/* Mobile Menu & Cart Button */}
          <div className="flex md:hidden items-center space-x-3">
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-slate-700"
            >
              <ShoppingCart className="w-6 h-6" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-3">
          {user && (
            <div className="p-3 bg-slate-50 rounded-lg flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-800 text-sm">{user.name}</p>
                <p className="text-xs text-slate-500">{user.email}</p>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                {user.role}
              </span>
            </div>
          )}

          <div className="flex flex-col space-y-2">
            <a
              href="/shop/abc"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-50"
            >
              Demo Shop (ABC Restaurant)
            </a>

            {user?.role === 'CUSTOMER' && (
              <a
                href="/my-orders"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-50"
              >
                My Orders
              </a>
            )}

            {user?.role === 'SHOPKEEPER' && (
              <a
                href="/shopkeeper"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-medium text-amber-700 bg-amber-50 rounded-lg"
              >
                Kitchen Dashboard
              </a>
            )}

            {user?.role === 'ADMIN' && (
              <a
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-medium text-purple-700 bg-purple-50 rounded-lg"
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
                className="w-full text-left px-3 py-2 text-sm font-medium text-rose-600 rounded-lg hover:bg-rose-50 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            ) : (
              <div className="pt-2 flex flex-col gap-2">
                <a
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 text-sm font-semibold text-slate-700 border border-slate-300 rounded-lg"
                >
                  Login
                </a>
                <a
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 text-sm font-semibold text-white bg-amber-600 rounded-lg"
                >
                  Register Customer
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
