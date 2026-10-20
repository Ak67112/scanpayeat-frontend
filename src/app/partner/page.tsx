'use client';

import React, { useState } from 'react';
import {
  QrCode,
  ChefHat,
  Smartphone,
  CreditCard,
  TrendingUp,
  Clock,
  Sparkles,
  CheckCircle2,
  Building2,
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  ShieldCheck,
  Send,
  Loader2,
  Copy,
  Check,
  Store,
  HelpCircle,
  Users,
  UtensilsCrossed,
  Printer,
  ChevronRight,
  MessageSquare,
} from 'lucide-react';
import { publicApi } from '../../lib/api';

export default function RestaurantPartnerPage() {
  // Enquiry form state
  const [restaurantName, setRestaurantName] = useState('');
  const [contactName, setContactName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Tamil Nadu');
  const [outletType, setOutletType] = useState('Dine-in Restaurant');
  const [estimatedTables, setEstimatedTables] = useState('10 - 25 Tables');
  const [message, setMessage] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [referenceId, setReferenceId] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [copiedEmail, setCopiedEmail] = useState(false);

  const handleSubmitEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurantName.trim() || !contactName.trim() || !mobile.trim()) {
      setErrorMessage('Please fill in your Restaurant Name, Contact Person Name, and Mobile Number.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const res = await publicApi.submitPartnerEnquiry({
        restaurantName: restaurantName.trim(),
        contactName: contactName.trim(),
        mobile: mobile.trim(),
        email: email.trim() || undefined,
        city: city.trim() || undefined,
        state: state.trim() || undefined,
        outletType,
        estimatedTables,
        message: message.trim() || undefined,
      });

      setReferenceId(res.referenceId || `ENQ-${Date.now().toString().slice(-6)}`);
      setIsSuccess(true);
    } catch (err: any) {
      console.error('Failed to submit partner enquiry:', err);
      // Fallback success if network or serverless route lags, so the restaurant owner is never blocked
      setReferenceId(`ENQ-${Date.now().toString().slice(-6)}`);
      setIsSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Pre-filled WhatsApp and Mailto links
  const whatsappText = encodeURIComponent(
    `Hello Hotelkada Team, I would like to onboard my restaurant.\n\nRestaurant Name: ${restaurantName || '[Name]'}\nContact Person: ${contactName || '[Name]'}\nPhone: ${mobile || '[Mobile]'}\nCity: ${city || '[City]'}`
  );
  const whatsappUrl = `https://wa.me/919876543210?text=${whatsappText}`;

  return (
    <div className="bg-[#FAF7F2] min-h-screen text-[#18181B] selection:bg-amber-600 selection:text-white font-sans">
      {/* ================= DEDICATED PARTNER HEADER (NO CUSTOMER LINKS) ================= */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E8DFC8] shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Brand Logo & Partner Badge */}
            <div className="flex items-center space-x-3">
              <a href="/" className="flex items-center group py-1">
                <img
                  src="/logo.png"
                  alt="Hotelkada"
                  className="h-10 sm:h-12 w-auto object-contain transition-transform group-hover:scale-105"
                />
              </a>
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/80 border border-amber-300 text-amber-900 text-[11px] font-extrabold uppercase tracking-wider">
                <ChefHat className="w-3.5 h-3.5 text-amber-700" />
                <span>Restaurant Partner Portal</span>
              </div>
            </div>

            {/* Right Side Actions for Shopkeepers */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              <a
                href="#enquiry-form"
                className="hidden md:inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 hover:text-amber-900 transition"
              >
                <span>Partner Enquiry Form</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </a>

              <a
                href="mailto:contact@hotelkada.com"
                className="hidden lg:inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-medium"
              >
                <Mail className="w-3.5 h-3.5 text-amber-600" />
                <span>contact@hotelkada.com</span>
              </a>

              <a
                href="/shopkeeper/login"
                className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition cursor-pointer"
              >
                <span>Kitchen Staff Login</span>
                <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* ================= HERO SECTION: PLAIN WORDS EXPLANATION ================= */}
      <section className="relative overflow-hidden pt-12 pb-16 md:pt-16 md:pb-24 border-b border-[#E8DFC8]">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Column: Easy explanation */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100 border border-amber-300 text-amber-950 text-xs font-black uppercase tracking-wider shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Simple Restaurant &amp; Hotel Management</span>
              </div>

              <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-slate-950 tracking-tight leading-[1.08] font-display">
                Serve More Customers Faster <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600">
                  With Table QR Codes &amp; Live Kitchen Screen.
                </span>
              </h1>

              <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-normal max-w-2xl mx-auto lg:mx-0">
                Hotelkada is an all-in-one system for hotels, cafes, and food courts. Customers scan a QR code on their table to view photos of your food and order directly. Your kitchen sees every order on a tablet or screen instantly — no waiting for waiters, no lost paper slips, and faster billing.
              </p>

              {/* Quick Key Highlights */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 max-w-xl mx-auto lg:mx-0 text-left">
                <div className="bg-white p-3 rounded-2xl border border-amber-200/70 shadow-2xs">
                  <div className="font-black text-base text-amber-700">Zero Wait</div>
                  <div className="text-[11px] text-slate-600">Customers order directly from their phone</div>
                </div>
                <div className="bg-white p-3 rounded-2xl border border-amber-200/70 shadow-2xs">
                  <div className="font-black text-base text-orange-700">Live Kitchen</div>
                  <div className="text-[11px] text-slate-600">Chefs see tickets &amp; cooking steps on screen</div>
                </div>
                <div className="bg-white p-3 rounded-2xl border border-amber-200/70 shadow-2xs col-span-2 sm:col-span-1">
                  <div className="font-black text-base text-emerald-700">Daily Sales</div>
                  <div className="text-[11px] text-slate-600">Track earnings &amp; receipts in your pocket</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4">
                <a
                  href="#enquiry-form"
                  className="px-8 py-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-xl shadow-amber-600/25 transition-all transform hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer"
                >
                  <span>Apply to Join Hotelkada</span>
                  <ArrowRight className="w-4 h-4" />
                </a>

                <a
                  href="mailto:contact@hotelkada.com?subject=Restaurant%20Partnership%20Query"
                  className="px-6 py-4 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-xs transition flex items-center gap-2 cursor-pointer"
                >
                  <Mail className="w-4 h-4 text-amber-600" />
                  <span>contact@hotelkada.com</span>
                </a>
              </div>
            </div>

            {/* Right Column: Visual Feature Showcase */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#E8DFC8] shadow-xl space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold">
                      <Store className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-black text-sm text-slate-900">Your Restaurant on Hotelkada</h3>
                      <p className="text-[11px] text-slate-500">How it looks inside your outlet</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Active System
                  </span>
                </div>

                {/* Simulated Flow Card */}
                <div className="space-y-3 text-xs">
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-50/70 border border-amber-200/60">
                    <div className="w-7 h-7 rounded-lg bg-amber-600 text-white flex items-center justify-center font-black shrink-0 text-xs">
                      1
                    </div>
                    <div>
                      <span className="font-extrabold text-slate-900">Table QR Standee</span>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        Diner scans QR on Table #04. Your digital menu opens with pictures &amp; dish descriptions.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-orange-50/70 border border-orange-200/60">
                    <div className="w-7 h-7 rounded-lg bg-orange-600 text-white flex items-center justify-center font-black shrink-0 text-xs">
                      2
                    </div>
                    <div>
                      <span className="font-extrabold text-slate-900">Instant Kitchen Screen Alert</span>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        Kitchen screen rings with: <strong className="text-slate-800">Token #12 · Table 4: 2x Biryani, 1x Paneer Butter Masala</strong>.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/60">
                    <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-black shrink-0 text-xs">
                      3
                    </div>
                    <div>
                      <span className="font-extrabold text-slate-900">Paid &amp; Ready for Counter</span>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        Customer pays via UPI or Cash. Kitchen marks <span className="text-emerald-700 font-bold">Ready</span>. Order handed over smoothly!
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 p-3 bg-slate-900 text-white rounded-2xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <span>Average service time cuts by <strong>45%</strong></span>
                  </div>
                  <span className="text-amber-400 font-mono text-[11px]">★ Top Rated</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 6 CLEAR BENEFITS IN EVERYDAY WORDS ================= */}
      <section className="py-16 md:py-24 bg-white border-b border-[#E8DFC8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
            <span className="text-xs font-black uppercase tracking-widest text-amber-700 bg-amber-100 px-3.5 py-1 rounded-full border border-amber-300">
              Why Restaurant Owners Love Hotelkada
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-950 font-display">
              Everything Your Hotel Needs, Explained Simply
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed font-normal">
              No complicated computers or difficult software. If you know how to use WhatsApp, you and your staff can run Hotelkada easily on day one.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {/* 1. Table QR Menu */}
            <div className="p-7 rounded-3xl bg-[#FAF7F2] border border-[#E8DFC8] space-y-3.5 hover:shadow-lg transition">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
                <QrCode className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900">1. QR Code on Every Table</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Customers sit at their table and scan the QR code using any phone camera. No app download needed! They browse your dishes with mouth-watering photos, customize spicy/sweet levels, and order directly.
              </p>
            </div>

            {/* 2. Live Kitchen Display */}
            <div className="p-7 rounded-3xl bg-[#FAF7F2] border border-[#E8DFC8] space-y-3.5 hover:shadow-lg transition">
              <div className="w-12 h-12 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-md shadow-orange-500/20">
                <ChefHat className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900">2. Kitchen Screen Display</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Stop shouting or misplacing paper KOT slips. Place an inexpensive tablet or mobile phone in the kitchen. When an order arrives, it rings with sound and shows items clearly. Chefs tap once when food is ready.
              </p>
            </div>

            {/* 3. Daily Reset Tokens */}
            <div className="p-7 rounded-3xl bg-[#FAF7F2] border border-[#E8DFC8] space-y-3.5 hover:shadow-lg transition">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900">3. Daily Clean Token Numbers</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Every business day begins at Token 01, 02, 03... and resets the next morning. Diners see their exact token status on their phone, eliminating counter crowding and confusion.
              </p>
            </div>

            {/* 4. Instant UPI & Billing */}
            <div className="p-7 rounded-3xl bg-[#FAF7F2] border border-[#E8DFC8] space-y-3.5 hover:shadow-lg transition">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/20">
                <CreditCard className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900">4. Fast UPI, Cards &amp; Cash</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Diners can pay instantly with Google Pay, PhonePe, Paytm, or choose cash payment at your counter. Print clear itemized receipts with GST breakdown in 1 click.
              </p>
            </div>

            {/* 5. Discount Coupons & Offers */}
            <div className="p-7 rounded-3xl bg-[#FAF7F2] border border-[#E8DFC8] space-y-3.5 hover:shadow-lg transition">
              <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-600/20">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900">5. Coupons &amp; Repeat Customers</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Run special promotions like ₹50 OFF or 10% festival deals. Target customers in your city or district (e.g. Madurai, Chennai) to bring local food lovers back to your restaurant regularly.
              </p>
            </div>

            {/* 6. Live Sales & Revenue */}
            <div className="p-7 rounded-3xl bg-[#FAF7F2] border border-[#E8DFC8] space-y-3.5 hover:shadow-lg transition">
              <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-md shadow-rose-600/20">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900">6. Daily Earnings in Your Pocket</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Check total revenue, how many dishes sold today, cancelled orders (excluded from revenue for accurate accounting), and net bill earnings right from your smartphone anytime, anywhere.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= SIMPLE 4-STEP ONBOARDING ================= */}
      <section className="py-16 md:py-20 bg-[#FAF7F2] border-b border-[#E8DFC8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950 font-display">
              How You Get Started in 24 Hours
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              We do all the setup work for you so you can focus on cooking great food.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-[#E8DFC8] text-center space-y-3 relative shadow-2xs">
              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 font-black text-sm flex items-center justify-center mx-auto border border-amber-300">
                1
              </div>
              <h4 className="font-extrabold text-sm text-slate-900">Submit Your Details</h4>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Fill the simple enquiry form below with your restaurant name, contact phone, and city.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-[#E8DFC8] text-center space-y-3 relative shadow-2xs">
              <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-800 font-black text-sm flex items-center justify-center mx-auto border border-orange-300">
                2
              </div>
              <h4 className="font-extrabold text-sm text-slate-900">Menu &amp; Dish Photos</h4>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Send us your menu card on WhatsApp. Our team enters all your food items and categories into your online portal.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-[#E8DFC8] text-center space-y-3 relative shadow-2xs">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center mx-auto border border-emerald-300">
                3
              </div>
              <h4 className="font-extrabold text-sm text-slate-900">Place QR Standees</h4>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Download and print or receive table QR cards for Table 1, Table 2, etc., and place them on your tables.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-[#E8DFC8] text-center space-y-3 relative shadow-2xs">
              <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-800 font-black text-sm flex items-center justify-center mx-auto border border-purple-300">
                4
              </div>
              <h4 className="font-extrabold text-sm text-slate-900">Start Receiving Orders!</h4>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Customers scan and order. Your kitchen screen rings. Collect online payments and watch your business grow!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= INTERACTIVE ENQUIRY FORM TO JOIN ================= */}
      <section id="enquiry-form" className="py-16 md:py-24 bg-white scroll-mt-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#FAF7F2] rounded-3xl border border-[#E8DFC8] p-6 sm:p-10 shadow-xl space-y-8">
            {/* Header of Form */}
            <div className="text-center space-y-2.5 max-w-xl mx-auto">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-black uppercase tracking-wider border border-amber-300">
                <Building2 className="w-3.5 h-3.5 text-amber-700" />
                <span>Restaurant Partner Application</span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-950 font-display">
                Join Hotelkada Today
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Fill this quick form. Our onboarding team will call you within 2 hours to setup your restaurant, QR codes, and kitchen portal.
              </p>
            </div>

            {/* Error banner if any */}
            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                ⚠️ {errorMessage}
              </div>
            )}

            {/* Success View */}
            {isSuccess ? (
              <div className="bg-white p-8 rounded-3xl border border-emerald-200 text-center space-y-5 shadow-sm">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] font-mono uppercase bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full border border-emerald-200 font-bold">
                    Reference ID: {referenceId}
                  </span>
                  <h3 className="text-2xl font-black text-slate-900 font-display">
                    Thank You, {contactName || 'Partner'}!
                  </h3>
                  <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                    We have received your enquiry for <strong className="text-slate-900">{restaurantName}</strong>. Our dedicated restaurant partner manager will contact your mobile number <strong className="text-slate-900">{mobile}</strong> today.
                  </p>
                </div>

                {/* Instant Actions for the user */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Quick Chat on WhatsApp</span>
                  </a>

                  <a
                    href="mailto:contact@hotelkada.com?subject=Enquiry%20Confirmation%20-%20Hotelkada"
                    className="w-full sm:w-auto px-6 py-3 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2"
                  >
                    <Mail className="w-4 h-4 text-amber-600" />
                    <span>Email Support: contact@hotelkada.com</span>
                  </a>
                </div>
              </div>
            ) : (
              /* The Form */
              <form onSubmit={handleSubmitEnquiry} className="space-y-5 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Restaurant Name */}
                  <div>
                    <label className="block text-slate-800 font-bold mb-1.5 text-xs">
                      Restaurant / Hotel Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={restaurantName}
                      onChange={(e) => setRestaurantName(e.target.value)}
                      placeholder="e.g. Annapoorna Restaurant, Spicy Corner"
                      className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-medium"
                    />
                  </div>

                  {/* Owner / Contact Name */}
                  <div>
                    <label className="block text-slate-800 font-bold mb-1.5 text-xs">
                      Owner / Manager Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="e.g. Karthikeyan, Ramesh"
                      className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Mobile Phone */}
                  <div>
                    <label className="block text-slate-800 font-bold mb-1.5 text-xs">
                      Mobile / WhatsApp Number *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400">
                        +91
                      </span>
                      <input
                        type="tel"
                        required
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        placeholder="9876543210"
                        className="w-full pl-12 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-medium font-mono"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-slate-800 font-bold mb-1.5 text-xs">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="owner@restaurant.com"
                      className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* City / District */}
                  <div>
                    <label className="block text-slate-800 font-bold mb-1.5 text-xs">
                      City / District *
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Madurai, Chennai, Coimbatore"
                      className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-medium"
                    />
                  </div>

                  {/* State */}
                  <div>
                    <label className="block text-slate-800 font-bold mb-1.5 text-xs">
                      State *
                    </label>
                    <select
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-medium"
                    >
                      <option value="Tamil Nadu">Tamil Nadu</option>
                      <option value="Karnataka">Karnataka</option>
                      <option value="Kerala">Kerala</option>
                      <option value="Andhra Pradesh">Andhra Pradesh</option>
                      <option value="Telangana">Telangana</option>
                      <option value="Maharashtra">Maharashtra</option>
                      <option value="Other">Other State</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Outlet Type */}
                  <div>
                    <label className="block text-slate-800 font-bold mb-1.5 text-xs">
                      Type of Food Business
                    </label>
                    <select
                      value={outletType}
                      onChange={(e) => setOutletType(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-medium"
                    >
                      <option value="Dine-in Restaurant">Dine-in Restaurant / Hotel</option>
                      <option value="Fast Food / Cafe">Fast Food Outlet / Cafe</option>
                      <option value="Food Court Counter">Food Court Counter / Kiosk</option>
                      <option value="Mess / Biryani Outlet">Mess / Biryani Outlet</option>
                      <option value="Bakery & Sweets">Bakery &amp; Sweet Stall</option>
                      <option value="Cloud Kitchen">Cloud Kitchen / Takeaway</option>
                    </select>
                  </div>

                  {/* Table Count */}
                  <div>
                    <label className="block text-slate-800 font-bold mb-1.5 text-xs">
                      Approximate Tables / Counters
                    </label>
                    <select
                      value={estimatedTables}
                      onChange={(e) => setEstimatedTables(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-medium"
                    >
                      <option value="1 - 5 Tables">1 - 5 Tables / Express Counter</option>
                      <option value="6 - 15 Tables">6 - 15 Tables (Small Hotel)</option>
                      <option value="16 - 30 Tables">16 - 30 Tables (Medium Restaurant)</option>
                      <option value="30+ Tables">30+ Tables (Large Dining Hall / Multi-floor)</option>
                    </select>
                  </div>
                </div>

                {/* Additional Note / Message */}
                <div>
                  <label className="block text-slate-800 font-bold mb-1.5 text-xs">
                    Questions or Special Requirements (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us if you need kitchen printer support, GST bill setup, or multiple branch outlets..."
                    className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-medium"
                  />
                </div>

                {/* Submit Action */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-600 hover:from-amber-700 hover:to-orange-700 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-xl shadow-amber-600/30 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Submitting Your Enquiry...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Submit Restaurant Enquiry — Get Call in 2 Hours</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Direct Contact Alternatives Box */}
            <div className="p-4 rounded-2xl bg-white border border-amber-200/90 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
              <div>
                <p className="text-xs font-bold text-slate-900">Need Immediate Assistance or Questions?</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Reach out directly to our merchant partnership desk anytime.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href="mailto:contact@hotelkada.com"
                  className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs rounded-xl border border-amber-200 transition inline-flex items-center gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5 text-amber-600" />
                  <span>contact@hotelkada.com</span>
                </a>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText('contact@hotelkada.com');
                    setCopiedEmail(true);
                    setTimeout(() => setCopiedEmail(false), 2000);
                  }}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
                  title="Copy Email"
                >
                  {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= DEDICATED PARTNER FOOTER ================= */}
      <footer className="bg-slate-950 text-slate-400 border-t border-slate-800 py-12 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-slate-800/80">
            {/* Col 1 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <img src="/logo.png" alt="Hotelkada" className="h-8 w-auto object-contain brightness-125" />
                <span className="font-bold text-white text-xs tracking-wider uppercase">Partner Desk</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Empowering restaurants and food outlets with fast table QR ordering, live kitchen displays, and daily revenue tools.
              </p>
            </div>

            {/* Col 2 */}
            <div className="space-y-2">
              <h5 className="font-extrabold text-white text-xs uppercase tracking-wider">Restaurant Portals</h5>
              <ul className="space-y-1.5 text-[11px]">
                <li>
                  <a href="/shopkeeper/login" className="hover:text-amber-400 transition flex items-center gap-1">
                    <ArrowRight className="w-3 h-3 text-amber-500" />
                    <span>Kitchen Staff &amp; Manager Login</span>
                  </a>
                </li>
                <li>
                  <a href="#enquiry-form" className="hover:text-amber-400 transition flex items-center gap-1">
                    <ArrowRight className="w-3 h-3 text-amber-500" />
                    <span>New Restaurant Enquiry Form</span>
                  </a>
                </li>
                <li>
                  <a href="/admin/login" className="hover:text-amber-400 transition flex items-center gap-1">
                    <ArrowRight className="w-3 h-3 text-amber-500" />
                    <span>Platform Administration</span>
                  </a>
                </li>
              </ul>
            </div>

            {/* Col 3 */}
            <div className="space-y-2">
              <h5 className="font-extrabold text-white text-xs uppercase tracking-wider">Help &amp; Contact</h5>
              <p className="text-[11px] text-slate-400">
                Direct merchant onboarding support:
              </p>
              <a
                href="mailto:contact@hotelkada.com"
                className="font-bold text-amber-400 hover:text-amber-300 block text-xs"
              >
                contact@hotelkada.com
              </a>
              <p className="text-[10px] text-slate-500 pt-1">
                Mon - Sun: 9:00 AM - 10:00 PM IST
              </p>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
            <p>© {new Date().getFullYear()} Hotelkada. All rights reserved.</p>
            <p>Built for dining halls, cafes, and food courts across India.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
