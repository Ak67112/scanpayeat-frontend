import {
  User,
  Shop,
  Category,
  Product,
  Order,
  AdminStats,
  ShopkeeperStats,
  OrderStatus,
  Coupon,
} from '../types';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== 'undefined' && window.location.hostname !== 'localhost'
    ? 'https://scanpayeat-backend.vercel.app'
    : 'http://localhost:5001');

interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

// Token helper for SSR/client safety
function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('scanpayeat_token');
}

export async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include', // Support cross-origin cookies
  });

  const json: ApiResponse<T> = await response.json().catch(() => ({
    success: false,
    message: 'Failed to parse JSON response',
  }));

  if (!response.ok || !json.success) {
    const errorMsg = json.message || json.error || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return (json.data as T) ?? (json as any);
}

// ================= AUTH API =================
export const authApi = {
  async register(data: { name: string; email: string; mobile?: string; avatarUrl?: string; password: string }) {
    return apiFetch<{ user: User; accessToken: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async login(data: { email: string; password: string; role?: string }) {
    return apiFetch<{ user: User; accessToken: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getMe() {
    return apiFetch<{ user: User }>('/api/auth/me');
  },

  async logout() {
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      // Ignore network failures on logout
    }
  },
};

// ================= PUBLIC / CUSTOMER SCAN API =================
export const publicApi = {
  async getShopBySlug(slug: string) {
    return apiFetch<{ shop: Shop }>(`/api/public/shops/${slug}`);
  },

  async getShopMenu(slug: string) {
    return apiFetch<{
      shop: Shop;
      categories: Category[];
      products: Product[];
    }>(`/api/public/shops/${slug}/menu`);
  },

  async getShopCoupons(slug: string) {
    return apiFetch<{ coupons: Coupon[] }>(`/api/public/shops/${slug}/coupons`);
  },

  async checkDiscounts(params: {
    shopId?: number;
    shopSlug?: string;
    subtotal: number;
    couponCode?: string;
  }) {
    const qs = new URLSearchParams();
    if (params.shopId) qs.set('shopId', String(params.shopId));
    if (params.shopSlug) qs.set('shopSlug', params.shopSlug);
    qs.set('subtotal', String(params.subtotal));
    if (params.couponCode) qs.set('couponCode', params.couponCode);
    return apiFetch<any>(`/api/public/discount-check?${qs.toString()}`);
  },

  async checkout(data: {
    shopId: number;
    items: { productId: number; quantity: number }[];
    notes?: string;
    couponCode?: string;
  }) {
    return apiFetch<{
      orderId?: number;
      orderCode?: string;
      order?: Order;
      razorpayOrder?: {
        id: string;
        amount: number;
        currency: string;
      };
      razorpayOrderId?: string;
      amountInPaise?: number;
      currency?: string;
      keyId?: string;
      razorpayKeyId?: string;
      subtotal?: number;
      totalAmount?: number;
      total?: number;
      discountAmount?: number;
      couponCode?: string;
      discountReason?: string;
      shop?: {
        id: number;
        name: string;
        slug: string;
      };
    }>('/api/orders/checkout', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async verifyPayment(data: {
    orderId: number;
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) {
    return apiFetch<{
      order: Order;
      tokenNumber: string;
      paymentStatus: string;
    }>('/api/payments/verify', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getOrder(orderId: number) {
    return apiFetch<{ order: Order }>(`/api/orders/${orderId}`);
  },

  async getMyOrders() {
    return apiFetch<{ orders: Order[] }>('/api/me/orders');
  },
};

// ================= SHOPKEEPER API =================
export const shopkeeperApi = {
  async getCategories() {
    return apiFetch<{ categories: Category[] }>('/api/shop/categories');
  },

  async createCategory(data: { name: string; description?: string; sortOrder?: number }) {
    return apiFetch<{ category: Category }>('/api/shop/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateCategory(id: number, data: { name?: string; description?: string; sortOrder?: number }) {
    return apiFetch<{ category: Category }>(`/api/shop/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteCategory(id: number) {
    return apiFetch(`/api/shop/categories/${id}`, {
      method: 'DELETE',
    });
  },

  async getProducts() {
    return apiFetch<{ products: Product[] }>('/api/shop/products');
  },

  async createProduct(data: {
    categoryId: number;
    name: string;
    description?: string;
    price: number;
    imageUrl?: string;
    isAvailable?: boolean;
  }) {
    return apiFetch<{ product: Product }>('/api/shop/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateProduct(id: number, data: Partial<Product>) {
    return apiFetch<{ product: Product }>(`/api/shop/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async toggleProductAvailability(id: number, isAvailable: boolean) {
    return apiFetch<{ product: Product }>(`/api/shop/products/${id}/availability`, {
      method: 'PATCH',
      body: JSON.stringify({ isAvailable }),
    });
  },

  async deleteProduct(id: number) {
    return apiFetch(`/api/shop/products/${id}`, {
      method: 'DELETE',
    });
  },

  async getOrders(status?: string) {
    const query = status ? `?status=${status}` : '';
    return apiFetch<{ orders: Order[] }>(`/api/shop/orders${query}`);
  },

  async updateOrderStatus(orderId: number, status: OrderStatus, note?: string) {
    return apiFetch<{ order: Order }>(`/api/shop/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, note }),
    });
  },

  async getStats() {
    return apiFetch<{ stats: ShopkeeperStats }>('/api/shop/stats');
  },

  async uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('image', file);

    const token = getToken();
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/api/shop/upload`, {
      method: 'POST',
      headers,
      body: formData,
      credentials: 'include',
    });

    const json = await response.json().catch(() => ({ success: false, message: 'Upload failed' }));
    if (!response.ok || !json.success) {
      throw new Error(json.message || 'Image upload to Cloudinary failed');
    }

    return (json.data as { imageUrl: string }).imageUrl;
  },

  async getRewardRule() {
    return apiFetch<{ rule: any }>('/api/shop/reward-rules');
  },

  async updateRewardRule(data: {
    milestoneCount?: number;
    discountAmount?: number;
    minOrderAmount?: number;
    isActive?: boolean;
    title?: string;
  }) {
    return apiFetch<{ rule: any }>('/api/shop/reward-rules', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async getCoupons() {
    return apiFetch<{ coupons: any[] }>('/api/shop/coupons');
  },

  async createCoupon(data: {
    code: string;
    discountType?: string;
    discountValue: number;
    minOrderAmount?: number;
    maxDiscount?: number;
  }) {
    return apiFetch<{ coupon: any }>('/api/shop/coupons', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async deleteCoupon(id: number) {
    return apiFetch(`/api/shop/coupons/${id}`, {
      method: 'DELETE',
    });
  },

  async getProfile() {
    return apiFetch<{ shop: Shop; shopkeeper: any }>('/api/shop/profile');
  },

  async updateProfile(data: {
    name?: string;
    address?: string;
    phone?: string;
    logoUrl?: string;
    bannerUrl?: string;
    description?: string;
    ambienceImages?: string[];
    keeperName?: string;
    keeperMobile?: string;
    keeperAvatarUrl?: string;
  }) {
    return apiFetch<{ shop: Shop }>('/api/shop/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

// ================= CUSTOMER API =================
export const customerApi = {
  async getProfile() {
    return apiFetch<{ customer: any }>('/api/customer/profile');
  },

  async updateProfile(data: { name?: string; mobile?: string; avatarUrl?: string }) {
    return apiFetch<{ customer: any }>('/api/customer/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async uploadAvatar(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('image', file);
    const token = getToken();
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`${API_BASE_URL}/api/customer/upload`, {
      method: 'POST',
      headers,
      body: formData,
      credentials: 'include',
    });
    const json = await response.json().catch(() => ({ success: false, message: 'Upload failed' }));
    if (!response.ok || !json.success) {
      throw new Error(json.message || 'Avatar upload failed');
    }
    return (json.data as { imageUrl: string }).imageUrl;
  },
};

// ================= ADMIN API =================
export const adminApi = {
  async getDashboard() {
    return apiFetch<{ stats: AdminStats }>('/api/admin/dashboard');
  },

  async getShops() {
    return apiFetch<{ shops: Shop[] }>('/api/admin/shops');
  },

  async createShop(data: {
    name: string;
    slug: string;
    subdomain: string;
    address?: string;
    phone?: string;
  }) {
    return apiFetch<{ shop: Shop }>('/api/admin/shops', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateShop(
    shopId: number,
    data: {
      name?: string;
      slug?: string;
      subdomain?: string;
      address?: string;
      phone?: string;
      isActive?: boolean;
    }
  ) {
    return apiFetch<{ shop: Shop }>(`/api/admin/shops/${shopId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteShop(shopId: number) {
    return apiFetch(`/api/admin/shops/${shopId}`, {
      method: 'DELETE',
    });
  },

  async updateShopStatus(shopId: number, isActive: boolean) {
    return apiFetch<{ shop: Shop }>(`/api/admin/shops/${shopId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive }),
    });
  },

  async getShopkeepers() {
    return apiFetch<{ shopkeepers: (User & { shop: Shop })[] }>('/api/admin/shopkeepers');
  },

  async createShopkeeper(data: {
    name: string;
    email: string;
    mobile?: string;
    shopId: number;
    password: string;
  }) {
    return apiFetch<{ shopkeeper: User }>('/api/admin/shopkeepers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateShopkeeper(
    shopkeeperId: number,
    data: {
      name?: string;
      email?: string;
      mobile?: string;
      password?: string;
      shopId?: number;
      isActive?: boolean;
    }
  ) {
    return apiFetch<{ shopkeeper: User }>(`/api/admin/shopkeepers/${shopkeeperId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteShopkeeper(shopkeeperId: number) {
    return apiFetch(`/api/admin/shopkeepers/${shopkeeperId}`, {
      method: 'DELETE',
    });
  },

  async updateShopkeeperStatus(shopkeeperId: number, isActive: boolean) {
    return apiFetch<{ shopkeeper: User }>(`/api/admin/shopkeepers/${shopkeeperId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive }),
    });
  },

  async getOrders() {
    return apiFetch<{ orders: Order[] }>('/api/admin/orders');
  },

  async getTransactions() {
    return apiFetch<{ transactions: any[] }>('/api/admin/transactions');
  },

  async getCoupons(params?: { shopId?: number; search?: string }) {
    const qs = new URLSearchParams();
    if (params?.shopId) qs.set('shopId', String(params.shopId));
    if (params?.search) qs.set('search', params.search);
    const query = qs.toString() ? `?${qs.toString()}` : '';
    return apiFetch<{ coupons: (Coupon & { isGlobal: boolean; shop?: Shop | null })[] }>(
      `/api/admin/coupons${query}`
    );
  },

  async createCoupon(data: {
    code: string;
    discountType?: string;
    discountValue: number;
    minOrderAmount?: number;
    maxDiscount?: number;
    shopId?: number | null;
    isActive?: boolean;
  }) {
    return apiFetch<{ coupon: Coupon }>('/api/admin/coupons', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async deleteCoupon(id: number) {
    return apiFetch(`/api/admin/coupons/${id}`, {
      method: 'DELETE',
    });
  },

  async toggleCoupon(id: number, isActive: boolean) {
    return apiFetch<{ coupon: Coupon }>(`/api/admin/coupons/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive }),
    });
  },
};
