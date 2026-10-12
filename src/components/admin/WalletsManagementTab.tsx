'use client';

import React, { useState, useEffect } from 'react';
import { adminApi } from '../../lib/api';
import { ShopkeeperWallet, WalletTransaction } from '../../types';
import {
  Wallet,
  PlusCircle,
  SlidersHorizontal,
  History,
  QrCode,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Power,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldCheck,
  TrendingUp,
  Receipt,
  Store,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import WalletLimitModal from './WalletLimitModal';
import WalletTransactionsModal from './WalletTransactionsModal';

export default function WalletsManagementTab() {
  const [wallets, setWallets] = useState<ShopkeeperWallet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'LOW_BALANCE' | 'QR_DISABLED'>('ALL');
  const [activeSubView, setActiveSubView] = useState<'WALLETS' | 'GLOBAL_LEDGER'>('WALLETS');

  // Pagination states
  const [walletsPage, setWalletsPage] = useState(1);
  const walletsPerPage = 8;
  const [ledgerPage, setLedgerPage] = useState(1);
  const ledgerPerPage = 10;

  // Global Ledger States
  const [globalTransactions, setGlobalTransactions] = useState<WalletTransaction[]>([]);
  const [isGlobalLedgerLoading, setIsGlobalLedgerLoading] = useState(false);
  const [globalLedgerTypeFilter, setGlobalLedgerTypeFilter] = useState('ALL');

  // Modal States
  const [limitModalTarget, setLimitModalTarget] = useState<ShopkeeperWallet | null>(null);
  const [txModalTarget, setTxModalTarget] = useState<ShopkeeperWallet | null>(null);

  // Toggle QR loading map
  const [togglingQrId, setTogglingQrId] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    loadWallets();
  }, []);

  const loadWallets = async () => {
    setIsLoading(true);
    try {
      const res = await adminApi.getWallets({ limit: 100 });
      setWallets(res.wallets || []);
    } catch (err) {
      console.error('Failed to load shopkeeper wallets:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadGlobalLedger = async () => {
    setIsGlobalLedgerLoading(true);
    try {
      const res = await adminApi.getWalletTransactions({ limit: 100 });
      setGlobalTransactions(res.transactions || []);
    } catch (err) {
      console.error('Failed to load global wallet transactions:', err);
    } finally {
      setIsGlobalLedgerLoading(false);
    }
  };

  const handleToggleQr = async (w: ShopkeeperWallet) => {
    setTogglingQrId(w.shopkeeperId);
    try {
      const newStatus = !w.isQrEnabled;
      await adminApi.updateWalletQrStatus(w.shopkeeperId, newStatus);
      setWallets((prev) =>
        prev.map((item) =>
          item.shopkeeperId === w.shopkeeperId ? { ...item, isQrEnabled: newStatus } : item
        )
      );
      setToastMessage(
        `QR payment ordering ${newStatus ? 'ENABLED' : 'PAUSED'} for ${w.shopkeeper?.name || 'Shopkeeper'}`
      );
      setTimeout(() => setToastMessage(null), 3500);
    } catch (err: any) {
      alert(err.message || 'Failed to update QR status');
    } finally {
      setTogglingQrId(null);
    }
  };

  // Metrics Calculations
  const totalWallets = wallets.length;
  const totalBalance = wallets.reduce((acc, w) => acc + Number(w.balance || 0), 0);
  const lowBalanceCount = wallets.filter((w) => Number(w.balance) < Number(w.minWalletLimit)).length;
  const totalDebits = wallets.reduce((acc, w) => acc + Number(w.totalDebits || 0), 0);

  // Filtered Wallets
  const filteredWallets = wallets.filter((w) => {
    const isLow = Number(w.balance) < Number(w.minWalletLimit);
    if (filterType === 'LOW_BALANCE' && !isLow) return false;
    if (filterType === 'QR_DISABLED' && w.isQrEnabled) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const name = w.shopkeeper?.name?.toLowerCase() || '';
      const email = w.shopkeeper?.email?.toLowerCase() || '';
      const shopName = w.shopkeeper?.shop?.name?.toLowerCase() || '';
      return name.includes(q) || email.includes(q) || shopName.includes(q);
    }
    return true;
  });

  // Paginated Wallets
  const totalWalletPages = Math.max(1, Math.ceil(filteredWallets.length / walletsPerPage));
  const paginatedWallets = filteredWallets.slice(
    (walletsPage - 1) * walletsPerPage,
    walletsPage * walletsPerPage
  );

  // Global Ledger Filtering & Pagination
  const filteredGlobalTx = globalTransactions.filter((tx) =>
    globalLedgerTypeFilter === 'ALL' ? true : tx.type === globalLedgerTypeFilter
  );
  const totalLedgerPages = Math.max(1, Math.ceil(filteredGlobalTx.length / ledgerPerPage));
  const paginatedGlobalTx = filteredGlobalTx.slice(
    (ledgerPage - 1) * ledgerPerPage,
    ledgerPage * ledgerPerPage
  );

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Active Wallets
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{totalWallets}</p>
          <p className="text-[11px] text-slate-400 mt-1">One wallet per shopkeeper</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Total Prepaid Balance
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-700">₹{totalBalance.toFixed(2)}</p>
          <p className="text-[11px] text-slate-400 mt-1">Platform-wide wallet reserve</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Low Balance / Paused
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-rose-700">{lowBalanceCount}</p>
          <p className="text-[11px] text-slate-400 mt-1">
            {lowBalanceCount > 0 ? 'QR payment blocked for these' : 'All outlets healthy'}
          </p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Total Platform Fees
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-indigo-900">₹{totalDebits.toFixed(2)}</p>
          <p className="text-[11px] text-slate-400 mt-1">Collected via QR order fees</p>
        </div>
      </div>

      {/* Sub-Tabs View Toggle */}
      <div className="flex items-center justify-between bg-white p-2 rounded-2xl border border-slate-200">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveSubView('WALLETS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center space-x-1.5 ${
              activeSubView === 'WALLETS'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>Shopkeeper Wallets ({wallets.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveSubView('GLOBAL_LEDGER');
              if (globalTransactions.length === 0) loadGlobalLedger();
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center space-x-1.5 ${
              activeSubView === 'GLOBAL_LEDGER'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Global Transactions Ledger</span>
          </button>
        </div>

        <button
          onClick={() => {
            if (activeSubView === 'WALLETS') loadWallets();
            else loadGlobalLedger();
          }}
          disabled={isLoading || isGlobalLedgerLoading}
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition cursor-pointer"
          title="Refresh data"
        >
          <RefreshCw
            className={`w-4 h-4 ${isLoading || isGlobalLedgerLoading ? 'animate-spin' : ''}`}
          />
        </button>
      </div>

      {/* VIEW 1: SHOPKEEPER WALLETS TABLE */}
      {activeSubView === 'WALLETS' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Table Header Filter Bar */}
          <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
            <div className="flex items-center space-x-1.5 overflow-x-auto scrollbar-none">
              <button
                onClick={() => setFilterType('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  filterType === 'ALL'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                All Outlets ({wallets.length})
              </button>
              <button
                onClick={() => setFilterType('LOW_BALANCE')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  filterType === 'LOW_BALANCE'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-rose-700 hover:bg-rose-50'
                }`}
              >
                Low Balance / Blocked ({lowBalanceCount})
              </button>
              <button
                onClick={() => setFilterType('QR_DISABLED')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  filterType === 'QR_DISABLED'
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                QR Paused
              </button>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search keeper or shop..."
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500 bg-white text-slate-900 placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto min-w-full">
            <table className="w-full min-w-[850px] text-left border-collapse text-xs">
              <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-700 font-extrabold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-4">Shopkeeper & Outlet</th>
                  <th className="p-4">Wallet Balance</th>
                  <th className="p-4">Min Limit & Health</th>
                  <th className="p-4">QR Ordering</th>
                  <th className="p-4">Credits / Debits</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-slate-400">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-purple-600 mb-2" />
                      <span>Loading shopkeeper wallets...</span>
                    </td>
                  </tr>
                ) : filteredWallets.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-slate-400">
                      <Wallet className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                      <p className="font-bold text-sm text-slate-600">No shopkeeper wallets found</p>
                      <p className="text-xs text-slate-400 mt-1">
                        Wallets are automatically created when shopkeepers are provisioned.
                      </p>
                    </td>
                  </tr>
                ) : (
                  paginatedWallets.map((w) => {
                    const bal = Number(w.balance);
                    const minLimit = Number(w.minWalletLimit);
                    const isBreached = bal < minLimit;
                    const isToggling = togglingQrId === w.shopkeeperId;

                    return (
                      <tr key={w.id} className="hover:bg-slate-50/80 transition">
                        {/* Shopkeeper info */}
                        <td className="p-4">
                          <span className="font-bold text-slate-900 block text-sm">
                            {w.shopkeeper?.name || `Shopkeeper #${w.shopkeeperId}`}
                          </span>
                          <span className="text-[11px] text-slate-500 block">
                            {w.shopkeeper?.email}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-700 mt-1">
                            <Store className="w-3 h-3" />
                            <span>{w.shopkeeper?.shop?.name || 'Restaurant Outlet'}</span>
                          </span>
                        </td>

                        {/* Balance */}
                        <td className="p-4">
                          <span
                            className={`font-black text-base ${
                              isBreached ? 'text-rose-600' : 'text-emerald-700'
                            }`}
                          >
                            ₹{bal.toFixed(2)}
                          </span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            Last updated:{' '}
                            {new Date(w.updatedAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                            })}
                          </span>
                        </td>

                        {/* Min Limit & Health */}
                        <td className="p-4">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs font-bold text-slate-700">
                              ₹{minLimit.toFixed(2)}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                                isBreached
                                  ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                  : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              }`}
                            >
                              {isBreached ? 'LOW LIMIT (BLOCKED)' : 'HEALTHY'}
                            </span>
                          </div>
                          {isBreached && (
                            <p className="text-[10px] text-rose-600 font-semibold mt-1">
                              Needs +₹{(minLimit - bal).toFixed(2)} to unblock QR
                            </p>
                          )}
                        </td>

                        {/* QR Enabled Status */}
                        <td className="p-4">
                          <button
                            type="button"
                            onClick={() => handleToggleQr(w)}
                            disabled={isToggling}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold inline-flex items-center gap-1 transition cursor-pointer border ${
                              w.isQrEnabled
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                            }`}
                            title="Click to toggle QR payment availability"
                          >
                            {isToggling ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <span
                                className={`w-2 h-2 rounded-full ${
                                  w.isQrEnabled ? 'bg-emerald-500' : 'bg-slate-400'
                                }`}
                              />
                            )}
                            <span>{w.isQrEnabled ? 'QR ACTIVE' : 'QR PAUSED'}</span>
                          </button>
                        </td>

                        {/* Credits / Debits */}
                        <td className="p-4 text-slate-600 text-[11px]">
                          <span className="text-emerald-700 font-bold block">
                            +₹{Number(w.totalCredits).toFixed(2)}{' '}
                            <span className="text-slate-400 font-normal">credited</span>
                          </span>
                          <span className="text-rose-700 font-bold block mt-0.5">
                            -₹{Number(w.totalDebits).toFixed(2)}{' '}
                            <span className="text-slate-400 font-normal">debited fees</span>
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="p-4 text-right space-x-1.5 whitespace-nowrap">
                          {/* Set Limit */}
                          <button
                            onClick={() => setLimitModalTarget(w)}
                            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg transition inline-flex items-center gap-1 cursor-pointer border border-slate-200"
                            title="Configure Minimum Balance Limit"
                          >
                            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-600" />
                            <span>Limit</span>
                          </button>

                          {/* View Ledger */}
                          <button
                            onClick={() => setTxModalTarget(w)}
                            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg transition inline-flex items-center gap-1 cursor-pointer border border-slate-200"
                            title="View Immutable Transaction History"
                          >
                            <History className="w-3.5 h-3.5 text-slate-600" />
                            <span>Ledger</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls for Wallets */}
          <div className="flex items-center justify-between p-4 border-t border-slate-200 bg-slate-50/50 text-xs">
            <span className="text-slate-500 font-medium">
              Showing {filteredWallets.length === 0 ? 0 : (walletsPage - 1) * walletsPerPage + 1} -{' '}
              {Math.min(walletsPage * walletsPerPage, filteredWallets.length)} of{' '}
              {filteredWallets.length} wallets
            </span>
            <div className="flex items-center space-x-2">
              <button
                disabled={walletsPage <= 1}
                onClick={() => setWalletsPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-bold hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer transition"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>
              <span className="font-bold text-slate-800 bg-white border border-slate-200 px-3 py-1 rounded-lg">
                {walletsPage} / {totalWalletPages}
              </span>
              <button
                disabled={walletsPage >= totalWalletPages}
                onClick={() => setWalletsPage((p) => Math.min(totalWalletPages, p + 1))}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-bold hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer transition"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: GLOBAL TRANSACTION LEDGER */}
      {activeSubView === 'GLOBAL_LEDGER' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Global Platform Transaction Ledger
              </h3>
              <p className="text-xs text-slate-500">
                Immutable audit record of all wallet credits, platform fee debits, and adjustments.
              </p>
            </div>

            <div className="flex items-center space-x-1.5">
              {['ALL', 'CREDIT', 'DEBIT', 'REFUND', 'ADJUSTMENT'].map((t) => (
                <button
                  key={t}
                  onClick={() => setGlobalLedgerTypeFilter(t)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                    globalLedgerTypeFilter === t
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto min-w-full">
            <table className="w-full min-w-[850px] text-left border-collapse text-xs">
              <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-700 font-extrabold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-4">Type & Timestamp</th>
                  <th className="p-4">Outlet & Shopkeeper</th>
                  <th className="p-4 text-right">Amount</th>
                  <th className="p-4 text-right">Balance Change</th>
                  <th className="p-4">Reference</th>
                  <th className="p-4">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isGlobalLedgerLoading ? (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-slate-400">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-purple-600 mb-2" />
                      <span>Loading global ledger...</span>
                    </td>
                  </tr>
                ) : globalTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-slate-400">
                      <History className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                      <p className="font-bold text-sm text-slate-600">No transactions recorded</p>
                    </td>
                  </tr>
                ) : (
                  paginatedGlobalTx.map((tx) => {
                    const isPlus = tx.type === 'CREDIT' || tx.type === 'REFUND';
                    return (
                      <tr key={tx.id} className="hover:bg-slate-50/70 transition">
                        <td className="p-4">
                          <span
                            className={`px-2 py-0.5 rounded-md font-bold text-[10px] inline-flex items-center gap-1 ${
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
                          <span className="text-[11px] text-slate-400 block mt-1">
                            {new Date(tx.createdAt).toLocaleString('en-IN', {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            })}
                          </span>
                        </td>

                        <td className="p-4">
                          <span className="font-bold text-slate-900 block">
                            {tx.shopkeeper?.name || 'Shopkeeper'}
                          </span>
                          <span className="text-[11px] text-purple-700 font-medium block">
                            {tx.shopkeeper?.shop?.name || 'Outlet'}
                          </span>
                        </td>

                        <td className="p-4 text-right">
                          <span
                            className={`font-black text-sm ${
                              isPlus ? 'text-emerald-700' : 'text-rose-700'
                            }`}
                          >
                            {isPlus ? '+' : '-'}₹{tx.amount.toFixed(2)}
                          </span>
                        </td>

                        <td className="p-4 text-right text-slate-600 font-mono text-[11px]">
                          ₹{tx.previousBalance.toFixed(2)}{' '}
                          <span className="text-slate-400">→</span>{' '}
                          <span className="font-bold text-slate-900">
                            ₹{tx.newBalance.toFixed(2)}
                          </span>
                        </td>

                        <td className="p-4">
                          <span className="font-mono text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200 font-bold block max-w-xs truncate">
                            {tx.reference}
                          </span>
                          {tx.orderId && (
                            <span className="text-[10px] text-purple-600 font-semibold block mt-0.5">
                              Order #{tx.orderId}
                            </span>
                          )}
                        </td>

                        <td className="p-4 text-slate-600 text-[11px] max-w-xs">
                          {tx.notes || '—'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls for Global Ledger */}
          <div className="flex items-center justify-between p-4 border-t border-slate-200 bg-slate-50/50 text-xs">
            <span className="text-slate-500 font-medium">
              Showing {filteredGlobalTx.length === 0 ? 0 : (ledgerPage - 1) * ledgerPerPage + 1} -{' '}
              {Math.min(ledgerPage * ledgerPerPage, filteredGlobalTx.length)} of{' '}
              {filteredGlobalTx.length} transactions
            </span>
            <div className="flex items-center space-x-2">
              <button
                disabled={ledgerPage <= 1}
                onClick={() => setLedgerPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-bold hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer transition"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>
              <span className="font-bold text-slate-800 bg-white border border-slate-200 px-3 py-1 rounded-lg">
                {ledgerPage} / {totalLedgerPages}
              </span>
              <button
                disabled={ledgerPage >= totalLedgerPages}
                onClick={() => setLedgerPage((p) => Math.min(totalLedgerPages, p + 1))}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-bold hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer transition"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Limit Modal */}
      <WalletLimitModal
        isOpen={!!limitModalTarget}
        onClose={() => setLimitModalTarget(null)}
        target={limitModalTarget}
        onSuccess={(shopkeeperId, newLimit) => {
          setWallets((prev) =>
            prev.map((item) =>
              item.shopkeeperId === shopkeeperId ? { ...item, minWalletLimit: newLimit } : item
            )
          );
        }}
      />

      {/* Transactions Modal */}
      <WalletTransactionsModal
        isOpen={!!txModalTarget}
        onClose={() => setTxModalTarget(null)}
        target={txModalTarget}
      />
    </div>
  );
}
