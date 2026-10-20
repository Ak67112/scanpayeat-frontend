'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { shopkeeperApi } from '../../lib/api';
import { getSocket, joinShopRoom } from '../../lib/socket';
import { Order, OrderStatus, Product, Category, ShopkeeperStats } from '../../types';
import { useRouter } from 'next/navigation';
import {
  ChefHat,
  UtensilsCrossed,
  Clock,
  CheckCircle2,
  Bell,
  Sparkles,
  Plus,
  RefreshCw,
  Loader2,
  TrendingUp,
  DollarSign,
  Package,
  Layers,
  Power,
  Volume2,
  Search,
  ExternalLink,
  LogOut,
  LayoutDashboard,
  ArrowUpRight,
  Receipt,
  Store,
  Upload,
  Image as ImageIcon,
  Edit2,
  Trash2,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Calendar,
  AlertTriangle,
  Info,
  Gift,
  Tag,
  Percent,
  Award,
  Table as TableIcon,
  Filter,
  CalendarRange,
  AlertCircle,
  Printer,
  Wallet,
  CreditCard,
  Lock,
  ShieldCheck,
  Zap,
  Key,
  Check,
} from 'lucide-react';
import { ShopkeeperWallet, WalletTransaction, ShopGatewaySettings, ShopTaxSettings } from '../../types';

type TabView = 'ORDERS' | 'PRODUCTS' | 'CATEGORIES' | 'STATS' | 'DISCOUNTS' | 'PROFILE' | 'WALLET' | 'TAX_SETTINGS';

type DashboardFilterKey = 'ALL' | 'NEW' | 'COOKING' | 'READY' | 'COMPLETED';

const DASHBOARD_FILTERS: { key: DashboardFilterKey; label: string }[] = [
  { key: 'ALL', label: 'All Orders' },
  { key: 'NEW', label: 'New Orders' },
  { key: 'COOKING', label: 'Cooking' },
  { key: 'READY', label: 'Ready for Counter' },
  { key: 'COMPLETED', label: 'Order Completed' },
];

const STATUS_CONFIG: Record<
  OrderStatus,
  {
    label: string;
    dotColor: string;
    badgeBg: string;
    badgeText: string;
    badgeBorder: string;
    description: string;
  }
> = {
  PENDING: {
    label: 'New / Pending',
    dotColor: 'bg-amber-500',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-800',
    badgeBorder: 'border-amber-200',
    description: 'Awaiting kitchen review',
  },
  CONFIRMED: {
    label: 'Confirmed',
    dotColor: 'bg-blue-500',
    badgeBg: 'bg-blue-50',
    badgeText: 'text-blue-800',
    badgeBorder: 'border-blue-200',
    description: 'Order confirmed & queued',
  },
  PREPARING: {
    label: 'Cooking',
    dotColor: 'bg-orange-500',
    badgeBg: 'bg-orange-50',
    badgeText: 'text-orange-800',
    badgeBorder: 'border-orange-200',
    description: 'Active cooking in kitchen',
  },
  READY: {
    label: 'Ready for Counter',
    dotColor: 'bg-emerald-500',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-800',
    badgeBorder: 'border-emerald-200',
    description: 'Ready for diner pickup',
  },
  COMPLETED: {
    label: 'Order Completed',
    dotColor: 'bg-slate-500',
    badgeBg: 'bg-slate-100',
    badgeText: 'text-slate-800',
    badgeBorder: 'border-slate-300',
    description: 'Fulfilled & handed over',
  },
  CANCELLED: {
    label: 'Cancelled',
    dotColor: 'bg-rose-500',
    badgeBg: 'bg-rose-50',
    badgeText: 'text-rose-800',
    badgeBorder: 'border-rose-200',
    description: 'Excluded from revenue',
  },
};

