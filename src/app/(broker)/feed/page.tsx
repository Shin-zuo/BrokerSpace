import React from 'react';
import { prisma } from '@/src/lib/prisma';
import PropertyCard from '@/src/components/ui/PropertyCard';
import Link from 'next/link';
import { Plus, Building2, Users, TrendingUp, User as UserIcon, Network } from 'lucide-react';
import { getSession } from '@/src/lib/auth';
import { getVisibilityFilter } from '@/src/lib/propertyFilters';
import FeedSidebar from './FeedSidebar';

export const dynamic = 'force-dynamic';

export default async function FeedPage() {
  const session = await getSession();
  let currentUser = null;
  if (session) {
    currentUser = await prisma.user.findUnique({
      where: { id: session.userId as string },
      include: { broker: true }
    });
  }

  const visibilityFilter = await getVisibilityFilter(
    currentUser?.id,
    currentUser?.broker?.id
  );

  const rawProperties = await prisma.property.findMany({
    where: { 
      status: 'Available',
      AND: [visibilityFilter]
    },
    orderBy: { createdAt: 'desc' },
    include: { 
      images: true, 
      broker: { include: { user: true } },
      likes: currentUser ? { where: { userId: currentUser.id } } : false,
      saves: currentUser ? { where: { userId: currentUser.id } } : false,
    },
  });

  const properties = rawProperties.map((property: any) => ({
    ...property,
    price: Number(property.price),
    sizeSqm: property.sizeSqm ? Number(property.sizeSqm) : null,
    latitude: property.latitude ? Number(property.latitude) : null,
    longitude: property.longitude ? Number(property.longitude) : null,
    isLiked: property.likes && property.likes.length > 0,
    isSaved: property.saves && property.saves.length > 0,
  }));

  // Market Insights calculation
  const regionCounts: Record<string, number> = {};
  let totalPrice = 0;
  rawProperties.forEach(p => {
    if (p.region) {
      regionCounts[p.region] = (regionCounts[p.region] || 0) + 1;
    }
    totalPrice += Number(p.price);
  });
  
  let topRegion = 'N/A';
  let maxCount = 0;
  for (const [region, count] of Object.entries(regionCounts)) {
    if (count > maxCount) {
      maxCount = count;
      topRegion = region;
    }
  }

  const avgPrice = rawProperties.length > 0 ? totalPrice / rawProperties.length : 0;
  const formattedAvgPrice = avgPrice >= 1000000 
    ? `₱ ${(avgPrice / 1000000).toFixed(1)}M` 
    : `₱ ${Math.round(avgPrice).toLocaleString()}`;

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] xl:grid-cols-[280px_1fr_300px] gap-6 lg:gap-8 items-start">
        
        {/* Left Sidebar (Profile & Navigation) */}
        <FeedSidebar currentUser={currentUser} />

        {/* Main Feed */}
        <div className="w-full max-w-2xl mx-auto min-w-0">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 mb-6 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 shrink-0 overflow-hidden">
              {currentUser?.broker?.profilePictureUrl ? (
                   <img src={currentUser.broker.profilePictureUrl} alt="Profile" className="w-full h-full object-cover" />
                 ) : (
                   <UserIcon className="w-5 h-5" />
              )}
            </div>
            <Link href="/properties?add=true" className="flex-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-500 px-4 py-2.5 rounded-full text-sm text-left transition-colors cursor-pointer">
              Share a new listing with the network...
            </Link>
            <Link href="/properties?add=true" className="shrink-0 bg-teal-50 text-teal-600 p-2.5 rounded-full hover:bg-teal-100 transition-colors cursor-pointer shadow-sm">
              <Plus className="w-5 h-5" />
            </Link>
          </div>

          <div className="space-y-6 flex flex-col">
            {properties.map((property: any) => (
              <PropertyCard key={property.id} property={property} />
            ))}
            {properties.length === 0 && (
              <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm">
                <p className="text-slate-500 font-medium">No properties in the network yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar (Market Trends / Suggestions) */}
        <div className="hidden xl:block sticky top-24">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-6">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              Market Insights
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Top Region</p>
                <p className="text-sm font-semibold text-slate-900">{topRegion}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Avg. Property Price</p>
                <p className="text-sm font-semibold text-slate-900">{formattedAvgPrice}</p>
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}
