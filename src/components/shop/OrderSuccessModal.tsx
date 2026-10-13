'use client';

import React, { useEffect, useState } from 'react';
import Confetti from '../common/Confetti';
import { useRouter } from 'next/navigation';
import {
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Clock,
  Store,
  Receipt,
  UtensilsCrossed,
  Camera,
} from 'lucide-react';
import { Order, FoodStoryData } from '../../types';
import { publicApi } from '../../lib/api';
import FoodStoryModal from './FoodStoryModal';

interface OrderSuccessModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
}

export default function OrderSuccessModal({
  order,
  isOpen,
  onClose,
}: OrderSuccessModalProps) {
  const router = useRouter();
  const [showCelebration, setShowCelebration] = useState(false);
  const [isStoryOpen, setIsStoryOpen] = useState(false);
  const [storyData, setStoryData] = useState<FoodStoryData | null>(null);
  const [isLoadingStory, setIsLoadingStory] = useState(false);

  const handleOpenStory = async () => {
    setIsStoryOpen(true);
    if (!storyData) {
      setIsLoadingStory(true);
      try {
        const data = await publicApi.getOrderStoryData(order.id);
        setStoryData(data);
      } catch (err) {
        // Fallback to local order details
        setStoryData({
          customer: {
            name: order.customerName || 'Food Lover',
            profileImage: null,
          },
          restaurant: {
            name: order.shop?.name || 'Restaurant',
            location: order.shop?.address || 'Dine-In',
            logo: order.shop?.logoUrl || null,
          },
          order: {
            id: order.id,
            orderNumber: order.orderCode || String(order.id),
            tokenNumber: order.tokenNumber || `ORD-${order.id}`,
            totalAmount: Number(order.totalAmount ?? order.total ?? 0),
            createdAt: order.createdAt || new Date().toISOString(),
            items: (order.items || []).map((i: any) => ({
              name: i.productName || i.name,
              image: i.product?.imageUrl || i.imageUrl || null,
              quantity: i.quantity || 1,
              unitPrice: Number(i.unitPrice || i.price || 0),
            })),
          },
        });
      } finally {
        setIsLoadingStory(false);
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      setShowCelebration(true);
      playSuccessFanfare();
    }
  }, [isOpen]);

  const playSuccessFanfare = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const notes = [
        { freq: 523.25, time: 0, dur: 0.15 }, // C5
        { freq: 659.25, time: 0.12, dur: 0.15 }, // E5
        { freq: 783.99, time: 0.24, dur: 0.2 }, // G5
        { freq: 1046.5, time: 0.4, dur: 0.5 }, // C6
      ];

      notes.forEach((n) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(n.freq, ctx.currentTime + n.time);
        gain.gain.setValueAtTime(0.3, ctx.currentTime + n.time);
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

  if (!isOpen) return null;

  const token = order.tokenNumber || `ORD-${order.id}`;
  const totalAmount = Number(order.totalAmount ?? order.total ?? 0);

  const handleTrackLive = () => {
    onClose();
    router.push(`/order/${order.id}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Confetti Explosion */}
      {showCelebration && <Confetti durationMs={4500} particleCount={140} />}

      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-md transition-opacity animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal Dialog with Scale-Up Animation */}
      <div className="relative w-full max-w-md bg-white rounded-3xl p-5 sm:p-8 shadow-2xl border border-slate-100 z-10 text-center space-y-4 sm:space-y-5 animate-in zoom-in-95 duration-300 max-h-[92vh] overflow-y-auto">
        {/* Animated Success Ring Icon */}
        <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-emerald-100 animate-ping opacity-75" />
          <div className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <CheckCircle2 className="w-10 h-10 animate-bounce" />
          </div>
        </div>

        {/* Heading */}
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            Payment Verified & Sent to Kitchen
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            Order Placed!
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Your food is now being freshly prepped by the chefs.
          </p>
        </div>

        {/* Hero Token Card Reveal */}
        <div className="bg-gradient-to-tr from-amber-500 via-amber-600 to-orange-600 rounded-2xl p-5 text-white shadow-xl shadow-amber-900/20 relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 opacity-10">
            <UtensilsCrossed className="w-32 h-32" />
          </div>

          <div className="relative z-10">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-100 bg-white/20 px-2.5 py-0.5 rounded-full backdrop-blur-xs">
              YOUR COUNTER TOKEN
            </span>

            <div className="my-2 text-4xl sm:text-5xl font-black font-mono tracking-tight drop-shadow-sm">
              {token}
            </div>

            <p className="text-[11px] text-amber-100 font-medium">
              Show this token at the counter for pickup
            </p>
          </div>
        </div>

        {/* Order Details Preview */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-left text-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="flex items-center gap-1.5 font-medium">
              <Store className="w-3.5 h-3.5 text-amber-600" />
              {order.shop?.name || 'Restaurant Outlet'}
            </span>
            <span className="font-mono text-slate-400">Order #{order.id}</span>
          </div>

          {order.discountAmount && Number(order.discountAmount) > 0 ? (
            <div className="space-y-1 border-t border-slate-200/70 pt-2">
              <div className="flex items-center justify-between text-slate-500">
                <span>Subtotal</span>
                <span>₹{order.subtotal || totalAmount + Number(order.discountAmount)}</span>
              </div>
              <div className="flex items-center justify-between text-emerald-700 font-bold">
                <span>Discount ({order.discountReason || order.couponCode || 'Offer'})</span>
                <span>-₹{Number(order.discountAmount)}</span>
              </div>
              {order.cgstAmount && Number(order.cgstAmount) > 0 && (
                <div className="flex items-center justify-between text-slate-500">
                  <span>CGST ({Number(order.cgstRate || 2.5)}%)</span>
                  <span>+₹{Number(order.cgstAmount).toFixed(2)}</span>
                </div>
              )}
              {order.sgstAmount && Number(order.sgstAmount) > 0 && (
                <div className="flex items-center justify-between text-slate-500">
                  <span>SGST ({Number(order.sgstRate || 2.5)}%)</span>
                  <span>+₹{Number(order.sgstAmount).toFixed(2)}</span>
                </div>
              )}
              <div className="flex items-center justify-between pt-1 font-bold text-slate-900 border-t border-slate-200/50">
                <span>Total Paid</span>
                <span className="text-base text-red-700 font-black">₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>
          ) : (
            <div className="space-y-1 border-t border-slate-200/70 pt-2">
              {order.cgstAmount && Number(order.cgstAmount) > 0 && (
                <div className="flex items-center justify-between text-slate-500">
                  <span>CGST ({Number(order.cgstRate || 2.5)}%)</span>
                  <span>+₹{Number(order.cgstAmount).toFixed(2)}</span>
                </div>
              )}
              {order.sgstAmount && Number(order.sgstAmount) > 0 && (
                <div className="flex items-center justify-between text-slate-500">
                  <span>SGST ({Number(order.sgstRate || 2.5)}%)</span>
                  <span>+₹{Number(order.sgstAmount).toFixed(2)}</span>
                </div>
              )}
              <div className="flex items-center justify-between pt-1 font-bold text-slate-900 border-t border-slate-200/50">
                <span>Total Paid</span>
                <span className="text-base text-red-700 font-black">₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>
          )}

          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 pt-1">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>Estimated Kitchen Prep Time: 10 - 15 mins</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          {/* Create Food Story Button */}
          <button
            onClick={handleOpenStory}
            className="w-full py-3 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 hover:from-purple-700 hover:via-pink-700 hover:to-orange-600 text-white font-black text-xs rounded-xl shadow-lg shadow-pink-500/25 transition flex items-center justify-center gap-2 cursor-pointer transform hover:scale-[1.01]"
          >
            <Camera className="w-4 h-4" />
            <span>Create My Food Story 📸✨</span>
          </button>

          <button
            onClick={handleTrackLive}
            className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-orange-500/25 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Track Order Status Live</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onClose}
            className="w-full py-2 text-slate-500 hover:text-slate-800 font-bold text-xs rounded-xl transition cursor-pointer"
          >
            Back to Menu
          </button>
        </div>
      </div>

      {/* Instagram-Style Food Story Modal */}
      <FoodStoryModal
        isOpen={isStoryOpen}
        onClose={() => setIsStoryOpen(false)}
        storyData={storyData}
        isLoading={isLoadingStory}
      />
    </div>
  );
}
