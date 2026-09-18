'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CreditCard, CheckCircle2, ShieldCheck, Sparkles, Loader2, ArrowRight } from 'lucide-react';
import { simulatePaymentAction } from '@/src/app/actions/payment';

function MockCheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const externalId = searchParams.get('external_id') || '';
  const amount = searchParams.get('amount') || '499';
  const plan = searchParams.get('plan') || 'monthly';
  const email = searchParams.get('email') || '';

  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'gcash' | 'maya' | 'card'>('gcash');
  const [error, setError] = useState<string | null>(null);

  const handleSimulatePayment = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      const res = await simulatePaymentAction(externalId, email);

      if (!res.success) {
        throw new Error(res.error || 'Failed to simulate payment.');
      }

      // Successfully processed, redirect to confirmation screen
      router.push(`/payment/success?external_id=${encodeURIComponent(externalId)}`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error simulating payment.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-lg px-6 py-12 relative z-10">
      <div className="glass-panel p-8 sm:p-10 shadow-2xl shadow-slate-200/50 relative overflow-hidden bg-white/95 backdrop-blur-xl border border-white/60 rounded-3xl">
        {/* Sandbox Notice Banner */}
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-2.5 rounded-2xl text-xs font-semibold flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>Xendit Developer Sandbox Simulation</span>
          </div>
          <span className="text-[10px] bg-amber-200/70 px-2 py-0.5 rounded-full uppercase">Test Mode</span>
        </div>

        {/* Brand Header */}
        <div className="text-center mb-6">
          <img src="/brokerSpace.png" alt="BrokerSpace Logo" className="h-16 w-auto object-contain mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-slate-900">BrokerSpace Checkout</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">Simulated Xendit Payment Gateway</p>
        </div>

        {/* Invoice Summary */}
        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 mb-6">
          <div className="flex justify-between items-center text-xs text-slate-500 mb-2">
            <span>Invoice Description</span>
            <span className="font-mono text-[11px] truncate max-w-[160px]">{externalId}</span>
          </div>
          <div className="flex justify-between items-baseline mb-4">
            <span className="text-sm font-semibold text-slate-800">
              {plan === 'yearly' ? 'Annual Broker Membership' : 'Monthly Broker Membership'}
            </span>
            <span className="text-2xl font-extrabold text-teal-700">
              ₱{Number(amount).toLocaleString()}
            </span>
          </div>
          <div className="text-xs text-slate-500 pt-3 border-t border-slate-200 flex justify-between">
            <span>Invoice Recipient:</span>
            <span className="font-semibold text-slate-700">{email}</span>
          </div>
        </div>

        {/* Payment Method Selector */}
        <div className="mb-6">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-3">
            Choose Payment Method
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { id: 'gcash', label: 'GCash', tag: 'E-Wallet' },
              { id: 'maya', label: 'Maya', tag: 'E-Wallet' },
              { id: 'card', label: 'Card', tag: 'Visa / MC' },
            ].map((m) => (
              <button
                type="button"
                key={m.id}
                onClick={() => setSelectedMethod(m.id as any)}
                className={`p-3 rounded-xl border text-center transition-all ${
                  selectedMethod === m.id
                    ? 'border-teal-600 bg-teal-50/60 ring-2 ring-teal-500/20 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="font-bold text-sm text-slate-900">{m.label}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{m.tag}</div>
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-red-50 text-red-600 text-xs font-medium border border-red-100">
            {error}
          </div>
        )}

        {/* Action Button */}
        <button
          type="button"
          onClick={handleSimulatePayment}
          disabled={isProcessing}
          className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl text-white font-bold bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-all shadow-lg shadow-teal-500/25 disabled:opacity-70 text-base"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Processing Mock Payment...
            </>
          ) : (
            <>
              Simulate Successful Payment (₱{Number(amount).toLocaleString()})
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        <p className="text-[11px] text-center text-slate-400 mt-4 leading-relaxed">
          In production, users are redirected to official Xendit checkout pages to pay via QR or SMS authorization.
        </p>
      </div>
    </div>
  );
}

export default function MockCheckoutPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-teal-100/50 blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-100/50 blur-3xl" />
      </div>

      <Suspense fallback={<div className="text-slate-500">Loading Checkout...</div>}>
        <MockCheckoutContent />
      </Suspense>
    </div>
  );
}
