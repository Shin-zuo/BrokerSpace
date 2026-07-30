import React from 'react';
import { prisma } from '@/src/lib/prisma';
import PropertyCard from '@/src/components/ui/PropertyCard';
import { getSession } from '@/src/lib/auth';
import { redirect } from 'next/navigation';
import { Bookmark } from 'lucide-react';
import BackButton from '@/src/components/ui/BackButton';

export default async function SavedPropertiesPage() {
  const session = await getSession();
  
  if (!session || !session.userId) {
    redirect('/login');
  }

  const currentUserId = session.userId as string;

  const savedRecords = await prisma.savedProperty.findMany({
    where: { userId: currentUserId },
    include: {
      property: {
        include: {
          images: true,
          broker: { include: { user: true } },
          likes: { where: { userId: currentUserId } },
          saves: { where: { userId: currentUserId } },
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  const properties = savedRecords.map((record) => {
    const property = record.property;
    return {
      ...property,
      price: Number(property.price),
      sizeSqm: property.sizeSqm ? Number(property.sizeSqm) : null,
      latitude: property.latitude ? Number(property.latitude) : null,
      longitude: property.longitude ? Number(property.longitude) : null,
      isLiked: property.likes && property.likes.length > 0,
      isSaved: property.saves && property.saves.length > 0,
    };
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-4">
        <BackButton />
      </div>
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center">
          <Bookmark className="w-6 h-6 fill-teal-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Saved Listings</h1>
          <p className="text-slate-500">Properties you've bookmarked for later</p>
        </div>
      </div>

      {properties.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 py-20 text-center">
          <Bookmark className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-700 mb-2">No saved properties yet</h2>
          <p className="text-slate-500">Browse the feed and save properties you're interested in.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property: any) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}
    </div>
  );
}
