'use client';

import React, { useState, Suspense } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ChefHat,
  Loader2,
  AlertCircle,
  KeyRound,
  Mail,
  Lock,
  ArrowRight,
  Store,
  Clock,
} from 'lucide-react';

function ShopkeeperLoginContent() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isExpired = searchParams.get('expired') === '24h';

  const [email, setEmail] = useState('shop@abc.com');
  const [password, setPassword] = useState('Shop@123');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      const user = await login(email, password, 'SHOPKEEPER');
      if (user.role === 'SHOPKEEPER') {
        router.push('/shopkeeper');
      } else {
        throw new Error('Access denied. Restaurant staff account required.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid restaurant staff credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
      {/* Header Banner */}
      <div className="p-8 text-center bg-gradient-to-b from-amber-500/10 to-transparent border-b border-slate-100">
        <a href="/" className="inline-block mb-3">
          <img
            src="/logo.png"
            alt="Scanner Pay Eat"
            className="h-10 mx-auto object-contain"
          />
        </a>
        <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center mx-auto shadow-md shadow-amber-500/20 mb-3">
          <ChefHat className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight font-display">
          Restaurant Partner Portal
        </h2>
        <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
          Manage kitchen display orders, dish availability, ambience photos, and sales analytics
        </p>
      </div>

      {/* Login Form */}
      <div className="p-8">
        {isExpired && (
          <div className="mb-5 p-3.5 bg-amber-50 border border-amber-300 text-amber-900 text-xs rounded-xl flex items-start gap-2.5 shadow-xs">
            <Clock className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
            <div>
              <p className="font-bold">24-Hour Session Expired</p>
              <p className="text-[11px] text-amber-800 mt-0.5">
                For kitchen and shop safety, restaurant partner sessions automatically expire every 24 hours. Please sign in again.
              </p>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="mb-5 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Restaurant Staff Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="staff@restaurant.com"
                className="w-full text-xs pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-white text-slate-900 placeholder:text-slate-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Staff Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-white text-slate-900 placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 text-[11px] text-amber-900 flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-medium">
              <KeyRound className="w-3.5 h-3.5 text-amber-600" />
              <span>Default credentials active</span>
            </span>
            <span className="font-mono text-[10px] bg-amber-200/80 px-1.5 py-0.5 rounded text-amber-900 font-bold">
              Shopkeeper
            </span>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md shadow-amber-600/20 transition flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Sign In to Kitchen Staff</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-500">
            Are you a diner?{' '}
            <a
              href="/login"
              className="font-bold text-emerald-600 hover:text-emerald-700 transition"
            >
              Customer Sign In
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ShopkeeperLoginPage() {
  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-slate-50">
      <Suspense
        fallback={
          <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-slate-200 shadow-xl flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
          </div>
        }
      >
        <ShopkeeperLoginContent />
      </Suspense>
    </div>
  );
}
