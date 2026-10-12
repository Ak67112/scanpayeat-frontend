'use client';

import React, { useState, useEffect } from 'react';
import { adminApi } from '../../lib/api';
import {
  SlidersHorizontal,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
} from 'lucide-react';

interface WalletLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  target: any | null;
  onSuccess: (shopkeeperId: number, newLimit: number) => void;
}

export default function WalletLimitModal({
  isOpen,
  onClose,
  target,
  onSuccess,
}: WalletLimitModalProps) {
  const [minLimit, setMinLimit] = useState<string>('100');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const shopkeeperId = target?.shopkeeperId || target?.id;
  const shopkeeperName = target?.shopkeeper?.name || target?.name || 'Shopkeeper';
  const shopName = target?.shopkeeper?.shop?.name || target?.shop?.name || 'Restaurant Outlet';
  const currentBalance = Number(target?.balance ?? target?.wallet?.balance ?? 0);
  const initialLimit = Number(target?.minWalletLimit ?? target?.wallet?.minWalletLimit ?? 0);

  useEffect(() => {
    if (target) {
      setMinLimit(String(initialLimit));
      setErrorMsg(null);
      setSuccessMsg(null);
    }
  }, [target, initialLimit]);

  if (!isOpen || !target) return null;

  const numLimit = parseFloat(minLimit) || 0;
  const isBreachedWithNewLimit = currentBalance < numLimit;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (numLimit < 0) {
      setErrorMsg('Minimum wallet limit cannot be negative.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await adminApi.setWalletLimit(shopkeeperId, numLimit);
      setSuccessMsg(`Minimum wallet limit updated to ₹${numLimit.toFixed(2)}`);
      setTimeout(() => {
        onSuccess(shopkeeperId, numLimit);
        onClose();
        setSuccessMsg(null);
      }, 900);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update minimum wallet limit.');
    } finally {
      setIsLoading(false);
    }
  };

  const quickLimits = [0, 50, 100, 250, 500, 1000];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-amber-400">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-tight">Set Minimum Wallet Limit</h3>
              <p className="text-xs text-slate-300">
                {shopkeeperName} • <span className="text-white font-medium">{shopName}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Explanation Banner */}
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 text-xs flex items-start gap-2.5">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Automated QR Payment Protection Rule</p>
              <p className="text-[11px] text-amber-800 mt-0.5">
                Before every new customer checkout, the platform checks if the shopkeeper&apos;s wallet balance is $\ge$ this limit. If balance is below the limit, new online QR orders are blocked for this outlet only.
              </p>
            </div>
          </div>

          {/* Balance vs Limit Preview Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                Current Balance
              </span>
              <span className="text-lg font-black text-slate-900">
                ₹{currentBalance.toFixed(2)}
              </span>
            </div>

            <div className="text-right">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                Projected Status
              </span>
              <span
                className={`text-xs font-black px-2.5 py-1 rounded-full inline-block mt-0.5 ${
                  isBreachedWithNewLimit
                    ? 'bg-rose-100 text-rose-800 border border-rose-200'
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                }`}
              >
                {isBreachedWithNewLimit ? 'LOW BALANCE (BLOCKED)' : 'HEALTHY (ACTIVE)'}
              </span>
            </div>
          </div>

          {/* Preset Buttons */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Configure Minimum Limit Threshold (₹)
            </label>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {quickLimits.map((lim) => (
                <button
                  type="button"
                  key={lim}
                  onClick={() => setMinLimit(String(lim))}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition border cursor-pointer ${
                    minLimit === String(lim)
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  ₹{lim.toLocaleString('en-IN')}
                </button>
              ))}
            </div>

            <div className="relative">
              <span className="absolute left-3.5 top-2.5 font-bold text-slate-400 text-sm">₹</span>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                value={minLimit}
                onChange={(e) => setMinLimit(e.target.value)}
                placeholder="0.00"
                className="w-full pl-8 pr-3.5 py-2.5 text-sm font-bold border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-slate-900 bg-white text-slate-900 placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || numLimit < 0}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs shadow-md shadow-slate-900/20 transition flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Limit...</span>
                </>
              ) : (
                <span>Save Minimum Limit</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
