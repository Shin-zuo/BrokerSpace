import React from 'react';
import { redirect } from 'next/navigation';
import { getSession } from '@/src/lib/auth';
import { prisma } from '@/src/lib/prisma';
import InquiriesList from '@/src/components/ui/InquiriesList';

export default async function InquiriesPage() {
  const session = await getSession();
  if (!session || !session.brokerId) {
    redirect('/login');
  }

  // Fetch inquiries for properties owned by this broker
  const inquiries = await prisma.inquiry.findMany({
    where: {
      property: {
        brokerId: session.brokerId as string,
      }
    },
    include: {
      property: {
        select: {
          title: true,
          images: {
            where: { isPrimary: true },
            take: 1
          }
        }
      }
    },
    orderBy: {
      createdAt: 'desc',
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Inquiries</h2>
        <p className="text-sm font-medium text-slate-500 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100">
          {inquiries.length} Total Inquiries
        </p>
      </div>

      {inquiries.length === 0 ? (
        <div className="glass-card p-12 rounded-3xl text-center space-y-4">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📬</span>
          </div>
          <h3 className="text-xl font-bold text-slate-700">No inquiries yet</h3>
          <p className="text-slate-500 max-w-sm mx-auto">
            When clients submit the inquiry form on your properties, they will appear here.
          </p>
        </div>
      ) : (
        <InquiriesList initialInquiries={inquiries} />
      )}
    </div>
  );
}
