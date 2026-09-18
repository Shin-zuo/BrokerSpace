'use client';

import React, { useState, useTransition, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { signupAction } from '@/src/app/actions/auth';
import { Building2, User, Phone, Briefcase, FileBadge, Link as LinkIcon, Mail, Lock, CheckCircle2, Sparkles, Zap, ShieldCheck } from 'lucide-react';
import BackButton from '@/src/components/ui/BackButton';

function SignupForm() {
  const searchParams = useSearchParams();
  const planParam = searchParams.get('plan');
  const initialPlan = planParam === 'yearly' ? 'yearly' : 'monthly';

  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>(initialPlan);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [whatsapp, setWhatsapp] = useState('');
  const [contact, setContact] = useState('');
  const [sameAsWhatsapp, setSameAsWhatsapp] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    formData.set('subscriptionPlan', selectedPlan);
    
    startTransition(async () => {
      const result = await signupAction(formData);
      if (result?.error) {
        setError(result.error);
      } else if (result?.redirectUrl) {
        window.location.href = result.redirectUrl;
      }
    });
  };

  return (
    <div className="w-full max-w-2xl px-6 py-12 relative z-10">
      <div className="mb-6">
        <BackButton />
      </div>
      <div className="glass-panel p-8 sm:p-12 shadow-xl shadow-slate-200/50 relative overflow-hidden bg-white/80 backdrop-blur-xl border border-white/60 rounded-3xl">
        
        <div className="text-center mb-8">
          <img src="/brokerSpace.png" alt="BrokerSpace Logo" className="h-24 w-auto object-contain mx-auto mb-4" />
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Create Broker Account</h1>
          <p className="text-slate-500 text-sm sm:text-base">Join BrokerSpace to manage and showcase your properties to verified brokers.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="p-4 rounded-2xl bg-red-50 text-red-600 text-sm font-medium border border-red-100 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
              {error}
            </div>
          )}

          {/* Step 1: Subscription Plan Selection */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-teal-700 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs">1</span>
                Select Subscription Plan
              </h2>
              <span className="text-xs text-slate-500">Billed in PHP (₱)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Monthly Option */}
              <div
                onClick={() => setSelectedPlan('monthly')}
                className={`cursor-pointer rounded-2xl p-5 border-2 transition-all relative flex flex-col justify-between ${
                  selectedPlan === 'monthly'
                    ? 'border-teal-600 bg-teal-50/50 shadow-md ring-2 ring-teal-500/20'
                    : 'border-slate-200 bg-white/60 hover:border-slate-300 hover:bg-slate-50/50'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Flexible</span>
                    <h3 className="font-bold text-slate-900 text-lg">Monthly Access</h3>
                  </div>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    selectedPlan === 'monthly' ? 'border-teal-600 bg-teal-600 text-white' : 'border-slate-300 bg-white'
                  }`}>
                    {selectedPlan === 'monthly' && <CheckCircle2 className="w-4 h-4 fill-current" />}
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-200/60">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-extrabold text-slate-900">₱499</span>
                    <span className="text-xs text-slate-500 font-medium">/ month</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Full network access, cancel anytime.</p>
                </div>
              </div>

              {/* Yearly Option */}
              <div
                onClick={() => setSelectedPlan('yearly')}
                className={`cursor-pointer rounded-2xl p-5 border-2 transition-all relative flex flex-col justify-between ${
                  selectedPlan === 'yearly'
                    ? 'border-teal-600 bg-teal-50/50 shadow-md ring-2 ring-teal-500/20'
                    : 'border-slate-200 bg-white/60 hover:border-slate-300 hover:bg-slate-50/50'
                }`}
              >
                {/* Save Badge */}
                <div className="absolute -top-3 right-4 bg-gradient-to-r from-teal-600 to-cyan-600 text-white text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Save ₱989
                </div>

                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-teal-700">Best Value</span>
                    <h3 className="font-bold text-slate-900 text-lg">Annual Access</h3>
                  </div>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    selectedPlan === 'yearly' ? 'border-teal-600 bg-teal-600 text-white' : 'border-slate-300 bg-white'
                  }`}>
                    {selectedPlan === 'yearly' && <CheckCircle2 className="w-4 h-4 fill-current" />}
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-200/60">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-extrabold text-slate-900">₱4,999</span>
                    <span className="text-xs text-slate-500 font-medium">/ year</span>
                  </div>
                  <p className="text-xs text-teal-700 font-semibold mt-1">~₱416 / mo • 2 months free equivalent</p>
                </div>
              </div>
            </div>

            {/* Hidden field for formData */}
            <input type="hidden" name="subscriptionPlan" value={selectedPlan} />
          </div>

          {/* Step 2: Broker Profile Details */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs font-bold">2</span>
              <h2 className="text-sm font-bold uppercase tracking-wider text-teal-700">Broker Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 block">Full Name *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    required
                    className="w-full pl-11 pr-4 py-3 bg-white/70 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              {/* WhatsApp Number */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 block">WhatsApp Number *</label>
                <div className="relative flex items-center">
                  <span className="absolute left-4 text-slate-500 font-medium z-10">+63</span>
                  <div className="absolute inset-y-0 left-0 pl-11 flex items-center pointer-events-none">
                    <Phone className="h-4 w-4 text-slate-400 opacity-50" />
                  </div>
                  <input
                    type="text"
                    name="whatsappNumber"
                    required
                    value={whatsapp.replace(/^\+63\s*/, '')}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                      const formatted = val ? `+63${val}` : '';
                      setWhatsapp(formatted);
                      if (sameAsWhatsapp) setContact(formatted);
                    }}
                    className="w-full pl-16 pr-4 py-3 bg-white/70 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                    placeholder="9000000000"
                  />
                </div>
              </div>

              {/* Contact Number */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-700 block">Contact Number</label>
                  <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={sameAsWhatsapp}
                      onChange={(e) => {
                        setSameAsWhatsapp(e.target.checked);
                        if (e.target.checked) setContact(whatsapp);
                      }}
                      className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                    />
                    Same as WhatsApp
                  </label>
                </div>
                <div className="relative flex items-center">
                  <span className="absolute left-4 text-slate-500 font-medium z-10">+63</span>
                  <div className="absolute inset-y-0 left-0 pl-11 flex items-center pointer-events-none">
                    <Phone className="h-4 w-4 text-slate-400 opacity-50" />
                  </div>
                  <input
                    type="text"
                    name="contactNumber"
                    disabled={sameAsWhatsapp}
                    value={contact.replace(/^\+63\s*/, '')}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setContact(val ? `+63${val}` : '');
                    }}
                    className="w-full pl-16 pr-4 py-3 bg-white/70 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all disabled:opacity-50 disabled:bg-slate-100"
                    placeholder="9000000000"
                  />
                </div>
              </div>

              {/* Company Name */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 block">Company Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Briefcase className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    name="companyName"
                    className="w-full pl-11 pr-4 py-3 bg-white/70 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                    placeholder="Real Estate Brokerage"
                  />
                </div>
              </div>

              {/* License Number */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-sm font-medium text-slate-700 block">PRC License / Registration Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <FileBadge className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    name="licenseNumber"
                    className="w-full pl-11 pr-4 py-3 bg-white/70 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                    placeholder="e.g. PRC REB Lic. No. 0012345"
                  />
                </div>
              </div>

              {/* Facebook URL */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 block">Facebook Profile / Page</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <LinkIcon className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="url"
                    name="facebookUrl"
                    className="w-full pl-11 pr-4 py-3 bg-white/70 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                    placeholder="https://facebook.com/yourprofile"
                  />
                </div>
              </div>

              {/* LinkedIn URL */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 block">LinkedIn Profile</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <LinkIcon className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="url"
                    name="linkedinUrl"
                    className="w-full pl-11 pr-4 py-3 bg-white/70 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Step 3: Account Credentials */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs font-bold">3</span>
              <h2 className="text-sm font-bold uppercase tracking-wider text-teal-700">Account Credentials</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-sm font-medium text-slate-700 block">Username *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    name="username"
                    required
                    className="w-full pl-11 pr-4 py-3 bg-white/70 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                    placeholder="broker_john"
                  />
                </div>
              </div>

              <div className="space-y-1.5 md:col-span-1">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-700 block">Email Address *</label>
                  <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200/60">
                    Required for Invoice
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    required
                    className="w-full pl-11 pr-4 py-3 bg-white/70 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                    placeholder="john@brokerage.com"
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  Your official tax invoice, payment receipt, and welcome package will be sent here.
                </p>
              </div>

              <div className="space-y-1.5 md:col-span-1">
                <label className="text-sm font-medium text-slate-700 block">Password *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    name="password"
                    required
                    className="w-full pl-11 pr-4 py-3 bg-white/70 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submission Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="w-full flex items-center justify-center py-4 px-6 rounded-2xl text-white font-bold bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-all shadow-lg shadow-teal-500/25 disabled:opacity-70 disabled:cursor-not-allowed text-base sm:text-lg"
            >
              {isPending
                ? "Setting up your checkout & invoice..."
                : `Proceed to Payment (${selectedPlan === 'yearly' ? '₱4,999 / year' : '₱499 / month'})`}
            </button>
            <div className="flex items-center justify-center gap-2 mt-3 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
              <span>Secure checkout via Xendit • GCash, Maya, Cards, Bank Transfer</span>
            </div>
            <p className="text-center text-[11px] text-slate-400 mt-2">
              By registering, you agree to BrokerSpace&apos;s verified broker guidelines. You can cancel or switch plans anytime.
            </p>
          </div>
        </form>

        <p className="mt-8 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-teal-600 hover:text-teal-500 transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-teal-100/50 blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-100/50 blur-3xl" />
      </div>

      <Suspense fallback={
        <div className="w-full max-w-2xl px-6 py-12 text-center text-slate-500">
          Loading sign up...
        </div>
      }>
        <SignupForm />
      </Suspense>
    </div>
  );
}
