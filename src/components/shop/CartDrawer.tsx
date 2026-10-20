'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { publicApi } from '../../lib/api';
import { useRouter } from 'next/navigation';
import { Order, Shop } from '../../types';
import OrderSuccessModal from './OrderSuccessModal';
import {
  X,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  Loader2,
  CheckCircle,
  AlertCircle,
  CreditCard,
  Tag,
  Gift,
  Sparkles,
} from 'lucide-react';

interface CartDrawerProps {
  shop?: Shop | null;
}

export default function CartDrawer({ shop }: CartDrawerProps = {}) {
  const {
    items,
    shopId,
    shopSlug,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    totalItems,
  } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  const [notes, setNotes] = useState('');
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  // Coupon & Milestone Discount states
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountReason, setDiscountReason] = useState<string | null>(null);
  const [milestoneNotice, setMilestoneNotice] = useState<string | null>(null);
  const [couponError, setCouponError] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState<any[]>([]);

  // Shop Tax & GST state - Synchronously initialized from shop prop if provided to prevent "FREE" flash
  const [shopTaxInfo, setShopTaxInfo] = useState<{
    gstEnabled: boolean;
    cgstRate: number;
    sgstRate: number;
    gstNumber?: string | null;
    isQrActive?: boolean;
    qrClosedReason?: string | null;
  } | null>(() => {
    if (shop) {
      return {
        gstEnabled: !!shop.gstEnabled,
        cgstRate: Number(shop.cgstRate ?? 2.5),
        sgstRate: Number(shop.sgstRate ?? 2.5),
        gstNumber: shop.gstNumber,
        isQrActive: shop.isQrActive !== false,
        qrClosedReason: shop.qrClosedReason || null,
      };
    }
    return null;
  });

  useEffect(() => {
    if (shop) {
      setShopTaxInfo({
        gstEnabled: !!shop.gstEnabled,
        cgstRate: Number(shop.cgstRate ?? 2.5),
        sgstRate: Number(shop.sgstRate ?? 2.5),
        gstNumber: shop.gstNumber,
        isQrActive: shop.isQrActive !== false,
        qrClosedReason: shop.qrClosedReason || null,
      });
    }
  }, [shop]);

  useEffect(() => {
    if (shopSlug && isCartOpen) {
      publicApi
        .getShopCoupons(shopSlug)
        .then((res) => {
          if (res?.coupons) setAvailableCoupons(res.coupons);
        })
        .catch(() => {});

      if (!shop) {
        publicApi
          .getShopMenu(shopSlug)
          .then((res: any) => {
            if (res?.shop) {
              setShopTaxInfo({
                gstEnabled: !!res.shop.gstEnabled,
                cgstRate: Number(res.shop.cgstRate ?? 2.5),
                sgstRate: Number(res.shop.sgstRate ?? 2.5),
                gstNumber: res.shop.gstNumber,
                isQrActive: res.shop.isQrActive !== false,
                qrClosedReason: res.shop.qrClosedReason || null,
              });
            }
          })
          .catch(() => {});
      }
    }
  }, [shopSlug, isCartOpen, shop]);

  const checkDiscounts = async (codeToTest?: string) => {
    if ((!shopId && !shopSlug) || items.length === 0) return;
    setIsApplyingCoupon(true);
    setCouponError('');
    try {
      const res = await publicApi.checkDiscounts({
        shopId: shopId || undefined,
        shopSlug: shopSlug || undefined,
        subtotal,
        couponCode: codeToTest !== undefined ? codeToTest : (appliedCoupon || couponInput.trim() || undefined),
      });

      setDiscountAmount(res.discountAmount || 0);
      setDiscountReason(res.reason || null);

      if (res.appliedCoupon) {
        setAppliedCoupon(res.appliedCoupon.code);
        setCouponError('');
      } else if (codeToTest) {
        setCouponError(res.couponError || 'Coupon code not valid');
        setAppliedCoupon(null);
      }

      if (res.milestone?.isEligible) {
        setMilestoneNotice(
          `🎉 Today's #${res.milestone.todayCustomerNumber} Customer Celebration! ₹${res.milestone.discountAmount} Special Milestone Reward applied!`
        );
      } else {
        setMilestoneNotice(null);
      }
    } catch (err: any) {
      if (codeToTest) setCouponError('Could not verify coupon.');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  useEffect(() => {
    if (isCartOpen && items.length > 0) {
      checkDiscounts();
    }
  }, [isCartOpen, subtotal, shopId, shopSlug]);

  const discountedSubtotal = Math.max(0, subtotal - discountAmount);
  const isGstActive = !!shopTaxInfo?.gstEnabled;
  const cgstRate = isGstActive ? (shopTaxInfo?.cgstRate ?? 2.5) : 0;
  const sgstRate = isGstActive ? (shopTaxInfo?.sgstRate ?? 2.5) : 0;
  const cgstAmount = isGstActive ? Math.round(discountedSubtotal * (cgstRate / 100) * 100) / 100 : 0;
  const sgstAmount = isGstActive ? Math.round(discountedSubtotal * (sgstRate / 100) * 100) / 100 : 0;
  const finalPayable = Math.round((discountedSubtotal + cgstAmount + sgstAmount) * 100) / 100;

  if (!isCartOpen && !confirmedOrder) return null;

  const handleCheckout = async () => {
    if (!shopId || items.length === 0) return;

    if (!user) {
      setIsCartOpen(false);
      const redirectPath = typeof window !== 'undefined' ? window.location.pathname : '';
      router.push(`/login${redirectPath ? `?redirect=${encodeURIComponent(redirectPath)}` : ''}`);
      return;
    }

    setIsCheckingOut(true);
    setErrorMessage('');

    try {
      // 1. Create order on backend (recalculates prices server-side)
      const checkoutPayload = {
        shopId,
        items: items.map((i) => ({
          productId: i.product.id,
          quantity: i.quantity,
        })),
        notes: notes.trim() || undefined,
        couponCode: appliedCoupon || undefined,
      };

      const checkoutRes = await publicApi.checkout(checkoutPayload);

      // Safe extraction supporting all API response shapes
      const activeOrderId = checkoutRes.orderId || checkoutRes.order?.id;
      const activeRzpOrderId = checkoutRes.razorpayOrderId || checkoutRes.razorpayOrder?.id;
      const activeKeyId = checkoutRes.razorpayKeyId || checkoutRes.keyId;
      const activeAmount = checkoutRes.amountInPaise || checkoutRes.razorpayOrder?.amount || Math.round(finalPayable * 100);

      if (!activeOrderId) {
        throw new Error('Order creation failed to return a valid order ID.');
      }

      // 2. Launch Razorpay payment modal if available on window
      const win = window as any;
      const isRealRazorpay =
        win.Razorpay &&
        activeKeyId &&
        activeKeyId !== 'rzp_test_placeholder' &&
        activeRzpOrderId &&
        !activeRzpOrderId.startsWith('rzp_mock_');

      if (isRealRazorpay) {
        const options = {
          key: activeKeyId,
          amount: activeAmount,
          currency: 'INR',
          name: 'Scan-Pay-Eat',
          description: `Order #${activeOrderId} Checkout`,
          order_id: activeRzpOrderId,
          prefill: {
            name: user?.name || 'Customer',
            email: user?.email || 'customer@hotelkada.com',
            contact: user?.mobile || '9999999999',
          },
          theme: {
            color: '#B91C1C',
          },
          handler: async function (response: any) {
            try {
              // 3. Verify Razorpay signature on backend
              const verifyRes = await publicApi.verifyPayment({
                orderId: activeOrderId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });

              const confirmed = {
                id: activeOrderId,
                orderCode: (verifyRes as any)?.orderCode || verifyRes?.order?.orderCode || checkoutRes.order?.orderCode,
                tokenNumber: verifyRes?.tokenNumber || checkoutRes.order?.tokenNumber || `T-${activeOrderId}`,
                orderStatus: 'CONFIRMED',
                paymentStatus: 'PAID',
                totalAmount: checkoutRes.totalAmount ?? finalPayable,
                total: checkoutRes.totalAmount ?? finalPayable,
                subtotal: subtotal,
                discountAmount: checkoutRes.discountAmount ?? discountAmount,
                couponCode: checkoutRes.couponCode ?? appliedCoupon,
                discountReason: checkoutRes.discountReason ?? discountReason,
                taxableAmount: (checkoutRes as any).taxableAmount ?? discountedSubtotal,
                cgstRate: (checkoutRes as any).cgstRate ?? cgstRate,
                sgstRate: (checkoutRes as any).sgstRate ?? sgstRate,
                cgstAmount: (checkoutRes as any).cgstAmount ?? cgstAmount,
                sgstAmount: (checkoutRes as any).sgstAmount ?? sgstAmount,
                items: items.map((i) => ({
                  id: i.product.id,
                  product: i.product,
                  quantity: i.quantity,
                  price: i.product.price,
                })),
                shop: checkoutRes.order?.shop || { id: shopId, name: 'Food Counter' },
                createdAt: new Date().toISOString(),
              } as any;

              clearCart();
              setIsCartOpen(false);
              setConfirmedOrder(confirmed);
            } catch (err: any) {
              setErrorMessage(err.message || 'Payment verification failed');
            }
          },
          modal: {
            ondismiss: function () {
              setIsCheckingOut(false);
            },
          },
        };

        const rzp = new win.Razorpay(options);
        rzp.on('payment.failed', function (resp: any) {
          setErrorMessage(resp.error?.description || 'Payment failed. Please retry.');
          setIsCheckingOut(false);
        });
        rzp.open();
      } else {
        // Direct test verification for local simulation or when Razorpay script is not blocked
        const mockSig = `sig_simulated_${Date.now()}`;
        const verifyRes = await publicApi
          .verifyPayment({
            orderId: activeOrderId,
            razorpay_order_id: activeRzpOrderId || `order_mock_${activeOrderId}`,
            razorpay_payment_id: `pay_mock_${Date.now()}`,
            razorpay_signature: mockSig,
          })
          .catch(() => null);

        const confirmed = {
          id: activeOrderId,
          orderCode: (verifyRes as any)?.orderCode || verifyRes?.order?.orderCode || checkoutRes.order?.orderCode,
          tokenNumber: verifyRes?.tokenNumber || checkoutRes.order?.tokenNumber || `T-${activeOrderId}`,
          orderStatus: 'CONFIRMED',
          paymentStatus: 'PAID',
          totalAmount: checkoutRes.totalAmount ?? finalPayable,
          total: checkoutRes.totalAmount ?? finalPayable,
          subtotal: subtotal,
          discountAmount: checkoutRes.discountAmount ?? discountAmount,
          couponCode: checkoutRes.couponCode ?? appliedCoupon,
          discountReason: checkoutRes.discountReason ?? discountReason,
          taxableAmount: (checkoutRes as any).taxableAmount ?? discountedSubtotal,
          cgstRate: (checkoutRes as any).cgstRate ?? cgstRate,
          sgstRate: (checkoutRes as any).sgstRate ?? sgstRate,
          cgstAmount: (checkoutRes as any).cgstAmount ?? cgstAmount,
          sgstAmount: (checkoutRes as any).sgstAmount ?? sgstAmount,
          items: items.map((i) => ({
            id: i.product.id,
            product: i.product,
            quantity: i.quantity,
            price: i.product.price,
          })),
          shop: checkoutRes.order?.shop || { id: shopId, name: 'Food Counter' },
          createdAt: new Date().toISOString(),
        } as any;

        clearCart();
        setIsCartOpen(false);
        setConfirmedOrder(confirmed);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Checkout failed. Please try again.');
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <>
      {confirmedOrder && (
        <OrderSuccessModal
          order={confirmedOrder}
          isOpen={true}
          onClose={() => {
            setConfirmedOrder(null);
            setIsCartOpen(false);
          }}
        />
      )}

      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsCartOpen(false)}
          />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FAF7F2] shadow-2xl flex flex-col border-l border-[#E8DFC8] h-full max-h-screen overflow-hidden">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-[#E8DFC8] flex items-center justify-between bg-white/80 backdrop-blur-xs shrink-0">
            <div className="flex items-center space-x-2.5">
              <div className="p-2.5 bg-red-700 text-white rounded-xl shadow-xs">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-black text-stone-900 text-lg sm:text-xl tracking-tight uppercase">Your Order</h3>
                <p className="text-xs text-stone-500 font-medium">
                  {totalItems} {totalItems === 1 ? 'dish' : 'dishes'} selected
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 text-stone-400 hover:text-stone-700 rounded-xl hover:bg-stone-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Error alert */}
          {errorMessage && (
            <div className="m-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2 shrink-0">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Scrollable Body: Holds items list, notes, and coupon offers */}
          <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 space-y-4">
            {/* Warning if QR Ordering is Paused */}
            {shopTaxInfo?.isQrActive === false && (
              <div className="p-3 bg-rose-50 border border-rose-300 rounded-2xl flex items-start gap-2.5 text-rose-900 text-xs">
                <AlertCircle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Online QR Ordering Paused</span>
                  <span className="text-[11px] text-rose-700 font-medium">
                    {shopTaxInfo?.qrClosedReason || 'This restaurant is currently not accepting online QR payments. Please place your order directly at the counter.'}
                  </span>
                </div>
              </div>
            )}

            {/* Cart Items List */}
            {items.length === 0 ? (
              <div className="py-16 flex flex-col items-center justify-center text-center p-8 text-stone-400 space-y-3">
                <ShoppingBag className="w-16 h-16 stroke-1 text-stone-300" />
                <p className="font-display font-bold text-stone-700 text-lg">Your cart is empty</p>
                <p className="text-xs text-stone-500 max-w-xs">
                  Scan a table QR code or browse the menu to add delicious freshly prepared dishes to your tray.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {items.map(({ product, quantity }) => (
                  <div key={product.id} className="flex items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-[#E8DFC8]/70 shadow-2xs">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-display font-bold text-sm text-stone-900 truncate">
                        {product.name}
                      </h4>
                      <p className="text-xs text-stone-500 mt-0.5">
                        ₹{product.price} × {quantity}
                      </p>
                      <p className="text-sm font-display font-black text-red-700 mt-1">
                        ₹{product.price * quantity}
                      </p>
                    </div>

                    {/* Quantity Stepper */}
                    <div className="flex items-center space-x-1.5 bg-stone-100 rounded-xl p-1 border border-stone-200">
                      <button
                        onClick={() => updateQuantity(product.id, quantity - 1)}
                        className="w-7 h-7 flex items-center justify-center text-stone-700 hover:bg-white rounded-lg transition cursor-pointer shadow-xs"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-6 text-center text-xs font-black text-stone-900">
                        {quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(product.id, quantity + 1)}
                        className="w-7 h-7 flex items-center justify-center text-stone-700 hover:bg-white rounded-lg transition cursor-pointer shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(product.id)}
                      className="p-1.5 text-stone-400 hover:text-rose-600 transition cursor-pointer"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Kitchen Instructions & Coupons inside Scroll Area */}
            {items.length > 0 && (
              <div className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1 tracking-wide uppercase">
                    Kitchen Instructions / Notes (Optional)
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Extra spicy, no onions, cutlery needed"
                    className="w-full text-xs px-3.5 py-2.5 border border-[#E8DFC8] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-red-600 bg-white text-stone-900 placeholder:text-stone-400 font-medium"
                  />
                </div>

                {/* Coupon Codes & Daily Milestone Rewards */}
                <div className="bg-amber-50/70 border border-amber-200/90 rounded-2xl p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-bold text-stone-800">
                    <span className="flex items-center gap-1.5">
                      <Gift className="w-4 h-4 text-red-700" />
                      <span>Offers &amp; Coupon Codes</span>
                    </span>
                    {discountAmount > 0 && (
                      <span className="text-emerald-700 font-extrabold bg-emerald-100 px-2 py-0.5 rounded-full text-[11px]">
                        -₹{discountAmount} SAVED
                      </span>
                    )}
                  </div>

                  {milestoneNotice && (
                    <div className="p-2.5 bg-gradient-to-r from-red-600 to-amber-600 text-white text-xs rounded-xl font-bold flex items-center gap-2 shadow-xs">
                      <Sparkles className="w-4 h-4 shrink-0 text-amber-200 animate-pulse" />
                      <span>{milestoneNotice}</span>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="w-3.5 h-3.5 absolute left-3 top-3 text-stone-400" />
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        placeholder="Enter promo coupon code"
                        className="w-full pl-8 pr-3 py-2 text-xs border border-stone-300 rounded-xl bg-white font-mono font-bold tracking-wider uppercase focus:outline-hidden focus:ring-2 focus:ring-red-600"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => checkDiscounts(couponInput.trim())}
                      disabled={isApplyingCoupon || !couponInput.trim()}
                      className="px-3 py-2 bg-stone-900 hover:bg-black text-white text-xs font-black rounded-xl uppercase tracking-wider transition disabled:opacity-50 cursor-pointer"
                    >
                      {isApplyingCoupon ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Apply'}
                    </button>
                  </div>

                  {couponError && (
                    <p className="text-[11px] text-rose-600 font-semibold">{couponError}</p>
                  )}

                  {/* Available Quick Coupon Codes */}
                  <div className="flex items-center gap-1.5 pt-0.5 flex-wrap">
                    <span className="text-[10px] text-stone-500 font-medium">Offers:</span>
                    {(availableCoupons.length > 0
                      ? availableCoupons.slice(0, 4).map((c: any) => c.code)
                      : ['WELCOME10', 'FLAT50', 'TASTY20']
                    ).map((code: string) => (
                      <button
                        key={code}
                        type="button"
                        onClick={() => {
                          setCouponInput(code);
                          checkDiscounts(code);
                        }}
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg border transition cursor-pointer ${
                          appliedCoupon === code
                            ? 'bg-red-700 text-white border-red-700'
                            : 'bg-white text-stone-700 border-stone-200 hover:border-red-400'
                        }`}
                      >
                        %{code}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer & Checkout button (Pinned bottom) */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-[#E8DFC8] bg-white shrink-0 shadow-lg space-y-3">
              {/* Bill Details */}
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal</span>
                  <span className="font-bold">₹{subtotal.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold bg-emerald-50 px-2 py-1 rounded-lg">
                    <span className="flex items-center gap-1">
                      <Gift className="w-3.5 h-3.5" />
                      <span>Discount ({discountReason || appliedCoupon || 'Reward'})</span>
                    </span>
                    <span>-₹{discountAmount.toFixed(2)}</span>
                  </div>
                )}
                {shopTaxInfo === null ? (
                  <div className="flex justify-between text-stone-600">
                    <span>Taxes &amp; Packaging</span>
                    <span className="text-stone-400 font-medium text-[11px]">Calculating...</span>
                  </div>
                ) : isGstActive ? (
                  <>
                    <div className="flex justify-between text-stone-600">
                      <span>CGST ({cgstRate}%)</span>
                      <span className="font-bold">+₹{cgstAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-stone-600">
                      <span>SGST ({sgstRate}%)</span>
                      <span className="font-bold">+₹{sgstAmount.toFixed(2)}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between text-stone-600">
                    <span>Taxes &amp; Packaging</span>
                    <span className="text-emerald-700 font-bold">FREE</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-display font-black text-stone-900 pt-1.5 border-t border-[#E8DFC8]">
                  <span>Total Amount</span>
                  <span className="text-red-700 font-display text-xl">₹{finalPayable.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-2">
                {shopTaxInfo?.isQrActive === false ? (
                  <div className="w-full py-3.5 px-4 bg-stone-100 border border-stone-300 text-stone-500 font-display font-black text-xs uppercase tracking-wider rounded-xl flex items-center justify-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-stone-400" />
                    <span>Online Ordering Paused by Outlet</span>
                  </div>
                ) : user ? (
                  <button
                    onClick={handleCheckout}
                    disabled={isCheckingOut}
                    className="w-full py-3.5 px-4 bg-gradient-to-r from-red-700 to-red-800 hover:from-red-800 hover:to-red-900 text-white font-display font-black text-sm tracking-wider uppercase rounded-xl shadow-lg shadow-red-700/20 hover:shadow-xl transition flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
                  >
                    {isCheckingOut ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Processing Order...</span>
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4" />
                        <span>Pay for Order (₹{finalPayable.toFixed(2)})</span>
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </>
                    )}
                  </button>
                ) : (
                  <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-3.5 space-y-2.5">
                    <div className="flex items-start gap-2">
                      <div className="p-1 rounded-lg bg-amber-100 text-amber-800 shrink-0 mt-0.5">
                        <AlertCircle className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <h4 className="text-[11px] font-black text-amber-950 uppercase tracking-wide">
                          Sign In Required to Order
                        </h4>
                        <p className="text-[10px] text-amber-800 font-medium leading-relaxed">
                          Please sign in to complete payment and receive your counter token.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsCartOpen(false);
                          const redirectPath = typeof window !== 'undefined' ? window.location.pathname : '';
                          router.push(`/login${redirectPath ? `?redirect=${encodeURIComponent(redirectPath)}` : ''}`);
                        }}
                        className="py-2 px-3 bg-red-700 hover:bg-red-800 text-white font-black text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <span>Sign In to Pay</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsCartOpen(false);
                          const redirectPath = typeof window !== 'undefined' ? window.location.pathname : '';
                          router.push(`/register${redirectPath ? `?redirect=${encodeURIComponent(redirectPath)}` : ''}`);
                        }}
                        className="py-2 px-3 bg-white hover:bg-amber-100/60 text-amber-950 font-bold text-xs rounded-xl border border-amber-300 transition flex items-center justify-center cursor-pointer"
                      >
                        <span>Create Account</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-center space-x-1 text-[10px] text-stone-500 font-medium">
                <CheckCircle className="w-3 h-3 text-emerald-600" />
                <span>100% Secure Razorpay Checkout &amp; Token Queue</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
      )}
    </>
  );
}
