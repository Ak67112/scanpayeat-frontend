'use client';

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import {
  UtensilsCrossed,
  ShieldAlert,
  ChefHat,
  ShoppingBag,
  Loader2,
  AlertCircle,
  KeyRound,
  Mail,
  Lock,
} from 'lucide-react';

type RoleTab = 'CUSTOMER' | 'SHOPKEEPER';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<RoleTab>('CUSTOMER');
  const [email, setEmail] = useState('customer@demo.com');
  const [password, setPassword] = useState('Customer@123');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleTabChange = (tab: RoleTab) => {
    setActiveTab(tab);
    setErrorMessage('');
    if (tab === 'CUSTOMER') {
      setEmail('customer@demo.com');
      setPassword('Customer@123');
    } else if (tab === 'SHOPKEEPER') {
      setEmail('shop@abc.com');
      setPassword('Shop@123');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      const user = await login(email, password, activeTab);

      // Redirect according to user role
      if (user.role === 'SHOPKEEPER') {
        router.push('/shopkeeper');
      } else {
        router.push('/shop/abc');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-slate-50">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        {/* Header Banner */}
        <div className="p-8 text-center bg-gradient-to-b from-amber-500/10 to-transparent border-b border-slate-100">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-white mx-auto shadow-md shadow-rose-500/20 mb-3">
            <UtensilsCrossed className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Portal Authentication
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Sign in to access your customer or shopkeeper dashboard
          </p>
        </div>

        {/* Role Selector Tabs (Customer and Shopkeeper only) */}
        <div className="p-4 bg-slate-100/70 border-b border-slate-200 flex gap-2">
          <button
            type="button"
            onClick={() => handleTabChange('CUSTOMER')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'CUSTOMER'
                ? 'bg-white text-emerald-800 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Customer</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('SHOPKEEPER')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'SHOPKEEPER'
                ? 'bg-white text-amber-800 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ChefHat className="w-3.5 h-3.5" />
            <span>Shopkeeper</span>
          </button>
        </div>

        {/* Login Form */}
        <div className="p-8">
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
                  className="w-full text-xs pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-white text-slate-900 placeholder:text-slate-400"
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
                  className="w-full text-xs pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-white text-slate-900 placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Quick Demo Fill Pill */}
            <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-2.5 text-[11px] text-amber-900 flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-medium">
                <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                Seeded demo credentials filled
              </span>
              <span className="font-mono text-[10px] bg-amber-100 px-1.5 py-0.5 rounded text-amber-800">
                {activeTab}
              </span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg transition flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <span>Sign In as {activeTab}</span>
              )}
            </button>
          </form>

          {/* Customer register link or info */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center text-xs text-slate-500">
            {activeTab === 'CUSTOMER' ? (
              <p>
                Don&apos;t have an account?{' '}
                <a
                  href="/register"
                  className="font-bold text-amber-600 hover:underline"
                >
                  Register Customer Account
                </a>
              </p>
            ) : (
              <p className="text-[11px] text-slate-400">
                Shopkeeper outlet logins are provisioned by Platform Admins.
              </p>
            )}

            <div className="mt-4 pt-3 border-t border-slate-100 text-center">
              <a
                href="/admin/login"
                className="text-[11px] text-slate-400 hover:text-slate-700 font-medium inline-flex items-center gap-1 transition"
              >
                <span>Platform Super Admin? Access Console</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
