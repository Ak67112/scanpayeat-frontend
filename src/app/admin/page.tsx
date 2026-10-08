'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { adminApi } from '../../lib/api';
import { Shop, User, Order, AdminStats, ShopSalesMetric } from '../../types';
import { useRouter } from 'next/navigation';
import {
  ShieldAlert,
  Store,
  Users,
  Receipt,
  DollarSign,
  Plus,
  RefreshCw,
  QrCode,
  Power,
  ExternalLink,
  Search,
  LogOut,
  LayoutDashboard,
  CheckCircle2,
  XCircle,
  FileCode,
  ArrowUpRight,
  TrendingUp,
  AlertCircle,
  Loader2,
  SlidersHorizontal,
  Edit2,
  Trash2,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  AlertTriangle,
  Building2,
  Calendar,
  Tag,
  Gift,
  CalendarRange,
  Filter,
  Printer,
} from 'lucide-react';

type AdminTab = 'OVERVIEW' | 'OUTLETS_SALES' | 'SHOPS' | 'SHOPKEEPERS' | 'ORDERS' | 'COUPONS';
type DatePreset = 'ALL' | 'TODAY' | 'YESTERDAY' | 'WEEK' | 'MONTH' | 'CUSTOM';

export default function AdminDashboard() {
  const { user, logout, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<AdminTab>('OVERVIEW');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [shops, setShops] = useState<Shop[]>([]);
  const [shopkeepers, setShopkeepers] = useState<(User & { shop: Shop })[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Filters
  const [orderShopFilter, setOrderShopFilter] = useState<string>('ALL');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('ALL');
  const [keeperShopFilter, setKeeperShopFilter] = useState<string>('ALL');
  const [couponScopeFilter, setCouponScopeFilter] = useState<string>('ALL');

  // Date Filters
  const [orderDatePreset, setOrderDatePreset] = useState<DatePreset>('ALL');
  const [orderStartDate, setOrderStartDate] = useState<string>('');
  const [orderEndDate, setOrderEndDate] = useState<string>('');

  const [salesDatePreset, setSalesDatePreset] = useState<DatePreset>('ALL');
  const [salesStartDate, setSalesStartDate] = useState<string>('');
  const [salesEndDate, setSalesEndDate] = useState<string>('');

  // Selected receipt modal
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<Order | null>(null);

  // Coupon Modals & Form
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscountType, setCouponDiscountType] = useState('FIXED');
  const [couponDiscountValue, setCouponDiscountValue] = useState('');
  const [couponMinOrder, setCouponMinOrder] = useState('');
  const [couponMaxDiscount, setCouponMaxDiscount] = useState('');
  const [couponShopId, setCouponShopId] = useState<string>('GLOBAL');
  const [isSubmittingCoupon, setIsSubmittingCoupon] = useState(false);
  const [couponError, setCouponError] = useState('');

  const [deleteCouponTarget, setDeleteCouponTarget] = useState<any | null>(null);
  const [isDeletingCoupon, setIsDeletingCoupon] = useState(false);

  // Pagination states
  const [couponsPage, setCouponsPage] = useState(1);
  const couponsPerPage = 10;

  // Pagination states
  const [shopsPage, setShopsPage] = useState(1);
  const shopsPerPage = 8;
  const [keepersPage, setKeepersPage] = useState(1);
  const keepersPerPage = 8;
  const [ordersPage, setOrdersPage] = useState(1);
  const ordersPerPage = 12;
  const [salesPage, setSalesPage] = useState(1);
  const salesPerPage = 8;

  // New Shop modal
  const [showShopModal, setShowShopModal] = useState(false);
  const [shopName, setShopName] = useState('');
  const [shopSlug, setShopSlug] = useState('');
  const [shopSubdomain, setShopSubdomain] = useState('');
  const [shopAddress, setShopAddress] = useState('');
  const [shopPhone, setShopPhone] = useState('');
  const [isSubmittingShop, setIsSubmittingShop] = useState(false);

  // Edit Shop modal
  const [showEditShopModal, setShowEditShopModal] = useState(false);
  const [editShopId, setEditShopId] = useState<number | null>(null);
  const [editShopName, setEditShopName] = useState('');
  const [editShopSlug, setEditShopSlug] = useState('');
  const [editShopSubdomain, setEditShopSubdomain] = useState('');
  const [editShopAddress, setEditShopAddress] = useState('');
  const [editShopPhone, setEditShopPhone] = useState('');
  const [isSubmittingEditShop, setIsSubmittingEditShop] = useState(false);

  // Delete Shop confirmation
  const [deleteShopTarget, setDeleteShopTarget] = useState<Shop | null>(null);
  const [isDeletingShop, setIsDeletingShop] = useState(false);

  // New Shopkeeper modal
  const [showKeeperModal, setShowKeeperModal] = useState(false);
  const [keeperName, setKeeperName] = useState('');
  const [keeperEmail, setKeeperEmail] = useState('');
  const [keeperMobile, setKeeperMobile] = useState('');
  const [keeperShopId, setKeeperShopId] = useState<number | ''>('');
  const [keeperPassword, setKeeperPassword] = useState('');
  const [isSubmittingKeeper, setIsSubmittingKeeper] = useState(false);

  // Edit Shopkeeper modal
  const [showEditKeeperModal, setShowEditKeeperModal] = useState(false);
  const [editKeeperId, setEditKeeperId] = useState<number | null>(null);
  const [editKeeperName, setEditKeeperName] = useState('');
  const [editKeeperEmail, setEditKeeperEmail] = useState('');
  const [editKeeperMobile, setEditKeeperMobile] = useState('');
  const [editKeeperShopId, setEditKeeperShopId] = useState<number | ''>('');
  const [editKeeperPassword, setEditKeeperPassword] = useState('');
  const [isSubmittingEditKeeper, setIsSubmittingEditKeeper] = useState(false);

  // Delete Shopkeeper confirmation
  const [deleteKeeperTarget, setDeleteKeeperTarget] = useState<User | null>(null);
  const [isDeletingKeeper, setIsDeletingKeeper] = useState(false);

  // QR Modal
  const [selectedQrShop, setSelectedQrShop] = useState<Shop | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== 'ADMIN') {
      router.push('/admin/login');
    }
  }, [user, authLoading, router]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [dashRes, shopsRes, keepersRes, ordersRes, couponsRes] = await Promise.all([
        adminApi.getDashboard().catch(() => ({ stats: null })),
        adminApi.getShops().catch(() => ({ shops: [] })),
        adminApi.getShopkeepers().catch(() => ({ shopkeepers: [] })),
        adminApi.getOrders().catch(() => ({ orders: [] })),
        adminApi.getCoupons().catch(() => ({ coupons: [] })),
      ]);

      if (dashRes?.stats) setStats(dashRes.stats);
      else if (dashRes && !('stats' in dashRes) && (dashRes as any).totalShops !== undefined) setStats(dashRes as any);

      const incomingShops = Array.isArray(shopsRes) ? shopsRes : (shopsRes?.shops || []);
      const incomingKeepers = Array.isArray(keepersRes) ? keepersRes : (keepersRes?.shopkeepers || []);
      const incomingOrders = Array.isArray(ordersRes) ? ordersRes : (ordersRes?.orders || []);
      const incomingCoupons = Array.isArray(couponsRes) ? couponsRes : (couponsRes?.coupons || []);

      setShops(Array.isArray(incomingShops) ? incomingShops : []);
      setShopkeepers(Array.isArray(incomingKeepers) ? incomingKeepers as any : []);
      setOrders(Array.isArray(incomingOrders) ? incomingOrders : []);
      setCoupons(Array.isArray(incomingCoupons) ? incomingCoupons : []);
    } catch (err: any) {
      console.error('Failed to load admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Coupon Action Handlers
  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim() || !couponDiscountValue) return;
    setIsSubmittingCoupon(true);
    setCouponError('');
    try {
      const res = await adminApi.createCoupon({
        code: couponCode.trim().toUpperCase(),
        discountType: couponDiscountType,
        discountValue: parseFloat(couponDiscountValue),
        minOrderAmount: couponMinOrder ? parseFloat(couponMinOrder) : 0,
        maxDiscount: couponMaxDiscount ? parseFloat(couponMaxDiscount) : undefined,
        shopId: couponShopId === 'GLOBAL' ? null : Number(couponShopId),
      });
      setCoupons((prev) => [res.coupon, ...prev]);
      setShowCouponModal(false);
      setCouponCode('');
      setCouponDiscountValue('');
      setCouponMinOrder('');
      setCouponMaxDiscount('');
      setCouponShopId('GLOBAL');
    } catch (err: any) {
      setCouponError(err.message || 'Failed to create coupon');
    } finally {
      setIsSubmittingCoupon(false);
    }
  };

  const handleDeleteCoupon = async () => {
    if (!deleteCouponTarget) return;
    setIsDeletingCoupon(true);
    try {
      await adminApi.deleteCoupon(deleteCouponTarget.id);
      setCoupons((prev) => prev.filter((c) => c.id !== deleteCouponTarget.id));
      setDeleteCouponTarget(null);
    } catch (err: any) {
      alert(err.message || 'Failed to delete coupon');
    } finally {
      setIsDeletingCoupon(false);
    }
  };

  const handleToggleCouponStatus = async (id: number, current: boolean) => {
    try {
      await adminApi.toggleCoupon(id, !current);
      setCoupons((prev) =>
        prev.map((c) => (c.id === id ? { ...c, isActive: !current } : c))
      );
    } catch (err: any) {
      alert(err.message || 'Failed to toggle coupon status');
    }
  };

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      loadData();
    }
  }, [user]);

  // Toggle Shop Active status
  const handleToggleShopStatus = async (shopId: number, currentStatus: boolean) => {
    try {
      await adminApi.updateShopStatus(shopId, !currentStatus);
      setShops((prev) =>
        prev.map((s) => (s.id === shopId ? { ...s, isActive: !currentStatus } : s))
      );
    } catch (err: any) {
      alert(err.message || 'Failed to update shop status');
    }
  };

  // Toggle Shopkeeper Active status
  const handleToggleKeeperStatus = async (keeperId: number, currentStatus: boolean) => {
    try {
      await adminApi.updateShopkeeperStatus(keeperId, !currentStatus);
      setShopkeepers((prev) =>
        prev.map((k) => (k.id === keeperId ? { ...k, isActive: !currentStatus } : k))
      );
    } catch (err: any) {
      alert(err.message || 'Failed to update shopkeeper status');
    }
  };

  // Create Shop
  const handleCreateShop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopName || !shopSlug || !shopSubdomain) return;
    setIsSubmittingShop(true);
    try {
      const res = await adminApi.createShop({
        name: shopName,
        slug: shopSlug.toLowerCase(),
        subdomain: shopSubdomain.toLowerCase(),
        address: shopAddress || undefined,
        phone: shopPhone || undefined,
      });
      setShops((prev) => [res.shop, ...prev]);
      setShowShopModal(false);
      setShopName('');
      setShopSlug('');
      setShopSubdomain('');
      setShopAddress('');
      setShopPhone('');
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to create shop');
    } finally {
      setIsSubmittingShop(false);
    }
  };

  // Open Edit Shop
  const openEditShop = (shop: Shop) => {
    setEditShopId(shop.id);
    setEditShopName(shop.name);
    setEditShopSlug(shop.slug);
    setEditShopSubdomain(shop.subdomain);
    setEditShopAddress(shop.address || '');
    setEditShopPhone(shop.phone || '');
    setShowEditShopModal(true);
  };

  // Submit Edit Shop
  const handleEditShop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editShopId || !editShopName || !editShopSlug || !editShopSubdomain) return;
    setIsSubmittingEditShop(true);
    try {
      const res = await adminApi.updateShop(editShopId, {
        name: editShopName,
        slug: editShopSlug.toLowerCase(),
        subdomain: editShopSubdomain.toLowerCase(),
        address: editShopAddress || undefined,
        phone: editShopPhone || undefined,
      });
      setShops((prev) =>
        prev.map((s) => (s.id === editShopId ? { ...s, ...res.shop } : s))
      );
      setShowEditShopModal(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to update shop');
    } finally {
      setIsSubmittingEditShop(false);
    }
  };

  // Delete Shop
  const handleDeleteShop = async () => {
    if (!deleteShopTarget) return;
    setIsDeletingShop(true);
    try {
      await adminApi.deleteShop(deleteShopTarget.id);
      setShops((prev) => prev.filter((s) => s.id !== deleteShopTarget.id));
      setDeleteShopTarget(null);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete shop');
    } finally {
      setIsDeletingShop(false);
    }
  };

  // Create Shopkeeper
  const handleCreateKeeper = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keeperName || !keeperEmail || !keeperPassword || !keeperShopId) return;
    setIsSubmittingKeeper(true);
    try {
      const res = await adminApi.createShopkeeper({
        name: keeperName,
        email: keeperEmail.toLowerCase(),
        mobile: keeperMobile || undefined,
        shopId: Number(keeperShopId),
        password: keeperPassword,
      });
      const targetShop = shops.find((s) => s.id === Number(keeperShopId));
      setShopkeepers((prev) => [
        { ...res.shopkeeper, shop: targetShop || ({} as Shop) },
        ...prev,
      ]);
      setShowKeeperModal(false);
      setKeeperName('');
      setKeeperEmail('');
      setKeeperMobile('');
      setKeeperShopId('');
      setKeeperPassword('');
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to provision shopkeeper');
    } finally {
      setIsSubmittingKeeper(false);
    }
  };

  // Open Edit Shopkeeper
  const openEditKeeper = (keeper: User & { shop: Shop }) => {
    setEditKeeperId(keeper.id);
    setEditKeeperName(keeper.name);
    setEditKeeperEmail(keeper.email);
    setEditKeeperMobile(keeper.mobile || '');
    setEditKeeperShopId(keeper.shopId || '');
    setEditKeeperPassword('');
    setShowEditKeeperModal(true);
  };

  // Submit Edit Shopkeeper
  const handleEditKeeper = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editKeeperId || !editKeeperName || !editKeeperEmail) return;
    setIsSubmittingEditKeeper(true);
    try {
      const res = await adminApi.updateShopkeeper(editKeeperId, {
        name: editKeeperName,
        email: editKeeperEmail.toLowerCase(),
        mobile: editKeeperMobile || undefined,
        shopId: editKeeperShopId ? Number(editKeeperShopId) : undefined,
        password: editKeeperPassword || undefined,
      });
      const targetShop = shops.find((s) => s.id === Number(editKeeperShopId));
      setShopkeepers((prev) =>
        prev.map((k) =>
          k.id === editKeeperId
            ? { ...k, ...res.shopkeeper, shop: targetShop || k.shop }
            : k
        )
      );
      setShowEditKeeperModal(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to update shopkeeper');
    } finally {
      setIsSubmittingEditKeeper(false);
    }
  };

  // Delete Shopkeeper
  const handleDeleteKeeper = async () => {
    if (!deleteKeeperTarget) return;
    setIsDeletingKeeper(true);
    try {
      await adminApi.deleteShopkeeper(deleteKeeperTarget.id);
      setShopkeepers((prev) => prev.filter((k) => k.id !== deleteKeeperTarget.id));
      setDeleteKeeperTarget(null);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete shopkeeper');
    } finally {
      setIsDeletingKeeper(false);
    }
  };

  // Calculations for KPI Cards
  const totalPlatformRevenue = Number(
    stats?.totalRevenue ??
    stats?.revenue ??
    orders
      .filter((o) => o.paymentStatus === 'PAID')
      .reduce((s, o) => s + Number(o.totalAmount ?? o.total ?? 0), 0)
  );

  // Active restaurant business day cutoff (4:00 AM shift rollover)
  const getBusinessDayCutoff = () => {
    const now = new Date();
    const isEarlyMorning = now.getHours() < 4;
    return new Date(
      now.getFullYear(),
      now.getMonth(),
      isEarlyMorning ? now.getDate() - 1 : now.getDate(),
      4,
      0,
      0,
      0
    );
  };

  const todayPaidOrders = useMemo(() => {
    const cutoff = getBusinessDayCutoff();
    return orders.filter((o) => {
      if (o.paymentStatus !== 'PAID') return false;
      const d = new Date(o.createdAt);
      return d >= cutoff;
    });
  }, [orders]);

  const weekPaidOrders = useMemo(() => {
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return orders.filter((o) => {
      if (o.paymentStatus !== 'PAID') return false;
      const d = new Date(o.createdAt).getTime();
      return d >= sevenDaysAgo;
    });
  }, [orders]);

  const monthPaidOrders = useMemo(() => {
    const now = new Date();
    return orders.filter((o) => {
      if (o.paymentStatus !== 'PAID') return false;
      const d = new Date(o.createdAt);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
  }, [orders]);

  const todayOrdersCount =
    stats?.todayOrders && stats.todayOrders > 0
      ? stats.todayOrders
      : todayPaidOrders.length;

  const todayPlatformSales = Number(
    stats?.todaySales && stats.todaySales > 0
      ? stats.todaySales
      : stats?.todayRevenue && stats.todayRevenue > 0
      ? stats.todayRevenue
      : todayPaidOrders.reduce((s, o) => s + Number(o.totalAmount ?? o.total ?? 0), 0)
  );

  const weekOrdersCount =
    stats?.weekOrders && stats.weekOrders > 0
      ? stats.weekOrders
      : weekPaidOrders.length;

  const weekPlatformSales = Number(
    stats?.weekSales && stats.weekSales > 0
      ? stats.weekSales
      : stats?.weekRevenue && stats.weekRevenue > 0
      ? stats.weekRevenue
      : weekPaidOrders.reduce((s, o) => s + Number(o.totalAmount ?? o.total ?? 0), 0)
  );

  const monthOrdersCount =
    stats?.monthOrders && stats.monthOrders > 0
      ? stats.monthOrders
      : monthPaidOrders.length;

  const monthPlatformSales = Number(
    stats?.monthSales && stats.monthSales > 0
      ? stats.monthSales
      : stats?.monthRevenue && stats.monthRevenue > 0
      ? stats.monthRevenue
      : monthPaidOrders.reduce((s, o) => s + Number(o.totalAmount ?? o.total ?? 0), 0)
  );

  // Date Range Matcher Helper
  const matchesDateRange = (
    dateStr: string,
    preset: DatePreset,
    startDate?: string,
    endDate?: string
  ): boolean => {
    if (preset === 'ALL' && !startDate && !endDate) return true;
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
      if (startDate) {
        const start = new Date(`${startDate}T00:00:00`);
        if (d < start) return false;
      }
      if (endDate) {
        const end = new Date(`${endDate}T23:59:59.999`);
        if (d > end) return false;
      }
      return true;
    }

    return true;
  };

  // Per-shop sales metric list with period date range support
  const shopSalesList = useMemo(() => {
    const cutoff = getBusinessDayCutoff();
    return shops.map((s) => {
      const shopOrders = orders.filter((o) => o.shopId === s.id);
      const paidOrders = shopOrders.filter((o) => o.paymentStatus === 'PAID');
      const today = new Date();

      const todayOrders = paidOrders.filter((o) => {
        const d = new Date(o.createdAt);
        return d >= cutoff;
      });

      const weekOrders = paidOrders.filter((o) => {
        return new Date(o.createdAt).getTime() >= Date.now() - 7 * 24 * 60 * 60 * 1000;
      });

      const monthOrders = paidOrders.filter((o) => {
        const d = new Date(o.createdAt);
        return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
      });

      // Filtered by selected sales date preset/range
      const periodPaidOrders = paidOrders.filter((o) =>
        matchesDateRange(o.createdAt, salesDatePreset, salesStartDate, salesEndDate)
      );

      const keepersForShop = shopkeepers.filter((k) => k.shopId === s.id);

      return {
        shopId: s.id,
        shopName: s.name,
        slug: s.slug,
        subdomain: s.subdomain,
        isActive: s.isActive,
        shopkeepers: keepersForShop.map((k) => ({
          id: k.id,
          name: k.name,
          email: k.email,
          mobile: k.mobile,
        })),
        productsCount: s._count?.products || 0,
        totalOrders: shopOrders.length,
        paidOrders: paidOrders.length,
        totalRevenue: paidOrders.reduce((sum, o) => sum + Number(o.totalAmount ?? o.total ?? 0), 0),
        todaySales: todayOrders.reduce((sum, o) => sum + Number(o.totalAmount ?? o.total ?? 0), 0),
        todayOrders: todayOrders.length,
        weekSales: weekOrders.reduce((sum, o) => sum + Number(o.totalAmount ?? o.total ?? 0), 0),
        weekOrders: weekOrders.length,
        monthSales: monthOrders.reduce((sum, o) => sum + Number(o.totalAmount ?? o.total ?? 0), 0),
        monthOrders: monthOrders.length,
        periodSales: periodPaidOrders.reduce(
          (sum, o) => sum + Number(o.totalAmount ?? o.total ?? 0),
          0
        ),
        periodOrders: periodPaidOrders.length,
      };
    });
  }, [shops, orders, shopkeepers, salesDatePreset, salesStartDate, salesEndDate]);

  const totalPeriodSales = useMemo(() => {
    return shopSalesList.reduce((sum, s) => sum + s.periodSales, 0);
  }, [shopSalesList]);

  const totalPeriodOrders = useMemo(() => {
    return shopSalesList.reduce((sum, s) => sum + s.periodOrders, 0);
  }, [shopSalesList]);

  // Filtered Shops
  const filteredShops = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return shops.filter(
      (s) =>
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.slug.toLowerCase().includes(q) ||
        s.subdomain.toLowerCase().includes(q) ||
        (s.address && s.address.toLowerCase().includes(q))
    );
  }, [shops, searchQuery]);

  // Filtered Shopkeepers
  const filteredKeepers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return shopkeepers.filter((k) => {
      const matchesSearch =
        !q ||
        k.name.toLowerCase().includes(q) ||
        k.email.toLowerCase().includes(q) ||
        (k.shop && k.shop.name.toLowerCase().includes(q));

      const matchesShop =
        keeperShopFilter === 'ALL' || String(k.shopId) === keeperShopFilter;

      return matchesSearch && matchesShop;
    });
  }, [shopkeepers, searchQuery, keeperShopFilter]);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return orders.filter((o) => {
      const matchesSearch =
        !q ||
        (o.tokenNumber && o.tokenNumber.toLowerCase().includes(q)) ||
        (o.orderCode && o.orderCode.toLowerCase().includes(q)) ||
        String(o.id).includes(q) ||
        (o.shop?.name && o.shop.name.toLowerCase().includes(q)) ||
        (o.customerName && o.customerName.toLowerCase().includes(q)) ||
        (o.customerPhone && o.customerPhone.toLowerCase().includes(q));

      const matchesShop =
        orderShopFilter === 'ALL' || String(o.shopId) === orderShopFilter;

      const matchesStatus =
        orderStatusFilter === 'ALL' || o.orderStatus === orderStatusFilter;

      const matchesDate = matchesDateRange(
        o.createdAt,
        orderDatePreset,
        orderStartDate,
        orderEndDate
      );

      return matchesSearch && matchesShop && matchesStatus && matchesDate;
    });
  }, [
    orders,
    searchQuery,
    orderShopFilter,
    orderStatusFilter,
    orderDatePreset,
    orderStartDate,
    orderEndDate,
  ]);

  const filteredOrdersRevenue = useMemo(() => {
    return filteredOrders
      .filter((o) => o.paymentStatus === 'PAID')
      .reduce((sum, o) => sum + Number(o.totalAmount ?? o.total ?? 0), 0);
  }, [filteredOrders]);

  const filteredOrdersDiscounts = useMemo(() => {
    return filteredOrders.reduce((sum, o) => sum + Number(o.discountAmount ?? 0), 0);
  }, [filteredOrders]);

  // Filtered Shop Sales List
  const filteredShopSales = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return shopSalesList.filter(
      (s) =>
        !q ||
        s.shopName.toLowerCase().includes(q) ||
        s.slug.toLowerCase().includes(q) ||
        s.shopkeepers.some((k) => k.name.toLowerCase().includes(q) || k.email.toLowerCase().includes(q))
    );
  }, [shopSalesList, searchQuery]);

  // Paginated collections
  const totalShopPages = Math.ceil(filteredShops.length / shopsPerPage) || 1;
  const paginatedShops = useMemo(() => {
    const start = (shopsPage - 1) * shopsPerPage;
    return filteredShops.slice(start, start + shopsPerPage);
  }, [filteredShops, shopsPage, shopsPerPage]);

  const totalKeeperPages = Math.ceil(filteredKeepers.length / keepersPerPage) || 1;
  const paginatedKeepers = useMemo(() => {
    const start = (keepersPage - 1) * keepersPerPage;
    return filteredKeepers.slice(start, start + keepersPerPage);
  }, [filteredKeepers, keepersPage, keepersPerPage]);

  const totalOrderPages = Math.ceil(filteredOrders.length / ordersPerPage) || 1;
  const paginatedOrders = useMemo(() => {
    const start = (ordersPage - 1) * ordersPerPage;
    return filteredOrders.slice(start, start + ordersPerPage);
  }, [filteredOrders, ordersPage, ordersPerPage]);

  const totalSalesPages = Math.ceil(filteredShopSales.length / salesPerPage) || 1;
  const paginatedSales = useMemo(() => {
    const start = (salesPage - 1) * salesPerPage;
    return filteredShopSales.slice(start, start + salesPerPage);
  }, [filteredShopSales, salesPage, salesPerPage]);

  // Filtered Coupons
  const filteredCoupons = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return coupons.filter((c) => {
      const matchesSearch = !q || c.code.toLowerCase().includes(q);
      const matchesScope =
        couponScopeFilter === 'ALL' ||
        (couponScopeFilter === 'GLOBAL' && (c.isGlobal || c.shopId === null)) ||
        String(c.shopId) === couponScopeFilter;
      return matchesSearch && matchesScope;
    });
  }, [coupons, searchQuery, couponScopeFilter]);

  const totalCouponPages = Math.ceil(filteredCoupons.length / couponsPerPage) || 1;
  const paginatedCoupons = useMemo(() => {
    const start = (couponsPage - 1) * couponsPerPage;
    return filteredCoupons.slice(start, start + couponsPerPage);
  }, [filteredCoupons, couponsPage, couponsPerPage]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center space-y-3 text-white">
        <Loader2 className="w-10 h-10 animate-spin text-purple-500" />
        <p className="text-sm font-semibold text-slate-300">
          Loading Super Admin Console...
        </p>
      </div>
    );
  }

  // Sidebar content renderer
  const renderSidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-900/30 shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div className="truncate">
            <span className="font-black text-white text-base tracking-tight block leading-tight">
              Scan-Pay-Eat
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300 bg-purple-950 px-1.5 py-0.5 rounded border border-purple-800/50">
              Super Admin Console
            </span>
          </div>
        </div>
        <button
          onClick={() => setIsMobileSidebarOpen(false)}
          className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Sidebar Nav Links */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Platform Management
        </div>

        <button
          onClick={() => {
            setActiveTab('OVERVIEW');
            setIsMobileSidebarOpen(false);
          }}
          className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'OVERVIEW'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-900/20'
              : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Dashboard Overview</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('OUTLETS_SALES');
            setIsMobileSidebarOpen(false);
          }}
          className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'OUTLETS_SALES'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-900/20'
              : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
          }`}
        >
          <BarChart3 className="w-4 h-4 text-emerald-400" />
          <span>Outlets Sales Tracking</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('SHOPS');
            setIsMobileSidebarOpen(false);
          }}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'SHOPS'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-900/20'
              : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
          }`}
        >
          <div className="flex items-center space-x-3">
            <Store className="w-4 h-4" />
            <span>Shops & Outlets</span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            {shops.length}
          </span>
        </button>

        <button
          onClick={() => {
            setActiveTab('SHOPKEEPERS');
            setIsMobileSidebarOpen(false);
          }}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'SHOPKEEPERS'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-900/20'
              : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
          }`}
        >
          <div className="flex items-center space-x-3">
            <Users className="w-4 h-4" />
            <span>Shopkeeper Accounts</span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            {shopkeepers.length}
          </span>
        </button>

        <button
          onClick={() => {
            setActiveTab('ORDERS');
            setIsMobileSidebarOpen(false);
          }}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'ORDERS'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-900/20'
              : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
          }`}
        >
          <div className="flex items-center space-x-3">
            <Receipt className="w-4 h-4" />
            <span>Platform Orders Audit</span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            {orders.length}
          </span>
        </button>

        <button
          onClick={() => {
            setActiveTab('COUPONS');
            setIsMobileSidebarOpen(false);
          }}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'COUPONS'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-900/20'
              : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
          }`}
        >
          <div className="flex items-center space-x-3">
            <Tag className="w-4 h-4 text-amber-400" />
            <span>Platform Coupons & Offers</span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            {coupons.length}
          </span>
        </button>

        <div className="pt-4 px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Documentation & API
        </div>

        <a
          href={typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:5001/api-docs' : 'https://scanpayeat-backend.vercel.app/api-docs'}
          target="_blank"
          rel="noreferrer"
          className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800/70 hover:text-white transition"
        >
          <div className="flex items-center space-x-3">
            <FileCode className="w-4 h-4 text-emerald-400" />
            <span>Swagger API Docs</span>
          </div>
          <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" />
        </a>
      </nav>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/60 flex items-center justify-between">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-purple-500/30 border border-purple-500/30 flex items-center justify-center font-bold text-xs text-purple-300 shrink-0">
            SA
          </div>
          <div className="truncate">
            <p className="text-xs font-bold text-white truncate leading-tight">
              {user?.name || 'Super Admin'}
            </p>
            <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
          </div>
        </div>

        <button
          onClick={() => logout()}
          title="Sign Out"
          className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition shrink-0 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-slate-100 text-slate-900 font-sans">
      {/* ================= DESKTOP SIDEBAR ================= */}
      <aside className="hidden lg:flex w-64 bg-slate-900 text-slate-200 flex-col shrink-0 border-r border-slate-800 select-none">
        {renderSidebarContent()}
      </aside>

      {/* ================= MOBILE SLIDING DRAWER ================= */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          <aside className="relative w-72 max-w-[80vw] bg-slate-900 text-slate-200 flex flex-col z-10 shadow-2xl">
            {renderSidebarContent()}
          </aside>
        </div>
      )}

      {/* ================= MAIN CONTENT AREA ================= */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header Bar */}
        <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sticky top-0 z-30 shadow-xs">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-purple-600 uppercase tracking-wide">
                  Super Admin
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-xs font-medium text-slate-500 hidden sm:inline">
                  {activeTab === 'OVERVIEW' && 'Multi-Tenant Network Analytics'}
                  {activeTab === 'OUTLETS_SALES' && 'Real-time Per-Shop Sales & Revenue'}
                  {activeTab === 'SHOPS' && 'Tenant Outlets Management'}
                  {activeTab === 'SHOPKEEPERS' && 'Assigned Kitchen Managers'}
                  {activeTab === 'ORDERS' && 'Global Transaction Audit'}
                </span>
              </div>
              <h1 className="text-lg sm:text-2xl font-black text-slate-900 mt-0.5">
                {activeTab === 'OVERVIEW' && 'Platform Overview & Revenue'}
                {activeTab === 'OUTLETS_SALES' && 'Per-Shop Sales Tracking'}
                {activeTab === 'SHOPS' && 'Registered Shops & Subdomains'}
                {activeTab === 'SHOPKEEPERS' && 'Shopkeeper Accounts'}
                {activeTab === 'ORDERS' && 'Platform Orders Audit'}
              </h1>
            </div>
          </div>

          {/* Action Buttons & Search */}
          <div className="flex items-center space-x-2 flex-wrap">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShopsPage(1);
                  setKeepersPage(1);
                  setOrdersPage(1);
                  setSalesPage(1);
                }}
                placeholder="Search tenant, slug, email..."
                className="text-xs pl-8 pr-3 py-1.5 sm:py-2 bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500 w-36 sm:w-56"
              />
            </div>

            {activeTab === 'SHOPS' && (
              <button
                onClick={() => setShowShopModal(true)}
                className="px-3 py-1.5 sm:py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center space-x-1.5 cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Add Shop</span>
              </button>
            )}

            {activeTab === 'SHOPKEEPERS' && (
              <button
                onClick={() => setShowKeeperModal(true)}
                className="px-3 py-1.5 sm:py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center space-x-1.5 cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Provision Keeper</span>
              </button>
            )}

            <button
              onClick={loadData}
              title="Refresh Data"
              className="p-1.5 sm:p-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Page Content Body */}
        <main className="p-4 sm:p-6 max-w-7xl w-full mx-auto space-y-6">
          {/* ================= VIEW: OVERVIEW ================= */}
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-6">
              {/* Multi-Period Platform Sales Metrics */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Platform Multi-Period Revenue Breakdown
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Total Revenue
                      </span>
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                        <DollarSign className="w-4 h-4" />
                      </div>
                    </div>
                    <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
                      ₹{totalPlatformRevenue}
                    </p>
                    <p className="text-[11px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5" /> Razorpay Settled
                    </p>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Today&apos;s Sales
                      </span>
                      <span className="p-1 rounded-md bg-blue-50 text-blue-600 font-bold text-[10px]">
                        Today
                      </span>
                    </div>
                    <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
                      ₹{todayPlatformSales}
                    </p>
                    <p className="text-[11px] text-blue-600 font-bold mt-1">
                      {todayOrdersCount} orders today
                    </p>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        This Week&apos;s Sales
                      </span>
                      <span className="p-1 rounded-md bg-indigo-50 text-indigo-600 font-bold text-[10px]">
                        7 Days
                      </span>
                    </div>
                    <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
                      ₹{weekPlatformSales}
                    </p>
                    <p className="text-[11px] text-indigo-600 font-bold mt-1">
                      {weekOrdersCount} orders in last 7 days
                    </p>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        This Month&apos;s Sales
                      </span>
                      <span className="p-1 rounded-md bg-purple-50 text-purple-600 font-bold text-[10px]">
                        Month
                      </span>
                    </div>
                    <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
                      ₹{monthPlatformSales}
                    </p>
                    <p className="text-[11px] text-purple-600 font-bold mt-1">
                      {monthOrdersCount} orders this month
                    </p>
                  </div>
                </div>
              </div>

              {/* Platform Scale Overview Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Registered Outlets
                    </span>
                    <Store className="w-4 h-4 text-purple-600" />
                  </div>
                  <p className="text-3xl font-black text-slate-900 mt-2">
                    {stats?.totalShops ?? shops.length}
                  </p>
                  <p className="text-[11px] text-purple-700 font-bold mt-1">
                    {shops.filter((s) => s.isActive).length} active shops
                  </p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Shopkeepers
                    </span>
                    <Users className="w-4 h-4 text-blue-600" />
                  </div>
                  <p className="text-3xl font-black text-slate-900 mt-2">
                    {stats?.totalShopkeepers ?? shopkeepers.length}
                  </p>
                  <p className="text-[11px] text-slate-500 font-semibold mt-1">
                    Multi-tenant RBAC provisioned
                  </p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Platform Orders
                    </span>
                    <Receipt className="w-4 h-4 text-amber-600" />
                  </div>
                  <p className="text-3xl font-black text-slate-900 mt-2">
                    {stats?.totalOrders ?? orders.length}
                  </p>
                  <p className="text-[11px] text-slate-500 font-semibold mt-1">
                    {stats?.paidOrders ?? orders.filter((o) => o.paymentStatus === 'PAID').length} paid tickets
                  </p>
                </div>
              </div>

              {/* Action Banner */}
              <div className="bg-gradient-to-r from-purple-900 to-indigo-900 rounded-3xl p-6 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-extrabold text-white">
                    Tenant Provisioning & Outlets
                  </h3>
                  <p className="text-xs text-purple-200 mt-1 max-w-xl">
                    Create new restaurant tenants with customized subdomains, provision shopkeeper logins, and generate QR codes for tables.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    onClick={() => setShowShopModal(true)}
                    className="px-4 py-2.5 bg-white text-purple-900 hover:bg-purple-50 font-bold text-xs rounded-xl shadow-xs transition flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-purple-600" />
                    <span>Create New Shop</span>
                  </button>

                  <button
                    onClick={() => setShowKeeperModal(true)}
                    className="px-4 py-2.5 bg-purple-700 hover:bg-purple-600 text-white font-bold text-xs rounded-xl border border-purple-500/40 shadow-xs transition flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Shopkeeper</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('OUTLETS_SALES')}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center space-x-1.5 cursor-pointer"
                  >
                    <BarChart3 className="w-4 h-4" />
                    <span>View Per-Shop Sales</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================= VIEW: OUTLETS SALES TRACKING ================= */}
          {activeTab === 'OUTLETS_SALES' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-slate-200 bg-slate-50/70 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-emerald-600" />
                      <span>Per-Shop Sales & Revenue Breakdown ({filteredShopSales.length})</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Track and filter sales across all restaurant outlets by custom date ranges or standard calendar periods.
                    </p>
                  </div>

                  {/* Date Filter Presets */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {(
                      [
                        { key: 'ALL', label: 'All Dates' },
                        { key: 'TODAY', label: 'Today' },
                        { key: 'YESTERDAY', label: 'Yesterday' },
                        { key: 'WEEK', label: 'Last 7 Days' },
                        { key: 'MONTH', label: 'This Month' },
                        { key: 'CUSTOM', label: 'Custom Range' },
                      ] as const
                    ).map((preset) => (
                      <button
                        key={preset.key}
                        type="button"
                        onClick={() => {
                          setSalesDatePreset(preset.key);
                          if (preset.key !== 'CUSTOM') {
                            setSalesStartDate('');
                            setSalesEndDate('');
                          }
                        }}
                        className={`px-3 py-1.5 rounded-lg font-bold text-xs transition cursor-pointer ${
                          salesDatePreset === preset.key
                            ? 'bg-purple-600 text-white shadow-2xs'
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Date Pickers */}
                {salesDatePreset === 'CUSTOM' && (
                  <div className="flex items-center gap-3 pt-2 border-t border-slate-200/80 flex-wrap">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-bold text-slate-600">From:</span>
                      <input
                        type="date"
                        value={salesStartDate}
                        onChange={(e) => setSalesStartDate(e.target.value)}
                        className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-bold text-slate-600">To:</span>
                      <input
                        type="date"
                        value={salesEndDate}
                        onChange={(e) => setSalesEndDate(e.target.value)}
                        className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    {(salesStartDate || salesEndDate) && (
                      <button
                        type="button"
                        onClick={() => {
                          setSalesStartDate('');
                          setSalesEndDate('');
                        }}
                        className="text-xs text-rose-600 hover:underline font-bold"
                      >
                        Clear dates
                      </button>
                    )}
                  </div>
                )}

                {/* Summary Ribbon */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                  <div className="bg-purple-50/70 border border-purple-200/80 p-3 rounded-xl">
                    <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block">
                      Period Sales ({salesDatePreset})
                    </span>
                    <span className="text-lg font-black text-purple-950">
                      ₹{totalPeriodSales}
                    </span>
                  </div>
                  <div className="bg-white border border-slate-200/80 p-3 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Period Orders
                    </span>
                    <span className="text-lg font-black text-slate-900">
                      {totalPeriodOrders}
                    </span>
                  </div>
                  <div className="bg-white border border-slate-200/80 p-3 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Active Outlets
                    </span>
                    <span className="text-lg font-black text-emerald-600">
                      {shops.filter((s) => s.isActive).length} / {shops.length}
                    </span>
                  </div>
                  <div className="bg-white border border-slate-200/80 p-3 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      All-Time Revenue
                    </span>
                    <span className="text-lg font-black text-amber-700">
                      ₹{totalPlatformRevenue}
                    </span>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-700 font-extrabold uppercase tracking-wider text-[11px]">
                      <th className="p-4">Shop Outlet</th>
                      <th className="p-4">Assigned Keeper</th>
                      <th className="p-4 bg-purple-100/70 text-purple-950 border-x border-purple-200">
                        Period Sales ({salesDatePreset})
                      </th>
                      <th className="p-4">Today&apos;s Sales</th>
                      <th className="p-4">This Week</th>
                      <th className="p-4">This Month</th>
                      <th className="p-4">Total Revenue</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedSales.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-slate-400">
                          No shop sales records found.
                        </td>
                      </tr>
                    ) : (
                      paginatedSales.map((s) => (
                        <tr key={s.shopId} className="hover:bg-slate-50/80 transition">
                          <td className="p-4">
                            <span className="font-bold text-slate-900 block text-sm">
                              {s.shopName}
                            </span>
                            <span className="font-mono text-[10px] text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200 inline-block mt-0.5">
                              /shop/{s.slug}
                            </span>
                          </td>
                          <td className="p-4 text-slate-700">
                            {s.shopkeepers && s.shopkeepers.length > 0 ? (
                              <div>
                                <span className="font-bold text-slate-900 block">
                                  {s.shopkeepers.map((k) => k.name).join(', ')}
                                </span>
                                <span className="text-[10px] text-slate-500">
                                  {s.shopkeepers[0].email}
                                </span>
                              </div>
                            ) : (
                              <span className="text-slate-400 italic">No keeper assigned</span>
                            )}
                          </td>
                          <td className="p-4 bg-purple-50/40 border-x border-purple-200">
                            <span className="font-black text-purple-950 text-sm block">
                              ₹{s.periodSales}
                            </span>
                            <span className="text-[10px] text-purple-700 font-semibold">
                              {s.periodOrders} orders
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="font-black text-slate-900 text-sm block">
                              ₹{s.todaySales}
                            </span>
                            <span className="text-[10px] text-emerald-600 font-semibold">
                              {s.todayOrders} orders
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="font-black text-slate-900 text-sm block">
                              ₹{s.weekSales}
                            </span>
                            <span className="text-[10px] text-blue-600 font-semibold">
                              {s.weekOrders} orders
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="font-black text-slate-900 text-sm block">
                              ₹{s.monthSales}
                            </span>
                            <span className="text-[10px] text-purple-600 font-semibold">
                              {s.monthOrders} orders
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="font-black text-amber-700 text-sm block">
                              ₹{s.totalRevenue}
                            </span>
                            <span className="text-[10px] text-slate-500 font-semibold">
                              {s.totalOrders} total orders
                            </span>
                          </td>
                          <td className="p-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold inline-flex items-center gap-1 ${
                                s.isActive
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                  : 'bg-rose-100 text-rose-800 border border-rose-200'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  s.isActive ? 'bg-emerald-600' : 'bg-rose-600'
                                }`}
                              />
                              {s.isActive ? 'ACTIVE' : 'SUSPENDED'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {totalSalesPages > 1 && (
                <div className="flex items-center justify-between p-4 border-t border-slate-200 bg-slate-50/50 text-xs">
                  <span className="text-slate-500 font-medium">
                    Showing {(salesPage - 1) * salesPerPage + 1} -{' '}
                    {Math.min(salesPage * salesPerPage, filteredShopSales.length)} of{' '}
                    {filteredShopSales.length} shops
                  </span>
                  <div className="flex items-center space-x-2">
                    <button
                      disabled={salesPage <= 1}
                      onClick={() => setSalesPage((p) => Math.max(1, p - 1))}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-bold hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span>Prev</span>
                    </button>
                    <span className="font-bold text-slate-800">
                      {salesPage} / {totalSalesPages}
                    </span>
                    <button
                      disabled={salesPage >= totalSalesPages}
                      onClick={() => setSalesPage((p) => Math.min(totalSalesPages, p + 1))}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-bold hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                    >
                      <span>Next</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= VIEW: SHOPS & OUTLETS ================= */}
          {activeTab === 'SHOPS' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Registered Outlets ({filteredShops.length})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Each shop possesses independent categories, products, orders, and daily token counters.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-700 font-extrabold uppercase tracking-wider text-[11px]">
                      <th className="p-4">Shop Name & Address</th>
                      <th className="p-4">Slug / Subdomain</th>
                      <th className="p-4">Phone</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedShops.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-400">
                          No shops match your search criteria.
                        </td>
                      </tr>
                    ) : (
                      paginatedShops.map((s) => (
                        <tr key={s.id} className="hover:bg-slate-50/80 transition">
                          <td className="p-4">
                            <span className="font-bold text-slate-900 block text-sm">
                              {s.name}
                            </span>
                            {s.address ? (
                              <span className="text-[11px] text-slate-500 block mt-0.5">
                                {s.address}
                              </span>
                            ) : (
                              <span className="text-[11px] text-slate-400 italic">
                                No address provided
                              </span>
                            )}
                          </td>
                          <td className="p-4">
                            <span className="font-mono font-bold text-purple-700 bg-purple-50 px-2 py-1 rounded-md border border-purple-200">
                              /shop/{s.slug}
                            </span>
                          </td>
                          <td className="p-4 font-medium text-slate-600">
                            {s.phone || '—'}
                          </td>
                          <td className="p-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold inline-flex items-center gap-1 ${
                                s.isActive
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                  : 'bg-rose-100 text-rose-800 border border-rose-200'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  s.isActive ? 'bg-emerald-600' : 'bg-rose-600'
                                }`}
                              />
                              {s.isActive ? 'ACTIVE' : 'SUSPENDED'}
                            </span>
                          </td>
                          <td className="p-4 text-right space-x-1.5">
                            <button
                              onClick={() => setSelectedQrShop(s)}
                              className="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg transition inline-flex items-center gap-1 cursor-pointer border border-slate-200"
                              title="Show QR Code"
                            >
                              <QrCode className="w-3.5 h-3.5 text-purple-600" />
                              <span className="hidden sm:inline">QR</span>
                            </button>

                            <a
                              href={`/shop/${s.slug}`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold rounded-lg transition inline-flex items-center gap-1 border border-purple-200"
                              title="Visit Shop Menu"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Visit</span>
                            </a>

                            <button
                              onClick={() => openEditShop(s)}
                              className="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg transition inline-flex items-center gap-1 cursor-pointer border border-slate-200"
                              title="Edit Shop"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-blue-600" />
                              <span>Edit</span>
                            </button>

                            <button
                              onClick={() => handleToggleShopStatus(s.id, s.isActive)}
                              className={`px-2 py-1.5 rounded-lg font-bold transition cursor-pointer border ${
                                s.isActive
                                  ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200'
                                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200'
                              }`}
                            >
                              {s.isActive ? 'Deactivate' : 'Activate'}
                            </button>

                            <button
                              onClick={() => setDeleteShopTarget(s)}
                              className="px-2 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg transition inline-flex items-center gap-1 cursor-pointer border border-rose-200"
                              title="Delete Shop"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {totalShopPages > 1 && (
                <div className="flex items-center justify-between p-4 border-t border-slate-200 bg-slate-50/50 text-xs">
                  <span className="text-slate-500 font-medium">
                    Showing {(shopsPage - 1) * shopsPerPage + 1} -{' '}
                    {Math.min(shopsPage * shopsPerPage, filteredShops.length)} of{' '}
                    {filteredShops.length} shops
                  </span>
                  <div className="flex items-center space-x-2">
                    <button
                      disabled={shopsPage <= 1}
                      onClick={() => setShopsPage((p) => Math.max(1, p - 1))}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-bold hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span>Prev</span>
                    </button>
                    <span className="font-bold text-slate-800">
                      {shopsPage} / {totalShopPages}
                    </span>
                    <button
                      disabled={shopsPage >= totalShopPages}
                      onClick={() => setShopsPage((p) => Math.min(totalShopPages, p + 1))}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-bold hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                    >
                      <span>Next</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= VIEW: SHOPKEEPERS ================= */}
          {activeTab === 'SHOPKEEPERS' && (
            <div className="space-y-4">
              {/* Filter by shop pill */}
              <div className="flex items-center space-x-2 overflow-x-auto pb-1 bg-white p-3 rounded-2xl border border-slate-200 scrollbar-none">
                <button
                  onClick={() => {
                    setKeeperShopFilter('ALL');
                    setKeepersPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                    keeperShopFilter === 'ALL'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  All Shops ({shopkeepers.length})
                </button>
                {shops.map((s) => {
                  const count = shopkeepers.filter((k) => k.shopId === s.id).length;
                  return (
                    <button
                      key={s.id}
                      onClick={() => {
                        setKeeperShopFilter(String(s.id));
                        setKeepersPage(1);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                        keeperShopFilter === String(s.id)
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {s.name} ({count})
                    </button>
                  );
                })}
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">
                      Shopkeeper Accounts ({filteredKeepers.length})
                    </h3>
                    <p className="text-xs text-slate-500">
                      Provisioned credentials to manage specific outlet kitchen operations and incoming tickets.
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-700 font-extrabold uppercase tracking-wider text-[11px]">
                        <th className="p-4">Name & Email</th>
                        <th className="p-4">Assigned Shop</th>
                        <th className="p-4">Mobile</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {paginatedKeepers.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-slate-400">
                            No shopkeepers found. Click &apos;Provision Keeper&apos; above.
                          </td>
                        </tr>
                      ) : (
                        paginatedKeepers.map((k) => (
                          <tr key={k.id} className="hover:bg-slate-50/80 transition">
                            <td className="p-4">
                              <span className="font-bold text-slate-900 block text-sm">
                                {k.name}
                              </span>
                              <span className="text-[11px] text-slate-500 block">
                                {k.email}
                              </span>
                            </td>
                            <td className="p-4">
                              <span className="font-bold text-purple-700">
                                {k.shop?.name || `Shop #${k.shopId}`}
                              </span>
                            </td>
                            <td className="p-4 font-medium text-slate-600">
                              {k.mobile || '—'}
                            </td>
                            <td className="p-4">
                              <span
                                className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold inline-flex items-center gap-1 ${
                                  k.isActive !== false
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                    : 'bg-rose-100 text-rose-800 border border-rose-200'
                                }`}
                              >
                                {k.isActive !== false ? 'ACTIVE' : 'DISABLED'}
                              </span>
                            </td>
                            <td className="p-4 text-right space-x-1.5">
                              <button
                                onClick={() => openEditKeeper(k)}
                                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg transition inline-flex items-center gap-1 cursor-pointer border border-slate-200"
                              >
                                <Edit2 className="w-3.5 h-3.5 text-blue-600" />
                                <span>Edit</span>
                              </button>

                              <button
                                onClick={() => handleToggleKeeperStatus(k.id, k.isActive !== false)}
                                className={`px-2.5 py-1.5 rounded-lg font-bold transition cursor-pointer border ${
                                  k.isActive !== false
                                    ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200'
                                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200'
                                }`}
                              >
                                {k.isActive !== false ? 'Deactivate' : 'Activate'}
                              </button>

                              <button
                                onClick={() => setDeleteKeeperTarget(k)}
                                className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg transition inline-flex items-center gap-1 cursor-pointer border border-rose-200"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Delete</span>
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                {totalKeeperPages > 1 && (
                  <div className="flex items-center justify-between p-4 border-t border-slate-200 bg-slate-50/50 text-xs">
                    <span className="text-slate-500 font-medium">
                      Showing {(keepersPage - 1) * keepersPerPage + 1} -{' '}
                      {Math.min(keepersPage * keepersPerPage, filteredKeepers.length)} of{' '}
                      {filteredKeepers.length} shopkeepers
                    </span>
                    <div className="flex items-center space-x-2">
                      <button
                        disabled={keepersPage <= 1}
                        onClick={() => setKeepersPage((p) => Math.max(1, p - 1))}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-bold hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        <span>Prev</span>
                      </button>
                      <span className="font-bold text-slate-800">
                        {keepersPage} / {totalKeeperPages}
                      </span>
                      <button
                        disabled={keepersPage >= totalKeeperPages}
                        onClick={() => setKeepersPage((p) => Math.min(totalKeeperPages, p + 1))}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-bold hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                      >
                        <span>Next</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================= VIEW: ORDERS AUDIT ================= */}
          {activeTab === 'ORDERS' && (
            <div className="space-y-4">
              {/* Header with Title and Quick Filter Counts */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                {/* Row 1: Shop & Status Dropdowns + Search */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-xs font-bold text-slate-500">Shop:</span>
                    <select
                      value={orderShopFilter}
                      onChange={(e) => {
                        setOrderShopFilter(e.target.value);
                        setOrdersPage(1);
                      }}
                      className="text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="ALL">All Shops ({shops.length})</option>
                      {shops.map((s) => (
                        <option key={s.id} value={String(s.id)}>
                          {s.name}
                        </option>
                      ))}
                    </select>

                    <span className="text-xs font-bold text-slate-500 ml-1">Status:</span>
                    <select
                      value={orderStatusFilter}
                      onChange={(e) => {
                        setOrderStatusFilter(e.target.value);
                        setOrdersPage(1);
                      }}
                      className="text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="ALL">All Statuses</option>
                      <option value="PENDING">PENDING</option>
                      <option value="CONFIRMED">CONFIRMED</option>
                      <option value="PREPARING">PREPARING</option>
                      <option value="READY">READY</option>
                      <option value="COMPLETED">COMPLETED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </div>

                  {/* Search query input */}
                  <div className="relative min-w-[240px]">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search token, shop, guest..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setOrdersPage(1);
                      }}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                {/* Row 2: Date Filter Presets + Custom Range */}
                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
                      <CalendarRange className="w-3.5 h-3.5 text-purple-600" />
                      <span>Date:</span>
                    </span>
                    {(
                      [
                        { key: 'ALL', label: 'All Dates' },
                        { key: 'TODAY', label: 'Today' },
                        { key: 'YESTERDAY', label: 'Yesterday' },
                        { key: 'WEEK', label: 'Last 7 Days' },
                        { key: 'MONTH', label: 'This Month' },
                        { key: 'CUSTOM', label: 'Custom Range' },
                      ] as const
                    ).map((preset) => (
                      <button
                        key={preset.key}
                        type="button"
                        onClick={() => {
                          setOrderDatePreset(preset.key);
                          setOrdersPage(1);
                          if (preset.key !== 'CUSTOM') {
                            setOrderStartDate('');
                            setOrderEndDate('');
                          }
                        }}
                        className={`px-3 py-1.5 rounded-lg font-bold text-xs transition cursor-pointer ${
                          orderDatePreset === preset.key
                            ? 'bg-purple-600 text-white shadow-2xs'
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>

                  {/* Custom Date Pickers */}
                  {orderDatePreset === 'CUSTOM' && (
                    <div className="flex items-center gap-2 text-xs flex-wrap">
                      <span className="font-bold text-slate-600">From:</span>
                      <input
                        type="date"
                        value={orderStartDate}
                        onChange={(e) => {
                          setOrderStartDate(e.target.value);
                          setOrdersPage(1);
                        }}
                        className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-purple-500"
                      />
                      <span className="font-bold text-slate-600">To:</span>
                      <input
                        type="date"
                        value={orderEndDate}
                        onChange={(e) => {
                          setOrderEndDate(e.target.value);
                          setOrdersPage(1);
                        }}
                        className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-purple-500"
                      />
                      {(orderStartDate || orderEndDate) && (
                        <button
                          type="button"
                          onClick={() => {
                            setOrderStartDate('');
                            setOrderEndDate('');
                            setOrdersPage(1);
                          }}
                          className="text-xs text-rose-600 hover:underline font-bold"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Summary Metrics Banner */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
                  <div className="bg-purple-50/70 border border-purple-200/80 p-3 rounded-xl">
                    <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block">
                      Filtered Revenue
                    </span>
                    <span className="text-lg font-black text-purple-950">
                      ₹{filteredOrdersRevenue}
                    </span>
                  </div>
                  <div className="bg-white border border-slate-200/80 p-3 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Matching Tickets
                    </span>
                    <span className="text-lg font-black text-slate-900">
                      {filteredOrders.length}
                    </span>
                  </div>
                  <div className="bg-white border border-slate-200/80 p-3 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Discounts Awarded
                    </span>
                    <span className="text-lg font-black text-emerald-600">
                      ₹{filteredOrdersDiscounts}
                    </span>
                  </div>
                  <div className="bg-white border border-slate-200/80 p-3 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Paid Orders
                    </span>
                    <span className="text-lg font-black text-amber-700">
                      {filteredOrders.filter((o) => o.paymentStatus === 'PAID').length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Data Table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-700 font-extrabold uppercase tracking-wider text-[11px]">
                        <th className="p-4">Daily Token / ID</th>
                        <th className="p-4">Shop Outlet</th>
                        <th className="p-4">Customer Details</th>
                        <th className="p-4">Dishes & Items</th>
                        <th className="p-4">Kitchen Status</th>
                        <th className="p-4">Payment</th>
                        <th className="p-4">Date & Time</th>
                        <th className="p-4 text-right">Net Amount</th>
                        <th className="p-4 text-right">Ticket</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {paginatedOrders.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="p-10 text-center text-slate-400 font-medium">
                            No orders match the selected filters.
                          </td>
                        </tr>
                      ) : (
                        paginatedOrders.map((o) => {
                          const orderDate = new Date(o.createdAt);
                          const dateFormatted = orderDate.toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          });
                          const timeFormatted = orderDate.toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          });
                          const itemsCount =
                            o.items?.reduce((s: number, it: any) => s + (it.quantity || 1), 0) || 0;

                          return (
                            <tr key={o.id} className="hover:bg-slate-50/80 transition">
                              <td className="p-4">
                                <span className="font-mono font-black text-xs bg-purple-50 text-purple-900 px-2.5 py-1 rounded-md border border-purple-200">
                                  #{o.tokenNumber || o.id}
                                </span>
                              </td>
                              <td className="p-4">
                                <span className="font-bold text-slate-900 block">
                                  {o.shop?.name || `Shop #${o.shopId}`}
                                </span>
                                {o.shop?.slug && (
                                  <span className="text-[10px] text-slate-400 font-mono">
                                    /{o.shop.slug}
                                  </span>
                                )}
                              </td>
                              <td className="p-4">
                                {o.customerName ? (
                                  <div>
                                    <span className="font-bold text-slate-900 block">{o.customerName}</span>
                                    {o.customerPhone && (
                                      <span className="text-[10px] text-slate-500 font-mono">
                                        {o.customerPhone}
                                      </span>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-slate-400 italic">Dine-in Guest</span>
                                )}
                              </td>
                              <td className="p-4">
                                <div className="max-w-xs">
                                  <p className="font-medium text-slate-800 truncate text-xs">
                                    {(o.items || [])
                                      .map((it: any) => `${it.quantity}× ${it.productName || it.product?.name || 'Item'}`)
                                      .join(', ')}
                                  </p>
                                  <span className="text-[10px] text-slate-400 font-semibold">
                                    {itemsCount} {itemsCount === 1 ? 'item' : 'items'} total
                                  </span>
                                </div>
                              </td>
                              <td className="p-4">
                                <span
                                  className={`px-2.5 py-1 rounded-md font-black text-[10px] uppercase tracking-wider ${
                                    o.orderStatus === 'COMPLETED'
                                      ? 'bg-slate-100 text-slate-700 border border-slate-200'
                                      : o.orderStatus === 'READY'
                                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                      : o.orderStatus === 'PREPARING'
                                      ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                      : o.orderStatus === 'PENDING'
                                      ? 'bg-orange-100 text-orange-900 border border-orange-300'
                                      : 'bg-amber-100 text-amber-900 border border-amber-300'
                                  }`}
                                >
                                  {o.orderStatus}
                                </span>
                              </td>
                              <td className="p-4">
                                <span
                                  className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                                    o.paymentStatus === 'PAID'
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                                  }`}
                                >
                                  {o.paymentStatus}
                                </span>
                              </td>
                              <td className="p-4 whitespace-nowrap text-slate-600">
                                <span className="font-bold block text-slate-900">{dateFormatted}</span>
                                <span className="text-[11px] text-slate-400">{timeFormatted}</span>
                              </td>
                              <td className="p-4 text-right">
                                <span className="font-black text-slate-900 text-sm block">
                                  ₹{Number(o.totalAmount ?? o.total ?? 0)}
                                </span>
                                {o.discountAmount && Number(o.discountAmount) > 0 && (
                                  <span className="text-[10px] font-bold text-emerald-600 block">
                                    -₹{Number(o.discountAmount)} disc
                                  </span>
                                )}
                              </td>
                              <td className="p-4 text-right">
                                <button
                                  type="button"
                                  onClick={() => setSelectedReceiptOrder(o)}
                                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] rounded-lg border border-slate-200 transition inline-flex items-center gap-1 cursor-pointer"
                                  title="View Ticket Receipt"
                                >
                                  <Receipt className="w-3.5 h-3.5 text-purple-600" />
                                  <span>Ticket</span>
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                {totalOrderPages > 1 && (
                  <div className="flex items-center justify-between p-4 border-t border-slate-200 bg-slate-50/50 text-xs">
                    <span className="text-slate-500 font-medium">
                      Showing {(ordersPage - 1) * ordersPerPage + 1} -{' '}
                      {Math.min(ordersPage * ordersPerPage, filteredOrders.length)} of{' '}
                      {filteredOrders.length} orders
                    </span>
                    <div className="flex items-center space-x-2">
                      <button
                        disabled={ordersPage <= 1}
                        onClick={() => setOrdersPage((p) => Math.max(1, p - 1))}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-bold hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        <span>Prev</span>
                      </button>
                      <span className="font-bold text-slate-800">
                        {ordersPage} / {totalOrderPages}
                      </span>
                      <button
                        disabled={ordersPage >= totalOrderPages}
                        onClick={() => setOrdersPage((p) => Math.min(totalOrderPages, p + 1))}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-bold hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                      >
                        <span>Next</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================= TAB: COUPONS & OFFERS ================= */}
          {activeTab === 'COUPONS' && (
            <div className="space-y-6">
              {/* Header Banner */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <Tag className="w-5 h-5 text-amber-500" />
                    <span>Platform Promotional Coupons & Discounts</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Create global coupons valid across <strong className="text-purple-700">ALL restaurants</strong> on ScanPayEat, or manage restaurant-exclusive discounts.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setCouponCode('');
                    setCouponDiscountValue('');
                    setCouponMinOrder('');
                    setCouponMaxDiscount('');
                    setCouponShopId('GLOBAL');
                    setCouponError('');
                    setShowCouponModal(true);
                  }}
                  className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Coupon</span>
                </button>
              </div>

              {/* Scope & Filter Toolbar */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-slate-500">Filter Scope:</span>
                  <select
                    value={couponScopeFilter}
                    onChange={(e) => {
                      setCouponScopeFilter(e.target.value);
                      setCouponsPage(1);
                    }}
                    className="text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                  >
                    <option value="ALL">All Coupons ({coupons.length})</option>
                    <option value="GLOBAL">🌐 Global Platform Offers Only</option>
                    {shops.map((s) => (
                      <option key={s.id} value={String(s.id)}>
                        🏪 {s.name} Only
                      </option>
                    ))}
                  </select>
                </div>

                <span className="text-xs text-slate-500 font-medium">
                  {filteredCoupons.length} matching coupons
                </span>
              </div>

              {/* Coupons Table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-700 font-extrabold uppercase tracking-wider text-[11px]">
                        <th className="p-4">Coupon Code</th>
                        <th className="p-4">Applicable Scope</th>
                        <th className="p-4">Discount</th>
                        <th className="p-4">Min Bill Value</th>
                        <th className="p-4">Redemptions</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {paginatedCoupons.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-slate-400">
                            No coupons match this filter. Click &apos;Create Coupon&apos; to create a new promotion.
                          </td>
                        </tr>
                      ) : (
                        paginatedCoupons.map((c) => (
                          <tr key={c.id} className="hover:bg-slate-50/80 transition">
                            <td className="p-4">
                              <span className="font-mono font-black text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-1 rounded-lg text-xs">
                                {c.code}
                              </span>
                            </td>
                            <td className="p-4">
                              {c.isGlobal || c.shopId === null ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
                                  <span>🌐 Global (All Shops)</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200">
                                  <span>🏪 {c.shop?.name || `Shop #${c.shopId}`}</span>
                                </span>
                              )}
                            </td>
                            <td className="p-4 font-extrabold text-slate-900">
                              {c.discountType === 'PERCENT' ? `${c.discountValue}%` : `₹${c.discountValue}`}
                              {c.maxDiscount ? ` (Cap ₹${c.maxDiscount})` : ''}
                              <span className="text-[10px] text-slate-400 font-normal block">
                                {c.discountType === 'PERCENT' ? 'Percentage Off' : 'Flat Off'}
                              </span>
                            </td>
                            <td className="p-4 text-slate-600 font-medium">
                              {c.minOrderAmount > 0 ? `₹${c.minOrderAmount}` : 'No minimum'}
                            </td>
                            <td className="p-4 font-bold text-slate-800">
                              {c.usageCount || 0} times
                            </td>
                            <td className="p-4">
                              <button
                                onClick={() => handleToggleCouponStatus(c.id, c.isActive)}
                                className={`text-[10px] font-bold px-2.5 py-1 rounded-full cursor-pointer border transition ${
                                  c.isActive
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                                    : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                                }`}
                              >
                                {c.isActive ? 'Active' : 'Disabled'}
                              </button>
                            </td>
                            <td className="p-4 text-right">
                              <button
                                onClick={() => setDeleteCouponTarget(c)}
                                className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg transition inline-flex items-center gap-1 cursor-pointer border border-rose-200"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Delete</span>
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                {totalCouponPages > 1 && (
                  <div className="flex items-center justify-between p-4 border-t border-slate-200 bg-slate-50/50 text-xs">
                    <span className="text-slate-500 font-medium">
                      Showing {(couponsPage - 1) * couponsPerPage + 1} -{' '}
                      {Math.min(couponsPage * couponsPerPage, filteredCoupons.length)} of{' '}
                      {filteredCoupons.length} coupons
                    </span>
                    <div className="flex items-center space-x-2">
                      <button
                        disabled={couponsPage <= 1}
                        onClick={() => setCouponsPage((p) => Math.max(1, p - 1))}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-bold hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        <span>Prev</span>
                      </button>
                      <span className="font-bold text-slate-800">
                        {couponsPage} / {totalCouponPages}
                      </span>
                      <button
                        disabled={couponsPage >= totalCouponPages}
                        onClick={() => setCouponsPage((p) => Math.min(totalCouponPages, p + 1))}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-bold hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                      >
                        <span>Next</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ================= MODAL: ADD SHOP ================= */}
      {showShopModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-extrabold text-slate-900">
                Register New Shop Tenant
              </h3>
              <button
                onClick={() => setShowShopModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateShop} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-800 font-bold mb-1.5 text-xs">
                  Restaurant / Outlet Name *
                </label>
                <input
                  type="text"
                  required
                  value={shopName}
                  onChange={(e) => {
                    setShopName(e.target.value);
                    const autoSlug = e.target.value
                      .toLowerCase()
                      .replace(/[^a-z0-9]/g, '-')
                      .replace(/-+/g, '-');
                    if (!shopSlug) setShopSlug(autoSlug);
                    if (!shopSubdomain) setShopSubdomain(autoSlug);
                  }}
                  placeholder="e.g. Royal Spice Kitchen"
                  className="w-full px-3.5 py-2.5 text-slate-900 bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500 placeholder:text-slate-400 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-800 font-bold mb-1.5 text-xs">
                  URL Slug *
                </label>
                <div className="flex items-center">
                  <span className="bg-slate-100 border border-r-0 border-slate-300 rounded-l-xl px-3 py-2.5 text-slate-500 text-xs font-mono">
                    /shop/
                  </span>
                  <input
                    type="text"
                    required
                    value={shopSlug}
                    onChange={(e) => setShopSlug(e.target.value.toLowerCase())}
                    placeholder="royal-spice"
                    className="w-full px-3.5 py-2.5 text-slate-900 bg-white border border-slate-300 rounded-r-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-800 font-bold mb-1.5 text-xs">
                  Subdomain *
                </label>
                <div className="flex items-center">
                  <input
                    type="text"
                    required
                    value={shopSubdomain}
                    onChange={(e) => setShopSubdomain(e.target.value.toLowerCase())}
                    placeholder="royalspice"
                    className="w-full px-3.5 py-2.5 text-slate-900 bg-white border border-slate-300 rounded-l-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500 text-xs font-mono"
                  />
                  <span className="bg-slate-100 border border-l-0 border-slate-300 rounded-r-xl px-3 py-2.5 text-slate-500 text-xs font-mono">
                    .scanpayeat.com
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-slate-800 font-bold mb-1.5 text-xs">
                  Address
                </label>
                <input
                  type="text"
                  value={shopAddress}
                  onChange={(e) => setShopAddress(e.target.value)}
                  placeholder="Block 4, Food Court, Tech Park"
                  className="w-full px-3.5 py-2.5 text-slate-900 bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-800 font-bold mb-1.5 text-xs">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  value={shopPhone}
                  onChange={(e) => setShopPhone(e.target.value)}
                  placeholder="9876543210"
                  className="w-full px-3.5 py-2.5 text-slate-900 bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500 text-xs"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmittingShop}
                  className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-extrabold rounded-xl transition flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingShop ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>Register Tenant Outlet</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT SHOP ================= */}
      {showEditShopModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-extrabold text-slate-900">
                Edit Tenant Outlet
              </h3>
              <button
                onClick={() => setShowEditShopModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditShop} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-800 font-bold mb-1.5 text-xs">
                  Restaurant / Outlet Name *
                </label>
                <input
                  type="text"
                  required
                  value={editShopName}
                  onChange={(e) => setEditShopName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-slate-900 bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-800 font-bold mb-1.5 text-xs">
                  URL Slug *
                </label>
                <div className="flex items-center">
                  <span className="bg-slate-100 border border-r-0 border-slate-300 rounded-l-xl px-3 py-2.5 text-slate-500 text-xs font-mono">
                    /shop/
                  </span>
                  <input
                    type="text"
                    required
                    value={editShopSlug}
                    onChange={(e) => setEditShopSlug(e.target.value.toLowerCase())}
                    className="w-full px-3.5 py-2.5 text-slate-900 bg-white border border-slate-300 rounded-r-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-800 font-bold mb-1.5 text-xs">
                  Subdomain *
                </label>
                <div className="flex items-center">
                  <input
                    type="text"
                    required
                    value={editShopSubdomain}
                    onChange={(e) => setEditShopSubdomain(e.target.value.toLowerCase())}
                    className="w-full px-3.5 py-2.5 text-slate-900 bg-white border border-slate-300 rounded-l-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500 text-xs font-mono"
                  />
                  <span className="bg-slate-100 border border-l-0 border-slate-300 rounded-r-xl px-3 py-2.5 text-slate-500 text-xs font-mono">
                    .scanpayeat.com
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-slate-800 font-bold mb-1.5 text-xs">
                  Address
                </label>
                <input
                  type="text"
                  value={editShopAddress}
                  onChange={(e) => setEditShopAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-slate-900 bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-800 font-bold mb-1.5 text-xs">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  value={editShopPhone}
                  onChange={(e) => setEditShopPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-slate-900 bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500 text-xs"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmittingEditShop}
                  className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-extrabold rounded-xl transition flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingEditShop ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>Save Outlet Changes</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: DELETE SHOP CONFIRMATION ================= */}
      {deleteShopTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Delete Tenant Outlet?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to permanently delete <strong className="text-slate-800">{deleteShopTarget.name}</strong>?
                This will remove the outlet and cascade all associated dishes, categories, and tokens.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteShopTarget(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeletingShop}
                onClick={handleDeleteShop}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isDeletingShop ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Delete Shop</span>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: CREATE SHOPKEEPER ================= */}
      {showKeeperModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-extrabold text-slate-900">
                Provision Shopkeeper Login
              </h3>
              <button
                onClick={() => setShowKeeperModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateKeeper} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-800 font-bold mb-1.5 text-xs">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={keeperName}
                  onChange={(e) => setKeeperName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full px-3.5 py-2.5 text-slate-900 bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500 placeholder:text-slate-400 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-800 font-bold mb-1.5 text-xs">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={keeperEmail}
                  onChange={(e) => setKeeperEmail(e.target.value)}
                  placeholder="ramesh@kitchen.com"
                  className="w-full px-3.5 py-2.5 text-slate-900 bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500 placeholder:text-slate-400 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-800 font-bold mb-1.5 text-xs">
                  Mobile Number (Optional)
                </label>
                <input
                  type="tel"
                  value={keeperMobile}
                  onChange={(e) => setKeeperMobile(e.target.value)}
                  placeholder="9876543210"
                  className="w-full px-3.5 py-2.5 text-slate-900 bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-800 font-bold mb-1.5 text-xs">
                  Assign to Shop *
                </label>
                <select
                  required
                  value={keeperShopId}
                  onChange={(e) => setKeeperShopId(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 text-slate-900 bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500 text-xs"
                >
                  <option value="">Select a shop</option>
                  {shops.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.slug})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-800 font-bold mb-1.5 text-xs">
                  Password *
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={keeperPassword}
                  onChange={(e) => setKeeperPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full px-3.5 py-2.5 text-slate-900 bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500 text-xs"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmittingKeeper}
                  className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-extrabold rounded-xl transition flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingKeeper ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>Provision Shopkeeper Account</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT SHOPKEEPER ================= */}
      {showEditKeeperModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-extrabold text-slate-900">
                Edit Shopkeeper Account
              </h3>
              <button
                onClick={() => setShowEditKeeperModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditKeeper} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-800 font-bold mb-1.5 text-xs">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={editKeeperName}
                  onChange={(e) => setEditKeeperName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-slate-900 bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-800 font-bold mb-1.5 text-xs">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={editKeeperEmail}
                  onChange={(e) => setEditKeeperEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-slate-900 bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-800 font-bold mb-1.5 text-xs">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  value={editKeeperMobile}
                  onChange={(e) => setEditKeeperMobile(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-slate-900 bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-800 font-bold mb-1.5 text-xs">
                  Re-assign Shop
                </label>
                <select
                  value={editKeeperShopId}
                  onChange={(e) => setEditKeeperShopId(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 text-slate-900 bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500 text-xs"
                >
                  {shops.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.slug})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-800 font-bold mb-1.5 text-xs">
                  Reset Password (Leave blank to keep unchanged)
                </label>
                <input
                  type="password"
                  minLength={6}
                  value={editKeeperPassword}
                  onChange={(e) => setEditKeeperPassword(e.target.value)}
                  placeholder="Enter new password if changing"
                  className="w-full px-3.5 py-2.5 text-slate-900 bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500 text-xs"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmittingEditKeeper}
                  className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-extrabold rounded-xl transition flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingEditKeeper ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>Save Shopkeeper Changes</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: DELETE SHOPKEEPER CONFIRMATION ================= */}
      {deleteKeeperTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Delete Shopkeeper?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to delete <strong className="text-slate-800">{deleteKeeperTarget.name}</strong> ({deleteKeeperTarget.email})?
                They will immediately lose access to the shopkeeper dashboard.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteKeeperTarget(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeletingKeeper}
                onClick={handleDeleteKeeper}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isDeletingKeeper ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Delete Keeper</span>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: SHOP QR CODE ================= */}
      {selectedQrShop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-extrabold text-slate-900 truncate">
                {selectedQrShop.name}
              </h3>
              <button
                onClick={() => setSelectedQrShop(null)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {(() => {
              const liveOrigin = typeof window !== 'undefined' && window.location.origin ? window.location.origin : 'https://scanpayeat-frontend.vercel.app';
              const shopUrl = `${liveOrigin}/shop/${selectedQrShop.slug}`;
              return (
                <>
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 inline-block mx-auto">
                    {/* High-res generated QR code representation */}
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(shopUrl)}`}
                      alt="Shop QR Code"
                      className="w-52 h-52 mx-auto rounded-lg shadow-xs"
                    />
                  </div>

                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      Scan to Open Shop Menu
                    </p>
                    <p className="text-[11px] font-mono text-purple-700 mt-1 break-all select-all">
                      {shopUrl}
                    </p>
                  </div>

                  <div className="pt-2 flex items-center gap-2">
                    <a
                      href={shopUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl transition inline-flex items-center justify-center gap-1"
                    >
                      <span>Open in Browser</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                    <button
                      onClick={() => setSelectedQrShop(null)}
                      className="py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* ================= MODAL: CREATE COUPON ================= */}
      {showCouponModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                  <Tag className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Create Coupon Code
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Configure platform-wide or restaurant-specific discount
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowCouponModal(false);
                  setCouponError('');
                }}
                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {couponError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{couponError}</span>
              </div>
            )}

            <form onSubmit={handleCreateCoupon} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Coupon Code *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. WELCOME50, FESTIVE10"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2.5 text-slate-900 bg-white border border-slate-300 rounded-xl font-mono uppercase tracking-wider font-bold focus:outline-hidden focus:ring-2 focus:ring-purple-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Scope (Global vs Store Exclusive) *
                </label>
                <select
                  value={couponShopId}
                  onChange={(e) => setCouponShopId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-slate-900 bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500 text-xs font-semibold"
                >
                  <option value="GLOBAL">
                    🌐 Global Platform Coupon (Valid at ALL Restaurants)
                  </option>
                  <optgroup label="Store-Specific Exclusive Coupons">
                    {shops.map((s) => (
                      <option key={s.id} value={s.id}>
                        🏪 {s.name} (Exclusive only to this store)
                      </option>
                    ))}
                  </optgroup>
                </select>
                <p className="text-[10px] text-slate-500 mt-1">
                  {couponShopId === 'GLOBAL'
                    ? 'Global coupons apply to cart totals across all restaurant outlets.'
                    : 'Exclusive coupons will be rejected if applied at any other store.'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Discount Type *
                  </label>
                  <select
                    value={couponDiscountType}
                    onChange={(e) => setCouponDiscountType(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-slate-900 bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500 text-xs font-semibold"
                  >
                    <option value="FIXED">Flat Off (₹)</option>
                    <option value="PERCENT">Percentage (%)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Discount Value *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    placeholder={couponDiscountType === 'PERCENT' ? 'e.g. 20' : 'e.g. 50'}
                    value={couponDiscountValue}
                    onChange={(e) => setCouponDiscountValue(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-slate-900 bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Min Order Amount (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 199 (0 for none)"
                    value={couponMinOrder}
                    onChange={(e) => setCouponMinOrder(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-slate-900 bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Max Discount Cap (₹)
                  </label>
                  <input
                    type="number"
                    min="1"
                    disabled={couponDiscountType !== 'PERCENT'}
                    placeholder={couponDiscountType === 'PERCENT' ? 'e.g. 100' : 'N/A'}
                    value={couponMaxDiscount}
                    onChange={(e) => setCouponMaxDiscount(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-slate-900 bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500 text-xs disabled:bg-slate-100 disabled:text-slate-400"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmittingCoupon}
                  className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-extrabold rounded-xl transition flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingCoupon ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>Create & Publish Coupon</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: DELETE COUPON CONFIRMATION ================= */}
      {deleteCouponTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Delete Coupon Code?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to permanently delete coupon{' '}
                <strong className="text-slate-900 font-mono font-bold">
                  {deleteCouponTarget.code}
                </strong>
                ? Customers will no longer be able to redeem this promo code at checkout.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteCouponTarget(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeletingCoupon}
                onClick={handleDeleteCoupon}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isDeletingCoupon ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span>Delete Coupon</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: RECEIPT & TICKET AUDIT ================= */}
      {selectedReceiptOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-5 border-b border-slate-200 bg-gradient-to-r from-purple-800 to-indigo-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <Receipt className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-black text-base">Order Ticket & Receipt Audit</h3>
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
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Date & Time
                  </span>
                  <span className="font-semibold text-slate-800">
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
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Kitchen Status
                  </span>
                  <span className="font-black text-purple-700 uppercase">
                    {selectedReceiptOrder.orderStatus}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Customer
                  </span>
                  <span className="font-bold text-slate-800">
                    {selectedReceiptOrder.customerName || 'Dine-in Guest'}
                  </span>
                  {selectedReceiptOrder.customerPhone && (
                    <span className="text-[11px] text-slate-500 font-mono block">
                      {selectedReceiptOrder.customerPhone}
                    </span>
                  )}
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
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
                <h4 className="font-bold text-slate-900 mb-2 uppercase text-[11px] tracking-wider">
                  Itemized Order Breakdown ({selectedReceiptOrder.items?.length || 0})
                </h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                  {(selectedReceiptOrder.items || []).map((it: any, idx: number) => {
                    const itemName = it.productName || it.product?.name || `Item #${idx + 1}`;
                    const unitPrice = Number(it.price || it.unitPrice || 0);
                    const lineTotal = Number(it.quantity || 1) * unitPrice;
                    return (
                      <div key={idx} className="p-3 flex items-center justify-between bg-white">
                        <div className="flex items-center gap-2.5">
                          <span className="w-6 h-6 rounded-md bg-purple-100 text-purple-900 font-black flex items-center justify-center text-xs">
                            {it.quantity}×
                          </span>
                          <div>
                            <span className="font-bold text-slate-800 block">{itemName}</span>
                            {unitPrice > 0 && (
                              <span className="text-[10px] text-slate-400">₹{unitPrice} each</span>
                            )}
                          </div>
                        </div>
                        <span className="font-black text-slate-900">
                          {lineTotal > 0 ? `₹${lineTotal}` : '—'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Financial Calculation */}
              <div className="bg-purple-50/60 p-4 rounded-2xl border border-purple-200/80 space-y-1.5">
                {selectedReceiptOrder.discountAmount &&
                  Number(selectedReceiptOrder.discountAmount) > 0 && (
                    <>
                      <div className="flex justify-between text-slate-600">
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
                <div className="flex justify-between items-baseline pt-2 border-t border-purple-200/60">
                  <span className="font-extrabold text-slate-900 text-sm">Net Total</span>
                  <span className="font-black text-slate-900 text-xl font-mono">
                    ₹{Number(selectedReceiptOrder.totalAmount ?? selectedReceiptOrder.total ?? 0)}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold rounded-xl transition inline-flex items-center gap-1.5 cursor-pointer text-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Ticket</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedReceiptOrder(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-black text-white font-bold rounded-xl text-xs transition cursor-pointer"
              >
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
