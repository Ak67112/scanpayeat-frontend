'use client';

import React, { useState } from 'react';
import { adminApi } from '../../lib/api';
import { ShopkeeperWallet, WalletTransaction, User, Shop } from '../../types';
import {
  Wallet,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface WalletCreditModalProps {
  isOpen: boolean;
  onClose: () => void;
  target: any | null;
  onSuccess: (updatedWallet: ShopkeeperWallet, tx: WalletTransaction) => void;
}

export default function WalletCreditModal({
  isOpen,
  onClose,
  target,
  onSuccess,
}: WalletCreditModalProps) {
  const [amount, setAmount] = useState<string>('500');
  const [reference, setReference] = useState<string>('');
  const [notes, setNotes] = useState<string>('Admin balance recharge');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen || !target) return null;

  const shopkeeperId = target.shopkeeperId || target.id;
  const shopkeeperName = target.shopkeeper?.name || target.name || 'Shopkeeper';
  const shopName = target.shopkeeper?.shop?.name || target.shop?.name || 'Restaurant Outlet';
  const currentBalance = Number(target.balance ?? target.wallet?.balance ?? 0);
  const numAmount = parseFloat(amount) || 0;
  const newEstimatedBalance = currentBalance + numAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (numAmount <= 0) {
      setErrorMsg('Credit amount must be greater than zero.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const idempotencyKey = `ADM-CR-${shopkeeperId}-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      const res = await adminApi.creditWallet(shopkeeperId, {
        amount: numAmount,
        reference: reference.trim() || undefined,
        notes: notes.trim() || undefined,
        idempotencyKey,
      });

      setSuccessMsg(`Successfully credited ₹${numAmount.toFixed(2)} to ${shopkeeperName}!`);
      setTimeout(() => {
        onSuccess(res.wallet, res.transaction);
        onClose();
        setSuccessMsg(null);
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to credit wallet. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const quickAmounts = [100, 250, 500, 1000, 2000, 5000];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-purple-900 to-indigo-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-purple-300">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-tight">Credit Shopkeeper Wallet</h3>
              <p className="text-xs text-purple-200">
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

        {/* Content & Form */}
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

          {/* Balance Preview Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                Current Balance
              </span>
              <span className="text-lg font-black text-slate-900">
                ₹{currentBalance.toFixed(2)}
              </span>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400" />
            <div className="text-right">
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600 block">
                New Balance
              </span>
              <span className="text-lg font-black text-purple-700">
                ₹{newEstimatedBalance.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Quick Select Amounts */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Select or Enter Credit Amount (₹)
            </label>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {quickAmounts.map((amt) => (
                <button
                  type="button"
                  key={amt}
                  onClick={() => setAmount(String(amt))}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition border cursor-pointer ${
                    amount === String(amt)
                      ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  +₹{amt.toLocaleString('en-IN')}
                </button>
              ))}
            </div>

            <div className="relative">
              <span className="absolute left-3.5 top-2.5 font-bold text-slate-400 text-sm">₹</span>
              <input
                type="number"
                min="1"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Custom amount"
                className="w-full pl-8 pr-3.5 py-2.5 text-sm font-bold border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500 bg-white text-slate-900 placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Reference & Notes */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Transaction Reference <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="e.g. UPI-REF-99213 / Bank Transfer / Cash Ref"
                className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500 bg-white text-slate-900 placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Internal Notes / Description
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Reason for credit recharge"
                className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500 bg-white text-slate-900 placeholder:text-slate-400"
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
              disabled={isLoading || numAmount <= 0}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/20 transition flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing Credit...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Confirm & Add ₹{numAmount.toFixed(2)}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
