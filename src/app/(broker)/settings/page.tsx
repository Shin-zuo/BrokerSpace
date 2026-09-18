import React, { Suspense } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from '@/src/lib/auth';
import { prisma } from '@/src/lib/prisma';
import SettingsTabs from '@/src/components/settings/SettingsTabs';
import { Settings } from 'lucide-react';
import BackButton from '@/src/components/ui/BackButton';

export default async function SettingsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;
  
  if (!token) {
    redirect('/login');
  }
  
  const payload = await verifyToken(token);
  if (!payload || !payload.brokerId) {
    redirect('/login');
  }
  
  const broker = await prisma.broker.findUnique({
    where: { id: payload.brokerId as string },
    include: {
      payments: {
        orderBy: { createdAt: 'desc' },
        take: 15,
      },
    },
  });
  
  if (!broker) {
    redirect('/login');
  }

  // Convert Prisma Decimal to plain JavaScript numbers for React Client Component serialization
  const serializedBroker = {
    ...broker,
    payments: broker.payments.map((p) => ({
      ...p,
      amount: Number(p.amount),
    })),
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="mb-2">
        <BackButton />
      </div>
      <div className="flex items-center gap-3">
        <div className="p-3 bg-teal-500/10 text-teal-600 rounded-xl w-fit">
          <Settings className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Account & Settings</h2>
          <p className="text-slate-500 text-sm">Manage your profile, public credentials, and subscription billing.</p>
        </div>
      </div>
      
      <Suspense fallback={<div className="text-slate-500 py-10 text-center">Loading settings...</div>}>
        <SettingsTabs broker={serializedBroker as any} />
      </Suspense>
    </div>
  );
}
