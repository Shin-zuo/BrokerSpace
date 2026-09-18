import React, { Suspense } from 'react';
import { getSession } from '@/src/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/src/lib/prisma';
import { getSystemSettingsAction } from '@/src/app/actions/admin';
import AdminSettingsView from '@/src/components/admin/AdminSettingsView';

export default async function AdminSettingsPage() {
  const session = await getSession();

  if (!session || session.role !== 'SuperAdmin') {
    redirect('/feed');
  }

  const [user, settings] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.userId as string },
      select: { email: true },
    }),
    getSystemSettingsAction(),
  ]);

  return (
    <Suspense fallback={<div className="py-20 text-center text-slate-500 font-medium">Loading Settings...</div>}>
      <AdminSettingsView
        initialSettings={settings}
        adminEmail={user?.email || 'admin@brokerspace.com'}
      />
    </Suspense>
  );
}
