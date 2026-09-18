import React, { Suspense } from 'react';
import { getSession } from '@/src/lib/auth';
import { redirect } from 'next/navigation';
import { getSystemSettingsAction } from '@/src/app/actions/admin';
import AdminSystemManagement from '@/src/components/admin/AdminSystemManagement';

export default async function AdminSystemPage() {
  const session = await getSession();

  if (!session || session.role !== 'SuperAdmin') {
    redirect('/feed');
  }

  const settings = await getSystemSettingsAction();

  return (
    <Suspense fallback={<div className="py-20 text-center text-slate-500 font-medium">Loading System Management...</div>}>
      <AdminSystemManagement initialSettings={settings} />
    </Suspense>
  );
}
