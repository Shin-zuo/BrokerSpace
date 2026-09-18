'use client';

import React, { useState, useTransition } from 'react';
import { CreditCard, CheckCircle2, AlertTriangle, Clock, Sparkles, ShieldCheck, ArrowRight, Loader2, Calendar, Receipt, Eye } from 'lucide-react';
import { createRenewalInvoiceAction } from '@/src/app/actions/subscription';
import InvoiceModal from './InvoiceModal';

interface Payment {
  id: string;
  xenditInvoiceId: string;
  externalId: string;
  amount: any;
  currency: string;
  plan: string;
  status: string;
  paymentMethod: string | null;
  payerEmail: string | null;
  paidAt: Date | string | null;
  createdAt: Date | string;
}

interface BrokerSubscriptionProps {
  broker: {
    id: string;
    name: string;
    whatsappNumber: string;
    companyName?: string | null;
    licenseNumber?: string | null;
    publicEmail?: string | null;
    subscriptionPlan: string;
    subscriptionStatus: string;
    subscriptionExpiresAt: Date | string | null;
    payments?: Payment[];
  };
}

export default function SubscriptionSettingsCard({ broker }: BrokerSubscriptionProps) {
  const [isPending, startTransition] = useTransition();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>(
    broker.subscriptionPlan === 'yearly' ? 'yearly' : 'monthly'
  );
  const [error, setError] = useState<string | null>(null);

  // Invoice modal state
  const [selectedInvoice, setSelectedInvoice] = useState<Payment | null>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

  const expiresAt = broker.subscriptionExpiresAt ? new Date(broker.subscriptionExpiresAt) : null;
  const now = new Date();
  const isExpired = expiresAt ? expiresAt < now : broker.subscriptionStatus === 'pending_payment';
  
  const daysRemaining = expiresAt
    ? Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const isExpiringSoon = !isExpired && daysRemaining <= 5 && daysRemaining >= 0;

  const handleRenew = (plan: 'monthly' | 'yearly') => {
    setError(null);
    startTransition(async () => {
      const res = await createRenewalInvoiceAction(plan);
      if (res.error) {
        setError(res.error);
      } else if (res.redirectUrl) {
        window.location.href = res.redirectUrl;
      }
    });
  };

  const handleRowClick = (payment: Payment) => {
    setSelectedInvoice(payment);
    setIsInvoiceModalOpen(true);
  };

  return (
    <div className="space-y-8">
      {/* Current Subscription Status Card */}
      <div className="glass-card p-6 md:p-8 rounded-3xl relative overflow-hidden bg-white/80 backdrop-blur-xl border border-white/60 shadow-lg">
        <div className="absolute -right-16 -top-16 w-56 h-56 bg-teal-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-xl font-bold text-slate-900">
                {broker.subscriptionPlan === 'lifetime'
                  ? 'SuperAdmin Permanent Membership'
                  : broker.subscriptionPlan === 'yearly'
                  ? 'Annual Broker Membership'
                  : 'Monthly Broker Membership'}
              </h3>
              {isExpired ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-500" /> Expired
                </span>
              ) : isExpiringSoon ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                  <Clock className="w-3.5 h-3.5 text-amber-500" /> Expires in {daysRemaining} days
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Active
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500">
              {expiresAt ? (
                <>
                  {isExpired ? 'Access expired on ' : 'Valid until '}
                  <span className="font-semibold text-slate-700">
                    {expiresAt.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </span>
                  {!isExpired && ` (${daysRemaining} days remaining)`}
                </>
              ) : (
                'Permanent lifetime access active (No Expiration Date)'
              )}
            </p>
          </div>

          <div className="text-left md:text-right">
            <div className="text-2xl font-extrabold text-slate-900">
              {broker.subscriptionPlan === 'lifetime'
                ? 'Lifetime'
                : broker.subscriptionPlan === 'yearly'
                ? '₱4,999'
                : '₱499'}
              {broker.subscriptionPlan !== 'lifetime' && (
                <span className="text-xs font-medium text-slate-500">
                  /{broker.subscriptionPlan === 'yearly' ? 'year' : 'month'}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {broker.subscriptionPlan === 'lifetime' ? 'Complimentary Administrative Access' : 'Billed in Philippine Peso (PHP)'}
            </p>
          </div>
        </div>

        {/* Renewal Plan Selection (Only for regular brokers) */}
        {broker.subscriptionPlan !== 'lifetime' && (
        <div className="mt-8">
          <h4 className="text-sm font-bold uppercase tracking-wider text-teal-700 mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> Renew or Switch Plan
          </h4>

          {error && (
            <div className="mb-4 p-4 rounded-2xl bg-red-50 text-red-600 text-sm font-medium border border-red-100 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <h5 className="font-bold text-slate-900 text-lg">Monthly Access</h5>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    selectedPlan === 'monthly' ? 'border-teal-600 bg-teal-600 text-white' : 'border-slate-300 bg-white'
                  }`}
                >
                  {selectedPlan === 'monthly' && <CheckCircle2 className="w-4 h-4 fill-current" />}
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-200/60">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-extrabold text-slate-900">₱499</span>
                  <span className="text-xs text-slate-500 font-medium">/ month</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">Renews for +30 days, cancel anytime.</p>
              </div>
            </div>

            {/* Annual Option */}
            <div
              onClick={() => setSelectedPlan('yearly')}
              className={`cursor-pointer rounded-2xl p-5 border-2 transition-all relative flex flex-col justify-between ${
                selectedPlan === 'yearly'
                  ? 'border-teal-600 bg-teal-50/50 shadow-md ring-2 ring-teal-500/20'
                  : 'border-slate-200 bg-white/60 hover:border-slate-300 hover:bg-slate-50/50'
              }`}
            >
              <div className="absolute -top-3 right-4 bg-gradient-to-r from-teal-600 to-cyan-600 text-white text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Save ₱989
              </div>

              <div className="flex items-start justify-between mb-2">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-teal-700">Best Value</span>
                  <h5 className="font-bold text-slate-900 text-lg">Annual Access</h5>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    selectedPlan === 'yearly' ? 'border-teal-600 bg-teal-600 text-white' : 'border-slate-300 bg-white'
                  }`}
                >
                  {selectedPlan === 'yearly' && <CheckCircle2 className="w-4 h-4 fill-current" />}
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-200/60">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-extrabold text-slate-900">₱4,999</span>
                  <span className="text-xs text-slate-500 font-medium">/ year</span>
                </div>
                <p className="text-xs text-teal-700 font-semibold mt-1">~₱416 / mo • Renews for +365 days</p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              type="button"
              disabled={isPending}
              onClick={() => handleRenew(selectedPlan)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 py-3.5 px-8 rounded-xl text-white font-bold bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-md shadow-teal-500/20 disabled:opacity-70 transition-all text-sm sm:text-base cursor-pointer"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Setting up renewal...
                </>
              ) : (
                <>
                  Proceed to Checkout ({selectedPlan === 'yearly' ? '₱4,999' : '₱499'})
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="flex items-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
              <span>Secure checkout via Xendit • GCash, Maya, Cards, Bank Transfer</span>
            </div>
          </div>
        </div>
        )}
      </div>

      {/* Transaction & Billing History Table */}
      <div className="glass-card p-6 md:p-8 rounded-3xl bg-white/80 backdrop-blur-xl border border-white/60 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-teal-600" />
            <h3 className="text-lg font-bold text-slate-900">Payment & Invoice History</h3>
          </div>
          <span className="text-xs text-slate-400 font-medium">Click any row to open and print your official receipt</span>
        </div>

        {(!broker.payments || broker.payments.length === 0) ? (
          <div className="text-center py-10 bg-slate-50/50 rounded-2xl border border-slate-100">
            <Receipt className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-600">No payment transactions yet</p>
            <p className="text-xs text-slate-400 mt-1">Invoices and receipts will appear here after your first payment.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <th className="pb-3 pl-3">Date</th>
                  <th className="pb-3">Description</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Method</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 pr-3 text-right">Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {broker.payments.map((p) => {
                  const txDate = new Date(p.paidAt || p.createdAt);
                  return (
                    <tr
                      key={p.id}
                      onClick={() => handleRowClick(p)}
                      className="hover:bg-teal-50/60 transition-colors cursor-pointer group"
                      title="Click to view full invoice & receipt"
                    >
                      <td className="py-4 pl-3 font-medium text-slate-800">
                        {txDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="py-4 text-slate-700 font-medium">
                        {p.plan === 'yearly' ? 'Annual Broker Membership' : 'Monthly Broker Membership'}
                      </td>
                      <td className="py-4 font-bold text-slate-900">
                        ₱{Number(p.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-4 text-slate-500 text-xs">
                        {p.paymentMethod || 'Online Checkout'}
                      </td>
                      <td className="py-4">
                        {p.status === 'PAID' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" /> Paid
                          </span>
                        ) : p.status === 'EXPIRED' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-500">
                            Expired
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="py-4 pr-3 text-right">
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-teal-600 group-hover:text-teal-700 group-hover:underline">
                          <Eye className="w-3.5 h-3.5" /> View Receipt
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Interactive Invoice Modal */}
      <InvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        invoice={selectedInvoice as any}
        broker={broker}
      />
    </div>
  );
}
