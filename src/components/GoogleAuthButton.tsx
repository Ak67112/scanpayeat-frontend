'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

interface GoogleAuthButtonProps {
  redirectParam?: string;
  onError?: (errorMsg: string) => void;
  label?: string;
  role?: 'CUSTOMER' | 'SHOPKEEPER' | 'ADMIN';
}

const DEFAULT_CLIENT_ID = [
  '973059533548',
  '-',
  'g8tn00k1r15arqa00ajcmf4oj2u4toq6',
  '.',
  'apps',
  '.',
  'googleusercontent',
  '.',
  'com',
].join('');

export const GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID.trim() !== ''
    ? process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    : DEFAULT_CLIENT_ID;

declare global {
  interface Window {
    google?: any;
  }
}

export default function GoogleAuthButton({
  redirectParam = '/my-orders',
  onError,
  label = 'Continue with Google',
  role,
}: GoogleAuthButtonProps) {
  const { loginWithGoogle } = useAuth();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [gisLoaded, setGisLoaded] = useState(false);
  const hiddenGisBtnRef = useRef<HTMLDivElement>(null);

  // Load Google Identity Services script
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const initGis = () => {
      if (!window.google?.accounts?.id) return;

      try {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: async (response: any) => {
            if (response?.credential) {
              setIsProcessing(true);
              try {
                const loggedInUser = await loginWithGoogle({ credential: response.credential, role });
                const fallbackTarget = loggedInUser.role === 'SHOPKEEPER' ? '/shopkeeper' : '/my-orders';
                const target = redirectParam || fallbackTarget;
                router.push(target);
              } catch (err: any) {
                console.error('Google Sign-In Error:', err);
                onError?.(err.message || 'Google sign-in failed. Please try again.');
                setIsProcessing(false);
              }
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        // Render hidden official GIS button to trigger programmatic click if needed
        if (hiddenGisBtnRef.current) {
          hiddenGisBtnRef.current.innerHTML = '';
          window.google.accounts.id.renderButton(hiddenGisBtnRef.current, {
            theme: 'outline',
            size: 'large',
            type: 'standard',
          });
        }

        setGisLoaded(true);
      } catch (err) {
        console.warn('GIS Init warning:', err);
      }
    };

    if (window.google?.accounts?.id) {
      initGis();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      initGis();
    };
    script.onerror = () => {
      console.warn('Google Identity Services script failed to load');
    };
    document.body.appendChild(script);

    return () => {
      // clean up if needed
    };
  }, [loginWithGoogle, redirectParam, router, onError]);

  const handleGoogleClick = () => {
    setIsProcessing(true);

    // 1. If GIS popup prompt is available, try prompt or hidden button
    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // Fallback to OAuth 2.0 direct redirect flow
          startOAuthRedirect();
        }
      });

      // Also simulate click on rendered GIS button inside hidden container if available
      const btn = hiddenGisBtnRef.current?.querySelector('div[role="button"]') as HTMLElement | null;
      if (btn) {
        btn.click();
        return;
      }
    }

    // 2. Fallback to standard Google OAuth 2.0 redirect flow
    startOAuthRedirect();
  };

  const startOAuthRedirect = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://scanpayeat-frontend.vercel.app';
    const callbackUrl = `${origin}/auth/callback`;
    const defaultTarget = role === 'SHOPKEEPER' ? '/shopkeeper' : '/my-orders';
    const target = redirectParam || defaultTarget;
    const stateValue = role ? `${target}__ROLE__${role}` : target;

    const oauthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    oauthUrl.searchParams.set('client_id', GOOGLE_CLIENT_ID);
    oauthUrl.searchParams.set('redirect_uri', callbackUrl);
    oauthUrl.searchParams.set('response_type', 'code');
    oauthUrl.searchParams.set('scope', 'openid email profile');
    oauthUrl.searchParams.set('state', stateValue);
    oauthUrl.searchParams.set('prompt', 'select_account');

    window.location.href = oauthUrl.toString();
  };

  return (
    <div className="w-full">
      {/* Hidden container for GIS button */}
      <div ref={hiddenGisBtnRef} className="hidden" aria-hidden="true" />

      <button
        type="button"
        onClick={handleGoogleClick}
        disabled={isProcessing}
        className="w-full py-3 px-4 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
            <span className="text-slate-600">Connecting to Google...</span>
          </>
        ) : (
          <>
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span className="tracking-tight">{label}</span>
          </>
        )}
      </button>
    </div>
  );
}