export default function ShopkeeperDashboard() {
  const { user, logout, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<TabView>('ORDERS');
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState<ShopkeeperStats | null>(null);

  // Wallet & QR state
  const [walletData, setWalletData] = useState<{
    wallet: ShopkeeperWallet | null;
    transactions: WalletTransaction[];
  }>({ wallet: null, transactions: [] });
  const [isWalletLoading, setIsWalletLoading] = useState(false);

  // Wallet Recharge Modal State
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState<number | ''>(500);
  const [isRecharging, setIsRecharging] = useState(false);
  const [rechargeError, setRechargeError] = useState<string | null>(null);
  const [rechargeSuccess, setRechargeSuccess] = useState<string | null>(null);

  // Shop Tax (GST) Settings State
  const [taxSettings, setTaxSettings] = useState<ShopTaxSettings | null>(null);
  const [gstEnabled, setGstEnabled] = useState(false);
  const [gstNumber, setGstNumber] = useState('');
  const [cgstRate, setCgstRate] = useState<number>(2.5);
  const [sgstRate, setSgstRate] = useState<number>(2.5);
  const [isSavingTax, setIsSavingTax] = useState(false);
  const [taxSuccessMsg, setTaxSuccessMsg] = useState<string | null>(null);
  const [taxErrorMsg, setTaxErrorMsg] = useState<string | null>(null);

  // Shop & Ambience Profile state
  const [shopProfile, setShopProfile] = useState<{
    name: string;
    address: string;
    state: string;
    district: string;
    phone: string;
    logoUrl: string;
    bannerUrl: string;
    description: string;
    ambienceImages: string[];
  }>({
    name: '',
    address: '',
    state: '',
    district: '',
    phone: '',
    logoUrl: '',
    bannerUrl: '',
    description: '',
    ambienceImages: [],
  });
  const [keeperProfile, setKeeperProfile] = useState<{
    name: string;
    email: string;
    mobile: string;
    avatarUrl: string;
  }>({
    name: '',
    email: '',
    mobile: '',
    avatarUrl: '',
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingAmbience, setIsUploadingAmbience] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Milestone Rewards and Coupons state
  const [rewardRule, setRewardRule] = useState<any>({
    milestoneCount: 10,
    discountAmount: 50,
    minOrderAmount: 100,
    isActive: true,
    title: "Today's 10th Customer Special Celebration Reward",
  });
  const [coupons, setCoupons] = useState<any[]>([]);
  const [isSavingRewardRule, setIsSavingRewardRule] = useState(false);
  const [rewardRuleSuccess, setRewardRuleSuccess] = useState(false);

  // New coupon modal state
  const [showAddCouponModal, setShowAddCouponModal] = useState(false);
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponType, setNewCouponType] = useState('FIXED');
  const [newCouponValue, setNewCouponValue] = useState('');
  const [newCouponMinOrder, setNewCouponMinOrder] = useState('');
  const [newCouponMaxDiscount, setNewCouponMaxDiscount] = useState('');
  const [isSubmittingCoupon, setIsSubmittingCoupon] = useState(false);
  const [couponFormError, setCouponFormError] = useState('');

  const [orderFilter, setOrderFilter] = useState<DashboardFilterKey>('ALL');
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [openStatusOrderId, setOpenStatusOrderId] = useState<number | null>(null);
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);
  const [isCancellingOrder, setIsCancellingOrder] = useState(false);

  type DatePreset = 'ALL' | 'TODAY' | 'YESTERDAY' | 'WEEK' | 'MONTH' | 'CUSTOM';
  const [orderDatePreset, setOrderDatePreset] = useState<DatePreset>('ALL');
  const [orderStartDate, setOrderStartDate] = useState<string>('');
  const [orderEndDate, setOrderEndDate] = useState<string>('');
  const [orderViewMode, setOrderViewMode] = useState<'CARDS' | 'TABLE'>('CARDS');

  // Selected Order for Receipt Details Modal
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<Order | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);

  // Custom date filter for Stats / Reports
  const [statsDatePreset, setStatsDatePreset] = useState<DatePreset>('TODAY');
  const [statsStartDate, setStatsStartDate] = useState<string>('');
  const [statsEndDate, setStatsEndDate] = useState<string>('');

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [newOrderAlert, setNewOrderAlert] = useState<string | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Real-time live order toast & notification states
  interface LiveOrderToast {
    id: string;
    order: Order;
  }
  const [liveOrderToasts, setLiveOrderToasts] = useState<LiveOrderToast[]>([]);
  const [highlightedOrderId, setHighlightedOrderId] = useState<number | null>(null);
  const [hasAudioUnlocked, setHasAudioUnlocked] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<string>('default');

  const getDisplayToken = (token?: string | null, id?: number | string) => {
    if (token) {
      const clean = String(token).replace(/^T-/, '').replace(/^ORD-/, '').trim();
      if (clean) return clean;
    }
    return String(id || '01').padStart(2, '0');
  };

  // Pagination states
  const [ordersPage, setOrdersPage] = useState(1);
  const ordersPerPage = 9;
  const [productsPage, setProductsPage] = useState(1);
  const productsPerPage = 10;
  const [categoriesPage, setCategoriesPage] = useState(1);
  const categoriesPerPage = 10;

  // New product form modal state
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdCatId, setNewProdCatId] = useState<number | ''>('');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdImage, setNewProdImage] = useState('');
  const [isSubmittingProd, setIsSubmittingProd] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Edit product modal state
  const [showEditProductModal, setShowEditProductModal] = useState(false);
  const [editProdId, setEditProdId] = useState<number | null>(null);
  const [editProdName, setEditProdName] = useState('');
  const [editProdPrice, setEditProdPrice] = useState('');
  const [editProdCatId, setEditProdCatId] = useState<number | ''>('');
  const [editProdDesc, setEditProdDesc] = useState('');
  const [editProdImage, setEditProdImage] = useState('');
  const [editProdAvailable, setEditProdAvailable] = useState(true);
  const [isSubmittingEditProd, setIsSubmittingEditProd] = useState(false);
  const [isUploadingEditImage, setIsUploadingEditImage] = useState(false);
  const [editUploadError, setEditUploadError] = useState('');

  // Delete product confirmation state
  const [deleteProductTarget, setDeleteProductTarget] = useState<Product | null>(null);
  const [isDeletingProd, setIsDeletingProd] = useState(false);

  // New category modal state
  const [showAddCatModal, setShowAddCatModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [isSubmittingCat, setIsSubmittingCat] = useState(false);

  // Edit category modal state
  const [showEditCatModal, setShowEditCatModal] = useState(false);
  const [editCatId, setEditCatId] = useState<number | null>(null);
  const [editCatName, setEditCatName] = useState('');
  const [editCatDesc, setEditCatDesc] = useState('');
  const [isSubmittingEditCat, setIsSubmittingEditCat] = useState(false);

  // Delete category confirmation state
  const [deleteCatTarget, setDeleteCatTarget] = useState<Category | null>(null);
  const [isDeletingCat, setIsDeletingCat] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      if (isEdit) setEditUploadError('Image size must be less than 5MB');
      else setUploadError('Image size must be less than 5MB');
      return;
    }

    if (isEdit) {
      setIsUploadingEditImage(true);
      setEditUploadError('');
    } else {
      setIsUploadingImage(true);
      setUploadError('');
    }

    try {
      const uploadedUrl = await shopkeeperApi.uploadImage(file);
      if (isEdit) {
        setEditProdImage(uploadedUrl);
      } else {
        setNewProdImage(uploadedUrl);
      }
    } catch (err: any) {
      const msg = err.message || 'Failed to upload image to Cloudinary';
      if (isEdit) setEditUploadError(msg);
      else setUploadError(msg);
    } finally {
      if (isEdit) setIsUploadingEditImage(false);
      else setIsUploadingImage(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== 'SHOPKEEPER') {
      router.push('/shopkeeper/login');
    }
  }, [user, authLoading, router]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [
        ordersRes,
        prodsRes,
        catsRes,
        statsRes,
        ruleRes,
        couponsRes,
        profileRes,
        walletRes,
        taxRes,
      ] = await Promise.all([
        shopkeeperApi.getOrders().catch(() => ({ orders: [] })),
        shopkeeperApi.getProducts().catch(() => ({ products: [] })),
        shopkeeperApi.getCategories().catch(() => ({ categories: [] })),
        shopkeeperApi.getStats().catch(() => ({ stats: null })),
        shopkeeperApi.getRewardRule().catch(() => ({ rule: null })),
        shopkeeperApi.getCoupons().catch(() => ({ coupons: [] })),
        shopkeeperApi.getProfile().catch(() => ({ shop: null, shopkeeper: null })),
        shopkeeperApi.getWallet().catch(() => ({ wallet: null, transactions: [] })),
        shopkeeperApi.getTaxSettings().catch(() => null),
      ]);

      const incomingCats = Array.isArray(catsRes) ? catsRes : (catsRes?.categories || []);
      const incomingProds = Array.isArray(prodsRes) ? prodsRes : (prodsRes?.products || []);
      const incomingOrders = Array.isArray(ordersRes) ? ordersRes : (ordersRes?.orders || []);

      setOrders(Array.isArray(incomingOrders) ? incomingOrders : []);
      setProducts(Array.isArray(incomingProds) ? incomingProds : []);
      setCategories(Array.isArray(incomingCats) ? incomingCats : []);
      if (statsRes?.stats) setStats(statsRes.stats);
      else if (statsRes && !('stats' in statsRes)) setStats(statsRes as any);

      if (ruleRes?.rule) setRewardRule(ruleRes.rule);
      const incomingCoupons = Array.isArray(couponsRes) ? couponsRes : (couponsRes?.coupons || []);
      setCoupons(incomingCoupons);

      if (walletRes && 'wallet' in walletRes && walletRes.wallet) {
        setWalletData({
          wallet: walletRes.wallet,
          transactions: walletRes.transactions || [],
        });
      }

      if (taxRes) {
        const tx = (taxRes as any).settings || taxRes;
        setTaxSettings(tx);
        setGstEnabled(tx.gstEnabled || false);
        setGstNumber(tx.gstNumber || '');
        setCgstRate(Number(tx.cgstRate ?? 2.5));
        setSgstRate(Number(tx.sgstRate ?? 2.5));
      }

      if (profileRes?.shop) {
        setShopProfile({
          name: profileRes.shop.name || '',
          address: profileRes.shop.address || '',
          state: profileRes.shop.state || '',
          district: profileRes.shop.district || '',
          phone: profileRes.shop.phone || '',
          logoUrl: profileRes.shop.logoUrl || '',
          bannerUrl: profileRes.shop.bannerUrl || '',
          description: profileRes.shop.description || '',
          ambienceImages: profileRes.shop.ambienceImages || [],
        });
      }
      if (profileRes?.shopkeeper) {
        setKeeperProfile({
          name: profileRes.shopkeeper.name || '',
          email: profileRes.shopkeeper.email || '',
          mobile: profileRes.shopkeeper.mobile || '',
          avatarUrl: profileRes.shopkeeper.avatarUrl || '',
        });
      }
    } catch (err: any) {
      console.error('Failed to load shopkeeper data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadWallet = async () => {
    setIsWalletLoading(true);
    try {
      const res = await shopkeeperApi.getWallet();
      setWalletData({
        wallet: res.wallet || null,
        transactions: res.transactions || [],
      });
    } catch (err) {
      console.error('Failed to reload wallet:', err);
    } finally {
      setIsWalletLoading(false);
    }
  };

  const handleRechargeWallet = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const amountNum = Number(rechargeAmount);
    if (!amountNum || amountNum < 10) {
      setRechargeError('Please enter a recharge amount of at least ₹10.');
      return;
    }

    setIsRecharging(true);
    setRechargeError(null);
    setRechargeSuccess(null);

    try {
      // 1. Create recharge order via global centralized gateway
      const orderRes = await shopkeeperApi.rechargeWalletCreateOrder(amountNum);
      const activeOrderId = orderRes.orderId;
      const activeKeyId = orderRes.keyId;
      const activeAmount = orderRes.amount;

      // 2. Launch Razorpay Checkout
      const win = window as any;
      const isRealRazorpay =
        win.Razorpay &&
        activeKeyId &&
        activeKeyId !== 'rzp_test_placeholder' &&
        activeOrderId &&
        !activeOrderId.startsWith('rzp_mock_');

      if (isRealRazorpay) {
        const options = {
          key: activeKeyId,
          amount: activeAmount,
          currency: 'INR',
          name: 'Scan-Pay-Eat Platform',
          description: `Shopkeeper Wallet Top-up (₹${amountNum})`,
          order_id: activeOrderId,
          prefill: {
            name: user?.name || 'Shopkeeper',
            email: user?.email || '',
            contact: user?.mobile || '',
          },
          theme: {
            color: '#D97706',
          },
          handler: async function (response: any) {
            try {
              const verifyRes = await shopkeeperApi.rechargeWalletVerify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                amount: amountNum,
              });

              const credited = (verifyRes as any).creditedAmount ?? (verifyRes as any).transaction?.amount ?? amountNum;
              const newBal = (verifyRes as any).newBalance ?? (verifyRes as any).wallet?.balance ?? 0;

              setRechargeSuccess(
                `🎉 Success! ₹${Number(credited).toFixed(2)} added to your wallet. New balance: ₹${Number(newBal).toFixed(2)}.`
              );
              setShowRechargeModal(false);
              await loadWallet();
            } catch (err: any) {
              setRechargeError(err.message || 'Payment verification failed.');
            } finally {
              setIsRecharging(false);
            }
          },
          modal: {
            ondismiss: function () {
              setIsRecharging(false);
            },
          },
        };

        const rzp = new win.Razorpay(options);
        rzp.on('payment.failed', function (resp: any) {
          setRechargeError(resp.error?.description || 'Payment failed. Please retry.');
          setIsRecharging(false);
        });
        rzp.open();
      } else {
        // Fallback simulated payment for local environment
        const mockSig = `sig_sim_${Date.now()}`;
        const verifyRes = await shopkeeperApi.rechargeWalletVerify({
          razorpay_order_id: activeOrderId,
          razorpay_payment_id: `pay_mock_${Date.now()}`,
          razorpay_signature: mockSig,
          amount: amountNum,
        });

        const credited = (verifyRes as any).creditedAmount ?? (verifyRes as any).transaction?.amount ?? amountNum;
        const newBal = (verifyRes as any).newBalance ?? (verifyRes as any).wallet?.balance ?? 0;

        setRechargeSuccess(
          `🎉 ₹${Number(credited).toFixed(2)} recharged successfully! New balance: ₹${Number(newBal).toFixed(2)}.`
        );
        setShowRechargeModal(false);
        await loadWallet();
        setIsRecharging(false);
      }
    } catch (err: any) {
      setRechargeError(err.message || 'Failed to initiate wallet recharge.');
      setIsRecharging(false);
    }
  };

  const handleSaveTax = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingTax(true);
    setTaxErrorMsg(null);
    setTaxSuccessMsg(null);
    try {
      const res = await shopkeeperApi.updateTaxSettings({
        gstEnabled,
        gstNumber: gstNumber.trim() || undefined,
        cgstRate: Number(cgstRate) || 0,
        sgstRate: Number(sgstRate) || 0,
      });
      const tx = (res as any).settings || res;
      if (tx) {
        setTaxSettings(tx);
        setGstEnabled(tx.gstEnabled);
        setGstNumber(tx.gstNumber || '');
        setCgstRate(Number(tx.cgstRate ?? 2.5));
        setSgstRate(Number(tx.sgstRate ?? 2.5));
      }
      setTaxSuccessMsg('GST tax settings saved successfully!');
      setTimeout(() => setTaxSuccessMsg(null), 5000);
    } catch (err: any) {
      setTaxErrorMsg(err.message || 'Failed to update GST settings');
    } finally {
      setIsSavingTax(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'SHOPKEEPER') {
      loadData();
    }
  }, [user]);

  // Check notification permission on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const playKitchenChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      setHasAudioUnlocked(true);

      const playTone = (freq: number, start: number, duration: number, gainVal: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
        gain.gain.setValueAtTime(gainVal, ctx.currentTime + start);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime + start + duration);
      };

      // 3-tone harmonic kitchen doorbell chime (C5 -> E5 -> C6)
      playTone(523.25, 0.0, 0.35, 0.35); // C5
      playTone(659.25, 0.12, 0.35, 0.35); // E5
      playTone(1046.5, 0.25, 0.7, 0.4);   // C6
    } catch (e) {
      // Audio autoplay policy
    }
  };

  const triggerDesktopNotification = (order: Order) => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (Notification.permission === 'granted') {
      const itemsList = (order.items || [])
        .map((it: any) => `${it.quantity}× ${it.productName || it.product?.name || 'Item'}`)
        .join(', ');
      const total = Number(order.totalAmount ?? order.total ?? 0);
      const cleanToken = String(order.tokenNumber || order.id)
        .replace(/^T-/, '')
        .replace(/^ORD-/, '')
        .padStart(2, '0');
      try {
        const notif = new Notification(`🍽️ New Order Received! Token #${cleanToken}`, {
          body: `Total ₹${total}${itemsList ? ` • ${itemsList}` : ''}`,
          icon: '/favicon.ico',
        });
        notif.onclick = () => {
          window.focus();
          setActiveTab('ORDERS');
          setOrderFilter('NEW');
          setHighlightedOrderId(order.id);
        };
      } catch (e) {
        // Notification error fallback
      }
    }
  };

  const handleTestAlerts = async () => {
    playKitchenChime();
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        const perm = await Notification.requestPermission();
        setNotificationPermission(perm);
        if (perm === 'granted') {
          try {
            new Notification('🔔 Kitchen Alerts Active!', {
              body: 'You will receive desktop alerts and sound chimes for incoming food orders.',
            });
          } catch (e) {}
        }
      }
    }
  };

  // Real-time Socket.io listener for new orders and status updates
  useEffect(() => {
    if (!user?.shopId) return;

    joinShopRoom(user.shopId);
    const socket = getSocket();

    const handleNewOrder = (orderData: any) => {
      // REQUIREMENT: Notification only comes for kitchen AFTER payment is PAID!
      const paymentStatus = orderData.paymentStatus || 'PAID';
      if (paymentStatus !== 'PAID') {
        return; // Strictly ignore unpaid orders for kitchen notifications
      }

      // Format token cleanly: ONLY the sequential token number, NO 'T-' prefix
      let rawToken = orderData.tokenNumber;
      if (typeof rawToken === 'string' && rawToken.startsWith('T-')) {
        rawToken = rawToken.replace(/^T-/, '');
      }
      const cleanToken = rawToken || String(orderData.id || orderData.orderId || '01').padStart(2, '0');

      const normalizedOrder: Order = {
        ...orderData,
        id: Number(orderData.id || orderData.orderId),
        orderStatus: orderData.orderStatus || 'CONFIRMED',
        paymentStatus: 'PAID',
        tokenNumber: cleanToken,
        totalAmount: Number(orderData.totalAmount ?? orderData.total ?? 0),
        subtotal: Number(orderData.subtotal ?? orderData.totalAmount ?? orderData.total ?? 0),
        items: (orderData.items || []).map((it: any) => ({
          ...it,
          id: it.id || Math.random(),
          productName: it.productName || it.product?.name || 'Item',
          quantity: it.quantity || 1,
          lineTotal:
            it.lineTotal !== undefined
              ? Number(it.lineTotal)
              : Number(it.unitPrice || it.price || 0) * (it.quantity || 1),
        })),
        createdAt: orderData.createdAt || new Date().toISOString(),
      };

      playKitchenChime();
      triggerDesktopNotification(normalizedOrder);

      // Top banner alert
      setNewOrderAlert(`New Order incoming! Token: ${cleanToken}`);
      setTimeout(() => setNewOrderAlert(null), 8000);

      // Add to floating interactive toasts
      const toastId = `toast-${normalizedOrder.id}-${Date.now()}`;
      setLiveOrderToasts((prev) => [
        { id: toastId, order: normalizedOrder },
        ...prev.filter((t) => t.order.id !== normalizedOrder.id).slice(0, 2),
      ]);

      // Auto dismiss toast after 15 seconds
      setTimeout(() => {
        setLiveOrderToasts((prev) => prev.filter((t) => t.id !== toastId));
      }, 15000);

      // Highlight in KDS grid
      setHighlightedOrderId(normalizedOrder.id);
      setTimeout(() => {
        setHighlightedOrderId((cur) => (cur === normalizedOrder.id ? null : cur));
      }, 20000);

      // Update orders list state
      setOrders((prev) => {
        if (prev.some((o) => o.id === normalizedOrder.id)) {
          return prev.map((o) => (o.id === normalizedOrder.id ? { ...o, ...normalizedOrder } : o));
        }
        return [normalizedOrder, ...prev];
      });

      // Also refresh stats
      shopkeeperApi
        .getStats()
        .then((res) => {
          if (res?.stats) setStats(res.stats);
        })
        .catch(() => {});
    };

    const handleStatusUpdated = (updatedOrder: Order) => {
      setOrders((prev) =>
        prev.map((o) => (o.id === updatedOrder.id ? { ...o, ...updatedOrder } : o))
      );
    };

    socket.on('new_order', handleNewOrder);
    socket.on('order_status_updated', handleStatusUpdated);

    // Background sync: poll latest orders and stats every 10 seconds
    // Pauses automatically if the tab is minimized or hidden to save database connections
    const pollInterval = setInterval(async () => {
      if (typeof document !== 'undefined' && document.hidden) {
        return;
      }

      try {
        const [ordersRes, statsRes] = await Promise.all([
          shopkeeperApi.getOrders().catch(() => null),
          shopkeeperApi.getStats().catch(() => null),
        ]);

        const incomingOrders = Array.isArray(ordersRes) ? ordersRes : (ordersRes?.orders || []);

        if (Array.isArray(incomingOrders) && incomingOrders.length > 0) {
          setOrders((currentOrders) => {
            // Only trigger kitchen alerts for orders that are PAID and were not previously notified as paid!
            const freshlyPaidOrders = incomingOrders.filter((o: any) => {
              if (o.paymentStatus !== 'PAID') return false;
              const existing = currentOrders.find((c) => c.id === o.id);
              return !existing || existing.paymentStatus !== 'PAID';
            });

            if (freshlyPaidOrders.length > 0) {
              const latestNew = freshlyPaidOrders[0];
              const cleanToken = String(latestNew.tokenNumber || latestNew.id)
                .replace(/^T-/, '')
                .replace(/^ORD-/, '')
                .padStart(2, '0');
              playKitchenChime();
              triggerDesktopNotification(latestNew);

              setNewOrderAlert(`New Order incoming! Token: ${cleanToken}`);
              setTimeout(() => setNewOrderAlert(null), 8000);

              const toastId = `toast-${latestNew.id}-${Date.now()}`;
              setLiveOrderToasts((prev) => [
                { id: toastId, order: latestNew },
                ...prev.filter((t) => t.order.id !== latestNew.id).slice(0, 2),
              ]);
              setTimeout(() => {
                setLiveOrderToasts((prev) => prev.filter((t) => t.id !== toastId));
              }, 15000);

              setHighlightedOrderId(latestNew.id);
              setTimeout(() => {
                setHighlightedOrderId((cur) => (cur === latestNew.id ? null : cur));
              }, 20000);
            }

            // Sync with updated status/payment/tokens from server
            return incomingOrders;
          });
        }

        if (statsRes?.stats) {
          setStats(statsRes.stats);
        }
      } catch (err) {
        // Silent poll error fallback
      }
    }, 10000);

    return () => {
      clearInterval(pollInterval);
      socket.off('new_order', handleNewOrder);
      socket.off('order_status_updated', handleStatusUpdated);
    };
  }, [user?.shopId]);

  // Status transitions
  const handleStatusChange = async (orderId: number, nextStatus: OrderStatus) => {
    setUpdatingOrderId(orderId);
    try {
      await shopkeeperApi.updateOrderStatus(orderId, nextStatus);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, orderStatus: nextStatus } : o))
      );
      setSelectedReceiptOrder((prev) =>
        prev && prev.id === orderId ? { ...prev, orderStatus: nextStatus } : prev
      );
    } catch (err: any) {
      alert(err.message || 'Failed to update order status');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Toggle availability
  const handleToggleProduct = async (prodId: number, current: boolean) => {
    try {
      await shopkeeperApi.toggleProductAvailability(prodId, !current);
      setProducts((prev) =>
        prev.map((p) => (p.id === prodId ? { ...p, isAvailable: !current } : p))
      );
    } catch (err: any) {
      alert(err.message || 'Failed to toggle product availability');
    }
  };

  // Create Product
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdCatId || !newProdName || !newProdPrice) return;
    setIsSubmittingProd(true);
    try {
      const res = await shopkeeperApi.createProduct({
        name: newProdName,
        price: parseFloat(newProdPrice),
        categoryId: Number(newProdCatId),
        description: newProdDesc || undefined,
        imageUrl: newProdImage || undefined,
      });
      setProducts((prev) => [res.product, ...prev]);
      setShowAddProductModal(false);
      setNewProdName('');
      setNewProdPrice('');
      setNewProdDesc('');
      setNewProdImage('');
    } catch (err: any) {
      alert(err.message || 'Failed to create product');
    } finally {
      setIsSubmittingProd(false);
    }
  };

  // Open Edit Product Modal
  const openEditProduct = (prod: Product) => {
    setEditProdId(prod.id);
    setEditProdName(prod.name);
    setEditProdPrice(String(prod.price));
    setEditProdCatId(prod.categoryId);
    setEditProdDesc(prod.description || '');
    setEditProdImage(prod.imageUrl || '');
    setEditProdAvailable(prod.isAvailable);
    setEditUploadError('');
    setShowEditProductModal(true);
  };

  // Submit Edit Product
  const handleEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editProdId || !editProdName || !editProdPrice || !editProdCatId) return;
    setIsSubmittingEditProd(true);
    try {
      const res = await shopkeeperApi.updateProduct(editProdId, {
        name: editProdName,
        price: parseFloat(editProdPrice),
        categoryId: Number(editProdCatId),
        description: editProdDesc || undefined,
        imageUrl: editProdImage || undefined,
        isAvailable: editProdAvailable,
      });
      setProducts((prev) =>
        prev.map((p) => (p.id === editProdId ? { ...p, ...res.product } : p))
      );
      setShowEditProductModal(false);
    } catch (err: any) {
      alert(err.message || 'Failed to update product');
    } finally {
      setIsSubmittingEditProd(false);
    }
  };

  // Delete Product
  const handleDeleteProduct = async () => {
    if (!deleteProductTarget) return;
    setIsDeletingProd(true);
    try {
      await shopkeeperApi.deleteProduct(deleteProductTarget.id);
      setProducts((prev) => prev.filter((p) => p.id !== deleteProductTarget.id));
      setDeleteProductTarget(null);
    } catch (err: any) {
      alert(err.message || 'Failed to delete product');
    } finally {
      setIsDeletingProd(false);
    }
  };

  // Create Category
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName) return;
    setIsSubmittingCat(true);
    try {
      const res = await shopkeeperApi.createCategory({
        name: newCatName,
        description: newCatDesc || undefined,
      });
      setCategories((prev) => [...prev, res.category]);
      setShowAddCatModal(false);
      setNewCatName('');
      setNewCatDesc('');
    } catch (err: any) {
      alert(err.message || 'Failed to create category');
    } finally {
      setIsSubmittingCat(false);
    }
  };

  // Open Edit Category
  const openEditCategory = (cat: Category) => {
    setEditCatId(cat.id);
    setEditCatName(cat.name);
    setEditCatDesc(cat.description || '');
    setShowEditCatModal(true);
  };

  // Submit Edit Category
  const handleEditCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCatId || !editCatName) return;
    setIsSubmittingEditCat(true);
    try {
      const res = await shopkeeperApi.updateCategory(editCatId, {
        name: editCatName,
        description: editCatDesc || undefined,
      });
      setCategories((prev) =>
        prev.map((c) => (c.id === editCatId ? { ...c, ...res.category } : c))
      );
      setShowEditCatModal(false);
    } catch (err: any) {
      alert(err.message || 'Failed to update category');
    } finally {
      setIsSubmittingEditCat(false);
    }
  };

  // Delete Category
  const handleDeleteCategory = async () => {
    if (!deleteCatTarget) return;
    setIsDeletingCat(true);
    try {
      await shopkeeperApi.deleteCategory(deleteCatTarget.id);
      setCategories((prev) => prev.filter((c) => c.id !== deleteCatTarget.id));
      setDeleteCatTarget(null);
    } catch (err: any) {
      alert(err.message || 'Failed to delete category');
    } finally {
      setIsDeletingCat(false);
    }
  };

  // Milestone Reward & Coupon Handlers
  const handleSaveRewardRule = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingRewardRule(true);
    setRewardRuleSuccess(false);
    try {
      const res = await shopkeeperApi.updateRewardRule({
        milestoneCount: Number(rewardRule.milestoneCount),
        discountAmount: Number(rewardRule.discountAmount),
        minOrderAmount: Number(rewardRule.minOrderAmount),
        isActive: Boolean(rewardRule.isActive),
        title: rewardRule.title || undefined,
      });
      if (res?.rule) setRewardRule(res.rule);
      setRewardRuleSuccess(true);
      setTimeout(() => setRewardRuleSuccess(false), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to save milestone rule');
    } finally {
      setIsSavingRewardRule(false);
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode.trim() || !newCouponValue) return;
    setIsSubmittingCoupon(true);
    setCouponFormError('');
    try {
      const res = await shopkeeperApi.createCoupon({
        code: newCouponCode.trim().toUpperCase(),
        discountType: newCouponType,
        discountValue: parseFloat(newCouponValue),
        minOrderAmount: newCouponMinOrder ? parseFloat(newCouponMinOrder) : 0,
        maxDiscount: newCouponMaxDiscount ? parseFloat(newCouponMaxDiscount) : undefined,
      });
      setCoupons((prev) => [res.coupon, ...prev]);
      setShowAddCouponModal(false);
      setNewCouponCode('');
      setNewCouponValue('');
      setNewCouponMinOrder('');
      setNewCouponMaxDiscount('');
    } catch (err: any) {
      setCouponFormError(err.message || 'Failed to create coupon');
    } finally {
      setIsSubmittingCoupon(false);
    }
  };

  const handleDeleteCoupon = async (id: number) => {
    if (!window.confirm('Delete this coupon code? Customers will no longer be able to use it.')) return;
    try {
      await shopkeeperApi.deleteCoupon(id);
      setCoupons((prev) => prev.filter((c) => c.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete coupon');
    }
  };

  // Profile & Ambience Action Handlers
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileSuccess(false);
    try {
      const res = await shopkeeperApi.updateProfile({
        name: shopProfile.name,
        address: shopProfile.address,
        state: shopProfile.state,
        district: shopProfile.district,
        phone: shopProfile.phone,
        logoUrl: shopProfile.logoUrl,
        bannerUrl: shopProfile.bannerUrl,
        description: shopProfile.description,
        ambienceImages: shopProfile.ambienceImages,
        keeperName: keeperProfile.name,
        keeperMobile: keeperProfile.mobile,
        keeperAvatarUrl: keeperProfile.avatarUrl,
      });
      if (res?.shop) {
        setShopProfile({
          name: res.shop.name || '',
          address: res.shop.address || '',
          state: res.shop.state || '',
          district: res.shop.district || '',
          phone: res.shop.phone || '',
          logoUrl: res.shop.logoUrl || '',
          bannerUrl: res.shop.bannerUrl || '',
          description: res.shop.description || '',
          ambienceImages: res.shop.ambienceImages || [],
        });
      }
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 5000);
    } catch (err: any) {
      alert(err.message || 'Failed to save restaurant profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleUploadShopLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingLogo(true);
    try {
      const url = await shopkeeperApi.uploadImage(file);
      setShopProfile((prev) => ({ ...prev, logoUrl: url }));
    } catch (err: any) {
      alert(err.message || 'Failed to upload shop logo');
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleUploadAmbienceImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingAmbience(true);
    try {
      const url = await shopkeeperApi.uploadImage(file);
      setShopProfile((prev) => ({
        ...prev,
        ambienceImages: [...(prev.ambienceImages || []), url],
      }));
    } catch (err: any) {
      alert(err.message || 'Failed to upload ambience image');
    } finally {
      setIsUploadingAmbience(false);
    }
  };

  const handleRemoveAmbienceImage = (index: number) => {
    setShopProfile((prev) => ({
      ...prev,
      ambienceImages: (prev.ambienceImages || []).filter((_, i) => i !== index),
    }));
  };

  const handleUploadKeeperAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingAvatar(true);
    try {
      const url = await shopkeeperApi.uploadImage(file);
      setKeeperProfile((prev) => ({ ...prev, avatarUrl: url }));
    } catch (err: any) {
      alert(err.message || 'Failed to upload avatar');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Calculated metrics with Restaurant Business Day (4:00 AM shift rollover)
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
      if (o.paymentStatus !== 'PAID' || o.orderStatus === 'CANCELLED') return false;
      const d = new Date(o.createdAt);
      return d >= cutoff;
    });
  }, [orders]);

  const weekPaidOrders = useMemo(() => {
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return orders.filter((o) => {
      if (o.paymentStatus !== 'PAID' || o.orderStatus === 'CANCELLED') return false;
      const d = new Date(o.createdAt).getTime();
      return d >= sevenDaysAgo;
    });
  }, [orders]);

  const monthPaidOrders = useMemo(() => {
    const now = new Date();
    return orders.filter((o) => {
      if (o.paymentStatus !== 'PAID' || o.orderStatus === 'CANCELLED') return false;
      const d = new Date(o.createdAt);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
  }, [orders]);

  const todayOrdersCount =
    stats?.todayOrders && stats.todayOrders > 0
      ? stats.todayOrders
      : todayPaidOrders.length;

  const todaySalesVal =
    stats?.todaySales && stats.todaySales > 0
      ? Number(stats.todaySales)
      : stats?.todayRevenue && stats.todayRevenue > 0
      ? Number(stats.todayRevenue)
      : todayPaidOrders.reduce((sum, o) => sum + Number(o.totalAmount ?? o.total ?? 0), 0);

  const weekOrdersCount =
    stats?.weekOrders && stats.weekOrders > 0
      ? stats.weekOrders
      : weekPaidOrders.length;

  const weekSalesVal =
    stats?.weekSales && stats.weekSales > 0
      ? Number(stats.weekSales)
      : stats?.weekRevenue && stats.weekRevenue > 0
      ? Number(stats.weekRevenue)
      : weekPaidOrders.reduce((sum, o) => sum + Number(o.totalAmount ?? o.total ?? 0), 0);

  const monthOrdersCount =
    stats?.monthOrders && stats.monthOrders > 0
      ? stats.monthOrders
      : monthPaidOrders.length;

  const monthSalesVal =
    stats?.monthSales && stats.monthSales > 0
      ? Number(stats.monthSales)
      : stats?.monthRevenue && stats.monthRevenue > 0
      ? Number(stats.monthRevenue)
      : monthPaidOrders.reduce((sum, o) => sum + Number(o.totalAmount ?? o.total ?? 0), 0);

  const lifetimeSalesVal = Number(
    stats?.totalSales ??
    stats?.totalRevenue ??
    orders
      .filter((o) => o.paymentStatus === 'PAID' && o.orderStatus !== 'CANCELLED')
      .reduce((sum, o) => sum + Number(o.totalAmount ?? o.total ?? 0), 0)
  );

  const todayDiscountsVal =
    stats?.todayDiscounts !== undefined
      ? Number(stats.todayDiscounts)
      : todayPaidOrders.reduce((sum, o) => sum + Number(o.discountAmount ?? 0), 0);

  const todayGrossSalesVal =
    stats?.todayGrossSales !== undefined
      ? Number(stats.todayGrossSales)
      : todaySalesVal + todayDiscountsVal;

  const activeOrdersCount = orders.filter(
    (o) => o.orderStatus !== 'COMPLETED' && o.orderStatus !== 'CANCELLED'
  ).length;

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

  // Exactly 5 filter category counts
  const filterCounts = useMemo(() => {
    return {
      ALL: orders.length,
      NEW: orders.filter((o) => o.orderStatus === 'PENDING').length,
      COOKING: orders.filter((o) => o.orderStatus === 'CONFIRMED' || o.orderStatus === 'PREPARING').length,
      READY: orders.filter((o) => o.orderStatus === 'READY').length,
      COMPLETED: orders.filter((o) => o.orderStatus === 'COMPLETED').length,
    };
  }, [orders]);

  // Filtered orders with search, status & date range
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      // Status filter - exactly 5 categories
      let matchesStatus = true;
      if (orderFilter === 'NEW') {
        matchesStatus = o.orderStatus === 'PENDING';
      } else if (orderFilter === 'COOKING') {
        matchesStatus = o.orderStatus === 'CONFIRMED' || o.orderStatus === 'PREPARING';
      } else if (orderFilter === 'READY') {
        matchesStatus = o.orderStatus === 'READY';
      } else if (orderFilter === 'COMPLETED') {
        matchesStatus = o.orderStatus === 'COMPLETED';
      } else {
        // 'ALL' -> includes every order, including CANCELLED
        matchesStatus = true;
      }

      // Date range filter
      const matchesDate = matchesDateRange(o.createdAt, orderDatePreset, orderStartDate, orderEndDate);

      // Search filter
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (o.tokenNumber && o.tokenNumber.toLowerCase().includes(q)) ||
        (o.orderCode && o.orderCode.toLowerCase().includes(q)) ||
        String(o.id).includes(q) ||
        (o.customerName && o.customerName.toLowerCase().includes(q)) ||
        (o.customerPhone && o.customerPhone.includes(q)) ||
        (o.items && o.items.some((it: any) => (it.productName || it.product?.name || '').toLowerCase().includes(q)));

      return matchesStatus && matchesDate && matchesSearch;
    });
  }, [orders, orderFilter, searchQuery, orderDatePreset, orderStartDate, orderEndDate]);

  // Cancelled orders are strictly excluded from all recognized revenue and sales totals
  const filteredOrdersTotalAmount = useMemo(() => {
    return filteredOrders
      .filter((o) => o.orderStatus !== 'CANCELLED')
      .reduce((sum, o) => sum + Number(o.totalAmount ?? o.total ?? 0), 0);
  }, [filteredOrders]);

  const filteredOrdersTotalDiscounts = useMemo(() => {
    return filteredOrders
      .filter((o) => o.orderStatus !== 'CANCELLED')
      .reduce((sum, o) => sum + Number(o.discountAmount ?? 0), 0);
  }, [filteredOrders]);

  // Filtered stats orders for STATS tab - strictly excluding cancelled orders
  const filteredStatsOrders = useMemo(() => {
    return orders.filter((o) => {
      if (o.paymentStatus !== 'PAID' || o.orderStatus === 'CANCELLED') return false;
      return matchesDateRange(o.createdAt, statsDatePreset, statsStartDate, statsEndDate);
    });
  }, [orders, statsDatePreset, statsStartDate, statsEndDate]);

  const filteredStatsRevenue = useMemo(() => {
    return filteredStatsOrders.reduce((sum, o) => sum + Number(o.totalAmount ?? o.total ?? 0), 0);
  }, [filteredStatsOrders]);

  const filteredStatsDiscounts = useMemo(() => {
    return filteredStatsOrders.reduce((sum, o) => sum + Number(o.discountAmount ?? 0), 0);
  }, [filteredStatsOrders]);

  // Kitchen status dropdown popover renderer with unclipped high z-index and cancel confirmation
  const renderStatusDropdown = (order: Order) => {
    const isCurrentOpen = openStatusOrderId === order.id;
    const cfg = STATUS_CONFIG[order.orderStatus] || STATUS_CONFIG.PENDING;

    return (
      <div className="relative inline-block text-left">
        <button
          type="button"
          disabled={updatingOrderId === order.id}
          onClick={(e) => {
            e.stopPropagation();
            setOpenStatusOrderId(isCurrentOpen ? null : order.id);
          }}
          className={`px-2.5 py-1 rounded-xl text-[11px] font-black border transition inline-flex items-center gap-1.5 cursor-pointer shadow-2xs hover:shadow-xs disabled:opacity-60 disabled:cursor-not-allowed ${cfg.badgeBg} ${cfg.badgeText} ${cfg.badgeBorder}`}
          title="Click to update status"
        >
          <span className={`w-2 h-2 rounded-full shrink-0 ${cfg.dotColor}`} />
          <span className="truncate">{cfg.label}</span>
          <ChevronDown className={`w-3 h-3 transition-transform ${isCurrentOpen ? 'rotate-180' : ''}`} />
        </button>

        {isCurrentOpen && (
          <>
            <div
              className="fixed inset-0 z-40 bg-transparent"
              onClick={() => setOpenStatusOrderId(null)}
            />
            <div
              className="absolute left-0 sm:right-0 sm:left-auto top-full mt-1.5 w-60 bg-white rounded-2xl shadow-2xl border border-slate-200 p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 text-left"
              onClick={(e) => e.stopPropagation()}
            >
            <div className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1">
              Change Status
            </div>
            {(['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'] as OrderStatus[]).map((st) => {
              const isSelected = order.orderStatus === st;
              const itemCfg = STATUS_CONFIG[st];
              return (
                <button
                  key={st}
                  type="button"
                  disabled={updatingOrderId === order.id}
                  onClick={() => {
                    setOpenStatusOrderId(null);
                    if (st === 'CANCELLED') {
                      setOrderToCancel(order);
                    } else if (!isSelected) {
                      handleStatusChange(order.id, st);
                    }
                  }}
                  className={`w-full text-left px-2.5 py-2 rounded-xl text-xs transition flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-slate-100 font-black text-slate-900'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${itemCfg.dotColor}`} />
                    <div>
                      <p className="leading-tight font-bold">{itemCfg.label}</p>
                      <p className="text-[10px] text-slate-400 font-normal leading-tight mt-0.5">
                        {itemCfg.description}
                      </p>
                    </div>
                  </div>
                  {isSelected && (
                    <span className="text-emerald-600 font-black text-sm ml-2">✓</span>
                  )}
                </button>
              );
            })}
          </div>
          </>
        )}
      </div>
    );
  };

  // Status Badge for Cards (Clean, non-dropdown static badge that prevents layout overflow/collapse)
  const renderStatusBadge = (order: Order) => {
    const cfg = STATUS_CONFIG[order.orderStatus] || STATUS_CONFIG.PENDING;
    return (
      <span
        className={`px-2.5 py-1 rounded-xl text-[11px] font-black border inline-flex items-center gap-1.5 shadow-2xs ${cfg.badgeBg} ${cfg.badgeText} ${cfg.badgeBorder}`}
      >
        <span className={`w-2 h-2 rounded-full shrink-0 ${cfg.dotColor}`} />
        <span className="truncate">{cfg.label}</span>
      </span>
    );
  };

  // Quick Action button renderer: PENDING/CONFIRMED -> Start Cooking, PREPARING -> Mark Ready, READY -> Complete Order
  const renderQuickActionBtn = (order: Order, isFullWidth = false) => {
    const isUpdating = updatingOrderId === order.id;

    if (order.orderStatus === 'PENDING' || order.orderStatus === 'CONFIRMED') {
      return (
        <button
          type="button"
          onClick={() => handleStatusChange(order.id, 'PREPARING')}
          disabled={isUpdating}
          className={`${isFullWidth ? 'flex-1 py-2' : 'px-3 py-1.5'} bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-[11px] rounded-xl shadow-xs transition inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50`}
        >
          {isUpdating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ChefHat className="w-3.5 h-3.5" />}
          <span>Start Cooking</span>
        </button>
      );
    }

    if (order.orderStatus === 'PREPARING') {
      return (
        <button
          type="button"
          onClick={() => handleStatusChange(order.id, 'READY')}
          disabled={isUpdating}
          className={`${isFullWidth ? 'flex-1 py-2' : 'px-3 py-1.5'} bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] rounded-xl shadow-xs transition inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50`}
        >
          {isUpdating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Bell className="w-3.5 h-3.5" />}
          <span>Mark Ready</span>
        </button>
      );
    }

    if (order.orderStatus === 'READY') {
      return (
        <button
          type="button"
          onClick={() => handleStatusChange(order.id, 'COMPLETED')}
          disabled={isUpdating}
          className={`${isFullWidth ? 'flex-1 py-2' : 'px-3 py-1.5'} bg-slate-900 hover:bg-black text-white font-extrabold text-[11px] rounded-xl shadow-xs transition inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50`}
        >
          {isUpdating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
          <span>Complete Order</span>
        </button>
      );
    }

    if (order.orderStatus === 'COMPLETED') {
      return (
        <button
          type="button"
          onClick={() => handleStatusChange(order.id, 'READY')}
          disabled={isUpdating}
          className={`${isFullWidth ? 'flex-1 py-2' : 'px-3 py-1.5'} bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] rounded-xl transition inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50`}
        >
          {isUpdating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
          <span>Reopen</span>
        </button>
      );
    }

    if (order.orderStatus === 'CANCELLED') {
      return (
        <button
          type="button"
          onClick={() => handleStatusChange(order.id, 'CONFIRMED')}
          disabled={isUpdating}
          className={`${isFullWidth ? 'flex-1 py-2' : 'px-3 py-1.5'} bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold text-[11px] rounded-xl transition inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50`}
        >
          {isUpdating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
          <span>Restore</span>
        </button>
      );
    }

    return null;
  };

  // Paginated orders
  const totalOrderPages = Math.ceil(filteredOrders.length / ordersPerPage) || 1;
  const paginatedOrders = useMemo(() => {
    const start = (ordersPage - 1) * ordersPerPage;
    return filteredOrders.slice(start, start + ordersPerPage);
  }, [filteredOrders, ordersPage, ordersPerPage]);

  // Filtered products with search & category
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q));

      const matchesCategory =
        categoryFilter === 'ALL' || String(p.categoryId) === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, categoryFilter]);

  // Paginated products
  const totalProductPages = Math.ceil(filteredProducts.length / productsPerPage) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (productsPage - 1) * productsPerPage;
    return filteredProducts.slice(start, start + productsPerPage);
  }, [filteredProducts, productsPage, productsPerPage]);

  // Paginated categories
  const totalCatPages = Math.ceil(categories.length / categoriesPerPage) || 1;
  const paginatedCategories = useMemo(() => {
    const start = (categoriesPage - 1) * categoriesPerPage;
    return categories.slice(start, start + categoriesPerPage);
  }, [categories, categoriesPage, categoriesPerPage]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center space-y-3 text-white">
        <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
        <p className="text-sm font-semibold text-slate-300">
          Connecting to Live Kitchen KDS Feed...
        </p>
      </div>
    );
  }

  // Sidebar Component for reuse (desktop & mobile drawer)
  const renderSidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-orange-900/30 shrink-0">
            <ChefHat className="w-5 h-5" />
          </div>
          <div className="truncate">
            <span className="font-black text-white text-base tracking-tight block leading-tight truncate">
              {user?.shopName || 'Kitchen Operations'}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300/80 bg-amber-950/70 px-1.5 py-0.5 rounded border border-amber-800/50">
              Shop #{user?.shopId}
            </span>
          </div>
        </div>
        {/* Close button for mobile */}
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
          Kitchen Hub
        </div>

        <button
          onClick={() => {
            setActiveTab('ORDERS');
            setIsMobileSidebarOpen(false);
          }}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'ORDERS'
              ? 'bg-amber-500 text-white shadow-md shadow-amber-900/20'
              : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
          }`}
        >
          <div className="flex items-center space-x-3">
            <UtensilsCrossed className="w-4 h-4" />
            <span>Kitchen Orders</span>
          </div>
          {activeOrdersCount > 0 && (
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                activeTab === 'ORDERS'
                  ? 'bg-amber-700 text-white'
                  : 'bg-amber-500/20 text-amber-400'
              }`}
            >
              {activeOrdersCount}
            </span>
          )}
        </button>

        <button
          onClick={() => {
            setActiveTab('PRODUCTS');
            setIsMobileSidebarOpen(false);
          }}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'PRODUCTS'
              ? 'bg-amber-500 text-white shadow-md shadow-amber-900/20'
              : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
          }`}
        >
          <div className="flex items-center space-x-3">
            <Package className="w-4 h-4" />
            <span>Dishes & Stock</span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            {products.length}
          </span>
        </button>

        <button
          onClick={() => {
            setActiveTab('CATEGORIES');
            setIsMobileSidebarOpen(false);
          }}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'CATEGORIES'
              ? 'bg-amber-500 text-white shadow-md shadow-amber-900/20'
              : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
          }`}
        >
          <div className="flex items-center space-x-3">
            <Layers className="w-4 h-4" />
            <span>Categories</span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            {categories.length}
          </span>
        </button>

        <button
          onClick={() => {
            setActiveTab('STATS');
            setIsMobileSidebarOpen(false);
          }}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'STATS'
              ? 'bg-amber-500 text-white shadow-md shadow-amber-900/20'
              : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
          }`}
        >
          <div className="flex items-center space-x-3">
            <TrendingUp className="w-4 h-4" />
            <span>Revenue & Reports</span>
          </div>
        </button>

        <button
          onClick={() => {
            setActiveTab('DISCOUNTS');
            setIsMobileSidebarOpen(false);
          }}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'DISCOUNTS'
              ? 'bg-amber-500 text-white shadow-md shadow-amber-900/20'
              : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
          }`}
        >
          <div className="flex items-center space-x-3">
            <Gift className="w-4 h-4 text-amber-400" />
            <span>Offers & Discounts</span>
          </div>
          {rewardRule?.isActive && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          )}
        </button>

        <button
          onClick={() => {
            setActiveTab('PROFILE');
            setIsMobileSidebarOpen(false);
          }}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'PROFILE'
              ? 'bg-amber-500 text-white shadow-md shadow-amber-900/20'
              : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
          }`}
        >
          <div className="flex items-center space-x-3">
            <Store className="w-4 h-4 text-amber-400" />
            <span>Profile & Ambience</span>
          </div>
          {shopProfile.logoUrl && (
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
          )}
        </button>

        <button
          onClick={() => {
            setActiveTab('WALLET');
            setIsMobileSidebarOpen(false);
          }}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'WALLET'
              ? 'bg-amber-500 text-white shadow-md shadow-amber-900/20'
              : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
          }`}
        >
          <div className="flex items-center space-x-3">
            <Wallet className="w-4 h-4 text-emerald-400" />
            <span>Wallet & QR Status</span>
          </div>
          {walletData.wallet && (
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                walletData.wallet.balance < walletData.wallet.minWalletLimit || !walletData.wallet.isQrEnabled
                  ? 'bg-rose-950/80 text-rose-300 border border-rose-800/50'
                  : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/50'
              }`}
            >
              ₹{Number(walletData.wallet.balance).toFixed(0)}
            </span>
          )}
        </button>

        <button
          onClick={() => {
            setActiveTab('TAX_SETTINGS');
            setIsMobileSidebarOpen(false);
          }}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'TAX_SETTINGS'
              ? 'bg-amber-500 text-white shadow-md shadow-amber-900/20'
              : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
          }`}
        >
          <div className="flex items-center space-x-3">
            <Percent className="w-4 h-4 text-emerald-400" />
            <span>GST &amp; Taxes</span>
          </div>
          {gstEnabled && (
            <span className="text-[9px] px-1 py-0.5 rounded font-extrabold bg-emerald-950/80 text-emerald-300 border border-emerald-800/50 uppercase">
              Active
            </span>
          )}
        </button>

        <div className="pt-4 px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Store Front
        </div>

        <a
          href={user?.shopSlug ? `/shop/${user.shopSlug}` : '/shop/abc'}
          target="_blank"
          rel="noreferrer"
          className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800/70 hover:text-white transition"
        >
          <div className="flex items-center space-x-3">
            <Store className="w-4 h-4 text-amber-400" />
            <span>Customer QR Menu</span>
          </div>
          <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" />
        </a>
      </nav>

      {/* Sidebar Footer / User Profile */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/60 flex items-center justify-between">
        <div className="flex items-center space-x-3 min-w-0">
          {keeperProfile.avatarUrl || user?.avatarUrl ? (
            <img
              src={keeperProfile.avatarUrl || user?.avatarUrl || ''}
              alt={keeperProfile.name || user?.name || 'Chef'}
              className="w-9 h-9 rounded-xl object-cover border border-amber-500/40 shrink-0"
            />
          ) : (
            <div className="w-9 h-9 rounded-xl bg-amber-500/30 border border-amber-500/30 flex items-center justify-center font-bold text-xs text-amber-300 shrink-0">
              {user?.name?.slice(0, 2).toUpperCase() || 'KM'}
            </div>
          )}
          <div className="truncate">
            <p className="text-xs font-bold text-white truncate leading-tight">
              {keeperProfile.name || user?.name}
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
        <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sticky top-0 z-40 shadow-xs">
          <div className="flex items-center space-x-3">
            {/* Hamburger for mobile */}
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-amber-600 uppercase tracking-wide">
                  Kitchen Display
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-xs font-medium text-slate-500 hidden sm:inline">
                  {activeTab === 'ORDERS' && 'Live Incoming Order Tickets'}
                  {activeTab === 'PRODUCTS' && 'Menu Items & Stock Controls'}
                  {activeTab === 'CATEGORIES' && 'Menu Groupings & Order'}
                  {activeTab === 'STATS' && "Today, This Week & This Month's Sales Breakdown"}
                  {activeTab === 'DISCOUNTS' && 'Milestone Rewards & Promo Coupon Codes'}
                  {activeTab === 'PROFILE' && 'Store Logo, Ambience Photos & Restaurant Story'}
                  {activeTab === 'WALLET' && 'Prepaid Balance & QR Payment Permission'}
                  {activeTab === 'TAX_SETTINGS' && 'Restaurant GSTIN & Tax Rates'}
                </span>
              </div>
              <h1 className="text-lg sm:text-2xl font-black text-slate-900 mt-0.5">
                {activeTab === 'ORDERS' && 'Live Kitchen Orders (KDS)'}
                {activeTab === 'PRODUCTS' && 'Menu Items & Stock Controls'}
                {activeTab === 'CATEGORIES' && 'Category Management'}
                {activeTab === 'STATS' && 'Sales & Revenue Analytics'}
                {activeTab === 'DISCOUNTS' && 'Discounts & Promotional Offers'}
                {activeTab === 'PROFILE' && 'Restaurant Profile & Ambience Gallery'}
                {activeTab === 'WALLET' && 'Prepaid Wallet & QR Status'}
                {activeTab === 'TAX_SETTINGS' && 'GST & Tax Settings'}
              </h1>
            </div>
          </div>

          {/* Action Buttons & Search */}
          <div className="flex items-center space-x-2 flex-wrap">
            {(activeTab === 'ORDERS' || activeTab === 'PRODUCTS') && (
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setOrdersPage(1);
                    setProductsPage(1);
                  }}
                  placeholder={activeTab === 'ORDERS' ? 'Search token, order #...' : 'Search dish...'}
                  className="text-xs pl-8 pr-3 py-1.5 sm:py-2 bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500 w-36 sm:w-56"
                />
              </div>
            )}

            {activeTab === 'PRODUCTS' && (
              <button
                onClick={() => setShowAddProductModal(true)}
                className="px-3 py-1.5 sm:py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center space-x-1.5 cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Add Dish</span>
              </button>
            )}

            {activeTab === 'CATEGORIES' && (
              <button
                onClick={() => setShowAddCatModal(true)}
                className="px-3 py-1.5 sm:py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center space-x-1.5 cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Add Category</span>
              </button>
            )}

            <button
              onClick={handleTestAlerts}
              title="Test kitchen chime & enable desktop notifications"
              className={`px-3 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer border shrink-0 ${
                notificationPermission === 'granted'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
              }`}
            >
              <Bell
                className={`w-3.5 h-3.5 ${
                  hasAudioUnlocked ? 'text-emerald-600' : 'text-amber-600 animate-bounce'
                }`}
              />
              <span className="hidden sm:inline">
                {notificationPermission === 'granted' ? 'Alerts Active' : 'Test Kitchen Chime'}
              </span>
              <span
                className={`w-2 h-2 rounded-full ${
                  notificationPermission === 'granted'
                    ? 'bg-emerald-500'
                    : 'bg-amber-500 animate-ping'
                }`}
              />
            </button>

            {walletData.wallet && (
              <button
                type="button"
                onClick={() => setActiveTab('WALLET')}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition cursor-pointer shrink-0 ${
                  walletData.wallet.balance < walletData.wallet.minWalletLimit || !walletData.wallet.isQrEnabled
                    ? 'bg-rose-50 text-rose-800 border-rose-300 hover:bg-rose-100'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                }`}
                title="Click to view prepaid wallet details"
              >
                <Wallet className="w-3.5 h-3.5" />
                <span className="font-mono">₹{Number(walletData.wallet.balance).toFixed(2)}</span>
                <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded-full bg-white/80 shadow-2xs">
                  {walletData.wallet.balance < walletData.wallet.minWalletLimit
                    ? 'Low Limit'
                    : !walletData.wallet.isQrEnabled
                    ? 'QR Paused'
                    : 'QR Active'}
                </span>
              </button>
            )}

            <button
              onClick={loadData}
              title="Refresh Data"
              className="p-1.5 sm:p-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {/* Profile Dropdown Menu in Dashboard Header */}
            <div className="relative">
              {(() => {
                const userAvatar = user?.avatar || user?.avatarUrl;
                return (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                      className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-full border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 transition cursor-pointer shadow-2xs"
                    >
                      {userAvatar ? (
                        <img
                          src={userAvatar}
                          alt={user?.name || 'Staff'}
                          className="w-7 h-7 rounded-full object-cover border border-amber-300 shrink-0"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 text-white font-black text-xs flex items-center justify-center shrink-0">
                          {(user?.name || 'S').charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="text-left hidden md:block">
                        <span className="text-xs font-bold text-slate-800 block leading-tight truncate max-w-[110px]">
                          {user?.name || 'Restaurant Staff'}
                        </span>
                        <span className="text-[10px] text-amber-600 font-semibold block leading-none">
                          Partner Portal
                        </span>
                      </div>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    </button>

                    {isProfileMenuOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-40 bg-transparent"
                          onClick={() => setIsProfileMenuOpen(false)}
                        />
                        <div
                          className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95 duration-150 text-left"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="p-3 bg-gradient-to-br from-slate-50 to-amber-50/50 rounded-xl border border-slate-100 flex items-center gap-3">
                            {userAvatar ? (
                              <img
                                src={userAvatar}
                                alt={user?.name || 'User'}
                                className="w-10 h-10 rounded-full object-cover border border-amber-400 shrink-0"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 text-white font-black text-sm flex items-center justify-center shrink-0">
                                {(user?.name || 'S').charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div className="overflow-hidden">
                              <p className="font-bold text-xs text-slate-900 truncate">
                                {user?.name || 'Restaurant Staff'}
                              </p>
                              <p className="text-[11px] text-slate-500 truncate">{user?.email || 'No email'}</p>
                              <span className="inline-block mt-0.5 text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-sm bg-amber-100 text-amber-800">
                                {user?.role || 'SHOPKEEPER'}
                              </span>
                            </div>
                          </div>

                          <div className="mt-1.5 space-y-0.5">
                            <button
                              type="button"
                              onClick={() => {
                                setActiveTab('PROFILE');
                                setIsProfileMenuOpen(false);
                              }}
                              className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 flex items-center gap-2 transition cursor-pointer"
                            >
                              <Store className="w-4 h-4 text-slate-400" />
                              <span>Restaurant Settings</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setActiveTab('WALLET');
                                setIsProfileMenuOpen(false);
                              }}
                              className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 flex items-center gap-2 transition cursor-pointer"
                            >
                              <Wallet className="w-4 h-4 text-slate-400" />
                              <span>Prepaid Wallet</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setActiveTab('TAX_SETTINGS');
                                setIsProfileMenuOpen(false);
                              }}
                              className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 flex items-center gap-2 transition cursor-pointer"
                            >
                              <Receipt className="w-4 h-4 text-slate-400" />
                              <span>GST / Tax Settings</span>
                            </button>

                            <div className="border-t border-slate-100 my-1" />

                            <button
                              type="button"
                              onClick={() => {
                                setIsProfileMenuOpen(false);
                                logout();
                                router.push('/shopkeeper/login');
                              }}
                              className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition cursor-pointer"
                            >
                              <LogOut className="w-4 h-4 text-rose-500" />
                              <span>Sign Out</span>
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        </header>

        {/* Low Wallet Balance or Paused QR Warning Banner */}
        {walletData.wallet &&
          (walletData.wallet.balance < walletData.wallet.minWalletLimit ||
            !walletData.wallet.isQrEnabled) && (
            <div className="bg-rose-50 border-b border-rose-200 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3 text-rose-900 text-xs">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>
                  <strong>QR Ordering is currently paused:</strong>{' '}
                  {walletData.wallet.balance < walletData.wallet.minWalletLimit
                    ? `Your prepaid balance (₹${Number(walletData.wallet.balance).toFixed(2)}) is below the required limit (₹${Number(walletData.wallet.minWalletLimit).toFixed(2)}).`
                    : 'QR ordering has been deactivated by administration.'}{' '}
                  Customer checkouts are blocked until your wallet is topped up.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('WALLET')}
                className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold shrink-0 text-[11px] cursor-pointer"
              >
                View Wallet
              </button>
            </div>
          )}

        {/* Incoming Order Flash Alert */}
        {newOrderAlert && (
          <div className="bg-amber-500 text-white px-4 sm:px-6 py-3 shadow-md flex items-center justify-between font-bold text-xs animate-bounce">
            <div className="flex items-center space-x-2">
              <Volume2 className="w-4 h-4" />
              <span>{newOrderAlert}</span>
            </div>
            <button
              onClick={() => setNewOrderAlert(null)}
              className="text-white hover:text-amber-100 text-xs cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Page Content Body */}
        <main className="p-4 sm:p-6 max-w-7xl w-full mx-auto space-y-6">
          {/* ================= VIEW: ORDERS ================= */}
          {activeTab === 'ORDERS' && (
            <div className="space-y-6">
              {/* Filter Bar: Status, Layout Mode & Date Filters */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                {/* Row 1: Status Pills & View Switcher */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  <div className="flex items-center space-x-2 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
                    {DASHBOARD_FILTERS.map((f) => {
                      const count = filterCounts[f.key] ?? 0;
                      const isActive = orderFilter === f.key;
                      return (
                        <button
                          key={f.key}
                          onClick={() => {
                            setOrderFilter(f.key);
                            setOrdersPage(1);
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                            isActive
                              ? 'bg-amber-500 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          <span>{f.label}</span>
                          <span
                            className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                              isActive
                                ? 'bg-white text-amber-800'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-center space-x-3 self-end lg:self-auto">
                    {/* View Switcher: Cards vs Table */}
                    <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                      <button
                        onClick={() => setOrderViewMode('CARDS')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                          orderViewMode === 'CARDS'
                            ? 'bg-white text-slate-900 shadow-xs'
                            : 'text-slate-500 hover:text-slate-900'
                        }`}
                        title="Card / KDS Kitchen Display View"
                      >
                        <LayoutDashboard className="w-3.5 h-3.5" />
                        <span>KDS Cards</span>
                      </button>
                      <button
                        onClick={() => setOrderViewMode('TABLE')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                          orderViewMode === 'TABLE'
                            ? 'bg-white text-slate-900 shadow-xs'
                            : 'text-slate-500 hover:text-slate-900'
                        }`}
                        title="Detailed Data Table View"
                      >
                        <TableIcon className="w-3.5 h-3.5" />
                        <span>Table View</span>
                      </button>
                    </div>

                    <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5 shrink-0">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      Live Feed
                    </span>
                  </div>
                </div>

                {/* Row 2: Date Filters & Custom Date Range */}
                <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mr-1">
                      <Calendar className="w-3 h-3 text-amber-500" />
                      Date:
                    </span>
                    {[
                      { key: 'ALL', label: 'All Dates' },
                      { key: 'TODAY', label: 'Today' },
                      { key: 'YESTERDAY', label: 'Yesterday' },
                      { key: 'WEEK', label: 'Last 7 Days' },
                      { key: 'MONTH', label: 'This Month' },
                      { key: 'CUSTOM', label: 'Custom Range' },
                    ].map((d) => (
                      <button
                        key={d.key}
                        onClick={() => {
                          setOrderDatePreset(d.key as any);
                          setOrdersPage(1);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                          orderDatePreset === d.key
                            ? 'bg-slate-900 text-white shadow-xs'
                            : 'bg-slate-50 text-slate-600 hover:bg-slate-200 border border-slate-200/60'
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>

                  {/* Summary Metric Badge */}
                  <div className="text-[11px] font-medium text-slate-500 bg-slate-50 px-3 py-1 rounded-xl border border-slate-200/80 flex items-center gap-2">
                    <span>
                      <strong className="text-slate-800 font-extrabold">{filteredOrders.length}</strong> orders
                    </span>
                    <span>•</span>
                    <span className="text-emerald-700 font-bold">
                      ₹{filteredOrdersTotalAmount.toLocaleString('en-IN')} net
                    </span>
                    {filteredOrdersTotalDiscounts > 0 && (
                      <>
                        <span>•</span>
                        <span className="text-amber-700 font-semibold">
                          ₹{filteredOrdersTotalDiscounts} saved
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Custom Date Pickers (Shown if CUSTOM selected) */}
                {orderDatePreset === 'CUSTOM' && (
                  <div className="pt-2 border-t border-dashed border-slate-200 flex items-center gap-3 flex-wrap bg-amber-50/50 p-2.5 rounded-xl">
                    <span className="text-xs font-bold text-amber-900 flex items-center gap-1">
                      <CalendarRange className="w-3.5 h-3.5 text-amber-600" />
                      Filter Range:
                    </span>
                    <div className="flex items-center gap-2">
                      <label className="text-[11px] text-slate-600 font-bold">From:</label>
                      <input
                        type="date"
                        value={orderStartDate}
                        onChange={(e) => {
                          setOrderStartDate(e.target.value);
                          setOrdersPage(1);
                        }}
                        className="text-xs px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-slate-800 font-medium focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-[11px] text-slate-600 font-bold">To:</label>
                      <input
                        type="date"
                        value={orderEndDate}
                        onChange={(e) => {
                          setOrderEndDate(e.target.value);
                          setOrdersPage(1);
                        }}
                        className="text-xs px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-slate-800 font-medium focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                    {(orderStartDate || orderEndDate) && (
                      <button
                        onClick={() => {
                          setOrderStartDate('');
                          setOrderEndDate('');
                        }}
                        className="text-[11px] text-rose-600 hover:text-rose-700 font-bold px-2 py-0.5 rounded-md hover:bg-rose-50 transition cursor-pointer"
                      >
                        Reset Dates
                      </button>
                    )}
                  </div>
                )}
              </div>

              {filteredOrders.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs space-y-3">
                  <ChefHat className="w-12 h-12 text-slate-300 mx-auto" />
                  <h3 className="font-bold text-slate-800 text-base">
                    No tickets found for selected filters
                  </h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Try changing your status or date filter above. Orders placed by customers will chime and pop up here in real-time.
                  </p>
                  <button
                    onClick={() => {
                      setOrderFilter('ALL');
                      setOrderDatePreset('ALL');
                      setOrderStartDate('');
                      setOrderEndDate('');
                      setSearchQuery('');
                    }}
                    className="mt-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    Reset All Filters
                  </button>
                </div>
              ) : (
                <>
                  {/* View 1: KDS Cards Grid */}
                  {orderViewMode === 'CARDS' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {paginatedOrders.map((order) => (
                        <div
                          key={order.id}
                          className={`bg-white rounded-2xl border shadow-xs flex flex-col justify-between overflow-hidden transition-all ${
                            highlightedOrderId === order.id
                              ? 'ring-4 ring-amber-500 ring-offset-2 border-amber-500 animate-pulse shadow-xl shadow-amber-500/20'
                              : order.orderStatus === 'CONFIRMED'
                              ? 'border-amber-400 ring-2 ring-amber-200'
                              : order.orderStatus === 'PREPARING'
                              ? 'border-blue-300'
                              : order.orderStatus === 'READY'
                              ? 'border-emerald-400 ring-2 ring-emerald-200'
                              : 'border-slate-200'
                          }`}
                        >
                          {/* Ticket Header */}
                          <div className="p-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
                            <div
                              onClick={() => setSelectedReceiptOrder(order)}
                              className="flex items-center space-x-2 cursor-pointer hover:opacity-85 transition"
                              title="Click to view order details & receipt"
                            >
                              <span className="font-mono text-base font-black bg-amber-500 text-white px-3 py-1 rounded-xl shadow-xs">
                                {getDisplayToken(order.tokenNumber, order.id)}
                              </span>
                              <span className="text-xs text-slate-500 font-bold">
                                #{order.id}
                              </span>
                              {highlightedOrderId === order.id && (
                                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-600 text-white animate-bounce flex items-center gap-1 shadow-xs">
                                  <Sparkles className="w-3 h-3" />
                                  <span>NEW</span>
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1.5">
                              {renderStatusBadge(order)}
                            </div>
                          </div>

                          {/* Ticket Body */}
                          <div className="p-4 flex-1 space-y-2">
                            <div className="text-xs text-slate-400 flex items-center justify-between pb-1 border-b border-slate-100">
                              <span>
                                {order.customerName ? `Guest: ${order.customerName}` : 'Items to prepare'}
                              </span>
                              <span>
                                {new Date(order.createdAt).toLocaleDateString()} • {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>

                            <div className="divide-y divide-slate-100">
                              {(order.items || []).map((item) => (
                                <div
                                  key={item.id}
                                  className="py-2 flex items-center justify-between text-xs"
                                >
                                  <span className="font-bold text-slate-900">
                                    {item.productName}
                                  </span>
                                  <span className="font-extrabold bg-slate-100 text-slate-900 px-2.5 py-0.5 rounded-md border border-slate-200">
                                    × {item.quantity}
                                  </span>
                                </div>
                              ))}
                            </div>

                            {/* Customer & Amount details */}
                            <div className="pt-2 text-xs space-y-1">
                              {order.discountAmount && Number(order.discountAmount) > 0 ? (
                                <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-2.5 space-y-1">
                                  <div className="flex justify-between text-slate-500 text-[11px]">
                                    <span>Gross Subtotal:</span>
                                    <span className="line-through font-mono">
                                      ₹{Number(order.subtotal || Number(order.totalAmount ?? order.total ?? 0) + Number(order.discountAmount))}
                                    </span>
                                  </div>
                                  <div className="flex justify-between text-emerald-800 font-bold text-[11px]">
                                    <span className="flex items-center gap-1">
                                      <Gift className="w-3 h-3 text-emerald-600 shrink-0" />
                                      <span className="truncate">Discount ({order.discountReason || order.couponCode || 'Offer'}):</span>
                                    </span>
                                    <span className="shrink-0">-₹{Number(order.discountAmount)}</span>
                                  </div>
                                  <div className="flex justify-between font-extrabold text-slate-900 pt-1 border-t border-emerald-200/70 text-xs">
                                    <span>Net Collected:</span>
                                    <span className="text-emerald-700 font-black text-sm">
                                      ₹{Number(order.totalAmount ?? order.total ?? 0)}
                                    </span>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center justify-between text-slate-500">
                                  <span>Amount:</span>
                                  <span className="font-extrabold text-slate-900 text-sm">
                                    ₹{Number(order.totalAmount ?? order.total ?? 0)}
                                  </span>
                                </div>
                              )}
                            </div>

                            {order.notes && (
                              <div className="mt-2 p-2.5 bg-amber-50 rounded-xl text-xs text-amber-900 border border-amber-200 font-medium">
                                <strong className="block text-[10px] uppercase tracking-wider text-amber-700">
                                  Instructions:
                                </strong>
                                {order.notes}
                              </div>
                            )}
                          </div>

                          {/* Ticket Action Button */}
                          <div className="p-3.5 bg-slate-50 border-t border-slate-100 flex items-center gap-2">
                            <div className="flex-1">{renderQuickActionBtn(order, true)}</div>
                            {order.orderStatus !== 'CANCELLED' && order.orderStatus !== 'COMPLETED' ? (
                              <button
                                type="button"
                                onClick={() => setOrderToCancel(order)}
                                className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-800 font-bold text-xs rounded-xl border border-rose-200 transition cursor-pointer flex items-center gap-1 shrink-0"
                                title="Cancel this order"
                              >
                                <X className="w-3.5 h-3.5" />
                                <span>Cancel</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setSelectedReceiptOrder(order)}
                                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-1 shrink-0"
                                title="View Details"
                              >
                                <Receipt className="w-3.5 h-3.5" />
                                <span>Details</span>
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => setSelectedReceiptOrder(order)}
                              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-xl transition cursor-pointer"
                              title="Print Ticket / Receipt"
                            >
                              <Receipt className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* View 2: Detailed Data Table View & Mobile Responsive Cards */}
                  {orderViewMode === 'TABLE' && (
                    <>
                      {/* Desktop Table View (>=md) */}
                      <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead>
                              <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-700 font-extrabold uppercase tracking-wider text-[11px]">
                                <th className="p-4">Daily Token / ID</th>
                                <th className="p-4">Date &amp; Time</th>
                                <th className="p-4">Customer Details</th>
                                <th className="p-4">Dishes &amp; Items</th>
                                <th className="p-4">Kitchen Status</th>
                                <th className="p-4">Payment</th>
                                <th className="p-4 text-right">Net Bill</th>
                                <th className="p-4 text-right">Action</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {paginatedOrders.map((order) => {
                                const itemsCount = (order.items || []).reduce(
                                  (acc: number, it: any) => acc + (it.quantity || 1),
                                  0
                                );
                                return (
                                  <tr
                                    key={order.id}
                                    className={`hover:bg-slate-50/80 transition ${
                                      highlightedOrderId === order.id ? 'bg-amber-50/80' : ''
                                    }`}
                                  >
                                    <td className="p-4">
                                      <div className="flex items-center gap-2">
                                        <span className="font-mono font-black text-xs bg-amber-500 text-white px-2.5 py-1 rounded-lg shadow-2xs">
                                          {getDisplayToken(order.tokenNumber, order.id)}
                                        </span>
                                        <span className="text-[10px] font-bold text-slate-400">
                                          #{order.id}
                                        </span>
                                      </div>
                                    </td>
                                    <td className="p-4 text-slate-500 font-medium whitespace-nowrap">
                                      <span className="text-slate-800 font-bold block">
                                        {new Date(order.createdAt).toLocaleDateString()}
                                      </span>
                                      <span className="text-[10px] text-slate-400">
                                        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                      </span>
                                    </td>
                                    <td className="p-4">
                                      {order.customerName ? (
                                        <div>
                                          <span className="font-bold text-slate-900 block">
                                            {order.customerName}
                                          </span>
                                          {order.customerPhone && (
                                            <span className="text-[10px] text-slate-400 font-mono">
                                              {order.customerPhone}
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
                                          {(order.items || [])
                                            .map((it: any) => `${it.quantity}× ${it.productName || it.product?.name || 'Item'}`)
                                            .join(', ')}
                                        </p>
                                        <span className="text-[10px] text-slate-400 font-semibold">
                                          {itemsCount} {itemsCount === 1 ? 'item' : 'items'} total
                                        </span>
                                      </div>
                                    </td>
                                    <td className="p-4">
                                      {renderStatusDropdown(order)}
                                    </td>
                                    <td className="p-4">
                                      <span
                                        className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                                          order.paymentStatus === 'PAID'
                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                                        }`}
                                      >
                                        {order.paymentStatus}
                                      </span>
                                    </td>
                                    <td className="p-4 text-right">
                                      <span className={`font-black text-sm block ${order.orderStatus === 'CANCELLED' ? 'text-rose-600 line-through' : 'text-slate-900'}`}>
                                        ₹{Number(order.totalAmount ?? order.total ?? 0)}
                                      </span>
                                      {order.discountAmount && Number(order.discountAmount) > 0 && (
                                        <span className="text-[10px] font-bold text-emerald-600 block">
                                          -₹{Number(order.discountAmount)} disc
                                        </span>
                                      )}
                                      {order.orderStatus === 'CANCELLED' && (
                                        <span className="text-[9px] font-extrabold text-rose-500 uppercase block">
                                          0 Revenue
                                        </span>
                                      )}
                                    </td>
                                    <td className="p-4 text-right space-x-1.5 whitespace-nowrap">
                                      {renderQuickActionBtn(order)}
                                      <button
                                        type="button"
                                        onClick={() => setSelectedReceiptOrder(order)}
                                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] rounded-lg border border-slate-200 transition inline-flex items-center gap-1 cursor-pointer"
                                        title="View Receipt"
                                      >
                                        <Receipt className="w-3 h-3 text-amber-600" />
                                        <span>Ticket</span>
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Mobile Stacked Responsive Cards (<md) */}
                      <div className="block md:hidden space-y-3">
                        {paginatedOrders.map((order) => {
                          const itemsCount = (order.items || []).reduce(
                            (acc: number, it: any) => acc + (it.quantity || 1),
                            0
                          );
                          return (
                            <div
                              key={order.id}
                              className={`bg-white rounded-2xl border p-4 shadow-xs space-y-3 transition ${
                                order.orderStatus === 'CANCELLED'
                                  ? 'border-rose-200 bg-rose-50/20'
                                  : order.orderStatus === 'READY'
                                  ? 'border-emerald-300 ring-2 ring-emerald-100'
                                  : 'border-slate-200'
                              }`}
                            >
                              {/* Top row: Token, Permanent ID & Time */}
                              <div
                                onClick={() => setSelectedReceiptOrder(order)}
                                className="flex items-center justify-between pb-2 border-b border-slate-100 cursor-pointer hover:opacity-85 transition"
                                title="Click to view order details & receipt"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-black text-sm bg-amber-500 text-white px-2.5 py-0.5 rounded-lg shadow-2xs">
                                    {getDisplayToken(order.tokenNumber, order.id)}
                                  </span>
                                  <span className="text-xs font-bold text-slate-400">
                                    #{order.id}
                                  </span>
                                </div>
                                <span className="text-[11px] text-slate-400 font-medium">
                                  {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>

                              {/* Customer (if available) */}
                              {order.customerName && (
                                <div
                                  onClick={() => setSelectedReceiptOrder(order)}
                                  className="text-xs cursor-pointer hover:text-amber-600 transition"
                                  title="Click to view order details & receipt"
                                >
                                  <span className="font-bold text-slate-900">{order.customerName}</span>
                                  {order.customerPhone && (
                                    <span className="text-slate-400 text-[11px] ml-1.5 font-mono">
                                      ({order.customerPhone})
                                    </span>
                                  )}
                                </div>
                              )}

                              {/* Dishes */}
                              <div
                                onClick={() => setSelectedReceiptOrder(order)}
                                className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs cursor-pointer hover:bg-slate-100 transition"
                                title="Click to view order details & receipt"
                              >
                                <p className="font-semibold text-slate-800 line-clamp-2">
                                  {(order.items || [])
                                    .map((it: any) => `${it.quantity}× ${it.productName || it.product?.name || 'Item'}`)
                                    .join(', ')}
                                </p>
                                <span className="text-[10px] text-slate-400 font-medium mt-1 block">
                                  {itemsCount} {itemsCount === 1 ? 'item' : 'items'}
                                </span>
                              </div>

                              {/* Status & Net Bill */}
                              <div className="flex items-center justify-between gap-2 pt-1">
                                <div>{renderStatusBadge(order)}</div>
                                <div className="text-right">
                                  <span
                                    className={`px-2 py-0.5 rounded-md font-bold text-[10px] inline-block ${
                                      order.paymentStatus === 'PAID'
                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                                    }`}
                                  >
                                    {order.paymentStatus}
                                  </span>
                                  <p className={`font-black text-sm mt-0.5 ${order.orderStatus === 'CANCELLED' ? 'text-rose-600 line-through' : 'text-slate-900'}`}>
                                    ₹{Number(order.totalAmount ?? order.total ?? 0)}
                                  </p>
                                  {order.orderStatus === 'CANCELLED' && (
                                    <span className="text-[9px] font-extrabold text-rose-500 uppercase block">
                                      0 Revenue
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Quick Action Button & Cancel Order */}
                              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                                <div className="flex-1">{renderQuickActionBtn(order, true)}</div>
                                {order.orderStatus !== 'CANCELLED' && order.orderStatus !== 'COMPLETED' ? (
                                  <button
                                    type="button"
                                    onClick={() => setOrderToCancel(order)}
                                    className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-800 font-bold text-xs rounded-xl border border-rose-200 transition cursor-pointer flex items-center gap-1 shrink-0"
                                    title="Cancel this order"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                    <span>Cancel</span>
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => setSelectedReceiptOrder(order)}
                                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-1 shrink-0"
                                    title="View Details"
                                  >
                                    <Receipt className="w-3.5 h-3.5" />
                                    <span>Details</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}

                  {/* Pagination Controls */}
                  {totalOrderPages > 1 && (
                    <div className="flex items-center justify-between bg-white px-4 py-3 rounded-2xl border border-slate-200 text-xs">
                      <span className="text-slate-500 font-medium">
                        Showing {(ordersPage - 1) * ordersPerPage + 1} -{' '}
                        {Math.min(ordersPage * ordersPerPage, filteredOrders.length)} of{' '}
                        {filteredOrders.length} tickets
                      </span>
                      <div className="flex items-center space-x-2">
                        <button
                          disabled={ordersPage <= 1}
                          onClick={() => setOrdersPage((p) => Math.max(1, p - 1))}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 font-bold hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
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
                          className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 font-bold hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                        >
                          <span>Next</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ================= VIEW: PRODUCTS & STOCK ================= */}
          {activeTab === 'PRODUCTS' && (
            <div className="space-y-4">
              {/* Category Filter Pills */}
              <div className="flex items-center space-x-2 overflow-x-auto pb-1 bg-white p-3 rounded-2xl border border-slate-200 scrollbar-none">
                <button
                  onClick={() => {
                    setCategoryFilter('ALL');
                    setProductsPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                    categoryFilter === 'ALL'
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  All Categories ({products.length})
                </button>
                {categories.map((c) => {
                  const count = products.filter((p) => p.categoryId === c.id).length;
                  return (
                    <button
                      key={c.id}
                      onClick={() => {
                        setCategoryFilter(String(c.id));
                        setProductsPage(1);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                        categoryFilter === String(c.id)
                          ? 'bg-amber-500 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {c.name} ({count})
                    </button>
                  );
                })}
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">
                      Dishes & Menu Management ({filteredProducts.length})
                    </h3>
                    <p className="text-xs text-slate-500">
                      Edit details, update pricing, upload photos, or toggle stock availability instantly.
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-700 font-extrabold uppercase tracking-wider text-[11px]">
                        <th className="p-4">Dish</th>
                        <th className="p-4">Category</th>
                        <th className="p-4">Price</th>
                        <th className="p-4">Stock Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {paginatedProducts.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-slate-400">
                            No menu items found. Click &apos;Add Dish&apos; to create one.
                          </td>
                        </tr>
                      ) : (
                        paginatedProducts.map((prod) => (
                          <tr key={prod.id} className="hover:bg-slate-50/80 transition">
                            <td className="p-4">
                              <div className="flex items-center space-x-3">
                                {prod.imageUrl ? (
                                  <img
                                    src={prod.imageUrl}
                                    alt={prod.name}
                                    className="w-10 h-10 object-cover rounded-lg border border-slate-200 shrink-0"
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                                    <UtensilsCrossed className="w-4 h-4 text-slate-300" />
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <span className="font-bold text-slate-900 block text-sm">
                                    {prod.name}
                                  </span>
                                  {prod.description && (
                                    <span className="text-[11px] text-slate-500 block mt-0.5 line-clamp-1">
                                      {prod.description}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="p-4 font-medium text-slate-700">
                              {categories.find((c) => c.id === prod.categoryId)?.name || 'General'}
                            </td>
                            <td className="p-4 font-black text-amber-700 text-sm">
                              ₹{prod.price}
                            </td>
                            <td className="p-4">
                              <span
                                className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold inline-flex items-center gap-1 ${
                                  prod.isAvailable
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                    : 'bg-rose-100 text-rose-800 border border-rose-200'
                                }`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    prod.isAvailable ? 'bg-emerald-600' : 'bg-rose-600'
                                  }`}
                                />
                                {prod.isAvailable ? 'IN STOCK' : 'OUT OF STOCK'}
                              </span>
                            </td>
                            <td className="p-4 text-right space-x-2">
                              <button
                                onClick={() => handleToggleProduct(prod.id, prod.isAvailable)}
                                className={`px-2.5 py-1.5 rounded-lg font-bold transition cursor-pointer border text-xs ${
                                  prod.isAvailable
                                    ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200'
                                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200'
                                }`}
                              >
                                {prod.isAvailable ? 'Mark Sold Out' : 'Mark In Stock'}
                              </button>

                              <button
                                onClick={() => openEditProduct(prod)}
                                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg transition inline-flex items-center gap-1 cursor-pointer border border-slate-200"
                                title="Edit Dish"
                              >
                                <Edit2 className="w-3.5 h-3.5 text-blue-600" />
                                <span>Edit</span>
                              </button>

                              <button
                                onClick={() => setDeleteProductTarget(prod)}
                                className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg transition inline-flex items-center gap-1 cursor-pointer border border-rose-200"
                                title="Delete Dish"
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
                {totalProductPages > 1 && (
                  <div className="flex items-center justify-between p-4 border-t border-slate-200 bg-slate-50/50 text-xs">
                    <span className="text-slate-500 font-medium">
                      Showing {(productsPage - 1) * productsPerPage + 1} -{' '}
                      {Math.min(productsPage * productsPerPage, filteredProducts.length)} of{' '}
                      {filteredProducts.length} items
                    </span>
                    <div className="flex items-center space-x-2">
                      <button
                        disabled={productsPage <= 1}
                        onClick={() => setProductsPage((p) => Math.max(1, p - 1))}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-bold hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        <span>Prev</span>
                      </button>
                      <span className="font-bold text-slate-800">
                        {productsPage} / {totalProductPages}
                      </span>
                      <button
                        disabled={productsPage >= totalProductPages}
                        onClick={() => setProductsPage((p) => Math.min(totalProductPages, p + 1))}
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

          {/* ================= VIEW: CATEGORIES ================= */}
          {activeTab === 'CATEGORIES' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Menu Categories ({categories.length})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Group dishes into intuitive sections for customers to browse.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-700 font-extrabold uppercase tracking-wider text-[11px]">
                      <th className="p-4">Category Name</th>
                      <th className="p-4">Description</th>
                      <th className="p-4">Product Count</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedCategories.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-slate-400">
                          No categories defined yet. Click &apos;Add Category&apos; above.
                        </td>
                      </tr>
                    ) : (
                      paginatedCategories.map((c) => {
                        const count = products.filter((p) => p.categoryId === c.id).length;
                        return (
                          <tr key={c.id} className="hover:bg-slate-50/80 transition">
                            <td className="p-4 font-bold text-slate-900 text-sm">
                              {c.name}
                            </td>
                            <td className="p-4 text-slate-500">
                              {c.description || '—'}
                            </td>
                            <td className="p-4 font-bold text-amber-700">
                              {count} items
                            </td>
                            <td className="p-4 text-right space-x-2">
                              <button
                                onClick={() => openEditCategory(c)}
                                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg transition inline-flex items-center gap-1 cursor-pointer border border-slate-200"
                              >
                                <Edit2 className="w-3.5 h-3.5 text-blue-600" />
                                <span>Edit</span>
                              </button>
                              <button
                                onClick={() => setDeleteCatTarget(c)}
                                className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg transition inline-flex items-center gap-1 cursor-pointer border border-rose-200"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Delete</span>
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
              {totalCatPages > 1 && (
                <div className="flex items-center justify-between p-4 border-t border-slate-200 bg-slate-50/50 text-xs">
                  <span className="text-slate-500 font-medium">
                    Showing {(categoriesPage - 1) * categoriesPerPage + 1} -{' '}
                    {Math.min(categoriesPage * categoriesPerPage, categories.length)} of{' '}
                    {categories.length} categories
                  </span>
                  <div className="flex items-center space-x-2">
                    <button
                      disabled={categoriesPage <= 1}
                      onClick={() => setCategoriesPage((p) => Math.max(1, p - 1))}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-bold hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span>Prev</span>
                    </button>
                    <span className="font-bold text-slate-800">
                      {categoriesPage} / {totalCatPages}
                    </span>
                    <button
                      disabled={categoriesPage >= totalCatPages}
                      onClick={() => setCategoriesPage((p) => Math.min(totalCatPages, p + 1))}
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

          {/* ================= VIEW: STATS & MULTI-PERIOD REVENUE ================= */}
          {activeTab === 'STATS' && (
            <div className="space-y-6">
              {/* Multi-Period Sales Breakdown Cards */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Live Revenue & Period Breakdown
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                  {/* Today's Sales */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Today&apos;s Sales
                      </span>
                      <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 font-bold text-[10px]">
                        Today
                      </span>
                    </div>
                    <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
                      ₹{todaySalesVal}
                    </p>
                    <p className="text-[11px] text-emerald-600 font-bold mt-1">
                      {todayOrdersCount} orders today
                    </p>
                  </div>

                  {/* This Week's Sales */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        This Week&apos;s Sales
                      </span>
                      <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600 font-bold text-[10px]">
                        7 Days
                      </span>
                    </div>
                    <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
                      ₹{weekSalesVal}
                    </p>
                    <p className="text-[11px] text-blue-600 font-bold mt-1">
                      {weekOrdersCount} orders this week
                    </p>
                  </div>

                  {/* This Month's Sales */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        This Month&apos;s Sales
                      </span>
                      <span className="p-1.5 rounded-lg bg-purple-50 text-purple-600 font-bold text-[10px]">
                        Month
                      </span>
                    </div>
                    <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
                      ₹{monthSalesVal}
                    </p>
                    <p className="text-[11px] text-purple-600 font-bold mt-1">
                      {monthOrdersCount} orders this month
                    </p>
                  </div>

                  {/* Lifetime Revenue */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        All-Time Revenue
                      </span>
                      <span className="p-1.5 rounded-lg bg-amber-50 text-amber-700 font-bold text-[10px]">
                        Lifetime
                      </span>
                    </div>
                    <p className="text-2xl sm:text-3xl font-black text-amber-700 mt-2">
                      ₹{lifetimeSalesVal}
                    </p>
                    <p className="text-[11px] text-slate-500 font-semibold mt-1">
                      {stats?.totalOrders ?? orders.length} total orders
                    </p>
                  </div>
                </div>
              </div>

              {/* Kitchen Operational Metrics */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Kitchen Operational Stats
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Active Kitchen Queue
                    </span>
                    <p className="text-3xl font-black text-amber-600 mt-2">
                      {activeOrdersCount}
                    </p>
                    <p className="text-[11px] text-amber-600 font-semibold mt-1">
                      Cooking or ready for counter pickup
                    </p>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Current Token Number
                    </span>
                    <p className="text-3xl font-black text-slate-900 mt-2 font-mono">
                      {stats?.currentToken ? `#${stats.currentToken}` : 'A100'}
                    </p>
                    <p className="text-[11px] text-slate-500 font-semibold mt-1">
                      Daily sequential counter
                    </p>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Menu Dishes & Categories
                    </span>
                    <p className="text-3xl font-black text-purple-700 mt-2">
                      {products.length}
                    </p>
                    <p className="text-[11px] text-slate-500 font-semibold mt-1">
                      Organized across {categories.length} categories
                    </p>
                  </div>
                </div>
              </div>

              {/* Discounts & Promotions Impact */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                  <Gift className="w-3.5 h-3.5 text-amber-600" />
                  <span>Customer Discounts & Promotions Impact</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-5 rounded-2xl border border-amber-200/80 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                        Today&apos;s Customer Discounts
                      </span>
                      <span className="p-1 rounded-md bg-amber-200/60 text-amber-800 font-bold text-[10px]">
                        Coupons & Rewards
                      </span>
                    </div>
                    <p className="text-3xl font-black text-amber-900 mt-2">
                      ₹{todayDiscountsVal}
                    </p>
                    <p className="text-[11px] text-amber-700 font-medium mt-1">
                      Total savings awarded to customers today across milestone rewards & promo codes
                    </p>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Today&apos;s Gross Sales (Pre-Discount)
                      </span>
                      <span className="p-1 rounded-md bg-slate-100 text-slate-600 font-bold text-[10px]">
                        Menu Subtotal
                      </span>
                    </div>
                    <p className="text-3xl font-black text-slate-900 mt-2">
                      ₹{todayGrossSalesVal}
                    </p>
                    <p className="text-[11px] text-slate-500 font-medium mt-1">
                      Net collected: ₹{todaySalesVal} + Savings given: ₹{todayDiscountsVal}
                    </p>
                  </div>
                </div>
              </div>

              {/* Date-wise Sales Audit & Detailed Ledger */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                {/* Header with Date Filter Bar */}
                <div className="p-5 border-b border-slate-200 bg-slate-50/70 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                        <CalendarRange className="w-4 h-4 text-amber-600" />
                        <span>Date-Wise Sales Audit & Ledger</span>
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Filter paid orders and track exact revenue, discounts, and item breakdown by date.
                      </p>
                    </div>

                    {/* Date Presets */}
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
                            setStatsDatePreset(preset.key);
                            if (preset.key !== 'CUSTOM') {
                              setStatsStartDate('');
                              setStatsEndDate('');
                            }
                          }}
                          className={`px-3 py-1.5 rounded-lg font-bold text-xs transition cursor-pointer ${
                            statsDatePreset === preset.key
                              ? 'bg-amber-500 text-white shadow-2xs'
                              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Date Pickers */}
                  {statsDatePreset === 'CUSTOM' && (
                    <div className="flex items-center gap-3 pt-2 border-t border-slate-200/80 flex-wrap">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-bold text-slate-600">From:</span>
                        <input
                          type="date"
                          value={statsStartDate}
                          onChange={(e) => setStatsStartDate(e.target.value)}
                          className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-bold text-slate-600">To:</span>
                        <input
                          type="date"
                          value={statsEndDate}
                          onChange={(e) => setStatsEndDate(e.target.value)}
                          className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                      {(statsStartDate || statsEndDate) && (
                        <button
                          type="button"
                          onClick={() => {
                            setStatsStartDate('');
                            setStatsEndDate('');
                          }}
                          className="text-xs text-rose-600 hover:underline font-bold"
                        >
                          Clear dates
                        </button>
                      )}
                    </div>
                  )}

                  {/* Summary Metric Ribbon */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                    <div className="bg-white p-3 rounded-xl border border-slate-200/80">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        Filtered Revenue
                      </span>
                      <span className="text-lg font-black text-amber-700">
                        ₹{filteredStatsRevenue}
                      </span>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-200/80">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        Paid Orders
                      </span>
                      <span className="text-lg font-black text-slate-900">
                        {filteredStatsOrders.length}
                      </span>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-200/80">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        Discounts Given
                      </span>
                      <span className="text-lg font-black text-emerald-600">
                        ₹{filteredStatsDiscounts}
                      </span>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-200/80">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        Gross Subtotal
                      </span>
                      <span className="text-lg font-black text-slate-700">
                        ₹{filteredStatsRevenue + filteredStatsDiscounts}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Ledger Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-700 font-extrabold uppercase tracking-wider text-[11px]">
                        <th className="p-4">Token / ID</th>
                        <th className="p-4">Date & Time</th>
                        <th className="p-4">Customer</th>
                        <th className="p-4">Items Summary</th>
                        <th className="p-4">Discount</th>
                        <th className="p-4 text-right">Net Amount</th>
                        <th className="p-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredStatsOrders.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-10 text-center text-slate-400 font-medium">
                            No paid orders found for the selected date range.
                          </td>
                        </tr>
                      ) : (
                        filteredStatsOrders.map((order) => {
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
                            <tr key={order.id} className="hover:bg-slate-50/80 transition">
                              <td className="p-4 font-mono font-black text-slate-900">
                                <span className="bg-amber-100/80 text-amber-900 px-2 py-0.5 rounded border border-amber-300">
                                  #{getDisplayToken(order.tokenNumber, order.id)}
                                </span>
                              </td>
                              <td className="p-4 whitespace-nowrap text-slate-600">
                                <span className="font-bold block text-slate-900">{dateFormatted}</span>
                                <span className="text-[11px] text-slate-400">{timeFormatted}</span>
                              </td>
                              <td className="p-4">
                                {order.customerName ? (
                                  <div>
                                    <span className="font-bold text-slate-900 block">{order.customerName}</span>
                                    {order.customerPhone && (
                                      <span className="text-[11px] text-slate-500 font-mono">
                                        {order.customerPhone}
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
                                    {(order.items || [])
                                      .map((it: any) => `${it.quantity}× ${it.productName || it.product?.name || 'Item'}`)
                                      .join(', ')}
                                  </p>
                                  <span className="text-[10px] text-slate-400">
                                    {order.items?.length || 0} unique items
                                  </span>
                                </div>
                              </td>
                              <td className="p-4">
                                {order.discountAmount && Number(order.discountAmount) > 0 ? (
                                  <span className="text-emerald-700 font-extrabold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block text-[11px]">
                                    -₹{Number(order.discountAmount)}
                                  </span>
                                ) : (
                                  <span className="text-slate-400">—</span>
                                )}
                              </td>
                              <td className="p-4 text-right">
                                <span className="font-black text-slate-900 text-sm">
                                  ₹{Number(order.totalAmount ?? order.total ?? 0)}
                                </span>
                              </td>
                              <td className="p-4 text-right">
                                <button
                                  type="button"
                                  onClick={() => setSelectedReceiptOrder(order)}
                                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] rounded-lg border border-slate-200 transition inline-flex items-center gap-1 cursor-pointer"
                                  title="View Ticket"
                                >
                                  <Receipt className="w-3.5 h-3.5 text-amber-600" />
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
              </div>
            </div>
          )}

          {/* ================= VIEW: DISCOUNTS & MILESTONE REWARDS ================= */}
          {activeTab === 'DISCOUNTS' && (
            <div className="space-y-6">
              {/* Header Banner */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <Gift className="w-5 h-5 text-red-600" />
                    <span>Offers, Promo Coupons & Milestone Rewards</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Reward today&apos;s lucky customers automatically (e.g. 10th customer discount) and issue custom promo coupon codes.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddCouponModal(true)}
                  className="px-4 py-2.5 bg-red-700 hover:bg-red-800 text-white font-extrabold text-xs rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create New Coupon</span>
                </button>
              </div>

              {/* CARD 1: Milestone Customer Celebration Reward Rule */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="p-5 border-b border-slate-200 bg-amber-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black shadow-xs">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm">
                        Today&apos;s Milestone Customer Reward Configuration
                      </h4>
                      <p className="text-xs text-slate-500">
                        Automatically surprises and discounts every Nth customer today (e.g. today&apos;s 10th or 100th customer).
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider self-start sm:self-auto ${
                      rewardRule?.isActive
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-slate-100 text-slate-500 border border-slate-200'
                    }`}
                  >
                    {rewardRule?.isActive ? '● Active in Store' : '○ Disabled'}
                  </span>
                </div>

                <form onSubmit={handleSaveRewardRule} className="p-6 space-y-4 text-xs">
                  {rewardRuleSuccess && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Milestone Customer Reward rule updated successfully!</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Toggle */}
                    <div>
                      <label className="block text-slate-700 font-bold mb-1.5">
                        Feature Status
                      </label>
                      <select
                        value={rewardRule?.isActive ? 'true' : 'false'}
                        onChange={(e) =>
                          setRewardRule((r: any) => ({ ...r, isActive: e.target.value === 'true' }))
                        }
                        className="w-full px-3.5 py-2.5 text-slate-900 bg-white border border-slate-300 rounded-xl font-bold text-xs focus:ring-2 focus:ring-amber-500"
                      >
                        <option value="true">Enabled (Apply Automatically)</option>
                        <option value="false">Disabled (Do Not Apply)</option>
                      </select>
                    </div>

                    {/* Milestone Customer Count */}
                    <div>
                      <label className="block text-slate-700 font-bold mb-1.5">
                        Target Customer Number (Nth) *
                      </label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={rewardRule?.milestoneCount || 10}
                        onChange={(e) =>
                          setRewardRule((r: any) => ({
                            ...r,
                            milestoneCount: parseInt(e.target.value, 10) || 10,
                          }))
                        }
                        placeholder="e.g. 10 (10th Customer)"
                        className="w-full px-3.5 py-2.5 text-slate-900 bg-white border border-slate-300 rounded-xl font-mono font-bold text-xs focus:ring-2 focus:ring-amber-500"
                      />
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        Example: 10 applies to today&apos;s 10th customer, 100 to the 100th
                      </span>
                    </div>

                    {/* Discount Amount */}
                    <div>
                      <label className="block text-slate-700 font-bold mb-1.5">
                        Discount Amount (₹) *
                      </label>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        required
                        value={rewardRule?.discountAmount || 50}
                        onChange={(e) =>
                          setRewardRule((r: any) => ({
                            ...r,
                            discountAmount: parseFloat(e.target.value) || 0,
                          }))
                        }
                        placeholder="e.g. 50"
                        className="w-full px-3.5 py-2.5 text-slate-900 bg-white border border-slate-300 rounded-xl font-mono font-bold text-xs focus:ring-2 focus:ring-amber-500"
                      />
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        Amount in INR deducted from total
                      </span>
                    </div>

                    {/* Minimum Order Amount */}
                    <div>
                      <label className="block text-slate-700 font-bold mb-1.5">
                        Minimum Bill Value (₹) *
                      </label>
                      <input
                        type="number"
                        min="0"
                        required
                        value={rewardRule?.minOrderAmount || 100}
                        onChange={(e) =>
                          setRewardRule((r: any) => ({
                            ...r,
                            minOrderAmount: parseFloat(e.target.value) || 0,
                          }))
                        }
                        placeholder="e.g. 100"
                        className="w-full px-3.5 py-2.5 text-slate-900 bg-white border border-slate-300 rounded-xl font-mono font-bold text-xs focus:ring-2 focus:ring-amber-500"
                      />
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        Order must exceed this minimum
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1.5">
                      Customer Celebration Banner Title
                    </label>
                    <input
                      type="text"
                      value={rewardRule?.title || "Today's 10th Customer Special Celebration Reward"}
                      onChange={(e) =>
                        setRewardRule((r: any) => ({ ...r, title: e.target.value }))
                      }
                      className="w-full px-3.5 py-2.5 text-slate-900 bg-white border border-slate-300 rounded-xl font-medium text-xs focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <p className="text-[11px] text-amber-700 font-medium">
                      💡 Customer count resets every day at 4:00 AM shift change.
                    </p>
                    <button
                      type="submit"
                      disabled={isSavingRewardRule}
                      className="px-5 py-2.5 bg-slate-900 hover:bg-black text-white font-extrabold text-xs rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {isSavingRewardRule ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <span>Save Milestone Rule</span>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* CARD 2: Active Promo Coupons Management */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">
                      Active Promotional Coupons ({coupons.length})
                    </h4>
                    <p className="text-xs text-slate-500">
                      Codes that customers can enter in their cart checkout drawer to redeem savings.
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-700 font-extrabold uppercase tracking-wider text-[11px]">
                        <th className="p-4">Coupon Code</th>
                        <th className="p-4">Discount Type</th>
                        <th className="p-4">Discount Value</th>
                        <th className="p-4">Min Bill Value</th>
                        <th className="p-4">Redemption Count</th>
                        <th className="p-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {coupons.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-slate-400">
                            No coupons created yet. Click &apos;Create New Coupon&apos; above to add one.
                          </td>
                        </tr>
                      ) : (
                        coupons.map((c) => (
                          <tr key={c.id} className="hover:bg-slate-50/80 transition">
                            <td className="p-4">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono font-black text-red-700 bg-red-50 border border-red-200 px-2.5 py-1 rounded-lg text-xs">
                                  {c.code}
                                </span>
                                {c.isGlobal || c.shopId === null ? (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
                                    Global Platform Offer
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    Store Exclusive
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="p-4 font-semibold text-slate-700">
                              {c.discountType === 'PERCENT' ? 'Percentage (%)' : 'Flat Amount (₹)'}
                            </td>
                            <td className="p-4 font-extrabold text-slate-900">
                              {c.discountType === 'PERCENT' ? `${c.discountValue}%` : `₹${c.discountValue}`}
                              {c.maxDiscount ? ` (Capped at ₹${c.maxDiscount})` : ''}
                            </td>
                            <td className="p-4 text-slate-600 font-medium">
                              {c.minOrderAmount > 0 ? `₹${c.minOrderAmount}` : 'No minimum'}
                            </td>
                            <td className="p-4 font-bold text-slate-800">
                              {c.usageCount || 0} times
                            </td>
                            <td className="p-4 text-right">
                              {c.canDelete || (c.shopId && c.shopId === user?.shopId) ? (
                                <button
                                  onClick={() => handleDeleteCoupon(c.id)}
                                  className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg transition inline-flex items-center gap-1 cursor-pointer border border-rose-200"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Delete</span>
                                </button>
                              ) : (
                                <span className="text-[11px] text-slate-400 font-medium italic">
                                  Global (Admin Only)
                                </span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 6: RESTAURANT PROFILE & AMBIENCE ================= */}
          {activeTab === 'PROFILE' && (
            <div className="space-y-6 max-w-5xl">
              {/* Header Banner */}
              <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
                <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-2 max-w-2xl">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-white text-xs font-black tracking-wide uppercase">
                      <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                      Customer Dining Impression
                    </span>
                    <h2 className="text-xl sm:text-3xl font-black font-display tracking-tight text-white">
                      Restaurant Profile & Ambience Showcase
                    </h2>
                    <p className="text-amber-100 text-xs sm:text-sm font-medium leading-relaxed">
                      Upload your shop logo, share your restaurant&apos;s ambition & culinary story, and showcase your interior dining atmosphere. These photos and details are prominently shown to diners whenever they scan your QR code.
                    </p>
                  </div>
                  <button
                    onClick={handleSaveProfile}
                    disabled={isSavingProfile}
                    className="px-6 py-3 bg-white text-amber-800 hover:bg-amber-50 font-black text-xs sm:text-sm rounded-2xl shadow-xl transition flex items-center gap-2 cursor-pointer shrink-0 disabled:opacity-50"
                  >
                    {isSavingProfile ? (
                      <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    )}
                    <span>{isSavingProfile ? 'Saving Changes...' : 'Save All Changes'}</span>
                  </button>
                </div>
              </div>

              {profileSuccess && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center justify-between shadow-xs animate-in fade-in duration-300">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span className="text-xs sm:text-sm font-bold">
                      Restaurant profile, logo and ambience photos updated successfully! Diners scanning your QR code will see the new experience immediately.
                    </span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Logo & Branding */}
                <div className="lg:col-span-1 space-y-6">
                  {/* Shop Logo Card */}
                  <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                        <Store className="w-4 h-4 text-amber-500" />
                        Restaurant Logo
                      </h3>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Branding
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Replaces the default letter badge on the customer QR menu and receipts.
                    </p>

                    <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 gap-3">
                      {shopProfile.logoUrl ? (
                        <div className="relative group">
                          <img
                            src={shopProfile.logoUrl}
                            alt="Shop Logo"
                            className="w-28 h-28 object-cover rounded-2xl border-2 border-white shadow-md"
                          />
                          <button
                            type="button"
                            onClick={() => setShopProfile((prev) => ({ ...prev, logoUrl: '' }))}
                            className="absolute -top-2 -right-2 p-1.5 bg-rose-600 text-white rounded-full shadow-md hover:bg-rose-700 transition cursor-pointer"
                            title="Remove Logo"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="w-24 h-24 rounded-2xl bg-amber-100 border border-amber-200 flex flex-col items-center justify-center text-amber-700">
                          <Store className="w-8 h-8 opacity-60" />
                          <span className="text-[10px] font-bold mt-1">No Logo</span>
                        </div>
                      )}

                      <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-xs transition">
                        {isUploadingLogo ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Uploading Logo...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-3.5 h-3.5" />
                            <span>{shopProfile.logoUrl ? 'Change Logo' : 'Upload Logo'}</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          disabled={isUploadingLogo}
                          onChange={handleUploadShopLogo}
                          className="hidden"
                        />
                      </label>
                      <input
                        type="url"
                        value={shopProfile.logoUrl}
                        onChange={(e) => setShopProfile((prev) => ({ ...prev, logoUrl: e.target.value }))}
                        placeholder="Or paste image URL"
                        className="w-full text-[11px] px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  {/* Shopkeeper Personal Avatar Card */}
                  <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                        <ChefHat className="w-4 h-4 text-amber-500" />
                        Host / Chef Profile
                      </h3>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Staff
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Your staff &amp; host picture displayed in kitchen management and restaurant info.
                    </p>

                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                      {keeperProfile.avatarUrl ? (
                        <div className="relative">
                          <img
                            src={keeperProfile.avatarUrl}
                            alt="Chef Avatar"
                            className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-xs"
                          />
                          <button
                            type="button"
                            onClick={() => setKeeperProfile((prev) => ({ ...prev, avatarUrl: '' }))}
                            className="absolute -top-1.5 -right-1.5 p-1 bg-rose-600 text-white rounded-full hover:bg-rose-700 transition cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-300 text-amber-700 flex items-center justify-center font-black text-lg">
                          {keeperProfile.name ? keeperProfile.name.slice(0, 2).toUpperCase() : 'CH'}
                        </div>
                      )}

                      <div className="flex-1 space-y-2">
                        <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl transition">
                          {isUploadingAvatar ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Upload className="w-3.5 h-3.5" />
                          )}
                          <span>{keeperProfile.avatarUrl ? 'Change Photo' : 'Upload Photo'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            disabled={isUploadingAvatar}
                            onChange={handleUploadKeeperAvatar}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>

                    <div className="space-y-3 pt-1">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Manager / Head Chef Name
                        </label>
                        <input
                          type="text"
                          value={keeperProfile.name}
                          onChange={(e) => setKeeperProfile((prev) => ({ ...prev, name: e.target.value }))}
                          placeholder="Chef or Manager Name"
                          className="w-full text-xs px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500 text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Direct Contact Mobile
                        </label>
                        <input
                          type="tel"
                          value={keeperProfile.mobile}
                          onChange={(e) => setKeeperProfile((prev) => ({ ...prev, mobile: e.target.value }))}
                          placeholder="Mobile number"
                          className="w-full text-xs px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500 text-slate-900"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Restaurant Story & Ambience Gallery */}
                <div className="lg:col-span-2 space-y-6">
                  {/* General Info & Story */}
                  <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
                    <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      Culinary Story &amp; Restaurant Ambition
                    </h3>
                    <p className="text-xs text-slate-500">
                      Tell customers what makes your restaurant unique — your culinary roots, fresh ingredients, kitchen hygiene, signature recipes, and dining experience.
                    </p>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-1.5">
                          Restaurant Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={shopProfile.name}
                          onChange={(e) => setShopProfile((prev) => ({ ...prev, name: e.target.value }))}
                          placeholder="e.g. The Rustic Spoon Cafe"
                          className="w-full text-xs px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500 font-bold text-slate-900"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-1.5">
                          Ambition, Story &amp; Dining Philosophy
                        </label>
                        <textarea
                          rows={4}
                          value={shopProfile.description}
                          onChange={(e) => setShopProfile((prev) => ({ ...prev, description: e.target.value }))}
                          placeholder="e.g. Crafted with passion! We source fresh organic farm produce daily and slow-cook our sauces to perfection. Experience our warm cozy vibes and delightful culinary creations..."
                          className="w-full text-xs px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500 text-slate-900 leading-relaxed"
                        />
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          This description will be highlighted on the mobile QR scan page in the &apos;About Us &amp; Ambition&apos; showcase.
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-800 mb-1.5">
                            Restaurant Physical Address
                          </label>
                          <input
                            type="text"
                            value={shopProfile.address}
                            onChange={(e) => setShopProfile((prev) => ({ ...prev, address: e.target.value }))}
                            placeholder="Street, Landmark, Area"
                            className="w-full text-xs px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500 text-slate-900"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-800 mb-1.5">
                            Order Helpline / Support Phone
                          </label>
                          <input
                            type="tel"
                            value={shopProfile.phone}
                            onChange={(e) => setShopProfile((prev) => ({ ...prev, phone: e.target.value }))}
                            placeholder="e.g. +91 98765 43210"
                            className="w-full text-xs px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500 text-slate-900"
                          />
                        </div>
                      </div>

                      {/* State & District for Regional Offers & Promotions */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-800 mb-1.5">
                            State (for Regional Promotions)
                          </label>
                          <input
                            type="text"
                            value={shopProfile.state}
                            onChange={(e) => setShopProfile((prev) => ({ ...prev, state: e.target.value }))}
                            placeholder="e.g. Tamil Nadu, Karnataka, Kerala"
                            className="w-full text-xs px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500 text-slate-900 font-medium"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-800 mb-1.5">
                            District / City (for Local Offers)
                          </label>
                          <input
                            type="text"
                            value={shopProfile.district}
                            onChange={(e) => setShopProfile((prev) => ({ ...prev, district: e.target.value }))}
                            placeholder="e.g. Madurai, Chennai, Coimbatore"
                            className="w-full text-xs px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500 text-slate-900 font-medium"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Ambience Gallery Card */}
                  <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                          <ImageIcon className="w-4 h-4 text-amber-500" />
                          Ambience &amp; Atmosphere Gallery ({shopProfile.ambienceImages?.length || 0})
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Photos of your dining hall, open kitchen, aesthetic lighting, and cozy corners.
                        </p>
                      </div>

                      <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-extrabold rounded-xl shadow-xs transition shrink-0">
                        {isUploadingAmbience ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Uploading Photo...</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4" />
                            <span>Add Ambience Photo</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          disabled={isUploadingAmbience}
                          onChange={handleUploadAmbienceImage}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {/* Ambience Gallery Grid */}
                    {(!shopProfile.ambienceImages || shopProfile.ambienceImages.length === 0) ? (
                      <div className="p-8 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
                          <ImageIcon className="w-6 h-6 opacity-70" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-700">No ambience photos uploaded yet</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Upload photos of your dining seating, mood lighting, outdoor patio, or bar counter to inspire visiting diners.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {shopProfile.ambienceImages.map((imgUrl, idx) => (
                          <div
                            key={idx}
                            className="relative group rounded-2xl overflow-hidden aspect-4/3 bg-slate-100 border border-slate-200 shadow-xs"
                          >
                            <img
                              src={imgUrl}
                              alt={`Ambience photo ${idx + 1}`}
                              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition flex items-end justify-between p-2.5">
                              <span className="text-[10px] font-bold text-white bg-black/40 px-2 py-0.5 rounded">
                                #{idx + 1}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleRemoveAmbienceImage(idx)}
                                className="p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow transition cursor-pointer"
                                title="Delete image"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Paste URL directly */}
                    <div className="pt-2">
                      <div className="flex gap-2">
                        <input
                          type="url"
                          id="ambience-url-input"
                          placeholder="Or paste an image web URL and click Add"
                          className="flex-1 text-xs px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const input = e.currentTarget;
                              const val = input.value.trim();
                              if (val) {
                                setShopProfile((prev) => ({
                                  ...prev,
                                  ambienceImages: [...(prev.ambienceImages || []), val],
                                }));
                                input.value = '';
                              }
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const input = document.getElementById('ambience-url-input') as HTMLInputElement;
                            if (input && input.value.trim()) {
                              setShopProfile((prev) => ({
                                ...prev,
                                ambienceImages: [...(prev.ambienceImages || []), input.value.trim()],
                              }));
                              input.value = '';
                            }
                          }}
                          className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                        >
                          Add URL
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Save Action */}
                  <div className="flex items-center justify-end pt-2">
                    <button
                      type="button"
                      onClick={handleSaveProfile}
                      disabled={isSavingProfile}
                      className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-black text-sm rounded-2xl shadow-lg shadow-orange-600/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isSavingProfile ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Saving Profile &amp; Ambience...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Save Profile &amp; Ambience</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 7: PREPAID WALLET & QR STATUS ================= */}
          {activeTab === 'WALLET' && (
            <div className="space-y-6 max-w-5xl">
              {/* Header Banner */}
              <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-slate-800">
                <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 inline-flex items-center gap-1.5">
                      <Wallet className="w-3.5 h-3.5" />
                      PREPAID OUTLET WALLET
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black">
                      Wallet &amp; QR Payment Status
                    </h2>
                    <p className="text-slate-400 text-xs sm:text-sm max-w-xl">
                      Prepaid balance required to keep online QR ordering active. Top up your wallet anytime via secure online payments.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setShowRechargeModal(true)}
                      className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-black rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Recharge Wallet</span>
                    </button>
                    <button
                      type="button"
                      onClick={loadWallet}
                      disabled={isWalletLoading}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isWalletLoading ? 'animate-spin' : ''}`} />
                      <span>Refresh</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Status & Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Current Wallet Balance
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
                        ₹{Number(walletData.wallet?.balance ?? 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <p className="text-[11px] text-slate-500">
                      Prepaid balance for QR ordering.
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowRechargeModal(true)}
                      className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-black rounded-lg shadow-2xs transition inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Money</span>
                    </button>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Minimum Required Limit
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-black text-slate-700 font-mono">
                      ₹{Number(walletData.wallet?.minWalletLimit ?? 0).toFixed(2)}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-2">
                    If balance drops below this threshold, QR ordering pauses.
                  </p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    QR Payment Status
                  </span>
                  <div>
                    {walletData.wallet?.balance !== undefined &&
                    walletData.wallet.balance >= walletData.wallet.minWalletLimit &&
                    walletData.wallet.isQrEnabled ? (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black border border-emerald-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>ACTIVE &amp; ACCEPTING</span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-black border border-rose-300">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                        <span>
                          {walletData.wallet && !walletData.wallet.isQrEnabled
                            ? 'PAUSED BY ADMIN'
                            : 'BELOW MINIMUM LIMIT'}
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-2">
                    {walletData.wallet?.balance !== undefined &&
                    walletData.wallet.balance >= walletData.wallet.minWalletLimit &&
                    walletData.wallet.isQrEnabled
                      ? 'Customers can scan QR and pay online smoothly.'
                      : 'Recharge your wallet to resume customer QR ordering.'}
                  </p>
                  {walletData.wallet &&
                    walletData.wallet.balance < walletData.wallet.minWalletLimit && (
                      <button
                        type="button"
                        onClick={() => setShowRechargeModal(true)}
                        className="mt-2 text-xs font-bold text-amber-600 hover:text-amber-700 inline-flex items-center gap-1 cursor-pointer underline"
                      >
                        <span>Top up now (need ₹{(Number(walletData.wallet.minWalletLimit) - Number(walletData.wallet.balance)).toFixed(2)} more)</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </button>
                    )}
                </div>
              </div>

              {/* Transactions Ledger */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Wallet Ledger &amp; Top-up History
                    </h3>
                    <p className="text-xs text-slate-500">
                      Audit trail of recharge credits and balance adjustments.
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-slate-500">
                    {walletData.transactions.length} entries
                  </span>
                </div>

                <div className="overflow-x-auto min-w-full">
                  <table className="w-full min-w-[680px] text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-700 font-extrabold uppercase tracking-wider text-[11px]">
                        <th className="p-3.5">Type</th>
                        <th className="p-3.5">Amount</th>
                        <th className="p-3.5">Previous Balance</th>
                        <th className="p-3.5">New Balance</th>
                        <th className="p-3.5">Reference / Notes</th>
                        <th className="p-3.5 text-right">Date &amp; Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {walletData.transactions.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-slate-400">
                            No transactions recorded yet. Click &quot;Recharge Wallet&quot; to add funds.
                          </td>
                        </tr>
                      ) : (
                        walletData.transactions.map((tx) => (
                          <tr key={tx.id} className="hover:bg-slate-50/80 transition">
                            <td className="p-3.5">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-black inline-flex items-center gap-1 ${
                                  tx.type === 'CREDIT'
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                    : 'bg-rose-100 text-rose-800 border border-rose-200'
                                }`}
                              >
                                {tx.type}
                              </span>
                            </td>
                            <td className="p-3.5 font-bold font-mono">
                              <span className={tx.type === 'CREDIT' ? 'text-emerald-600' : 'text-rose-600'}>
                                {tx.type === 'CREDIT' ? '+' : '-'}₹{Number(tx.amount).toFixed(2)}
                              </span>
                            </td>
                            <td className="p-3.5 text-slate-500 font-mono">
                              ₹{Number(tx.previousBalance).toFixed(2)}
                            </td>
                            <td className="p-3.5 font-bold text-slate-900 font-mono">
                              ₹{Number(tx.newBalance).toFixed(2)}
                            </td>
                            <td className="p-3.5 text-slate-600">
                              <span className="block font-medium">{tx.notes || '—'}</span>
                              {tx.reference && (
                                <span className="text-[10px] text-slate-400 font-mono block">
                                  Ref: {tx.reference}
                                </span>
                              )}
                            </td>
                            <td className="p-3.5 text-right text-slate-500 whitespace-nowrap">
                              {new Date(tx.createdAt).toLocaleString('en-IN', {
                                dateStyle: 'medium',
                                timeStyle: 'short',
                              })}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 8: GST & TAX SETTINGS ================= */}
          {activeTab === 'TAX_SETTINGS' && (
            <div className="space-y-6 max-w-2xl mx-auto">
              {/* Header Banner */}
              <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-slate-800">
                <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 inline-flex items-center gap-1.5">
                      <Percent className="w-3.5 h-3.5" />
                      RESTAURANT TAXATION
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black">
                      GST Tax Rates &amp; Details
                    </h2>
                    <p className="text-slate-400 text-xs sm:text-sm max-w-xl">
                      Configure your restaurant&apos;s GSTIN and tax rates (CGST &amp; SGST). If enabled, GST will be added to every customer food order during checkout.
                    </p>
                  </div>
                  <button
                    onClick={loadData}
                    disabled={isLoading}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                  </button>
                </div>
              </div>

              {/* CARD: GST & TAX SETTINGS */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
                <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200">
                      <Percent className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-slate-900">
                        Goods &amp; Services Tax (GST)
                      </h3>
                      <p className="text-xs text-slate-500">
                        Customise tax rates and GST identification for your orders
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${
                      gstEnabled
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    {gstEnabled ? 'GST Active' : 'GST Disabled'}
                  </span>
                </div>

                {taxSuccessMsg && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{taxSuccessMsg}</span>
                  </div>
                )}

                {taxErrorMsg && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-bold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{taxErrorMsg}</span>
                  </div>
                )}

                <form onSubmit={handleSaveTax} className="space-y-5 text-xs">
                  {/* Toggle */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <label
                        htmlFor="gstEnabledToggle"
                        className="font-bold text-sm text-slate-800 cursor-pointer block"
                      >
                        Enable GST on Food Orders
                      </label>
                      <p className="text-xs text-slate-500 mt-0.5">
                        If active, CGST &amp; SGST are calculated at checkout and printed on customer bills.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        id="gstEnabledToggle"
                        checked={gstEnabled}
                        onChange={(e) => setGstEnabled(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>

                  {/* GSTIN */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      GSTIN (GST Identification Number)
                    </label>
                    <input
                      type="text"
                      value={gstNumber}
                      onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                      placeholder="e.g. 29AAAAA0000A1Z5"
                      className="w-full text-xs font-mono px-3.5 py-2.5 border border-slate-300 rounded-xl bg-white text-slate-900 uppercase focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      Printed on customer receipts and audit tickets.
                    </p>
                  </div>

                  {/* Rates */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        CGST Rate (%)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="28"
                        value={cgstRate}
                        onChange={(e) => setCgstRate(parseFloat(e.target.value) || 0)}
                        className="w-full text-xs font-mono px-3.5 py-2.5 border border-slate-300 rounded-xl bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                      />
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        Central GST (default 2.5%)
                      </span>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        SGST Rate (%)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="28"
                        value={sgstRate}
                        onChange={(e) => setSgstRate(parseFloat(e.target.value) || 0)}
                        className="w-full text-xs font-mono px-3.5 py-2.5 border border-slate-300 rounded-xl bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                      />
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        State GST (default 2.5%)
                      </span>
                    </div>
                  </div>

                  {/* Tax Calculation Preview Box */}
                  <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-extrabold uppercase text-emerald-900 tracking-wider">
                        Live Tax Breakdown Preview
                      </span>
                      <span className="text-xs font-black text-emerald-800">
                        Total GST: {(Number(cgstRate || 0) + Number(sgstRate || 0)).toFixed(2)}%
                      </span>
                    </div>
                    <div className="space-y-1.5 text-xs text-emerald-950 font-mono">
                      <div className="flex justify-between">
                        <span>Example Food Item:</span>
                        <span>₹100.00</span>
                      </div>
                      <div className="flex justify-between text-emerald-800">
                        <span>CGST ({Number(cgstRate || 0).toFixed(2)}%):</span>
                        <span>+₹{(100 * (Number(cgstRate || 0) / 100)).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-emerald-800">
                        <span>SGST ({Number(sgstRate || 0).toFixed(2)}%):</span>
                        <span>+₹{(100 * (Number(sgstRate || 0) / 100)).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-bold pt-1.5 border-t border-emerald-200 text-emerald-950">
                        <span>Customer Total:</span>
                        <span>
                          ₹{(100 + 100 * ((Number(cgstRate || 0) + Number(sgstRate || 0)) / 100)).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Submit */}
                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={isSavingTax}
                      className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black rounded-xl shadow-xs transition inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {isSavingTax ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      )}
                      <span>{isSavingTax ? 'Saving...' : 'Save GST Settings'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ================= MODAL: ADD PRODUCT ================= */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-extrabold text-slate-900">
                Add Menu Dish
              </h3>
              <button
                onClick={() => setShowAddProductModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-800 font-bold mb-1.5 text-xs">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  placeholder="e.g. Crispy Paneer Burger"
                  className="w-full px-3.5 py-2.5 text-slate-900 bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500 placeholder:text-slate-400 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-800 font-bold mb-1.5 text-xs">
                  Category *
                </label>
                <select
                  required
                  value={newProdCatId}
                  onChange={(e) => setNewProdCatId(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 text-slate-900 bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-xs"
                >
                  <option value="">Select a category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-800 font-bold mb-1.5 text-xs">
                  Price (₹) *
                </label>
                <input
                  type="number"
                  required
                  step="0.01"
                  value={newProdPrice}
                  onChange={(e) => setNewProdPrice(e.target.value)}
                  placeholder="180"
                  className="w-full px-3.5 py-2.5 text-slate-900 bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500 placeholder:text-slate-400 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-800 font-bold mb-1.5 text-xs">
                  Description (Optional)
                </label>
                <textarea
                  value={newProdDesc}
                  onChange={(e) => setNewProdDesc(e.target.value)}
                  placeholder="Fresh ingredients, toppings, cooking details..."
                  className="w-full px-3.5 py-2.5 text-slate-900 bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500 placeholder:text-slate-400 text-xs"
                  rows={2}
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-slate-800 font-bold mb-1.5 text-xs">
                  Dish Image (Upload to Cloudinary)
                </label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <label className="flex-1 flex items-center justify-center gap-2 px-3.5 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold border border-dashed border-amber-300 rounded-xl cursor-pointer transition text-xs">
                      {isUploadingImage ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
                          <span>Uploading to Cloudinary...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 text-amber-600" />
                          <span>Choose Image to Upload</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        disabled={isUploadingImage}
                        onChange={(e) => handleImageUpload(e, false)}
                        className="hidden"
                      />
                    </label>

                    {newProdImage && (
                      <button
                        type="button"
                        onClick={() => setNewProdImage('')}
                        className="px-2.5 py-2 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold transition cursor-pointer"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  {uploadError && (
                    <p className="text-[11px] text-rose-600 font-semibold">{uploadError}</p>
                  )}

                  {newProdImage && (
                    <div className="flex items-center gap-3 p-2 bg-slate-50 border border-slate-200 rounded-xl">
                      <img
                        src={newProdImage}
                        alt="Preview"
                        className="w-12 h-12 object-cover rounded-lg border border-slate-200 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Image Uploaded
                        </span>
                        <p className="text-[10px] font-mono text-slate-500 truncate mt-0.5">
                          {newProdImage}
                        </p>
                      </div>
                    </div>
                  )}

                  <input
                    type="url"
                    value={newProdImage}
                    onChange={(e) => setNewProdImage(e.target.value)}
                    placeholder="Or paste image URL (https://...)"
                    className="w-full px-3 py-1.5 text-slate-900 bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500 placeholder:text-slate-400 text-[11px]"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmittingProd || isUploadingImage}
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-extrabold rounded-xl transition flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingProd ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>Add Dish to Menu</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT PRODUCT ================= */}
      {showEditProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-extrabold text-slate-900">
                Edit Menu Dish
              </h3>
              <button
                onClick={() => setShowEditProductModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditProduct} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-800 font-bold mb-1.5 text-xs">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={editProdName}
                  onChange={(e) => setEditProdName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-slate-900 bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-800 font-bold mb-1.5 text-xs">
                  Category *
                </label>
                <select
                  required
                  value={editProdCatId}
                  onChange={(e) => setEditProdCatId(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 text-slate-900 bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-xs"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-800 font-bold mb-1.5 text-xs">
                  Price (₹) *
                </label>
                <input
                  type="number"
                  required
                  step="0.01"
                  value={editProdPrice}
                  onChange={(e) => setEditProdPrice(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-slate-900 bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-800 font-bold mb-1.5 text-xs">
                  Description
                </label>
                <textarea
                  value={editProdDesc}
                  onChange={(e) => setEditProdDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-slate-900 bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-xs"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-slate-800 font-bold mb-1.5 text-xs">
                  Stock Availability
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editProdAvailable}
                    onChange={(e) => setEditProdAvailable(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500"
                  />
                  <span className="text-slate-800 font-medium">In Stock & Orderable</span>
                </label>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-slate-800 font-bold mb-1.5 text-xs">
                  Dish Image (Cloudinary)
                </label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <label className="flex-1 flex items-center justify-center gap-2 px-3.5 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold border border-dashed border-amber-300 rounded-xl cursor-pointer transition text-xs">
                      {isUploadingEditImage ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 text-amber-600" />
                          <span>Replace Image</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        disabled={isUploadingEditImage}
                        onChange={(e) => handleImageUpload(e, true)}
                        className="hidden"
                      />
                    </label>

                    {editProdImage && (
                      <button
                        type="button"
                        onClick={() => setEditProdImage('')}
                        className="px-2.5 py-2 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold transition cursor-pointer"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  {editUploadError && (
                    <p className="text-[11px] text-rose-600 font-semibold">{editUploadError}</p>
                  )}

                  {editProdImage && (
                    <div className="flex items-center gap-3 p-2 bg-slate-50 border border-slate-200 rounded-xl">
                      <img
                        src={editProdImage}
                        alt="Preview"
                        className="w-12 h-12 object-cover rounded-lg border border-slate-200 shrink-0"
                      />
                      <p className="text-[10px] font-mono text-slate-500 truncate flex-1">
                        {editProdImage}
                      </p>
                    </div>
                  )}

                  <input
                    type="url"
                    value={editProdImage}
                    onChange={(e) => setEditProdImage(e.target.value)}
                    placeholder="Or paste image URL"
                    className="w-full px-3 py-1.5 text-slate-900 bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-[11px]"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmittingEditProd || isUploadingEditImage}
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-extrabold rounded-xl transition flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingEditProd ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: DELETE PRODUCT CONFIRMATION ================= */}
      {deleteProductTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Delete Dish?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to remove <strong className="text-slate-800">{deleteProductTarget.name}</strong>?
                If this dish has past order records, it will be safely archived without breaking customer receipts.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteProductTarget(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeletingProd}
                onClick={handleDeleteProduct}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isDeletingProd ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Delete</span>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD CATEGORY ================= */}
      {showAddCatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-extrabold text-slate-900">
                Add Menu Category
              </h3>
              <button
                onClick={() => setShowAddCatModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-800 font-bold mb-1.5 text-xs">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="e.g. Burgers, Beverages, Combos..."
                  className="w-full px-3.5 py-2.5 text-slate-900 bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500 placeholder:text-slate-400 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-800 font-bold mb-1.5 text-xs">
                  Description (Optional)
                </label>
                <textarea
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  placeholder="Short description for this menu section..."
                  className="w-full px-3.5 py-2.5 text-slate-900 bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500 placeholder:text-slate-400 text-xs"
                  rows={2}
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmittingCat}
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-extrabold rounded-xl transition flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingCat ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>Create Category</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT CATEGORY ================= */}
      {showEditCatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-extrabold text-slate-900">
                Edit Menu Category
              </h3>
              <button
                onClick={() => setShowEditCatModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditCategory} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-800 font-bold mb-1.5 text-xs">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={editCatName}
                  onChange={(e) => setEditCatName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-slate-900 bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-800 font-bold mb-1.5 text-xs">
                  Description
                </label>
                <textarea
                  value={editCatDesc}
                  onChange={(e) => setEditCatDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-slate-900 bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-xs"
                  rows={2}
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmittingEditCat}
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-extrabold rounded-xl transition flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingEditCat ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>Save Category</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: DELETE CATEGORY CONFIRMATION ================= */}
      {deleteCatTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Delete Category?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to remove <strong className="text-slate-800">{deleteCatTarget.name}</strong>?
                Existing dishes will not be deleted if they have prior order receipts.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteCatTarget(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeletingCat}
                onClick={handleDeleteCategory}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isDeletingCat ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Delete</span>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD COUPON ================= */}
      {showAddCouponModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                  <Tag className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Create Promo Coupon
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Create discount code for customers at checkout
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowAddCouponModal(false);
                  setCouponFormError('');
                }}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {couponFormError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{couponFormError}</span>
              </div>
            )}

            <form onSubmit={handleCreateCoupon} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-800 font-bold mb-1.5">
                  Coupon Code *
                </label>
                <input
                  type="text"
                  required
                  value={newCouponCode}
                  onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                  placeholder="e.g. FESTIVE20, SPECIAL50"
                  className="w-full px-3.5 py-2.5 text-slate-900 bg-white border border-slate-300 rounded-xl font-mono uppercase font-bold focus:outline-hidden focus:ring-2 focus:ring-amber-500 placeholder:text-slate-400 text-xs"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Customers enter this code at checkout to claim the offer
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-800 font-bold mb-1.5">
                    Discount Type *
                  </label>
                  <select
                    value={newCouponType}
                    onChange={(e) => setNewCouponType(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-slate-900 bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-xs font-bold"
                  >
                    <option value="FIXED">Flat (₹ Off)</option>
                    <option value="PERCENTAGE">Percentage (% Off)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-800 font-bold mb-1.5">
                    {newCouponType === 'FIXED' ? 'Flat Amount (₹) *' : 'Percentage (%) *'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    value={newCouponValue}
                    onChange={(e) => setNewCouponValue(e.target.value)}
                    placeholder={newCouponType === 'FIXED' ? '50' : '15'}
                    className="w-full px-3.5 py-2.5 text-slate-900 bg-white border border-slate-300 rounded-xl font-mono font-bold focus:outline-hidden focus:ring-2 focus:ring-amber-500 placeholder:text-slate-400 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-800 font-bold mb-1.5">
                  Minimum Order Amount (₹)
                </label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={newCouponMinOrder}
                  onChange={(e) => setNewCouponMinOrder(e.target.value)}
                  placeholder="e.g. 100 (Optional)"
                  className="w-full px-3.5 py-2.5 text-slate-900 bg-white border border-slate-300 rounded-xl font-mono focus:outline-hidden focus:ring-2 focus:ring-amber-500 placeholder:text-slate-400 text-xs"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Leave empty or 0 if no minimum required
                </span>
              </div>

              {newCouponType === 'PERCENTAGE' && (
                <div>
                  <label className="block text-slate-800 font-bold mb-1.5">
                    Maximum Discount Cap (₹)
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    value={newCouponMaxDiscount}
                    onChange={(e) => setNewCouponMaxDiscount(e.target.value)}
                    placeholder="e.g. 100 (Optional)"
                    className="w-full px-3.5 py-2.5 text-slate-900 bg-white border border-slate-300 rounded-xl font-mono focus:outline-hidden focus:ring-2 focus:ring-amber-500 placeholder:text-slate-400 text-xs"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Highest discount cap for percentage discount
                  </span>
                </div>
              )}

              <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddCouponModal(false);
                    setCouponFormError('');
                  }}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingCoupon}
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs rounded-xl transition flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingCoupon ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>Create Coupon</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: WALLET RECHARGE ================= */}
      {showRechargeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-7 w-full max-w-md shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Recharge Prepaid Wallet
                  </h3>
                  <p className="text-xs text-slate-500">
                    Add funds to keep QR payments active
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowRechargeModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {rechargeError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{rechargeError}</span>
              </div>
            )}

            {rechargeSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{rechargeSuccess}</span>
              </div>
            )}

            <form onSubmit={handleRechargeWallet} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  Select Quick Recharge Amount
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[200, 500, 1000, 2000, 3000, 5000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setRechargeAmount(amt)}
                      className={`py-2 px-3 rounded-xl font-mono font-bold text-xs border transition cursor-pointer ${
                        Number(rechargeAmount) === amt
                          ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                      }`}
                    >
                      +₹{amt}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Or Enter Custom Amount (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    min="10"
                    step="1"
                    value={rechargeAmount}
                    onChange={(e) =>
                      setRechargeAmount(e.target.value ? Number(e.target.value) : '')
                    }
                    placeholder="e.g. 500"
                    className="w-full text-sm font-mono font-bold pl-8 pr-3 py-2 border border-slate-300 rounded-xl bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Minimum top-up is ₹10. Current balance: ₹
                  {Number(walletData.wallet?.balance ?? 0).toFixed(2)}.
                </p>
              </div>

              <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-2xl flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-900 leading-relaxed">
                  Processed securely using the central Razorpay payment gateway. Your wallet is updated atomically upon payment verification.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRechargeModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isRecharging || !rechargeAmount || Number(rechargeAmount) < 10}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-black text-xs shadow-md transition inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isRecharging ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Opening Razorpay...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      <span>Pay ₹{Number(rechargeAmount || 0)} &amp; Top Up</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= ORDER CANCELLATION CONFIRMATION MODAL ================= */}
      {orderToCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-lg font-black text-slate-900">
                Cancel Order #{orderToCancel.id}?
              </h3>
              <p className="text-xs text-slate-500">
                Daily Token:{' '}
                <span className="font-mono font-bold text-slate-800">
                  {getDisplayToken(orderToCancel.tokenNumber, orderToCancel.id)}
                </span>
              </p>
              <div className="text-xs text-rose-700 bg-rose-50 p-3 rounded-2xl border border-rose-200 mt-2 text-left space-y-1">
                <p className="font-bold">⚠️ Revenue Safeguard:</p>
                <p className="text-[11px] text-rose-600">
                  Cancelled orders are strictly excluded from recognized sales, daily metrics, and restaurant revenue totals.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setOrderToCancel(null)}
                disabled={isCancellingOrder}
                className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Keep Order
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!orderToCancel) return;
                  setIsCancellingOrder(true);
                  try {
                    await handleStatusChange(orderToCancel.id, 'CANCELLED');
                    setOrderToCancel(null);
                  } finally {
                    setIsCancellingOrder(false);
                  }
                }}
                disabled={isCancellingOrder}
                className="flex-1 py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md shadow-rose-600/20 transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isCancellingOrder ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <span>Confirm Cancel</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}


      {/* ================= RECEIPT & TICKET MODAL ================= */}
      {selectedReceiptOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-5 border-b border-slate-200 bg-gradient-to-r from-amber-500 to-orange-500 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <Receipt className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-black text-base">Order Ticket &amp; Receipt</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-mono bg-white/25 px-2 py-0.5 rounded-md font-bold">
                      Token #{getDisplayToken(selectedReceiptOrder.tokenNumber, selectedReceiptOrder.id)}
                    </span>
                    <span className="text-[11px] text-white/80 font-bold">
                      Order ID: #{selectedReceiptOrder.id}
                    </span>
                  </div>
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
                    Order Status
                  </span>
                  <span className="font-black text-amber-700 uppercase">
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
                  Itemized Order ({selectedReceiptOrder.items?.length || 0})
                </h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
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
              <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200/80 space-y-1.5">
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
                {selectedReceiptOrder.taxableAmount && Number(selectedReceiptOrder.taxableAmount) > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Taxable Amount</span>
                    <span className="font-mono">₹{Number(selectedReceiptOrder.taxableAmount).toFixed(2)}</span>
                  </div>
                )}
                {selectedReceiptOrder.cgstAmount && Number(selectedReceiptOrder.cgstAmount) > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>CGST ({Number(selectedReceiptOrder.cgstRate || 2.5)}%)</span>
                    <span className="font-mono">+₹{Number(selectedReceiptOrder.cgstAmount).toFixed(2)}</span>
                  </div>
                )}
                {selectedReceiptOrder.sgstAmount && Number(selectedReceiptOrder.sgstAmount) > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>SGST ({Number(selectedReceiptOrder.sgstRate || 2.5)}%)</span>
                    <span className="font-mono">+₹{Number(selectedReceiptOrder.sgstAmount).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between items-baseline pt-2 border-t border-amber-200/60">
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

              <div className="flex items-center gap-2 flex-wrap">
                {renderStatusDropdown(selectedReceiptOrder)}
                {renderQuickActionBtn(selectedReceiptOrder)}
                <button
                  type="button"
                  onClick={() => setSelectedReceiptOrder(null)}
                  className="px-3.5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl text-xs transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= FLOATING REAL-TIME INCOMING ORDER TOASTS ================= */}
      <div className="fixed top-5 right-5 z-[70] flex flex-col space-y-3 max-w-sm sm:max-w-md w-full px-4 sm:px-0 pointer-events-none">
        {liveOrderToasts.map((toast) => {
          const { order } = toast;
          const cleanToken = String(order.tokenNumber || order.id || '01')
            .replace(/^T-/, '')
            .replace(/^ORD-/, '')
            .padStart(2, '0');
          const total = Number(order.totalAmount ?? order.total ?? 0);
          const itemsPreview = (order.items || [])
            .slice(0, 3)
            .map((it: any) => `${it.quantity}× ${it.productName || it.product?.name || 'Item'}`)
            .join(', ');
          const moreItemsCount = (order.items?.length || 0) - 3;

          return (
            <div
              key={toast.id}
              className="pointer-events-auto bg-slate-900/95 backdrop-blur-md text-white rounded-3xl p-5 shadow-2xl border-2 border-amber-500 ring-4 ring-amber-500/20 animate-in slide-in-from-top-5 duration-300 relative overflow-hidden space-y-3"
            >
              {/* Progress bar timer */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500/20">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-orange-500"
                  style={{ animation: 'progressShrink 15s linear forwards' }}
                />
              </div>

              {/* Toast Header with prominent Close Button */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center space-x-2">
                  <div
                    className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 shrink-0"
                    style={{ animation: 'bellWiggle 1s ease-in-out infinite' }}
                  >
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/15 px-2.5 py-1 rounded-full border border-amber-500/30 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping inline-block" />
                      Paid Kitchen Alert!
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setLiveOrderToasts((prev) => prev.filter((t) => t.id !== toast.id))
                  }
                  className="w-8 h-8 rounded-full bg-slate-800/90 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-700/80 hover:border-rose-500/40 flex items-center justify-center transition cursor-pointer shadow-xs group shrink-0"
                  title="Dismiss alert"
                  aria-label="Dismiss alert"
                >
                  <X className="w-4 h-4 transition-transform group-hover:scale-110" />
                </button>
              </div>

              {/* Hero Token & Price */}
              <div className="flex items-baseline justify-between bg-slate-800/90 p-3.5 rounded-2xl border border-slate-700/60 shadow-inner">
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                    Counter Token
                  </span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="font-mono text-3xl font-black text-amber-400 tracking-tight">
                      {cleanToken}
                    </span>
                    <span className="text-[10px] text-amber-300/70 font-bold uppercase">Today</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                    Amount Paid
                  </span>
                  <span className="text-xl font-black text-white font-mono">₹{total}</span>
                </div>
              </div>

              {/* Items Summary */}
              <div className="text-xs text-slate-300 line-clamp-2 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/60">
                <span className="font-bold text-amber-300">Items: </span>
                {itemsPreview || 'Order details'}
                {moreItemsCount > 0 && (
                  <span className="font-bold text-amber-400"> +{moreItemsCount} more</span>
                )}
              </div>

              {/* Interactive Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-0.5">
                <button
                  type="button"
                  onClick={() => {
                    handleStatusChange(order.id, 'PREPARING');
                    setActiveTab('ORDERS');
                    setOrderFilter('NEW');
                    setHighlightedOrderId(order.id);
                    setLiveOrderToasts((prev) => prev.filter((t) => t.id !== toast.id));
                  }}
                  className="py-2.5 px-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <ChefHat className="w-3.5 h-3.5" />
                  <span>Accept &amp; Cook</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('ORDERS');
                    setOrderFilter('ALL');
                    setSelectedReceiptOrder(order);
                    setLiveOrderToasts((prev) => prev.filter((t) => t.id !== toast.id));
                  }}
                  className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <Receipt className="w-3.5 h-3.5 text-amber-400" />
                  <span>View Ticket</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <style jsx global>{`
        @keyframes progressShrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
        @keyframes bellWiggle {
          0%,
          100% {
            transform: rotate(0deg);
          }
          20%,
          60% {
            transform: rotate(14deg);
          }
          40%,
          80% {
            transform: rotate(-14deg);
          }
        }
      `}</style>
    </div>
  );
}
