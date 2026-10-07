export type UserRole = 'ADMIN' | 'SHOPKEEPER' | 'CUSTOMER';

export interface User {
  id: number;
  name: string;
  email: string;
  mobile?: string | null;
  role: UserRole;
  shopId?: number | null;
  shopName?: string | null;
  shopSlug?: string | null;
  isActive?: boolean;
}

export interface Shop {
  id: number;
  name: string;
  slug: string;
  subdomain: string;
  address?: string | null;
  phone?: string | null;
  qrUrl?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
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

