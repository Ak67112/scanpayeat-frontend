'use client';

import React, { useEffect } from 'react';
import {
  CheckCircle2,
  Sparkles,
  Trash2,
  AlertTriangle,
  Check,
  X,
  Coins,
  IndianRupee,
  ArrowRight,
} from 'lucide-react';

export type ActionFeedbackType = 'CREATE' | 'UPDATE' | 'DELETE' | 'ERROR' | 'WALLET';

export interface ActionFeedbackData {
  isOpen: boolean;
  type: ActionFeedbackType;
  title: string;
  message?: string;
  entityName?: string;
}

interface ActionFeedbackModalProps {
  data: ActionFeedbackData | null;
  onClose: () => void;
  autoCloseDuration?: number; // ms, default 2400
}

export default function ActionFeedbackModal({
  data,
  onClose,
  autoCloseDuration = 2400,
}: ActionFeedbackModalProps) {
  useEffect(() => {
    if (!data || !data.isOpen) return;

    // Do not auto-close on ERROR so user can read the error message
    if (data.type === 'ERROR') return;

    const timer = setTimeout(() => {
      onClose();
    }, autoCloseDuration);

    return () => clearTimeout(timer);
  }, [data, onClose, autoCloseDuration]);

  if (!data || !data.isOpen) return null;

  const isCreate = data.type === 'CREATE';
  const isUpdate = data.type === 'UPDATE';
  const isDelete = data.type === 'DELETE';
  const isError = data.type === 'ERROR';
  const isWallet = data.type === 'WALLET';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200 select-none"
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-3xl p-6 sm:p-8 w-full max-w-sm shadow-2xl border text-center space-y-4 relative overflow-hidden animate-in zoom-in-95 duration-200 ${
          isCreate || isWallet
            ? 'border-emerald-200 shadow-emerald-500/10'
            : isUpdate
            ? 'border-amber-200 shadow-amber-500/10'
            : isDelete
            ? 'border-rose-200 shadow-rose-500/10'
            : 'border-rose-300 shadow-rose-600/15'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient Top Glow */}
        <div
          className={`absolute -top-10 -left-10 w-32 h-32 rounded-full blur-2xl pointer-events-none ${
            isCreate || isWallet
              ? 'bg-emerald-400/20'
              : isUpdate
              ? 'bg-amber-400/20'
              : 'bg-rose-400/20'
          }`}
        />
        <div
          className={`absolute -bottom-10 -right-10 w-32 h-32 rounded-full blur-2xl pointer-events-none ${
            isCreate || isWallet
              ? 'bg-teal-400/20'
              : isUpdate
              ? 'bg-orange-400/20'
              : 'bg-rose-400/20'
          }`}
        />

        {/* Close Icon in corner */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Central Animated Illustration / Icon */}
        <div className="relative mx-auto w-24 h-24 flex items-center justify-center pt-2">
          {/* Ripple rings */}
          <div
            className={`absolute inset-0 rounded-full animate-ping opacity-25 ${
              isCreate || isWallet
                ? 'bg-emerald-400'
                : isUpdate
                ? 'bg-amber-400'
                : 'bg-rose-400'
            }`}
          />
          <div
            className={`absolute inset-2 rounded-full animate-pulse opacity-40 ${
              isCreate || isWallet
                ? 'bg-emerald-300'
                : isUpdate
                ? 'bg-amber-300'
                : 'bg-rose-300'
            }`}
          />

          {/* Icon Badge Center */}
          {isCreate && (
            <div className="relative w-18 h-18 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 border-4 border-emerald-100 shadow-xl shadow-emerald-500/30 flex items-center justify-center text-white">
              <CheckCircle2 className="w-9 h-9 drop-shadow-md animate-bounce" />
              <div className="absolute -top-1 -right-1 p-1 bg-white rounded-full shadow-md text-amber-500">
                <Sparkles className="w-4 h-4 fill-amber-400 animate-spin" />
              </div>
            </div>
          )}

          {isWallet && (
            <div className="relative w-18 h-18 rounded-3xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-amber-500 border-4 border-emerald-100 shadow-xl shadow-emerald-500/30 flex items-center justify-center text-white animate-bounce">
              <Coins className="w-9 h-9 drop-shadow-md" />
              <div className="absolute -bottom-1 -right-1 p-1 bg-white rounded-full shadow-md text-emerald-600">
                <IndianRupee className="w-4 h-4 stroke-[3]" />
              </div>
            </div>
          )}

          {isUpdate && (
            <div className="relative w-18 h-18 rounded-3xl bg-gradient-to-tr from-amber-500 to-orange-500 border-4 border-amber-100 shadow-xl shadow-amber-500/30 flex items-center justify-center text-white">
              <Sparkles className="w-9 h-9 drop-shadow-md" />
              <div className="absolute -bottom-1 -right-1 p-1 bg-white rounded-full shadow-md text-emerald-600">
                <Check className="w-4 h-4 stroke-[3]" />
              </div>
            </div>
          )}

          {isDelete && (
            <div className="relative w-18 h-18 rounded-3xl bg-gradient-to-tr from-rose-500 to-red-600 border-4 border-rose-100 shadow-xl shadow-rose-500/30 flex items-center justify-center text-white">
              <Trash2 className="w-8 h-8 drop-shadow-md" />
            </div>
          )}

          {isError && (
            <div className="relative w-18 h-18 rounded-3xl bg-gradient-to-tr from-rose-600 to-red-700 border-4 border-rose-200 shadow-xl shadow-rose-600/30 flex items-center justify-center text-white">
              <AlertTriangle className="w-9 h-9 drop-shadow-md animate-pulse" />
            </div>
          )}
        </div>

        {/* Content & Labels */}
        <div className="space-y-1.5">
          <span
            className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
              isWallet
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : isCreate
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                : isUpdate
                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                : isDelete
                ? 'bg-rose-100 text-rose-800 border border-rose-200'
                : 'bg-rose-100 text-rose-900 border border-rose-300 font-mono'
            }`}
          >
            {isWallet
              ? '💰 Wallet Recharge Success'
              : isCreate
              ? '✨ Created Successfully'
              : isUpdate
              ? '⚡ Updated Successfully'
              : isDelete
              ? '🗑️ Deleted / Removed'
              : '⚠️ Action Failed'}
          </span>

          <h3 className="text-xl font-black text-slate-900 tracking-tight">
            {data.title}
          </h3>

          {data.entityName && (
            <p className="text-xs font-bold text-slate-700 truncate max-w-xs mx-auto">
              &quot;{data.entityName}&quot;
            </p>
          )}

          {data.message && (
            <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto pt-0.5">
              {data.message}
            </p>
          )}
        </div>

        {/* Dismiss / Action CTA */}
        <div className="pt-2">
          <button
            type="button"
            onClick={onClose}
            className={`w-full py-3 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition cursor-pointer flex items-center justify-center gap-1.5 ${
              isCreate || isWallet
                ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                : isUpdate
                ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20'
                : isDelete
                ? 'bg-slate-900 hover:bg-slate-800'
                : 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
            }`}
          >
            <span>{isError ? 'Dismiss' : 'Continue'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
