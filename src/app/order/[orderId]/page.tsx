'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { publicApi } from '../../../lib/api';
import { getSocket, joinOrderRoom } from '../../../lib/socket';
import { Order, OrderStatus } from '../../../types';
import Confetti from '../../../components/common/Confetti';
import {
  CheckCircle2,
  Clock,
  ChefHat,
  Bell,
  ShoppingBag,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Receipt,
  Sparkles,
  PartyPopper,
} from 'lucide-react';

const STATUS_STEPS: { status: OrderStatus; label: string; icon: any; desc: string }[] = [
  {
    status: 'CONFIRMED',
    label: 'Order Confirmed',
    icon: CheckCircle2,
    desc: 'Payment verified and sent to the kitchen',
  },
  {
    status: 'PREPARING',
    label: 'Kitchen Preparing',
    icon: ChefHat,
    desc: 'The chef is cooking your meal fresh',
  },
  {
    status: 'READY',
    label: 'Ready for Pickup',
    icon: Bell,
    desc: 'Please collect your order at the counter',
  },
  {
    status: 'COMPLETED',
    label: 'Completed',
    icon: Sparkles,
    desc: 'Thank you for dining with us!',
  },
];

export default function OrderTrackingPage() {
  const params = useParams();
  const orderId = Number(params?.orderId);

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isAlertPlaying, setIsAlertPlaying] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const playFanfare = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const notes = [
        { freq: 523.25, time: 0, dur: 0.12 },
        { freq: 659.25, time: 0.1, dur: 0.12 },
        { freq: 783.99, time: 0.2, dur: 0.15 },
        { freq: 1046.5, time: 0.32, dur: 0.4 },
      ];
      notes.forEach((n) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(n.freq, ctx.currentTime + n.time);
        gain.gain.setValueAtTime(0.25, ctx.currentTime + n.time);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + n.time + n.dur);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + n.time);
        osc.stop(ctx.currentTime + n.time + n.dur);
      });
    } catch (e) {
      // Audio autoplay policy
    }
  };

  useEffect(() => {
    if (!orderId) return;

    // 1. Fetch initial order data
    publicApi
      .getOrder(orderId)
      .then((data) => {
        setOrder(data.order);
        if (data.order?.orderStatus === 'CONFIRMED') {
          setShowCelebration(true);
          playFanfare();
        }
      })
      .catch((err) => {
        setErrorMessage(err.message || 'Failed to load order details');
      })
      .finally(() => {
        setIsLoading(false);
      });

    // 2. Connect to Socket.io and join order room
    joinOrderRoom(orderId);
    const socket = getSocket();

    const handleStatusUpdate = (updatedOrder: Order) => {
      if (updatedOrder && updatedOrder.id === orderId) {
        setOrder(updatedOrder);
        setLastUpdated(new Date());

        // Play chime and celebrate if ready
        if (updatedOrder.orderStatus === 'READY') {
          setIsAlertPlaying(true);
          setShowCelebration(true);
          try {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
            osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5
            gain.gain.setValueAtTime(0.3, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.5);
          } catch (e) {
            // Audio autoplay blocked or unsupported
          }
        }
      }
    };

    socket.on('order_status_updated', handleStatusUpdate);

    return () => {
      socket.off('order_status_updated', handleStatusUpdate);
    };
  }, [orderId]);

  if (isLoading) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        <p className="text-sm font-semibold text-slate-600">
          Loading live ticket and kitchen status...
        </p>
      </div>
    );
  }

  if (errorMessage || !order) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center px-4 text-center">
        <div className="p-4 bg-rose-100 text-rose-700 rounded-full mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Order Not Found</h2>
        <p className="text-xs text-slate-500 max-w-sm mt-2">{errorMessage}</p>
        <a
          href="/"
          className="mt-6 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold"
        >
          Back to Home
        </a>
      </div>
    );
  }

  const currentStepIndex = STATUS_STEPS.findIndex(
    (s) => s.status === order.orderStatus
  );

  return (
    <div className="bg-slate-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Celebratory Confetti Burst */}
      {showCelebration && <Confetti durationMs={4500} particleCount={140} />}

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Navigation & Title */}
        <div className="flex items-center justify-between">
          <a
            href={order.shop?.slug ? `/shop/${order.shop.slug}` : '/'}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Menu</span>
          </a>

          <div className="flex items-center gap-2">
            {showCelebration && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                <PartyPopper className="w-3.5 h-3.5 text-amber-600" />
                Payment Confirmed!
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              Live Socket.io Connected
            </span>
          </div>
        </div>

        {/* Big Token Number Hero Card */}
        <div className="bg-gradient-to-tr from-amber-500 via-amber-600 to-rose-600 rounded-3xl p-8 text-white shadow-xl shadow-amber-900/15 text-center relative overflow-hidden ring-4 ring-amber-400/20">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10">
            <span className="text-xs font-black uppercase tracking-widest text-amber-100 bg-white/20 px-3.5 py-1 rounded-full backdrop-blur-md border border-white/20">
              DAILY ORDER TOKEN
            </span>

            <div className="my-4 font-black text-6xl sm:text-7xl tracking-tight drop-shadow-md font-mono select-all">
              {order.tokenNumber || `ORD-${order.id}`}
            </div>

            <p className="text-xs text-amber-100 font-medium">
              Order #{order.id} • {order.shop?.name || 'Restaurant Outlet'}
            </p>

            {order.orderStatus === 'READY' && (
              <div className="mt-4 p-3.5 bg-white text-slate-900 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-xl animate-bounce">
                <Bell className="w-5 h-5 text-amber-600 animate-wiggle" />
                <span>YOUR FOOD IS READY! PLEASE COLLECT AT COUNTER</span>
              </div>
            )}
          </div>
        </div>

        {/* Live Status Progress Steps */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>Live Kitchen Tracker</span>
            </h3>
            <span className="text-[11px] text-slate-400">
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          </div>

          <div className="space-y-6 relative before:absolute before:left-5 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-200">
            {STATUS_STEPS.map((step, idx) => {
              const StepIcon = step.icon;
              const isPassed = currentStepIndex >= idx;
              const isCurrent = currentStepIndex === idx;

              return (
                <div key={step.status} className="relative flex items-start gap-4">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 z-10 transition-all ${
                      isCurrent
                        ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30 ring-4 ring-amber-100 scale-110'
                        : isPassed
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-100 text-slate-400 border border-slate-200'
                    }`}
                  >
                    <StepIcon className="w-5 h-5" />
                  </div>

                  <div className="pt-1">
                    <h4
                      className={`text-sm font-bold ${
                        isCurrent
                          ? 'text-amber-800'
                          : isPassed
                          ? 'text-slate-900'
                          : 'text-slate-400'
                      }`}
                    >
                      {step.label}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Items Breakdown Snapshot */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <Receipt className="w-4 h-4 text-amber-600" />
              <span>Order Summary Snapshot</span>
            </h3>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Payment: {order.paymentStatus || 'PAID'}
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {order.items?.map((item: any) => {
              const lineTotal =
                item.lineTotal !== undefined
                  ? Number(item.lineTotal)
                  : Number(item.unitPrice || item.price || 0) * (item.quantity || 1);
              return (
                <div key={item.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-slate-800">
                      {item.productName || item.product?.name || 'Item'}
                    </span>
                    <span className="text-slate-400 ml-2">× {item.quantity}</span>
                  </div>
                  <span className="font-bold text-slate-900">₹{lineTotal}</span>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-200 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal</span>
              <span>₹{Number(order.subtotal ?? order.totalAmount ?? order.total ?? 0)}</span>
            </div>
            {order.discountAmount && Number(order.discountAmount) > 0 && (
              <div className="flex justify-between text-emerald-700 font-bold bg-emerald-50 px-2 py-1 rounded-lg">
                <span>Discount ({order.discountReason || order.couponCode || 'Reward'})</span>
                <span>-₹{Number(order.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between font-extrabold text-sm text-slate-900 pt-2 border-t border-slate-100">
              <span>Total Paid</span>
              <span className="text-red-700 font-black font-display text-base">
                ₹{Number(order.totalAmount ?? order.total ?? order.subtotal ?? 0)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
