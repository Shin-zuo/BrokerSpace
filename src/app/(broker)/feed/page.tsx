import React from 'react';
import { prisma } from '@/src/lib/prisma';
import PropertyCard from '@/src/components/ui/PropertyCard';
import Link from 'next/link';
import { Plus, Building2, Users, TrendingUp, User as UserIcon, Network } from 'lucide-react';
import { getSession } from '@/src/lib/auth';

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

  const rawProperties = await prisma.property.findMany({
    where: { status: 'Available' },
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
        <div className="hidden lg:block sticky top-24">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">
            <div className="h-16 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
            <div className="px-6 pb-6 relative">
              <div className="w-16 h-16 rounded-2xl bg-white border-4 border-white shadow-md flex items-center justify-center text-indigo-600 -mt-8 mb-3 overflow-hidden">
                 {currentUser?.broker?.profilePictureUrl ? (
                   <img src={currentUser.broker.profilePictureUrl} alt="Profile" className="w-full h-full object-cover" />
                 ) : (
                   <UserIcon className="w-8 h-8" />
                 )}
              </div>
              <h2 className="text-lg font-bold text-slate-900 leading-tight">{currentUser?.broker?.name || 'Broker'}</h2>
              <p className="text-sm text-slate-500 mb-4">@{currentUser?.username || 'broker'}</p>
              
              <div className="flex items-center justify-between text-sm text-slate-600 border-t border-slate-100 pt-4">
                <span>My Listings</span>
                <span className="font-bold text-slate-900">Active</span>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <Link href={`/${currentUser?.username || 'profile'}`} className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-700 hover:bg-slate-100 font-medium transition-colors cursor-pointer">
              <UserIcon className="w-5 h-5 text-slate-400" />
              My Profile
            </Link>
            <Link href="/properties" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-700 hover:bg-slate-100 font-medium transition-colors cursor-pointer">
              <Building2 className="w-5 h-5 text-slate-400" />
              Manage Listings
            </Link>
            <Link href="/saved" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-700 hover:bg-slate-100 font-medium transition-colors cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bookmark text-slate-400">
                <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>
              </svg>
              Saved Listings
            </Link>
            <Link href="/network" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-700 hover:bg-slate-100 font-medium transition-colors cursor-pointer">
              <Network className="w-5 h-5 text-slate-400" />
              My Network
            </Link>
          </div>
        </div>

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
            <Link href="/properties?add=true" className="shrink-0 bg-indigo-50 text-indigo-600 p-2.5 rounded-full hover:bg-indigo-100 transition-colors cursor-pointer shadow-sm">
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
