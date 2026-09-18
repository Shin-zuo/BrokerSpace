import React from 'react';
import { getSession } from '@/src/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/src/lib/prisma';
import { getSystemSettings } from '@/src/lib/systemSettings';
import AdminSidebar from '@/src/components/admin/AdminSidebar';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session || session.role !== 'SuperAdmin') {
    redirect('/feed');
  }

  const [user, settings] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.userId as string },
      select: { email: true, username: true },
    }),
    getSystemSettings(),
  ]);

  return (
    <div className="min-h-screen bg-slate-100/80 text-slate-900 flex flex-col md:flex-row antialiased">
      {/* Sidebar Navigation */}
      <AdminSidebar
        userEmail={user?.email || 'admin@brokerspace.com'}
        isMaintenanceMode={settings.maintenance_mode}
      />

      {/* Main Admin Content Canvas */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-y-auto">
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-8 py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
