'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { publicApi } from '../../lib/api';
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
} from 'lucide-react';

export default function MyOrdersPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push('/login');
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

  if (authLoading || isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        <p className="text-sm font-semibold text-slate-600">Loading order history...</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              My Orders & Receipts
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Active and past orders across all shops on Scan-Pay-Eat
            </p>
          </div>

          <a
            href="/shop/abc"
            className="self-start sm:self-auto px-4 py-2 bg-red-700 hover:bg-red-800 text-white font-bold text-xs rounded-xl shadow-xs transition"
          >
            Browse ABC Restaurant Menu
          </a>
        </div>

        {errorMessage && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {orders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs space-y-3">
            <ShoppingBag className="w-14 h-14 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No Orders Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              You haven&apos;t placed any orders yet. Visit any shop menu to scan and order!
            </p>
            <div className="pt-2">
              <a
                href="/shop/abc"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold"
              >
                <span>Browse ABC Restaurant</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs hover:shadow-md transition flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-mono text-xs font-black bg-amber-100 text-amber-900 px-2.5 py-1 rounded-lg border border-amber-200">
                      TOKEN: {order.tokenNumber || `ORD-${order.id}`}
                    </span>

                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                        order.orderStatus === 'COMPLETED'
                          ? 'bg-slate-100 text-slate-700'
                          : order.orderStatus === 'READY'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {order.orderStatus}
                    </span>

                    <span className="text-xs text-slate-400">
                      {new Date(order.createdAt).toLocaleDateString()} at{' '}
                      {new Date(order.createdAt).toLocaleTimeString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                    <Store className="w-3.5 h-3.5 text-amber-600" />
                    <span>{order.shop?.name || `Shop #${order.shopId}`}</span>
                  </div>

                  {/* Summary of items */}
                  <p className="text-xs text-slate-500">
                    {order.items?.map((i) => `${i.productName} (×${i.quantity})`).join(', ')}
                  </p>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                  <div className="text-left md:text-right">
                    <p className="text-[11px] text-slate-400">Total Amount</p>
                    <p className="text-base font-extrabold text-slate-900">
                      ₹{Number(order.totalAmount ?? order.total ?? 0)}
                    </p>
                  </div>

                  <a
                    href={`/order/${order.id}`}
                    className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <span>Track Live</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
