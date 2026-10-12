'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { adminApi } from '../../lib/api';
import { WalletTransaction, ShopkeeperWallet } from '../../types';
import {
  History,
  Search,
  Filter,
  RefreshCw,
  ArrowDownLeft,
  ArrowUpRight,
  Receipt,
  Store,
  Calendar,
  Wallet,
  TrendingUp,
  TrendingDown,
  Layers,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react';

interface WalletLedgerTabProps {
  initialShopkeeperFilter?: number | null;
  onClearShopkeeperFilter?: () => void;
}

export default function WalletLedgerTab({
  initialShopkeeperFilter,
  onClearShopkeeperFilter,
}: WalletLedgerTabProps) {
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [wallets, setWallets] = useState<ShopkeeperWallet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [selectedKeeperId, setSelectedKeeperId] = useState<string>(
    initialShopkeeperFilter ? String(initialShopkeeperFilter) : 'ALL'
  );
  const [dateFilter, setDateFilter] = useState<'ALL' | 'TODAY' | 'YESTERDAY' | 'WEEK' | 'MONTH'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    if (initialShopkeeperFilter) {
      setSelectedKeeperId(String(initialShopkeeperFilter));
    }
  }, [initialShopkeeperFilter]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [txRes, walletsRes] = await Promise.all([
        adminApi.getWalletTransactions({ limit: 100 }),
        adminApi.getWallets({ limit: 100 }).catch(() => ({ wallets: [] })),
      ]);
      setTransactions(txRes.transactions || []);
      setWallets(walletsRes.wallets || []);
    } catch (err) {
      console.error('Failed to load wallet transactions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter Transactions
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfYesterday = startOfToday - 24 * 60 * 60 * 1000;
    const startOfWeek = now.getTime() - 7 * 24 * 60 * 60 * 1000;
    const startOfMonth = now.getTime() - 30 * 24 * 60 * 60 * 1000;

    return transactions.filter((t) => {
      // Type filter
      if (typeFilter !== 'ALL' && t.type !== typeFilter) return false;

      // Shopkeeper filter
      if (selectedKeeperId !== 'ALL') {
        const kId = (t as any).shopkeeper?.id || (t as any).wallet?.shopkeeperId || (t as any).walletId;
        if (String(kId) !== selectedKeeperId) return false;
      }

      // Date filter
      if (dateFilter !== 'ALL') {
        const txTime = new Date(t.createdAt).getTime();
        if (dateFilter === 'TODAY' && txTime < startOfToday) return false;
        if (dateFilter === 'YESTERDAY' && (txTime < startOfYesterday || txTime >= startOfToday)) return false;
        if (dateFilter === 'WEEK' && txTime < startOfWeek) return false;
        if (dateFilter === 'MONTH' && txTime < startOfMonth) return false;
      }

      // Search query
      if (search.trim()) {
        const q = search.toLowerCase();
        const refMatch = t.reference?.toLowerCase().includes(q) ?? false;
        const notesMatch = t.notes?.toLowerCase().includes(q) ?? false;
        const keeperName = (t as any).shopkeeper?.name?.toLowerCase().includes(q) ?? false;
        const shopName = (t as any).shopkeeper?.shop?.name?.toLowerCase().includes(q) ?? false;
        return refMatch || notesMatch || keeperName || shopName;
      }

      return true;
    });
  }, [transactions, typeFilter, selectedKeeperId, dateFilter, search]);

  // Metrics from filtered transactions
  const totalCount = filteredTransactions.length;
  const totalCredits = filteredTransactions
    .filter((t) => t.type === 'CREDIT' || t.type === 'REFUND')
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const totalDebits = filteredTransactions
    .filter((t) => t.type === 'DEBIT')
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const netMovement = totalCredits - totalDebits;

  // Pagination
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const resetFilters = () => {
    setSearch('');
    setTypeFilter('ALL');
    setSelectedKeeperId('ALL');
    setDateFilter('ALL');
    setCurrentPage(1);
    if (onClearShopkeeperFilter) onClearShopkeeperFilter();
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-slate-800">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 inline-flex items-center gap-1.5">
              <History className="w-3.5 h-3.5" />
              FINANCIAL AUDIT LEDGER
            </span>
            <h2 className="text-xl sm:text-2xl font-black">
              Wallet Transactions Ledger
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm max-w-xl">
              Immutable audit ledger of all shopkeeper wallet credits, recharges, refunds, and adjustments across all restaurant outlets.
            </p>
          </div>
          <button
            onClick={loadData}
            disabled={isLoading}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Ledger</span>
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Transactions */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>Total Records</span>
            <Layers className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-black text-slate-900 font-mono">
            {totalCount}
          </p>
          <span className="text-[11px] text-slate-400 block">Filtered ledger rows</span>
        </div>

        {/* Total Credits */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>Total Inflow (Credits)</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-600 font-mono">
            +₹{totalCredits.toFixed(2)}
          </p>
          <span className="text-[11px] text-emerald-600/80 font-bold block">
            Online top-ups &amp; credits
          </span>
        </div>

        {/* Total Debits */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>Total Outflow (Debits)</span>
            <TrendingDown className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-black text-rose-600 font-mono">
            -₹{totalDebits.toFixed(2)}
          </p>
          <span className="text-[11px] text-rose-600/80 font-bold block">
            Deductions &amp; adjustments
          </span>
        </div>

        {/* Net Movement */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>Net Balance Movement</span>
            <Wallet className="w-4 h-4 text-purple-500" />
          </div>
          <p
            className={`text-2xl font-black font-mono ${
              netMovement >= 0 ? 'text-purple-600' : 'text-rose-600'
            }`}
          >
            {netMovement >= 0 ? `+₹${netMovement.toFixed(2)}` : `-₹${Math.abs(netMovement).toFixed(2)}`}
          </p>
          <span className="text-[11px] text-slate-400 block">Net financial impact</span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by Payment ID, reference, notes, keeper, outlet..."
              className="w-full text-xs pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500 focus:bg-white transition"
            />
          </div>

          {/* Shopkeeper Dropdown */}
          <div className="flex items-center gap-2">
            <Store className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedKeeperId}
              onChange={(e) => {
                setSelectedKeeperId(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-bold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-purple-500 cursor-pointer"
            >
              <option value="ALL">All Shopkeepers ({wallets.length})</option>
              {wallets.map((w) => (
                <option key={w.shopkeeperId} value={String(w.shopkeeperId)}>
                  {w.shopkeeper?.name || `Keeper #${w.shopkeeperId}`} (
                  {w.shopkeeper?.shop?.name || 'Shop'})
                </option>
              ))}
            </select>
          </div>

          {/* Date Filter */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-bold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-purple-500 cursor-pointer"
            >
              <option value="ALL">All Time</option>
              <option value="TODAY">Today</option>
              <option value="YESTERDAY">Yesterday</option>
              <option value="WEEK">Last 7 Days</option>
              <option value="MONTH">Last 30 Days</option>
            </select>
          </div>
        </div>

        {/* Type Filter Pills & Clear */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-500 mr-1">Type:</span>
            {['ALL', 'CREDIT', 'DEBIT', 'REFUND', 'ADJUSTMENT'].map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTypeFilter(t);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1 rounded-xl text-[11px] font-bold transition cursor-pointer ${
                  typeFilter === t
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {(search || typeFilter !== 'ALL' || selectedKeeperId !== 'ALL' || dateFilter !== 'ALL') && (
            <button
              onClick={resetFilters}
              className="text-[11px] font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer transition"
            >
              <X className="w-3.5 h-3.5" />
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left border-collapse text-xs min-w-[900px]">
            <thead>
              <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-700 font-extrabold uppercase tracking-wider text-[11px]">
                <th className="p-4 w-44">Date &amp; Time</th>
                <th className="p-4 w-48">Shopkeeper &amp; Outlet</th>
                <th className="p-4 w-28 text-center">Type</th>
                <th className="p-4 w-32 text-right">Amount</th>
                <th className="p-4 w-48 text-right">Balance Movement</th>
                <th className="p-4 w-44">Reference / Order</th>
                <th className="p-4">Notes &amp; Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-purple-600 mb-2" />
                    <span>Loading ledger records...</span>
                  </td>
                </tr>
              ) : paginatedTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400 space-y-2">
                    <History className="w-8 h-8 mx-auto text-slate-300" />
                    <p className="font-bold text-slate-600 text-sm">No transactions found</p>
                    <p className="text-xs text-slate-400">
                      Try clearing your search or adjusting filters.
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedTransactions.map((tx) => {
                  const isCredit = tx.type === 'CREDIT' || tx.type === 'REFUND';
                  const shopName = (tx as any).shopkeeper?.shop?.name || 'Restaurant';
                  const keeperName = (tx as any).shopkeeper?.name || `Keeper #${tx.walletId}`;
                  const keeperEmail = (tx as any).shopkeeper?.email || '';

                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/80 transition">
                      {/* Date & Time */}
                      <td className="p-4 whitespace-nowrap">
                        <span className="font-bold text-slate-900 block text-xs">
                          {new Date(tx.createdAt).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono block">
                          {new Date(tx.createdAt).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          })}
                        </span>
                      </td>

                      {/* Shopkeeper & Shop */}
                      <td className="p-4">
                        <span className="font-bold text-purple-700 block text-xs">
                          {shopName}
                        </span>
                        <span className="text-[11px] text-slate-600 font-medium block">
                          {keeperName}
                        </span>
                        {keeperEmail && (
                          <span className="text-[10px] text-slate-400 block truncate max-w-[180px]">
                            {keeperEmail}
                          </span>
                        )}
                      </td>

                      {/* Type */}
                      <td className="p-4 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold inline-flex items-center gap-1 border ${
                            tx.type === 'CREDIT'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : tx.type === 'DEBIT'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : tx.type === 'REFUND'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {isCredit ? (
                            <ArrowDownLeft className="w-3 h-3" />
                          ) : (
                            <ArrowUpRight className="w-3 h-3" />
                          )}
                          {tx.type}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="p-4 text-right whitespace-nowrap">
                        <span
                          className={`font-mono font-black text-sm ${
                            isCredit ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          {isCredit ? '+' : '-'}₹{Number(tx.amount).toFixed(2)}
                        </span>
                      </td>

                      {/* Balance Movement */}
                      <td className="p-4 text-right whitespace-nowrap">
                        <div className="font-mono text-xs text-slate-600 flex items-center justify-end gap-1.5">
                          <span className="text-slate-400">
                            ₹{Number(tx.previousBalance).toFixed(2)}
                          </span>
                          <span className="text-slate-300">→</span>
                          <span className="font-bold text-slate-900">
                            ₹{Number(tx.newBalance).toFixed(2)}
                          </span>
                        </div>
                      </td>

                      {/* Reference */}
                      <td className="p-4">
                        <span className="font-mono text-[11px] text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 block truncate max-w-[160px]">
                          {tx.reference || '—'}
                        </span>
                      </td>

                      {/* Notes */}
                      <td className="p-4 text-slate-600">
                        <span className="text-xs line-clamp-2">
                          {tx.notes || 'Wallet ledger adjustment'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 bg-slate-50/70 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="text-slate-500 font-medium">
              Showing {totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{' '}
              {Math.min(currentPage * pageSize, totalCount)} of {totalCount} records
            </span>
            <div className="flex items-center gap-1.5 text-slate-500">
              <span className="text-[11px] font-semibold">Rows:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-700 cursor-pointer focus:outline-hidden"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-bold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition flex items-center gap-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Prev</span>
            </button>
            <span className="px-3 py-1 font-bold text-slate-800 bg-white border border-slate-200 rounded-lg shadow-2xs">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-bold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition flex items-center gap-1"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
