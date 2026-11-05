'use client';

import React, { useState, useEffect } from 'react';
import { adminApi } from '../../lib/api';
import { Shop, ShopQrAnalytics } from '../../types';
import {
  QrCode,
  X,
  Loader2,
  RefreshCw,
  TrendingUp,
  Calendar,
  Clock,
  Eye,
  Store,
  UtensilsCrossed,
  ExternalLink,
  Copy,
  Check,
  Smartphone,
  Laptop,
  Flame,
  Layers,
  ArrowUpRight,
  Hash,
} from 'lucide-react';

interface ShopQrAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  shop: Shop | null;
}

export default function ShopQrAnalyticsModal({
  isOpen,
  onClose,
  shop,
}: ShopQrAnalyticsModalProps) {
  const [data, setData] = useState<ShopQrAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeView, setActiveView] = useState<'TABLES' | 'RECENT_FEED'>('TABLES');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && shop) {
      loadAnalytics();
    }
  }, [isOpen, shop]);

  const loadAnalytics = async () => {
    if (!shop) return;
    setIsLoading(true);
    try {
      const res = await adminApi.getShopQrAnalytics(shop.id);
      setData(res);
    } catch (err) {
      console.error('Failed to load shop QR analytics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  if (!isOpen || !shop) return null;

  const liveOrigin =
    typeof window !== 'undefined' && window.location.origin
      ? window.location.origin
      : 'https://www.hotelkada.com';

  const counterQrUrl = `${liveOrigin}/shop/${shop.slug}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center text-purple-300 shrink-0 shadow-inner">
              <QrCode className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  QR SCAN AUDIT
                </span>
                <span className="text-slate-400 text-xs hidden sm:inline">•</span>
                <span className="text-xs text-purple-200 font-mono truncate hidden sm:inline">
                  /shop/{shop.slug}
                </span>
              </div>
              <h3 className="font-extrabold text-base sm:text-lg tracking-tight truncate text-white mt-0.5">
                {shop.name}
              </h3>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={loadAnalytics}
              disabled={isLoading}
              title="Refresh scan counts"
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-6 space-y-5 bg-slate-50/50">
          {isLoading && !data ? (
            <div className="py-20 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-purple-600 mb-3" />
              <p className="text-xs font-bold text-slate-600">Calculating QR scans & table metrics...</p>
            </div>
          ) : data ? (
            <>
              {/* KPI Metrics Ribbon */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* Total Scans */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                  <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold">
                    <span>Total Scans</span>
                    <Eye className="w-3.5 h-3.5 text-purple-500" />
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-black text-slate-900 font-mono">
                      {data.summary.totalScans}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">all-time</span>
                  </div>
                </div>

                {/* Today's Scans */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                  <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold">
                    <span>Today&apos;s Scans</span>
                    <Clock className="w-3.5 h-3.5 text-emerald-500" />
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-black text-emerald-600 font-mono">
                      {data.summary.scansToday}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-bold">live today</span>
                  </div>
                </div>

                {/* Dining Tables Scans */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                  <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold">
                    <span>Dining Table QRs</span>
                    <UtensilsCrossed className="w-3.5 h-3.5 text-amber-500" />
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-black text-amber-600 font-mono">
                      {data.summary.diningScans}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">
                      {shop.tableCount ? `across ${shop.tableCount} tables` : 'tables'}
                    </span>
                  </div>
                </div>

                {/* Main / Counter QR */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                  <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold">
                    <span>Counter / Takeaway</span>
                    <Store className="w-3.5 h-3.5 text-blue-500" />
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-black text-blue-600 font-mono">
                      {data.summary.counterScans}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">
                      {data.summary.counterPercentage}% of total
                    </span>
                  </div>
                </div>
              </div>

              {/* View Switcher Bar */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-2 pt-1 flex-wrap gap-2">
                <div className="flex items-center bg-slate-200/70 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setActiveView('TABLES')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      activeView === 'TABLES'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Each QR Code Breakdown ({data.tables.length + 1})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveView('RECENT_FEED')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      activeView === 'RECENT_FEED'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Recent Live Scans ({data.recentScans.length})</span>
                  </button>
                </div>

                <span className="text-[11px] text-slate-500">
                  Last updated:{' '}
                  <strong>{new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</strong>
                </span>
              </div>

              {/* VIEW 1: QR CODES & TABLE BREAKDOWN */}
              {activeView === 'TABLES' && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                  <div className="p-3.5 bg-slate-100/60 border-b border-slate-200 flex items-center justify-between text-xs">
                    <span className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px]">
                      Active QR Codes for this Restaurant
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Tamper-proof standee QRs and counter menu links
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-extrabold uppercase tracking-wider text-[10px]">
                          <th className="p-3.5 w-12 text-center">#</th>
                          <th className="p-3.5">QR Code / Standee Target</th>
                          <th className="p-3.5">Target Scan URL</th>
                          <th className="p-3.5 text-right w-36">Scans Count</th>
                          <th className="p-3.5 text-right w-40">Last Scanned</th>
                          <th className="p-3.5 text-right w-24">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {/* Row 0: General Counter / Takeaway QR */}
                        <tr className="hover:bg-slate-50/80 transition bg-blue-50/20">
                          <td className="p-3.5 text-center font-bold text-blue-700">
                            <Store className="w-4 h-4 mx-auto text-blue-600" />
                          </td>
                          <td className="p-3.5">
                            <div className="flex items-center gap-1.5">
                              <span className="font-extrabold text-slate-900 text-xs">
                                Main Counter / Store QR
                              </span>
                              <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black bg-blue-100 text-blue-800 border border-blue-200">
                                TAKEAWAY
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400 block mt-0.5">
                              Default restaurant QR for general entrance &amp; takeout
                            </span>
                          </td>
                          <td className="p-3.5">
                            <span className="font-mono text-[10px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 block truncate max-w-[220px]">
                              {counterQrUrl}
                            </span>
                          </td>
                          <td className="p-3.5 text-right font-mono">
                            <div className="flex flex-col items-end">
                              <span className="font-black text-sm text-slate-900">
                                {data.summary.counterScans}
                              </span>
                              <span className="text-[10px] text-slate-400 font-semibold">
                                {data.summary.counterPercentage}% share
                              </span>
                            </div>
                          </td>
                          <td className="p-3.5 text-right text-slate-500 whitespace-nowrap text-[11px]">
                            {(() => {
                              const lastCounter = data.recentScans.find(
                                (s) => !s.tableNumber || s.tableNumber === 'COUNTER'
                              );
                              return lastCounter ? (
                                <span>
                                  {new Date(lastCounter.createdAt).toLocaleDateString('en-IN', {
                                    day: 'numeric',
                                    month: 'short',
                                  })}{' '}
                                  •{' '}
                                  {new Date(lastCounter.createdAt).toLocaleTimeString('en-IN', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                              ) : (
                                <span className="text-slate-400 italic">—</span>
                              );
                            })()}
                          </td>
                          <td className="p-3.5 text-right whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => handleCopy(counterQrUrl, 'counter')}
                              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition inline-flex items-center gap-1 text-[10px] font-bold cursor-pointer"
                              title="Copy URL"
                            >
                              {copiedKey === 'counter' ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3 text-slate-500" />
                              )}
                            </button>
                          </td>
                        </tr>

                        {/* Dining Table QRs */}
                        {data.tables.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="p-6 text-center text-slate-400">
                              This shop is in Counter / Takeaway mode (No physical dining tables configured).
                            </td>
                          </tr>
                        ) : (
                          data.tables.map((t) => {
                            const tableUrl = `${liveOrigin}/shop/${shop.slug}/table-${t.tableNumber}`;
                            const isHot = t.percentage >= 20;

                            return (
                              <tr key={t.tableNumber} className="hover:bg-slate-50/80 transition">
                                <td className="p-3.5 text-center font-bold text-slate-400 font-mono">
                                  #{t.tableNumber}
                                </td>
                                <td className="p-3.5">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-extrabold text-slate-900 text-xs">
                                      {t.label} Standee
                                    </span>
                                    {isHot && (
                                      <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black bg-amber-100 text-amber-800 border border-amber-200 inline-flex items-center gap-0.5">
                                        <Flame className="w-2.5 h-2.5 text-amber-600" />
                                        POPULAR
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[10px] text-slate-400 block mt-0.5">
                                    Physical Dining Table #{t.tableNumber}
                                  </span>
                                </td>
                                <td className="p-3.5">
                                  <span className="font-mono text-[10px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 block truncate max-w-[220px]">
                                    {tableUrl}
                                  </span>
                                </td>
                                <td className="p-3.5 text-right font-mono">
                                  <div className="flex flex-col items-end">
                                    <span className="font-black text-sm text-purple-950">
                                      {t.scans}
                                    </span>
                                    <div className="w-16 bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
                                      <div
                                        className="bg-purple-600 h-full rounded-full transition-all"
                                        style={{ width: `${Math.min(100, t.percentage)}%` }}
                                      />
                                    </div>
                                    <span className="text-[9px] text-slate-400 font-semibold mt-0.5">
                                      {t.percentage}% of total
                                    </span>
                                  </div>
                                </td>
                                <td className="p-3.5 text-right text-slate-500 whitespace-nowrap text-[11px]">
                                  {t.lastScannedAt ? (
                                    <span>
                                      {new Date(t.lastScannedAt).toLocaleDateString('en-IN', {
                                        day: 'numeric',
                                        month: 'short',
                                      })}{' '}
                                      •{' '}
                                      {new Date(t.lastScannedAt).toLocaleTimeString('en-IN', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                      })}
                                    </span>
                                  ) : (
                                    <span className="text-slate-400 italic">Not scanned yet</span>
                                  )}
                                </td>
                                <td className="p-3.5 text-right whitespace-nowrap">
                                  <button
                                    type="button"
                                    onClick={() => handleCopy(tableUrl, `table-${t.tableNumber}`)}
                                    className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition inline-flex items-center gap-1 text-[10px] font-bold cursor-pointer"
                                    title="Copy Table QR URL"
                                  >
                                    {copiedKey === `table-${t.tableNumber}` ? (
                                      <Check className="w-3 h-3 text-emerald-600" />
                                    ) : (
                                      <Copy className="w-3 h-3 text-slate-500" />
                                    )}
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* VIEW 2: RECENT LIVE SCANS AUDIT LOG */}
              {activeView === 'RECENT_FEED' && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                  <div className="p-3.5 bg-slate-100/60 border-b border-slate-200 flex items-center justify-between text-xs">
                    <span className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px]">
                      Live Audit Feed (Recent Scans)
                    </span>
                    <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      Live Events
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-extrabold uppercase tracking-wider text-[10px]">
                          <th className="p-3 w-36">Time</th>
                          <th className="p-3 w-32">Scanned Target</th>
                          <th className="p-3">Device / User Agent</th>
                          <th className="p-3 text-right w-28">IP Address</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                        {data.recentScans.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="p-8 text-center text-slate-400 font-sans">
                              No recent scans recorded yet.
                            </td>
                          </tr>
                        ) : (
                          data.recentScans.map((s) => {
                            const isMobile =
                              s.userAgent?.includes('Mobile') ||
                              s.userAgent?.includes('iPhone') ||
                              s.userAgent?.includes('Android');

                            return (
                              <tr key={s.id} className="hover:bg-slate-50 transition">
                                <td className="p-3 whitespace-nowrap text-slate-600">
                                  {new Date(s.createdAt).toLocaleDateString('en-IN', {
                                    day: 'numeric',
                                    month: 'short',
                                  })}{' '}
                                  •{' '}
                                  <span className="font-bold text-slate-900">
                                    {new Date(s.createdAt).toLocaleTimeString('en-IN', {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                      second: '2-digit',
                                    })}
                                  </span>
                                </td>
                                <td className="p-3">
                                  {s.tableNumber ? (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-200 font-sans">
                                      Table #{s.tableNumber}
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-900 border border-blue-200 font-sans">
                                      Counter QR
                                    </span>
                                  )}
                                </td>
                                <td className="p-3 font-sans">
                                  <div className="flex items-center gap-1.5 truncate max-w-md text-slate-600">
                                    {isMobile ? (
                                      <Smartphone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                    ) : (
                                      <Laptop className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                    )}
                                    <span className="truncate text-slate-700 text-xs">
                                      {s.userAgent || 'Customer Mobile Browser'}
                                    </span>
                                  </div>
                                </td>
                                <td className="p-3 text-right text-slate-400">
                                  {s.ipAddress || '—'}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="py-12 text-center text-slate-400">
              No analytics data could be retrieved for this shop.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100/80 border-t border-slate-200 flex items-center justify-between text-xs shrink-0">
          <span className="text-slate-500 font-medium">
            Hotel Kada Tamper-Proof QR Network Analytics
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
