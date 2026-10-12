'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  CreditCard,
  Key,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Store,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { adminApi } from '@/lib/api';

interface ShopkeeperGatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
  shopkeeper: {
    id: number;
    name: string;
    email: string;
    shop?: {
      id: number;
      name: string;
      razorpayKeyId?: string | null;
      isCustomGatewayEnabled?: boolean;
      hasKeySecret?: boolean;
    } | null;
  } | null;
  onSaved: () => void;
}

export const ShopkeeperGatewayModal: React.FC<ShopkeeperGatewayModalProps> = ({
  isOpen,
  onClose,
  shopkeeper,
  onSaved,
}) => {
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form states
  const [isCustomGatewayEnabled, setIsCustomGatewayEnabled] = useState(false);
  const [keyId, setKeyId] = useState('');
  const [keySecret, setKeySecret] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [existingSecretMasked, setExistingSecretMasked] = useState<string | null>(null);
  const [hasSecret, setHasSecret] = useState(false);

  useEffect(() => {
    if (isOpen && shopkeeper) {
      loadSettings();
    } else {
      resetForm();
    }
  }, [isOpen, shopkeeper]);

  const resetForm = () => {
    setIsCustomGatewayEnabled(false);
    setKeyId('');
    setKeySecret('');
    setShowSecret(false);
    setExistingSecretMasked(null);
    setHasSecret(false);
    setTestResult(null);
    setErrorMsg('');
    setSuccessMsg('');
  };

  const loadSettings = async () => {
    if (!shopkeeper) return;
    setIsLoadingDetails(true);
    setErrorMsg('');
    try {
      const data = await adminApi.getShopkeeperGatewayGst(shopkeeper.id);
      setIsCustomGatewayEnabled(Boolean(data.isCustomGatewayEnabled));
      setKeyId(data.razorpayKeyId || '');
      setHasSecret(Boolean(data.hasKeySecret));
      setExistingSecretMasked(data.keySecretMasked || null);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load gateway settings.');
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleTestConnection = async () => {
    if (!shopkeeper) return;
    if (!keyId.trim() && !hasSecret) {
      setErrorMsg('Please enter a Razorpay Key ID and Key Secret to test.');
      return;
    }
    setIsTesting(true);
    setTestResult(null);
    setErrorMsg('');
    try {
      const payload: { keyId?: string; keySecret?: string } = {};
      if (keyId.trim()) payload.keyId = keyId.trim();
      if (keySecret.trim()) payload.keySecret = keySecret.trim();

      const res = await adminApi.testShopkeeperGateway(shopkeeper.id, payload);
      setTestResult(res);
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Connection test failed.',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopkeeper) return;
    setIsSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await adminApi.updateShopkeeperGatewayGst(shopkeeper.id, {
        isCustomGatewayEnabled,
        razorpayKeyId: keyId.trim() || null,
        ...(keySecret.trim() ? { razorpayKeySecret: keySecret.trim() } : {}),
      });

      setSuccessMsg('Gateway credentials updated successfully!');
      setTimeout(() => {
        onSaved();
        onClose();
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save settings.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen || !shopkeeper) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg my-8 overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Modal Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-amber-300 border border-white/20">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold flex items-center gap-2">
                Payment Gateway Configuration
              </h2>
              <p className="text-xs text-purple-200/80">
                Custom Razorpay merchant account for customer food payments
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Shop Info Pill */}
        <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <Store className="w-4 h-4 text-purple-600" />
            <span className="font-bold text-slate-900">
              {shopkeeper.shop?.name || 'Assigned Shop'}
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-600">{shopkeeper.name}</span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-100 text-purple-800 border border-purple-200">
            Admin Provisioned
          </span>
        </div>

        {isLoadingDetails ? (
          <div className="p-12 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-purple-600 animate-spin mx-auto" />
            <p className="text-xs text-slate-500 font-medium">Loading merchant gateway details...</p>
          </div>
        ) : (
          <form onSubmit={handleSave} className="p-6 space-y-5">
            {errorMsg && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs flex items-center gap-2 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl text-xs flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* TOGGLE: CUSTOM RAZORPAY GATEWAY */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div>
                <label className="font-bold text-sm text-slate-800 cursor-pointer block">
                  Enable Custom Razorpay Account
                </label>
                <p className="text-xs text-slate-500 mt-0.5">
                  When active, customer order payments go directly into this shop&apos;s Razorpay merchant account.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={isCustomGatewayEnabled}
                  onChange={(e) => setIsCustomGatewayEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

            {isCustomGatewayEnabled && (
              <div className="space-y-4 pt-1">
                {/* Key ID */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Razorpay Key ID
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Key className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={keyId}
                      onChange={(e) => setKeyId(e.target.value)}
                      placeholder="rzp_test_... or rzp_live_..."
                      className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                </div>

                {/* Key Secret */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Razorpay Key Secret
                    </label>
                    {hasSecret && (
                      <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" />
                        Encrypted in Database
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <input
                      type={showSecret ? 'text' : 'password'}
                      value={keySecret}
                      onChange={(e) => setKeySecret(e.target.value)}
                      placeholder={
                        hasSecret
                          ? `Secret saved (${existingSecretMasked || '••••••••'}). Enter to replace.`
                          : 'Enter Razorpay Key Secret'
                      }
                      className="w-full pl-9 pr-10 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSecret(!showSecret)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Encrypted with AES-256-GCM. Never exposed in plaintext to the frontend.
                  </p>
                </div>

                {/* Test Connection Button */}
                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={isTesting}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-50 hover:bg-slate-100 text-purple-700 border border-purple-200 transition inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isTesting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Testing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        Test Connection
                      </>
                    )}
                  </button>

                  {testResult && (
                    <span
                      className={`text-xs font-bold inline-flex items-center gap-1 ${
                        testResult.success ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {testResult.success ? (
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 shrink-0" />
                      )}
                      <span>{testResult.message}</span>
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="px-4 py-2.5 rounded-xl font-bold text-xs text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 rounded-xl font-bold text-xs bg-purple-600 hover:bg-purple-700 text-white shadow-xs transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Gateway'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
