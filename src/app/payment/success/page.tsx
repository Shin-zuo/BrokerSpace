import React from 'react';
import Link from 'next/link';
import { CheckCircle2, ArrowRight, Mail, ShieldCheck, Sparkles } from 'lucide-react';
import { prisma } from '@/src/lib/prisma';
import { getXenditInvoice } from '@/src/lib/xendit';
import { sendWelcomeSubscriptionEmail } from '@/src/lib/mail';

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function PaymentSuccessPage({ searchParams }: Props) {
  const resolvedParams = await searchParams;
  const externalId = typeof resolvedParams.external_id === 'string' ? resolvedParams.external_id : undefined;

  let isVerified = false;

  // Dual verification: If returned from Xendit, verify status even if webhook has not arrived yet (e.g. on localhost)
  if (externalId) {
    try {
      const transaction = await prisma.paymentTransaction.findFirst({
        where: { externalId },
        include: {
          broker: {
            include: { user: true },
          },
        },
      });

      if (transaction) {
        if (transaction.status === 'PAID') {
          isVerified = true;
        } else {
          // Check live invoice with Xendit API
          const xenditInvoice = await getXenditInvoice(externalId);

          if (xenditInvoice && (xenditInvoice.status === 'PAID' || xenditInvoice.status === 'SETTLED')) {
            const paidDate = new Date();
            const expiresAt = new Date(paidDate);
            if (transaction.plan === 'yearly') {
              expiresAt.setDate(expiresAt.getDate() + 365);
            } else {
              expiresAt.setDate(expiresAt.getDate() + 30);
            }

            await prisma.paymentTransaction.update({
              where: { id: transaction.id },
              data: {
                status: 'PAID',
                paymentMethod: 'XENDIT_AUTO_VERIFIED',
                paidAt: paidDate,
                payerEmail: xenditInvoice.payer_email || transaction.payerEmail,
              },
            });

            await prisma.broker.update({
              where: { id: transaction.brokerId },
              data: {
                subscriptionStatus: 'active',
                subscriptionPlan: transaction.plan,
                subscriptionExpiresAt: expiresAt,
              },
            });

            const recipientEmail =
              xenditInvoice.payer_email ||
              transaction.payerEmail ||
              transaction.broker.user?.email ||
              transaction.broker.publicEmail;

            if (recipientEmail) {
              await sendWelcomeSubscriptionEmail({
                to: recipientEmail,
                name: transaction.broker.name,
                plan: transaction.plan as 'monthly' | 'yearly',
                amount: Number(transaction.amount),
                expiresAt,
                invoiceId: xenditInvoice.id,
              });
            }

            isVerified = true;
            console.log(`[Xendit Return Auto-Verification] Broker ${transaction.brokerId} activated via Return URL check.`);
          }
        }
      }
    } catch (err) {
      console.error('[Payment Success Verification Error]:', err);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] rounded-full bg-teal-100/50 blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] rounded-full bg-emerald-100/50 blur-3xl" />
      </div>

      <div className="w-full max-w-xl px-6 py-12 relative z-10">
        <div className="glass-panel p-8 sm:p-12 shadow-2xl shadow-teal-900/10 relative overflow-hidden bg-white/90 backdrop-blur-xl border border-white/60 rounded-3xl text-center">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-gradient-to-tr from-teal-500 to-emerald-400 text-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-teal-500/25 animate-in zoom-in-75 duration-300">
            <CheckCircle2 className="w-11 h-11 stroke-[2.5]" />
          </div>

          {/* Header */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/60 text-teal-700 text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Subscription Activated
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
            Welcome to BrokerSpace!
          </h1>
          <p className="text-slate-600 text-sm sm:text-base mb-8 max-w-md mx-auto">
            Your payment was processed successfully. You now have full access to our verified broker network, listings, and real-time messaging.
          </p>

          {/* Invoice & Email Notice Card */}
          <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-5 mb-8 text-left flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center shrink-0 mt-0.5">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">Official Invoice & Receipt Sent</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                We&apos;ve sent your official Xendit payment receipt, VAT invoice, and welcome package to your registered email address.
              </p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-3">
            <Link
              href="/feed"
              className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl text-white font-bold bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-all shadow-lg shadow-teal-500/25 text-base sm:text-lg"
            >
              Enter BrokerSpace Feed
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/properties"
              className="w-full flex items-center justify-center py-3 px-6 rounded-2xl text-slate-600 font-semibold bg-slate-100 hover:bg-slate-200 transition-all text-sm"
            >
              Browse Properties
            </Link>
          </div>

          {/* Security badge */}
          <div className="flex items-center justify-center gap-2 mt-8 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <span>Encrypted payment processed through Xendit</span>
          </div>
        </div>
      </div>
    </div>
  );
}
