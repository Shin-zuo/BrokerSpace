import React, { Suspense } from 'react';
import { getSession } from '@/src/lib/auth';
import { redirect } from 'next/navigation';
import { getAdminDashboardStatsAction, getAdminUsersAction } from '@/src/app/actions/admin';
import AdminUserManagement from '@/src/components/admin/AdminUserManagement';

export default async function AdminUsersPage() {
  const session = await getSession();

  if (!session || session.role !== 'SuperAdmin') {
    redirect('/feed');
  }

  const [stats, usersData] = await Promise.all([
    getAdminDashboardStatsAction(),
    getAdminUsersAction({ page: 1, pageSize: 20 }),
  ]);

  return (
    <Suspense fallback={<div className="py-20 text-center text-slate-500 font-medium">Loading User Management...</div>}>
      <AdminUserManagement initialStats={stats} initialUsersData={usersData} />
    </Suspense>
  );
}
