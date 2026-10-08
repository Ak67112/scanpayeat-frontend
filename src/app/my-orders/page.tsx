'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { publicApi, customerApi } from '../../lib/api';
import { Order } from '../../types';
import { useRouter } from 'next/navigation';
import {
  ShoppingBag,
  Clock,
  ArrowRight,
  Loader2,
  AlertCircle,
  Receipt,
  Store,
  CalendarRange,
  Filter,
  CheckCircle2,
  Printer,
  X,
  Search,
  Camera,
  Upload,
} from 'lucide-react';

type DatePreset = 'ALL' | 'TODAY' | 'YESTERDAY' | 'WEEK' | 'MONTH' | 'CUSTOM';

export default function MyOrdersPage() {
  const { user, isLoading: authLoading, refreshUser } = useAuth();
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  // Customer Profile Avatar Upload State
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');
  const [profileErrorMsg, setProfileErrorMsg] = useState('');

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setProfileErrorMsg('Please select a valid image file (JPG, PNG, WebP)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setProfileErrorMsg('Image size must be less than 5MB');
      return;
    }

    setIsUploadingAvatar(true);
    setProfileErrorMsg('');
    setProfileSuccessMsg('');
    try {
      const imageUrl = await customerApi.uploadAvatar(file);
      await customerApi.updateProfile({ avatarUrl: imageUrl });
      await refreshUser();
      setProfileSuccessMsg('Profile picture updated successfully!');
      setTimeout(() => setProfileSuccessMsg(''), 4000);
    } catch (err: any) {
      setProfileErrorMsg(err.message || 'Failed to upload photo');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Filters: Shops, Weeks / Date Presets, Custom Date Range
  const [selectedShopFilter, setSelectedShopFilter] = useState<string>('ALL');
  const [datePreset, setDatePreset] = useState<DatePreset>('ALL');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Receipt Modal State
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push('/login?redirect=/my-orders');
      return;
    }

    publicApi
      .getMyOrders()
      .then((data) => {
        setOrders(data.orders || []);
      })
      .catch((err) => {
        setErrorMessage(err.message || 'Unable to load orders');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [user, authLoading, router]);

  // Extract distinct restaurants that the user has ordered from
  const availableShops = useMemo(() => {
    const map = new Map<number, string>();
    orders.forEach((o) => {
      if (o.shopId) {
        map.set(o.shopId, o.shop?.name || `Shop #${o.shopId}`);
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [orders]);

  // Date range matcher
  const matchesDateRange = (
    dateStr: string,
    preset: DatePreset,
    start?: string,
    end?: string
  ): boolean => {
    if (preset === 'ALL' && !start && !end) return true;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return true;
    const now = new Date();

    if (preset === 'TODAY') {
      return (
        d.getDate() === now.getDate() &&
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear()
      );
    }

    if (preset === 'YESTERDAY') {
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      return (
        d.getDate() === yesterday.getDate() &&
        d.getMonth() === yesterday.getMonth() &&
        d.getFullYear() === yesterday.getFullYear()
      );
    }

    if (preset === 'WEEK') {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      sevenDaysAgo.setHours(0, 0, 0, 0);
      return d >= sevenDaysAgo && d <= now;
    }

    if (preset === 'MONTH') {
      return (
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear()
      );
    }

    if (preset === 'CUSTOM') {
      if (start) {
        const startDateObj = new Date(`${start}T00:00:00`);
        if (d < startDateObj) return false;
      }
      if (end) {
        const endDateObj = new Date(`${end}T23:59:59.999`);
        if (d > endDateObj) return false;
      }
      return true;
    }

    return true;
  };

  // Filtered orders with Shop, Date Preset, and Custom Date Range
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      // 1. Shop Filter
      if (selectedShopFilter !== 'ALL' && String(o.shopId) !== selectedShopFilter) {
        return false;
      }

      // 2. Date Range Filter
      if (!matchesDateRange(o.createdAt, datePreset, startDate, endDate)) {
        return false;
      }

      // 3. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesToken = (o.tokenNumber || '').toLowerCase().includes(q);
        const matchesShop = (o.shop?.name || '').toLowerCase().includes(q);
        const matchesItems = (o.items || []).some((it: any) =>
          (it.productName || it.product?.name || '').toLowerCase().includes(q)
        );
        if (!matchesToken && !matchesShop && !matchesItems && !String(o.id).includes(q)) {
          return false;
        }
      }

      return true;
    });
  }, [orders, selectedShopFilter, datePreset, startDate, endDate, searchQuery]);

  // Financial and status aggregations for filtered view
  const totalFilteredSpent = useMemo(() => {
    return filteredOrders
      .filter((o) => o.paymentStatus === 'PAID')
      .reduce((sum, o) => sum + Number(o.totalAmount ?? o.total ?? 0), 0);
  }, [filteredOrders]);

  const activeTicketsCount = useMemo(() => {
    return filteredOrders.filter(
      (o) => o.orderStatus === 'PENDING' || o.orderStatus === 'CONFIRMED' || o.orderStatus === 'PREPARING' || o.orderStatus === 'READY'
    ).length;
  }, [filteredOrders]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        <p className="text-sm font-semibold text-slate-600">Loading order history...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#FAF7F2] min-h-screen py-8 sm:py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Page Title & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-display">
              My Orders &amp; Receipts
            </h1>
            <p className="text-xs text-stone-500 mt-1 font-medium">
              Track live food prep, counter token numbers, and itemized billing history.
            </p>
          </div>

          <a
            href="/"
            className="self-start sm:self-auto px-4 py-2.5 bg-red-700 hover:bg-red-800 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <Store className="w-4 h-4" />
            <span>Explore Partner Menus</span>
          </a>
        </div>

        {/* Customer Profile Banner Card */}
        {user && (
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E8DFC8] shadow-xs flex flex-col sm:flex-row items-center sm:items-start justify-between gap-5">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5 text-center sm:text-left">
              {/* Avatar with Camera / Upload Button */}
              <div className="relative group shrink-0">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover ring-4 ring-red-100 shadow-md"
                  />
                ) : (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-red-700 to-amber-600 text-white font-black text-2xl flex items-center justify-center shadow-md ring-4 ring-red-100 font-display">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}

                {/* Upload Action Overlay */}
                <label
                  htmlFor="customer-avatar-input"
                  className="absolute bottom-0 right-0 p-2 bg-stone-900 hover:bg-red-700 text-white rounded-full shadow-lg border-2 border-white cursor-pointer transition hover:scale-110 active:scale-95"
                  title="Upload / Change profile photo"
                >
                  {isUploadingAvatar ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Camera className="w-3.5 h-3.5" />
                  )}
                  <input
                    id="customer-avatar-input"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    disabled={isUploadingAvatar}
                    className="hidden"
                  />
                </label>
              </div>

              {/* User Details */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 justify-center sm:justify-start flex-wrap">
                  <h2 className="text-lg sm:text-xl font-black text-stone-900 font-display">
                    {user.name}
                  </h2>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                    Active Diner
                  </span>
                </div>
                <p className="text-xs text-stone-500 font-medium">{user.email}</p>
                {user.mobile && (
                  <p className="text-xs text-stone-500 font-medium">Phone: {user.mobile}</p>
                )}
                <div className="pt-1 flex items-center gap-3 text-xs text-stone-600 justify-center sm:justify-start">
                  <label
                    htmlFor="customer-avatar-input"
                    className="text-xs font-bold text-red-700 hover:text-red-800 hover:underline cursor-pointer flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{user.avatarUrl ? 'Change Profile Photo' : 'Upload Profile Photo'}</span>
                  </label>
                </div>
                {profileSuccessMsg && (
                  <p className="text-xs text-emerald-700 font-bold animate-in fade-in pt-1">
                    ✓ {profileSuccessMsg}
                  </p>
                )}
                {profileErrorMsg && (
                  <p className="text-xs text-rose-600 font-bold animate-in fade-in pt-1">
                    ✕ {profileErrorMsg}
                  </p>
                )}
              </div>
            </div>

            {/* Orders & Spending Quick Counters */}
            <div className="flex items-center gap-6 border-t sm:border-t-0 sm:border-l border-[#E8DFC8] pt-3 sm:pt-0 sm:pl-6 w-full sm:w-auto justify-around sm:justify-end">
              <div className="text-center sm:text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                  Total Orders
                </span>
                <span className="text-xl font-black text-slate-900 font-display">
                  {orders.length}
                </span>
              </div>
              <div className="text-center sm:text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                  Total Spent
                </span>
                <span className="text-xl font-black text-emerald-700 font-display">
                  ₹{orders.filter((o) => o.paymentStatus === 'PAID').reduce((sum, o) => sum + Number(o.totalAmount ?? o.total ?? 0), 0).toFixed(0)}
                </span>
              </div>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* ================= INTERACTIVE FILTERS BAR ================= */}
        {orders.length > 0 && (
          <div className="bg-white rounded-3xl p-5 border border-[#E8DFC8] shadow-xs space-y-4">
            {/* Row 1: Shop Dropdown & Search Query */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-xs font-bold text-stone-500 flex items-center gap-1">
                  <Store className="w-3.5 h-3.5 text-amber-600" />
                  <span>Outlet:</span>
                </span>
                <select
                  value={selectedShopFilter}
                  onChange={(e) => setSelectedShopFilter(e.target.value)}
                  className="text-xs px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-bold text-stone-900 focus:ring-2 focus:ring-red-600"
                >
                  <option value="ALL">All Restaurants ({availableShops.length || 'All'})</option>
                  {availableShops.map((s) => (
                    <option key={s.id} value={String(s.id)}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search in orders */}
              <div className="relative min-w-[220px]">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  placeholder="Search token, dish name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-red-600 font-medium"
                />
              </div>
            </div>

            {/* Row 2: Date / Weeks Presets & Custom Calendar Pickers */}
            <div className="pt-3 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-bold text-stone-500 mr-1 flex items-center gap-1">
                  <CalendarRange className="w-3.5 h-3.5 text-red-700" />
                  <span>Time:</span>
                </span>
                {(
                  [
                    { key: 'ALL', label: 'All Dates' },
                    { key: 'TODAY', label: 'Today' },
                    { key: 'YESTERDAY', label: 'Yesterday' },
                    { key: 'WEEK', label: 'This Week' },
                    { key: 'MONTH', label: 'This Month' },
                    { key: 'CUSTOM', label: 'Custom Date' },
                  ] as const
                ).map((preset) => (
                  <button
                    key={preset.key}
                    type="button"
                    onClick={() => {
                      setDatePreset(preset.key);
                      if (preset.key !== 'CUSTOM') {
                        setStartDate('');
                        setEndDate('');
                      }
                    }}
                    className={`px-3 py-1.5 rounded-lg font-bold text-xs transition cursor-pointer ${
                      datePreset === preset.key
                        ? 'bg-red-700 text-white shadow-2xs'
                        : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {/* Custom Date Pickers */}
              {datePreset === 'CUSTOM' && (
                <div className="flex items-center gap-2 text-xs flex-wrap">
                  <span className="font-bold text-stone-600">From:</span>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-xs font-semibold text-stone-800 focus:ring-2 focus:ring-red-600"
                  />
                  <span className="font-bold text-stone-600">To:</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-xs font-semibold text-stone-800 focus:ring-2 focus:ring-red-600"
                  />
                  {(startDate || endDate) && (
                    <button
                      type="button"
                      onClick={() => {
                        setStartDate('');
                        setEndDate('');
                      }}
                      className="text-xs text-rose-600 hover:underline font-bold"
                    >
                      Clear
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Row 3: Summary Metrics Ribbon */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-stone-100">
              <div className="bg-[#FAF7F2] p-3 rounded-2xl border border-[#E8DFC8]">
                <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                  Filtered Orders
                </span>
                <span className="text-lg font-black text-stone-900">
                  {filteredOrders.length}
                </span>
              </div>

              <div className="bg-[#FAF7F2] p-3 rounded-2xl border border-[#E8DFC8]">
                <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                  Total Spent
                </span>
                <span className="text-lg font-black text-red-700">
                  ₹{totalFilteredSpent}
                </span>
              </div>

              <div className="bg-[#FAF7F2] p-3 rounded-2xl border border-[#E8DFC8]">
                <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                  Kitchen Active
                </span>
                <span className="text-lg font-black text-amber-600">
                  {activeTicketsCount}
                </span>
              </div>

              <div className="bg-[#FAF7F2] p-3 rounded-2xl border border-[#E8DFC8]">
                <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                  Total Ever Placed
                </span>
                <span className="text-lg font-black text-stone-700">
                  {orders.length}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ================= ORDER LIST ================= */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-[#E8DFC8] shadow-xs space-y-3">
            <ShoppingBag className="w-14 h-14 text-stone-300 mx-auto" />
            <h3 className="text-base font-bold text-stone-800">No Orders Yet</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              You haven&apos;t placed any orders yet. When at a dining table, scan the QR code to order!
            </p>
            <div className="pt-2">
              <a
                href="/"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-semibold"
              >
                <span>Discover How QR Dining Works</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-[#E8DFC8] shadow-xs space-y-3">
            <Filter className="w-10 h-10 text-stone-300 mx-auto" />
            <h3 className="text-sm font-bold text-stone-800">No Orders Found for Selected Filters</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Try choosing &apos;All Dates&apos; or changing your restaurant outlet filter.
            </p>
            <button
              onClick={() => {
                setSelectedShopFilter('ALL');
                setDatePreset('ALL');
                setStartDate('');
                setEndDate('');
                setSearchQuery('');
              }}
              className="px-4 py-2 bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const orderDate = new Date(order.createdAt);
              const dateFormatted = orderDate.toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              });
              const timeFormatted = orderDate.toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E8DFC8] shadow-xs hover:shadow-md transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="font-mono text-xs font-black bg-amber-100 text-amber-900 px-2.5 py-1 rounded-lg border border-amber-300">
                        TOKEN: #{order.tokenNumber || order.id}
                      </span>

                      <span
                        className={`text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                          order.orderStatus === 'COMPLETED'
                            ? 'bg-slate-100 text-slate-700 border border-slate-200'
                            : order.orderStatus === 'READY'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 animate-pulse'
                            : order.orderStatus === 'PREPARING'
                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}
                      >
                        {order.orderStatus}
                      </span>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          order.paymentStatus === 'PAID'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {order.paymentStatus}
                      </span>

                      <span className="text-xs text-stone-400 font-medium">
                        {dateFormatted} at {timeFormatted}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs font-bold text-stone-800">
                      <Store className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>{order.shop?.name || `Shop #${order.shopId}`}</span>
                    </div>

                    {/* Summary of items */}
                    <p className="text-xs text-stone-600 line-clamp-1">
                      {order.items?.map((i) => `${i.quantity}× ${i.productName || (i as any).product?.name || 'Item'}`).join(', ')}
                    </p>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-3 border-t md:border-t-0 pt-3 md:pt-0 border-stone-100 shrink-0">
                    <div className="text-left md:text-right">
                      <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Net Amount</p>
                      <p className="text-lg font-black text-stone-900">
                        ₹{Number(order.totalAmount ?? order.total ?? 0)}
                      </p>
                      {order.discountAmount && Number(order.discountAmount) > 0 && (
                        <p className="text-[10px] font-bold text-emerald-600">
                          -₹{Number(order.discountAmount)} saved
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedReceiptOrder(order)}
                        className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl border border-stone-200 transition flex items-center gap-1.5 cursor-pointer"
                        title="View Receipt"
                      >
                        <Receipt className="w-3.5 h-3.5 text-amber-600" />
                        <span>Ticket</span>
                      </button>

                      <a
                        href={`/order/${order.id}`}
                        className="px-3.5 py-2 bg-red-700 hover:bg-red-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                      >
                        <span>Live Status</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ================= MODAL: RECEIPT & BILL BREAKDOWN ================= */}
        {selectedReceiptOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
              {/* Header */}
              <div className="p-5 border-b border-stone-200 bg-gradient-to-r from-red-700 to-amber-600 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <Receipt className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-black text-base">Dining Receipt &amp; Token</h3>
                    <span className="text-xs font-mono bg-white/25 px-2 py-0.5 rounded-md font-bold">
                      Token #{selectedReceiptOrder.tokenNumber || selectedReceiptOrder.id} •{' '}
                      {selectedReceiptOrder.shop?.name || `Shop #${selectedReceiptOrder.shopId}`}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedReceiptOrder(null)}
                  className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-5 text-xs">
                {/* Order Metadata */}
                <div className="grid grid-cols-2 gap-3 bg-stone-50 p-3.5 rounded-2xl border border-stone-200">
                  <div>
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                      Date &amp; Time
                    </span>
                    <span className="font-semibold text-stone-800">
                      {new Date(selectedReceiptOrder.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}{' '}
                      •{' '}
                      {new Date(selectedReceiptOrder.createdAt).toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                      Kitchen Status
                    </span>
                    <span className="font-black text-red-700 uppercase">
                      {selectedReceiptOrder.orderStatus}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                      Outlet
                    </span>
                    <span className="font-bold text-stone-800">
                      {selectedReceiptOrder.shop?.name || `Shop #${selectedReceiptOrder.shopId}`}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                      Payment Status
                    </span>
                    <span
                      className={`font-black text-[11px] uppercase ${
                        selectedReceiptOrder.paymentStatus === 'PAID'
                          ? 'text-emerald-700'
                          : 'text-amber-700'
                      }`}
                    >
                      {selectedReceiptOrder.paymentStatus}
                    </span>
                  </div>
                </div>

                {/* Items List */}
                <div>
                  <h4 className="font-bold text-stone-900 mb-2 uppercase text-[11px] tracking-wider">
                    Itemized Order Breakdown ({selectedReceiptOrder.items?.length || 0})
                  </h4>
                  <div className="border border-stone-200 rounded-xl overflow-hidden divide-y divide-stone-100">
                    {(selectedReceiptOrder.items || []).map((it: any, idx: number) => {
                      const itemName = it.productName || it.product?.name || `Item #${idx + 1}`;
                      const unitPrice = Number(it.price || it.unitPrice || 0);
                      const lineTotal = Number(it.quantity || 1) * unitPrice;
                      return (
                        <div key={idx} className="p-3 flex items-center justify-between bg-white">
                          <div className="flex items-center gap-2.5">
                            <span className="w-6 h-6 rounded-md bg-amber-100 text-amber-900 font-black flex items-center justify-center text-xs">
                              {it.quantity}×
                            </span>
                            <div>
                              <span className="font-bold text-stone-800 block">{itemName}</span>
                              {unitPrice > 0 && (
                                <span className="text-[10px] text-stone-400">₹{unitPrice} each</span>
                              )}
                            </div>
                          </div>
                          <span className="font-black text-stone-900">
                            {lineTotal > 0 ? `₹${lineTotal}` : '—'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Financial Calculation */}
                <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200 space-y-1.5">
                  {selectedReceiptOrder.discountAmount &&
                    Number(selectedReceiptOrder.discountAmount) > 0 && (
                      <>
                        <div className="flex justify-between text-stone-600">
                          <span>Items Subtotal</span>
                          <span className="font-bold">
                            ₹
                            {Number(selectedReceiptOrder.totalAmount ?? selectedReceiptOrder.total ?? 0) +
                              Number(selectedReceiptOrder.discountAmount)}
                          </span>
                        </div>
                        <div className="flex justify-between text-emerald-700 font-bold">
                          <span>Discount Applied</span>
                          <span>-₹{Number(selectedReceiptOrder.discountAmount)}</span>
                        </div>
                      </>
                    )}
                  <div className="flex justify-between items-baseline pt-2 border-t border-amber-200">
                    <span className="font-extrabold text-stone-900 text-sm">Net Total</span>
                    <span className="font-black text-stone-900 text-xl font-mono">
                      ₹{Number(selectedReceiptOrder.totalAmount ?? selectedReceiptOrder.total ?? 0)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 py-2 bg-white border border-stone-300 hover:bg-stone-100 text-stone-700 font-bold rounded-xl transition inline-flex items-center gap-1.5 cursor-pointer text-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Receipt</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedReceiptOrder(null)}
                  className="px-4 py-2 bg-stone-900 hover:bg-black text-white font-bold rounded-xl text-xs transition cursor-pointer"
                >
                  Close Receipt
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
