'use client';

import React, { useState, useEffect } from 'react';
import { adminApi } from '../../lib/api';
import { WalletTransaction } from '../../types';
import {
  History,
  X,
  Loader2,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  Tag,
} from 'lucide-react';

interface WalletTransactionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  target: any | null;
}

export default function WalletTransactionsModal({
  isOpen,
  onClose,
  target,
}: WalletTransactionsModalProps) {
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');

  const shopkeeperId = target?.shopkeeperId || target?.id;
  const shopkeeperName = target?.shopkeeper?.name || target?.name || 'Shopkeeper';
  const shopName = target?.shopkeeper?.shop?.name || target?.shop?.name || 'Restaurant Outlet';
  const currentBalance = Number(target?.balance ?? target?.wallet?.balance ?? 0);
  const minLimit = Number(target?.minWalletLimit ?? target?.wallet?.minWalletLimit ?? 0);
  const isQrEnabled = target?.isQrEnabled ?? target?.wallet?.isQrEnabled ?? true;

  useEffect(() => {
    if (isOpen && shopkeeperId) {
      loadTransactions();
    }
  }, [isOpen, shopkeeperId]);

  const loadTransactions = async () => {
    setIsLoading(true);
    try {
      const res = await adminApi.getWalletTransactions({
        shopkeeperId,
        limit: 50,
      });
      setTransactions(res.transactions || []);
    } catch (err) {
      console.error('Failed to load wallet transactions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !target) return null;

  const filtered = transactions.filter((t) => {
    if (typeFilter !== 'ALL' && t.type !== typeFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const refMatch = t.reference.toLowerCase().includes(q);
      const notesMatch = t.notes?.toLowerCase().includes(q) ?? false;
      return refMatch || notesMatch;
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-purple-950 to-indigo-950 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-purple-300">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-tight">Wallet Transaction Ledger</h3>
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

        {/* Top Summary Bar */}
        <div className="bg-slate-50 border-b border-slate-200 p-4 grid grid-cols-3 gap-3 shrink-0">
          <div className="bg-white p-3 rounded-2xl border border-slate-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              Current Balance
            </span>
            <span className="text-base font-black text-slate-900">
              ₹{currentBalance.toFixed(2)}
            </span>
          </div>

          <div className="bg-white p-3 rounded-2xl border border-slate-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              Minimum Limit
            </span>
            <span className="text-base font-black text-purple-700">
              ₹{minLimit.toFixed(2)}
            </span>
          </div>

          <div className="bg-white p-3 rounded-2xl border border-slate-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              QR Status
            </span>
            <span
              className={`text-xs font-black px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                isQrEnabled
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              {isQrEnabled ? 'ENABLED' : 'PAUSED'}
            </span>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0 bg-white">
          <div className="flex items-center space-x-1.5 overflow-x-auto scrollbar-none">
            {['ALL', 'CREDIT', 'DEBIT', 'REFUND', 'ADJUSTMENT'].map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  typeFilter === t
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            <div className="relative w-48">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search ref or notes..."
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-purple-500 bg-white text-slate-900 placeholder:text-slate-400"
              />
            </div>
            <button
              onClick={loadTransactions}
              disabled={isLoading}
              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition cursor-pointer"
              title="Refresh ledger"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Ledger Table Container */}
        <div className="overflow-y-auto flex-1 p-0">
          {isLoading ? (
            <div className="p-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-purple-600 mb-2" />
              <p className="text-xs text-slate-500 font-medium">Fetching immutable ledger...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <History className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p className="font-bold text-sm text-slate-600">No transactions recorded yet</p>
              <p className="text-xs text-slate-400 mt-1">
                Transactions appear automatically when credits are added or order fees are debited.
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead className="sticky top-0 bg-slate-100 border-b border-slate-200 text-slate-700 font-extrabold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3.5">Type & Date</th>
                  <th className="p-3.5 text-right">Amount</th>
                  <th className="p-3.5 text-right">Balance Change</th>
                  <th className="p-3.5">Reference</th>
                  <th className="p-3.5">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((tx) => {
                  const isPlus = tx.type === 'CREDIT' || tx.type === 'REFUND';
                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/70 transition">
                      <td className="p-3.5">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`p-1.5 rounded-lg font-bold text-[10px] inline-flex items-center gap-1 ${
                              tx.type === 'CREDIT'
                                ? 'bg-emerald-100 text-emerald-800'
                                : tx.type === 'DEBIT'
                                ? 'bg-rose-100 text-rose-800'
                                : tx.type === 'REFUND'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-purple-100 text-purple-800'
                            }`}
                          >
                            {isPlus ? (
                              <ArrowDownLeft className="w-3 h-3" />
                            ) : (
                              <ArrowUpRight className="w-3 h-3" />
                            )}
                            <span>{tx.type}</span>
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 block mt-1">
                          {new Date(tx.createdAt).toLocaleString('en-IN', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </span>
                      </td>

                      <td className="p-3.5 text-right">
                        <span
                          className={`font-black text-sm ${
                            isPlus ? 'text-emerald-700' : 'text-rose-700'
                          }`}
                        >
                          {isPlus ? '+' : '-'}₹{tx.amount.toFixed(2)}
                        </span>
                      </td>

                      <td className="p-3.5 text-right text-slate-600 font-mono text-[11px]">
                        ₹{tx.previousBalance.toFixed(2)} <span className="text-slate-400">→</span>{' '}
                        <span className="font-bold text-slate-900">
                          ₹{tx.newBalance.toFixed(2)}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <span className="font-mono text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200 font-bold block max-w-xs truncate">
                          {tx.reference}
                        </span>
                        {tx.orderId && (
                          <span className="text-[10px] text-purple-600 font-semibold block mt-0.5">
                            Order #{tx.orderId}
                          </span>
                        )}
                      </td>

                      <td className="p-3.5 text-slate-600 text-[11px] max-w-xs">
                        {tx.notes || '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>Showing {filtered.length} entries</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-black text-white font-bold rounded-xl transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
