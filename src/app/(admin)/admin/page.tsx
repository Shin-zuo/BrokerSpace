import React, { Suspense } from 'react';
import { getSession } from '@/src/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/src/lib/prisma';
import { getAdminDashboardStatsAction, getSystemSettingsAction } from '@/src/app/actions/admin';
import AdminDashboardOverview from '@/src/components/admin/AdminDashboardOverview';

export default async function AdminDashboardPage() {
  const session = await getSession();

  if (!session || session.role !== 'SuperAdmin') {
    redirect('/feed');
  }

  const [stats, settings, recentUsers] = await Promise.all([
    getAdminDashboardStatsAction(),
    getSystemSettingsAction(),
    prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        broker: {
          select: {
            name: true,
            subscriptionStatus: true,
            isVerified: true,
          },
        },
      },
    }),
  ]);

  return (
    <Suspense fallback={<div className="py-20 text-center text-slate-500 font-medium">Loading SuperAdmin Dashboard...</div>}>
      <AdminDashboardOverview
        stats={stats}
        settings={settings}
        recentUsers={recentUsers}
      />
    </Suspense>
  );
}
