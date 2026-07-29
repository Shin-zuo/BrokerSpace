import React from 'react';
import { prisma } from '@/src/lib/prisma';
import PropertyCard from '@/src/components/ui/PropertyCard';
import Link from 'next/link';
import { Search, User, Building2 } from 'lucide-react';
import { getSession } from '@/src/lib/auth';
import BackButton from '@/src/components/ui/BackButton';

export const dynamic = 'force-dynamic';

export default async function SearchPage(props: { searchParams: Promise<{ q?: string }> }) {
  const searchParams = await props.searchParams;
  const session = await getSession();
  const currentUserId = session?.userId as string;

  const query = searchParams.q || '';
  
  if (!query) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-4">
          <BackButton />
        </div>
        <div className="py-8 text-center">
          <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Search BrokerSpace</h1>
          <p className="text-slate-500">Enter a keyword to search for properties and brokers.</p>
        </div>
      </div>
    );
  }

  // Fetch properties matching query
  const rawProperties = await prisma.property.findMany({
    where: {
      status: 'Available',
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { city: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ]
    },
    orderBy: { createdAt: 'desc' },
    include: { 
      images: true, 
      broker: { include: { user: true } },
      likes: currentUserId ? { where: { userId: currentUserId } } : false,
      saves: currentUserId ? { where: { userId: currentUserId } } : false,
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

  // Fetch users/brokers matching query
  const brokers = await prisma.user.findMany({
    where: {
      OR: [
        { username: { contains: query, mode: 'insensitive' } },
        { broker: { name: { contains: query, mode: 'insensitive' } } },
        { broker: { companyName: { contains: query, mode: 'insensitive' } } },
      ]
    },
    include: { broker: true }
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-4">
        <BackButton />
      </div>
      <div className="mb-8 border-b border-slate-200 pb-6">
        <h1 className="text-2xl font-bold text-slate-900">Search results for "{query}"</h1>
        <p className="text-slate-500 mt-1">Found {properties.length} properties and {brokers.length} brokers.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Properties Results */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-500" />
            Properties
          </h2>
          
          {properties.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 border-dashed py-12 text-center text-slate-500">
              No properties found matching "{query}"
            </div>
          ) : (
            <div className="space-y-6">
              {properties.map((property: any) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}
        </div>

        {/* Brokers Results */}
        <div className="lg:col-span-1 space-y-6">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-500" />
            Brokers
          </h2>

          {brokers.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 border-dashed py-12 text-center text-slate-500">
              No brokers found matching "{query}"
            </div>
          ) : (
            <div className="space-y-4">
              {brokers.map((user: any) => (
                <Link key={user.id} href={`/${user.username}`} className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-300 transition-colors group cursor-pointer">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 overflow-hidden">
                    {user.broker?.profilePictureUrl ? (
                      <img src={user.broker.profilePictureUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{user.broker?.name}</h3>
                    <p className="text-sm text-slate-500">@{user.username}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
