'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { User, CreditCard, Sparkles, AlertTriangle } from 'lucide-react';
import SettingsForm from '@/src/components/ui/SettingsForm';
import SubscriptionSettingsCard from '@/src/components/subscription/SubscriptionSettingsCard';
import { Broker } from '@/src/generated/prisma/client';

interface SettingsTabsProps {
  broker: Broker & {
    payments?: any[];
  };
}

export default function SettingsTabs({ broker }: SettingsTabsProps) {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') === 'billing' ? 'billing' : 'profile';
  const [activeTab, setActiveTab] = useState<'profile' | 'billing'>(initialTab);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'billing') {
      setActiveTab('billing');
    }
  }, [searchParams]);

  const expiresAt = broker.subscriptionExpiresAt ? new Date(broker.subscriptionExpiresAt) : null;
  const isExpired = expiresAt ? expiresAt < new Date() : broker.subscriptionStatus === 'pending_payment';

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 py-3 px-5 border-b-2 font-bold text-sm transition-all cursor-pointer ${
            activeTab === 'profile'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          <User className="w-4 h-4" />
          Profile Information
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('billing')}
          className={`flex items-center gap-2 py-3 px-5 border-b-2 font-bold text-sm transition-all cursor-pointer relative ${
            activeTab === 'billing'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          Subscription & Billing
          {isExpired ? (
            <span className="w-2 h-2 rounded-full bg-red-500" />
          ) : (
            <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.2 bg-teal-100 text-teal-800 rounded-full">
              {broker.subscriptionPlan}
            </span>
          )}
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'profile' ? (
        <SettingsForm initialData={broker} />
      ) : (
        <SubscriptionSettingsCard broker={broker} />
      )}
    </div>
  );
}
