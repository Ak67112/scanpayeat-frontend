'use client';

import React, { useState, useEffect } from 'react';
import { adminApi } from '../../lib/api';
import { PaymentGatewaySettings } from '../../types';
import {
  CreditCard,
  Key,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  Zap,
  Info,
  Server,
  Percent,
} from 'lucide-react';

export default function PaymentGatewaySettingsTab() {
  const [settings, setSettings] = useState<PaymentGatewaySettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Form Fields
  const [keyId, setKeyId] = useState('');
  const [keySecret, setKeySecret] = useState('');
  const [webhookSecret, setWebhookSecret] = useState('');
  const [environment, setEnvironment] = useState<'TEST' | 'LIVE'>('TEST');
  const [currency, setCurrency] = useState('INR');
  const [isActive, setIsActive] = useState(true);

  // UI States
  const [showKeySecretInput, setShowKeySecretInput] = useState(false);
  const [showWebhookSecretInput, setShowWebhookSecretInput] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [saveErrorMsg, setSaveErrorMsg] = useState<string | null>(null);

  // Test Connection States
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    error?: string;
  } | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    setSaveErrorMsg(null);
    try {
      const res = await adminApi.getPaymentGatewaySettings();
      if (res?.settings) {
        const s = res.settings;
        setSettings(s);
        setKeyId(s.keyId || '');
        setEnvironment(s.environment || 'TEST');
        setCurrency(s.currency || 'INR');
        setIsActive(s.isActive ?? true);
      }
    } catch (err: any) {
      setSaveErrorMsg(err.message || 'Failed to load payment gateway settings.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyId.trim()) {
      setSaveErrorMsg('Gateway Key ID is required.');
      return;
    }

    setIsSaving(true);
    setSaveErrorMsg(null);
    setSaveSuccessMsg(null);
    setTestResult(null);
    try {
      const res = await adminApi.updatePaymentGatewaySettings({
        keyId: keyId.trim(),
        keySecret: keySecret.trim() ? keySecret.trim() : undefined,
        webhookSecret: webhookSecret.trim() ? webhookSecret.trim() : undefined,
        environment,
        currency,
        isActive,
      });

      if (res?.settings) {
        setSettings(res.settings);
        setKeySecret('');
        setWebhookSecret('');
        setShowKeySecretInput(false);
        setShowWebhookSecretInput(false);
      }

      setSaveSuccessMsg('Payment gateway configuration saved securely & cache updated!');
      setTimeout(() => setSaveSuccessMsg(null), 5000);
    } catch (err: any) {
      setSaveErrorMsg(err.message || 'Failed to update gateway settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    setSaveErrorMsg(null);
    try {
      const res = await adminApi.testPaymentGatewayConnection({
        keyId: keyId.trim() || undefined,
        keySecret: keySecret.trim() || undefined,
        environment,
      });
      setTestResult(res);
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Connection test failed to authenticate with Razorpay.',
      });
    } finally {
      setIsTesting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-purple-600 mb-3" />
        <p className="text-xs text-slate-500 font-medium">Loading gateway settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner / Explanation */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 translate-x-12 -translate-y-12 w-64 h-64 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-white/10 text-purple-300 border border-white/10 mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Centrally Configured Gateway</span>
            </div>
            <h2 className="text-xl font-black tracking-tight text-white font-display">
              Payment Gateway & Merchant Credentials
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              All restaurant outlets automatically route customer QR payments through this central gateway account. Secrets are protected using AES-256-GCM authenticated encryption on the backend and are never exposed to client browsers.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 ${
                isActive
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-400' : 'bg-rose-400'}`} />
              <span>{isActive ? 'Gateway Active' : 'Gateway Disabled'}</span>
            </span>

            <span className="px-3 py-1.5 rounded-xl text-xs font-mono font-bold bg-white/10 text-purple-200 border border-white/10">
              {environment} MODE
            </span>
          </div>
        </div>
      </div>

      {/* Main Settings Form */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 md:p-8">
        {saveSuccessMsg && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-bold">{saveSuccessMsg}</span>
          </div>
        )}

        {saveErrorMsg && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-900 rounded-2xl text-xs flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span className="font-bold">{saveErrorMsg}</span>
          </div>
        )}

        {testResult && (
          <div
            className={`mb-6 p-4 rounded-2xl text-xs flex items-start gap-2.5 border ${
              testResult.success
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                : 'bg-rose-50 border-rose-300 text-rose-900'
            }`}
          >
            {testResult.success ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-bold">
                {testResult.success ? 'Connectivity Verified!' : 'Authentication Failed'}
              </p>
              <p className="text-[11px] mt-0.5">{testResult.message}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Environment Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-2">
              Gateway Operating Mode
            </label>
            <div className="grid grid-cols-2 gap-3 max-w-md">
              <button
                type="button"
                onClick={() => setEnvironment('TEST')}
                className={`p-3 rounded-2xl border text-xs font-bold text-left transition cursor-pointer flex items-center justify-between ${
                  environment === 'TEST'
                    ? 'border-purple-600 bg-purple-50/50 text-purple-900 shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <div>
                  <span className="block font-black">TEST (Sandbox)</span>
                  <span className="text-[10px] text-slate-500 font-normal">
                    Simulate payments with Razorpay test keys
                  </span>
                </div>
                {environment === 'TEST' && (
                  <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0 ml-2" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setEnvironment('LIVE')}
                className={`p-3 rounded-2xl border text-xs font-bold text-left transition cursor-pointer flex items-center justify-between ${
                  environment === 'LIVE'
                    ? 'border-emerald-600 bg-emerald-50/50 text-emerald-900 shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <div>
                  <span className="block font-black">LIVE (Production)</span>
                  <span className="text-[10px] text-slate-500 font-normal">
                    Real UPI, card, and netbanking transactions
                  </span>
                </div>
                {environment === 'LIVE' && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 ml-2" />
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-slate-100">
            {/* Key ID */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Razorpay Key ID <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={keyId}
                  onChange={(e) => setKeyId(e.target.value)}
                  placeholder="rzp_test_..."
                  className="w-full text-xs font-mono pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500 bg-white text-slate-900 placeholder:text-slate-400"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Public key identifier passed to checkout modal in diner browsers.
              </p>
            </div>

            {/* Currency */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Base Currency Code
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full text-xs font-bold px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500 bg-white text-slate-900"
              >
                <option value="INR">INR (₹ - Indian Rupee)</option>
                <option value="USD">USD ($ - US Dollar)</option>
                <option value="EUR">EUR (€ - Euro)</option>
              </select>
              <p className="text-[11px] text-slate-400 mt-1">
                Currency code submitted with Razorpay orders.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-slate-100">
            {/* Key Secret */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  Razorpay Key Secret <span className="text-rose-500">*</span>
                </label>
                {settings?.isKeySecretSet && !showKeySecretInput && (
                  <button
                    type="button"
                    onClick={() => setShowKeySecretInput(true)}
                    className="text-[11px] text-purple-600 hover:text-purple-700 font-bold cursor-pointer"
                  >
                    Change Secret
                  </button>
                )}
              </div>

              {settings?.isKeySecretSet && !showKeySecretInput ? (
                <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="flex items-center space-x-2">
                    <Lock className="w-4 h-4 text-emerald-600" />
                    <span className="font-mono text-xs text-slate-700">
                      {settings.keySecretMasked || '••••••••••••••••'}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                    Active & Encrypted
                  </span>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      value={keySecret}
                      onChange={(e) => setKeySecret(e.target.value)}
                      placeholder="Paste your Razorpay Key Secret"
                      className="w-full text-xs font-mono pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500 bg-white text-slate-900 placeholder:text-slate-400"
                    />
                  </div>
                  {settings?.isKeySecretSet && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowKeySecretInput(false);
                        setKeySecret('');
                      }}
                      className="text-[10px] text-slate-400 hover:text-slate-600 font-medium cursor-pointer"
                    >
                      Cancel change (keep existing secret)
                    </button>
                  )}
                </div>
              )}
              <p className="text-[11px] text-slate-400 mt-1">
                Used strictly on the backend to verify signatures. Never transmitted to browsers.
              </p>
            </div>

            {/* Webhook Secret */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  Webhook Signature Secret{' '}
                  <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                {settings?.isWebhookSecretSet && !showWebhookSecretInput && (
                  <button
                    type="button"
                    onClick={() => setShowWebhookSecretInput(true)}
                    className="text-[11px] text-purple-600 hover:text-purple-700 font-bold cursor-pointer"
                  >
                    Change Secret
                  </button>
                )}
              </div>

              {settings?.isWebhookSecretSet && !showWebhookSecretInput ? (
                <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="flex items-center space-x-2">
                    <Lock className="w-4 h-4 text-emerald-600" />
                    <span className="font-mono text-xs text-slate-700">
                      {settings.webhookSecretMasked || '••••••••••••••••'}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                    Configured
                  </span>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      value={webhookSecret}
                      onChange={(e) => setWebhookSecret(e.target.value)}
                      placeholder="Webhook signing secret"
                      className="w-full text-xs font-mono pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500 bg-white text-slate-900 placeholder:text-slate-400"
                    />
                  </div>
                  {settings?.isWebhookSecretSet && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowWebhookSecretInput(false);
                        setWebhookSecret('');
                      }}
                      className="text-[10px] text-slate-400 hover:text-slate-600 font-medium cursor-pointer"
                    >
                      Cancel change
                    </button>
                  )}
                </div>
              )}
              <p className="text-[11px] text-slate-400 mt-1">
                Used to verify incoming Razorpay webhooks at /api/webhooks/razorpay.
              </p>
            </div>
          </div>


          {/* Active Status Checkbox */}
          <div className="pt-2 flex items-center space-x-3">
            <input
              type="checkbox"
              id="isActiveGateway"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
            />
            <label htmlFor="isActiveGateway" className="text-xs font-bold text-slate-800 cursor-pointer">
              Enable centralized payment gateway for online QR checkout
            </label>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={isTesting || !keyId.trim()}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-xs transition flex items-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              {isTesting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                  <span>Testing Razorpay API...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span>Test Connection</span>
                </>
              )}
            </button>

            <button
              type="submit"
              disabled={isSaving || !keyId.trim()}
              className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/20 transition flex items-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Configuration...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Save Gateway Settings</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
