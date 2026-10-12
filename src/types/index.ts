export type UserRole = 'ADMIN' | 'SHOPKEEPER' | 'CUSTOMER';

export interface User {
  id: number;
  name: string;
  email: string;
  mobile?: string | null;
  avatarUrl?: string | null;
  role: UserRole;
  shopId?: number | null;
  shopName?: string | null;
  shopSlug?: string | null;
  isActive?: boolean;
  wallet?: ShopkeeperWallet | null;
}

export interface Shop {
  id: number;
  name: string;
  slug: string;
  subdomain: string;
  address?: string | null;
  phone?: string | null;
  qrUrl?: string | null;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  description?: string | null;
  ambienceImages?: string[];
  shopkeepers?: { id: number; name: string; avatarUrl?: string | null }[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  razorpayKeyId?: string | null;
  isCustomGatewayEnabled?: boolean;
  gstEnabled?: boolean;
  cgstRate?: number;
  sgstRate?: number;
  gstNumber?: string | null;
  isQrActive?: boolean;
  qrClosedReason?: string | null;
  _count?: {
    products?: number;
    orders?: number;
    shopkeepers?: number;
  };
}

export interface Category {
  id: number;
  shopId: number;
  name: string;
  description?: string | null;
  sortOrder: number;
  createdAt: string;
}

export interface Product {
  id: number;
  shopId: number;
  categoryId: number;
  name: string;
  description?: string | null;
  price: number;
  imageUrl?: string | null;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
  category?: Category;
}

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  productName: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface OrderStatusHistory {
  id: number;
  orderId: number;
  status: OrderStatus;
  note?: string | null;
  createdAt: string;
}

export interface Payment {
  id: number;
  orderId: number;
  shopId: number;
  customerId: number;
  razorpayOrderId?: string | null;
  razorpayPaymentId?: string | null;
  amount: number;
  currency: string;
  status: PaymentStatus;
  createdAt: string;
}

export interface Order {
  id: number;
  orderCode?: string;
  shopId: number;
  customerId?: number | null;
  customerName?: string | null;
  customerPhone?: string | null;
  tokenNumber?: string | null;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  subtotal: number;
  discountAmount?: number;
  couponCode?: string | null;
  discountReason?: string | null;
  taxableAmount?: number | null;
  cgstRate?: number;
  sgstRate?: number;
  cgstAmount?: number;
  sgstAmount?: number;
  tax?: number;
  discount?: number;
  totalAmount: number;
  total?: number;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  items?: OrderItem[];
  payments?: Payment[];
  payment?: Payment | null;
  statusHistory?: OrderStatusHistory[];
  shop?: Shop;
  customer?: {
    id: number;
    name: string;
    email: string;
    mobile?: string | null;
  };
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface ShopSalesMetric {
  shopId: number;
  shopName: string;
  slug: string;
  subdomain: string;
  isActive: boolean;
  shopkeepers: { id: number; name: string; email: string; mobile?: string | null }[];
  productsCount: number;
  totalOrders: number;
  paidOrders: number;
  totalRevenue: number;
  todaySales: number;
  todayOrders: number;
  weekSales: number;
  weekOrders: number;
  monthSales: number;
  monthOrders: number;
}

export interface AdminStats {
  totalShops: number;
  activeShops: number;
  totalOrders: number;
  paidOrders?: number;
  pendingOrders?: number;
  totalRevenue: number;
  revenue?: number;
  totalCustomers: number;
  totalShopkeepers?: number;
  todaySales?: number;
  todayRevenue?: number;
  todayOrders?: number;
  weekSales?: number;
  weekRevenue?: number;
  weekOrders?: number;
  monthSales?: number;
  monthRevenue?: number;
  monthOrders?: number;
  shopSales?: ShopSalesMetric[];
}

export interface ShopkeeperStats {
  todayOrders: number;
  todayRevenue: number;
  todaySales?: number;
  todayDiscounts?: number;
  todayGrossSales?: number;
  weekOrders?: number;
  weekRevenue?: number;
  weekSales?: number;
  monthOrders?: number;
  monthRevenue?: number;
  monthSales?: number;
  totalOrders?: number;
  totalRevenue?: number;
  totalSales?: number;
  totalDiscounts?: number;
  currentToken: number;
  activeOrders: number;
}

export interface Coupon {
  id: number;
  shopId?: number | null;
  code: string;
  discountType: string;
  discountValue: number;
  minOrderAmount: number;
  maxDiscount?: number | null;
  isActive: boolean;
  usageCount?: number;
  isGlobal?: boolean;
  canDelete?: boolean;
  shop?: Shop | null;
  createdAt?: string;
}

export interface ShopRewardRule {
  id: number;
  shopId: number;
  milestoneCount: number;
  discountAmount: number;
  minOrderAmount: number;
  isActive: boolean;
  title?: string;
}

export interface DiscountCheckResult {
  subtotal: number;
  discountAmount: number;
  finalAmount: number;
  appliedCoupon?: {
    code: string;
    discountAmount: number;
    type: string;
    value: number;
  } | null;
  couponError?: string | null;
  milestone?: {
    active: boolean;
    todayCustomerNumber: number;
    targetMilestone: number;
    isEligible: boolean;
    discountAmount: number;
    minOrderAmount: number;
    title: string;
  } | null;
  reason?: string | null;
}

export interface WalletTransaction {
  id: number;
  walletId: number;
  type: 'CREDIT' | 'DEBIT' | 'REFUND' | 'ADJUSTMENT';
  amount: number;
  previousBalance: number;
  newBalance: number;
  reference: string;
  idempotencyKey?: string | null;
  adminId?: number | null;
  orderId?: number | null;
  notes?: string | null;
  createdAt: string;
  shopkeeper?: {
    id: number;
    name: string;
    email: string;
    shop?: { id: number; name: string; slug: string };
  };
}

export interface ShopkeeperWallet {
  id: number;
  shopkeeperId: number;
  balance: number;
  minWalletLimit: number;
  isQrEnabled: boolean;
  isBreached?: boolean;
  totalCredits: number;
  totalDebits: number;
  createdAt: string;
  updatedAt: string;
  transactions?: WalletTransaction[];
  lastTransaction?: WalletTransaction | null;
  recentTransactions?: WalletTransaction[];
  shopkeeper?: User & { shop?: Shop };
}

export interface PaymentGatewaySettings {
  id?: number;
  provider: string;
  keyId: string;
  keySecretMasked: string;
  webhookSecretMasked?: string;
  isKeySecretSet: boolean;
  isWebhookSecretSet?: boolean;
  environment: 'TEST' | 'LIVE';
  currency: string;
  isActive: boolean;
  updatedAt?: string;
}

export interface ShopGatewaySettings {
  keyId: string;
  keySecretMasked: string;
  isKeySecretSet: boolean;
  isCustomGatewayEnabled: boolean;
}

export interface ShopTaxSettings {
  gstEnabled: boolean;
  cgstRate: number;
  sgstRate: number;
  totalGstRate: number;
  gstNumber: string;
}

export interface WalletRechargeOrder {
  orderId: string;
  amount: number;
  amountInPaise: number;
  currency: string;
  keyId: string;
}

export interface FoodStoryData {
  customer: {
    name: string;
    profileImage?: string | null;
  };
  restaurant: {
    name: string;
    logo?: string | null;
    location?: string | null;
  };
  order: {
    id: number;
    orderNumber: string;
    tokenNumber: string;
    totalAmount: number;
    createdAt: string;
    items: Array<{
      name: string;
      image?: string | null;
      quantity: number;
      unitPrice?: number;
    }>;
  };
}



