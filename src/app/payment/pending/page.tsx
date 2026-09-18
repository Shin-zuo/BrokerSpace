import React, { Suspense } from 'react';
import Link from 'next/link';
import { Clock, RefreshCw, ArrowRight, ShieldAlert, Mail } from 'lucide-react';

function PaymentPendingContent() {
  return (
    <div className="w-full max-w-xl px-6 py-12 relative z-10">
      <div className="glass-panel p-8 sm:p-12 shadow-2xl shadow-slate-200/50 relative overflow-hidden bg-white/90 backdrop-blur-xl border border-white/60 rounded-3xl text-center">
        {/* Pending Icon */}
        <div className="w-20 h-20 bg-gradient-to-tr from-amber-400 to-orange-400 text-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-amber-500/25">
          <Clock className="w-11 h-11 stroke-[2.5]" />
        </div>

        {/* Header */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/60 text-amber-800 text-xs font-semibold uppercase tracking-wider mb-3">
          Payment Processing or Incomplete
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
          Awaiting Payment Confirmation
        </h1>
        <p className="text-slate-600 text-sm sm:text-base mb-8 max-w-md mx-auto">
          If you recently completed payment via GCash, Maya, or bank transfer, your transaction may take a few minutes to settle. Your account will automatically activate once confirmed.
        </p>

        {/* Info card */}
        <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-5 mb-8 text-left flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 mb-1">Check Your Email</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              We also emailed you a direct link to complete your payment invoice if your browser session was closed early.
            </p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="space-y-3">
          <Link
            href="/feed"
            className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl text-white font-bold bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-all shadow-lg shadow-teal-500/25 text-base"
          >
            Check Account Status
            <RefreshCw className="w-4 h-4" />
          </Link>
          <Link
            href="/login"
            className="w-full flex items-center justify-center py-3 px-6 rounded-2xl text-slate-600 font-semibold bg-slate-100 hover:bg-slate-200 transition-all text-sm"
          >
            Return to Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PaymentPendingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] rounded-full bg-amber-100/50 blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] rounded-full bg-slate-200/50 blur-3xl" />
      </div>

      <Suspense fallback={<div className="text-slate-500">Loading...</div>}>
        <PaymentPendingContent />
      </Suspense>
    </div>
  );
}
