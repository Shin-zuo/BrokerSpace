'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AlertCircle, Clock, ArrowRight, X, Sparkles } from 'lucide-react';

interface SubscriptionBannerProps {
  broker?: {
    subscriptionPlan?: string;
    subscriptionStatus?: string;
    subscriptionExpiresAt?: Date | string | null;
  } | null;
}

export default function SubscriptionBanner({ broker }: SubscriptionBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  if (!broker || isDismissed) return null;

  const expiresAt = broker.subscriptionExpiresAt ? new Date(broker.subscriptionExpiresAt) : null;
  const now = new Date();
  
  const isExpired = expiresAt
    ? expiresAt < now
    : broker.subscriptionStatus === 'pending_payment';

  const daysRemaining = expiresAt
    ? Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    : 999;

  const isExpiringSoon = !isExpired && daysRemaining <= 5 && daysRemaining >= 0;

  // Don't render banner if subscription is active and healthy (>5 days)
  if (!isExpired && !isExpiringSoon) {
    return null;
  }

  return (
    <div
      className={`w-full py-3 px-4 sm:px-6 relative z-40 transition-all ${
        isExpired
          ? 'bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white shadow-md'
          : 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white shadow-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
        <div className="flex items-center gap-2.5 text-center sm:text-left">
          {isExpired ? (
            <AlertCircle className="w-5 h-5 shrink-0 text-white animate-pulse" />
          ) : (
            <Clock className="w-5 h-5 shrink-0 text-white" />
          )}
          <span className="font-medium">
            {isExpired ? (
              <>
                <strong>Subscription Expired:</strong> Your broker access ended{' '}
                {expiresAt
                  ? `on ${expiresAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                  : 'recently'}
                . Renew now to keep your listings active.
              </>
            ) : (
              <>
                <strong>Notice:</strong> Your {broker.subscriptionPlan === 'yearly' ? 'annual' : 'monthly'} access expires in{' '}
                <strong className="underline">{daysRemaining} {daysRemaining === 1 ? 'day' : 'days'}</strong>. Renew early to avoid interruption.
              </>
            )}
          </span>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/settings?tab=billing"
            className="flex items-center gap-1.5 px-4 py-1.5 bg-white text-slate-900 hover:bg-slate-100 font-bold rounded-full text-xs shadow-sm transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            {isExpired ? 'Renew Subscription' : 'Renew Early'}
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          {!isExpired && (
            <button
              onClick={() => setIsDismissed(true)}
              className="text-white/80 hover:text-white p-1 transition-colors"
              title="Dismiss notice"
              aria-label="Dismiss notice"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
