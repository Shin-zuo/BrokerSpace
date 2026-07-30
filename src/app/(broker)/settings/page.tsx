import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from '@/src/lib/auth';
import { prisma } from '@/src/lib/prisma';
import SettingsForm from '@/src/components/ui/SettingsForm';
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
  });
  
  if (!broker) {
    redirect('/login');
  }

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
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Profile Settings</h2>
          <p className="text-slate-500 text-sm">Update your public profile, contact info, and credentials.</p>
        </div>
      </div>
      
      <SettingsForm initialData={broker} />
    </div>
  );
}
