'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { Loader2, AlertCircle } from 'lucide-react';

function CallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { loginWithGoogle } = useAuth();
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
      setErrorMessage(`Google authentication was cancelled or failed (${error}).`);
      setTimeout(() => {
        router.push(`/login?error=${encodeURIComponent(error)}`);
      }, 3000);
      return;
    }

    if (!code) {
      setErrorMessage('No authorization code received from Google.');
      setTimeout(() => {
        router.push('/login');
      }, 2500);
      return;
    }

    const exchangeCode = async () => {
      try {
        const origin = window.location.origin;
        const redirectUri = `${origin}/auth/callback`;
        await loginWithGoogle({ code, redirectUri });

        // Navigate to the target redirect URL (e.g., /shop/jkans or /my-orders)
        const target = state ? decodeURIComponent(state) : '/my-orders';
        router.push(target);
      } catch (err: any) {
        console.error('Callback token exchange error:', err);
        setErrorMessage(err.message || 'Failed to authenticate with Google.');
        setTimeout(() => {
          router.push(`/login?error=${encodeURIComponent(err.message || 'auth_failed')}`);
        }, 3500);
      }
    };

    exchangeCode();
  }, [searchParams, router, loginWithGoogle]);

  return (
    <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-4">
      <div className="flex justify-center">
        <img
          src="/logo.png"
          alt="Scanner Pay Eat"
          className="h-10 mx-auto object-contain"
        />
      </div>

      {errorMessage ? (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl flex items-center gap-2.5 text-left">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <div>
            <p className="font-bold">Authentication Failed</p>
            <p className="text-[11px] text-rose-600 mt-0.5">{errorMessage}</p>
            <p className="text-[10px] text-slate-400 mt-2">Redirecting you back to sign in...</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3 py-4">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto" />
          <h2 className="text-lg font-black text-slate-900 font-display">
            Signing you in with Google...
          </h2>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Verifying your Google dining credentials and redirecting to your food order.
          </p>
        </div>
      )}
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-slate-50">
      <Suspense
        fallback={
          <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-slate-200 shadow-xl flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
          </div>
        }
      >
        <CallbackContent />
      </Suspense>
    </div>
  );
}
