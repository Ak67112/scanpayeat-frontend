'use client';

import React, { useState, Suspense } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ShieldAlert,
  Loader2,
  AlertCircle,
  KeyRound,
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  ArrowLeft,
  Clock,
} from 'lucide-react';

function AdminLoginContent() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isExpired = searchParams.get('expired') === '24h';

  const [email, setEmail] = useState('admin@scanpayeat.com');
  const [password, setPassword] = useState('Admin@123');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      const user = await login(email, password, 'ADMIN');
      if (user.role === 'ADMIN') {
        router.push('/admin');
      } else {
        throw new Error('Access denied. Administrator privileges required.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid administrator credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-slate-950 text-white relative overflow-hidden">
      {/* Decorative gradient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden relative z-10">
        {/* Top Header */}
        <div className="p-8 text-center bg-gradient-to-b from-purple-900/30 to-transparent border-b border-slate-800">
          <div className="bg-white/95 px-3 py-1.5 rounded-2xl inline-block shadow-md border border-slate-700/50 mb-4">
            <img
              src="/logo.png"
              alt="Scanner Pay Eat"
              className="h-8 w-auto object-contain"
            />
          </div>
          <br />
          <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30 mb-2">
            Restricted Access
          </span>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Super Admin Portal
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Authenticate to access platform outlets, revenue, and tenant controls
          </p>
        </div>

        {/* Login Form Body */}
        <div className="p-8 space-y-5">
          {isExpired && (
            <div className="p-3.5 bg-purple-950/80 border border-purple-500/50 text-purple-200 text-xs rounded-xl flex items-start gap-2.5 shadow-sm">
              <Clock className="w-4 h-4 shrink-0 text-purple-400 mt-0.5" />
              <div>
                <p className="font-bold">24-Hour Admin Session Expired</p>
                <p className="text-[11px] text-purple-300 mt-0.5">
                  For platform security, administrator sessions strictly expire every 24 hours. Please re-authenticate to continue.
                </p>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="p-3.5 bg-rose-950/60 border border-rose-800/80 text-rose-200 text-xs rounded-xl flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Admin Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@scanpayeat.com"
                  className="w-full text-xs pl-10 pr-3.5 py-2.5 border border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500 bg-slate-950 text-white placeholder:text-slate-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Admin Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs pl-10 pr-3.5 py-2.5 border border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500 bg-slate-950 text-white placeholder:text-slate-600"
                />
              </div>
            </div>

            {/* Default Admin Credentials Pill */}
            <div className="bg-purple-950/40 border border-purple-800/50 rounded-xl p-3 text-[11px] text-purple-200 flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-medium">
                <KeyRound className="w-3.5 h-3.5 text-purple-400" />
                Admin Default Account
              </span>
              <span className="font-mono text-[10px] bg-purple-900/60 text-purple-300 px-2 py-0.5 rounded border border-purple-700/50">
                admin@scanpayeat.com
              </span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-purple-600/30 transition flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authorizing Console Access...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Enter Super Admin Console</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          </form>

          {/* Navigation link back to standard login */}
          <div className="pt-4 border-t border-slate-800 text-center">
            <a
              href="/login"
              className="text-xs text-slate-400 hover:text-white transition inline-flex items-center gap-1.5 font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Customer & Shopkeeper Portal</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
        </div>
      }
    >
      <AdminLoginContent />
    </Suspense>
  );
}
