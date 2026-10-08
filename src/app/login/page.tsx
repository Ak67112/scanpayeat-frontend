'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ShoppingBag,
  Loader2,
  AlertCircle,
  KeyRound,
  Mail,
  Lock,
  ArrowRight,
  Clock,
} from 'lucide-react';

function LoginContent() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isExpired = searchParams.get('expired') === '30d';

  const [email, setEmail] = useState('customer@demo.com');
  const [password, setPassword] = useState('Customer@123');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      await login(email, password, 'CUSTOMER');
      const redirectParam = searchParams.get('redirect');
      router.push(redirectParam || '/my-orders');
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
      {/* Header Banner */}
      <div className="p-8 text-center bg-gradient-to-b from-emerald-500/10 to-transparent border-b border-slate-100">
        <a href="/" className="inline-block mb-4">
          <img
            src="/logo.png"
            alt="Scanner Pay Eat"
            className="h-10 mx-auto object-contain"
          />
        </a>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight font-display">
          Customer Sign In
        </h2>
        <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
          Access your dining history, active order tickets, and claim discount coupons
        </p>
      </div>

      {/* Login Form */}
      <div className="p-8">
        {isExpired && (
          <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs rounded-xl flex items-start gap-2.5 shadow-xs">
            <Clock className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
            <div>
              <p className="font-bold">30-Day Session Concluded</p>
              <p className="text-[11px] text-emerald-800 mt-0.5">
                Your monthly login period has concluded. Please sign in again to access your orders and rewards.
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
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full text-xs pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white text-slate-900 placeholder:text-slate-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white text-slate-900 placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Quick Fill Credentials Helper */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-[11px] text-slate-600 flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-medium">
              <KeyRound className="w-3.5 h-3.5 text-slate-400" />
              <span>Default credentials active</span>
            </span>
            <span className="font-mono text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">
              Diner
            </span>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md shadow-emerald-600/20 transition flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Sign In to Dining</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-600">
            New customer?{' '}
            <a
              href="/register"
              className="font-bold text-emerald-600 hover:text-emerald-700 transition"
            >
              Create a Free Account
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-slate-50">
      <Suspense
        fallback={
          <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-slate-200 shadow-xl flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
          </div>
        }
      >
        <LoginContent />
      </Suspense>
    </div>
  );
}
