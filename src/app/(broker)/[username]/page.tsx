import React from 'react';
import { prisma } from '@/src/lib/prisma';
import { getSession } from '@/src/lib/auth';
import { notFound, redirect } from 'next/navigation';
import PropertyCard from '@/src/components/ui/PropertyCard';
import Link from 'next/link';
import { User, Settings, Edit, Trash2, Eye, Heart, Bookmark, MessageSquare } from 'lucide-react';
import DeletePropertyButton from './DeletePropertyButton';
import ProfileActions from '@/src/components/profile/ProfileActions';

export default async function ProfilePage(props: { params: Promise<{ username: string }> }) {
  const params = await props.params;
  const session = await getSession();
  
  if (!session || !session.userId) {
    redirect('/login');
  }

  const currentUserId = session.userId as string;
  const username = params.username;

  // Reserved routes fallback
  if (['feed', 'messages', 'settings', 'properties', 'saved'].includes(username)) {
    notFound();
  }

  const targetUser = await prisma.user.findUnique({
    where: { username },
    include: {
      broker: {
        include: {
          properties: {
            where: { status: 'Available' },
            include: {
              images: true,
              broker: { include: { user: true } },
              likes: true,
              saves: true,
            },
            orderBy: { createdAt: 'desc' }
          }
        }
      }
    }
  });

  if (!targetUser || !targetUser.broker) {
    notFound();
  }

  const isOwner = currentUserId === targetUser.id;
  const properties = targetUser.broker.properties;

  // Simple Analytics Calculation
  const totalListings = properties.length;
  const totalLikes = properties.reduce((acc, prop) => acc + (prop.likes?.length || 0), 0);
  const totalSaves = properties.reduce((acc, prop) => acc + (prop.saves?.length || 0), 0);

  const serializedProperties = properties.map((property: any) => ({
    ...property,
    price: Number(property.price),
    sizeSqm: property.sizeSqm ? Number(property.sizeSqm) : null,
    latitude: property.latitude ? Number(property.latitude) : null,
    longitude: property.longitude ? Number(property.longitude) : null,
    isLiked: property.likes?.some((l: any) => l.userId === currentUserId),
    isSaved: property.saves?.some((s: any) => s.userId === currentUserId),
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">
        <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-600 relative">
          {isOwner && (
            <Link href="/settings" className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white p-2 rounded-xl transition-colors">
              <Settings className="w-5 h-5" />
            </Link>
          )}
        </div>
        <div className="px-8 pb-8 relative">
          <div className="w-24 h-24 rounded-2xl bg-white border-4 border-white shadow-md flex items-center justify-center text-indigo-600 -mt-12 mb-4 overflow-hidden">
            {targetUser.broker.profilePictureUrl ? (
              <img src={targetUser.broker.profilePictureUrl} alt={targetUser.broker.name} className="w-full h-full object-cover" />
            ) : (
              <User className="w-10 h-10" />
            )}
          </div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{targetUser.broker.name}</h1>
              <p className="text-slate-500 font-medium">@{targetUser.username}</p>
              {targetUser.broker.bio && (
                <p className="mt-2 text-slate-600 max-w-2xl">{targetUser.broker.bio}</p>
              )}
            </div>
            {!isOwner && (
              <ProfileActions currentUserId={currentUserId} targetUserId={targetUser.id} brokerId={targetUser.broker.id} />
            )}
          </div>
        </div>
      </div>

      {isOwner ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Analytics Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Eye className="w-5 h-5 text-indigo-500" />
                Your Analytics
              </h2>
              <div className="space-y-6">
                <div>
                  <p className="text-sm text-slate-500 font-medium mb-1">Active Listings</p>
                  <p className="text-3xl font-bold text-slate-900">{totalListings}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium mb-1">Total Likes</p>
                  <p className="text-3xl font-bold text-indigo-600 flex items-center gap-2">
                    {totalLikes} <Heart className="w-5 h-5 fill-indigo-100" />
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium mb-1">Total Saves</p>
                  <p className="text-3xl font-bold text-emerald-600 flex items-center gap-2">
                    {totalSaves} <Bookmark className="w-5 h-5 fill-emerald-100" />
                  </p>
                </div>
              </div>
            </div>
            
            <Link href="/saved" className="bg-slate-900 hover:bg-slate-800 text-white w-full rounded-2xl p-4 flex items-center justify-between transition-colors">
              <div className="flex items-center gap-3 font-medium">
                <Bookmark className="w-5 h-5 text-slate-300" />
                My Saved Listings
              </div>
            </Link>
          </div>

          {/* Listings Management */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">Manage Listings</h2>
              <Link href="/properties" className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-4 py-2 rounded-lg font-medium transition-colors text-sm">
                Manage in Dashboard
              </Link>
            </div>
            
            {serializedProperties.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 border-dashed py-16 text-center">
                <p className="text-slate-500 mb-4">You don't have any active listings yet.</p>
                <Link href="/properties" className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition-colors inline-block">
                  Create your first listing
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {serializedProperties.map((property: any) => (
                  <div key={property.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 flex flex-col sm:flex-row gap-4 items-center">
                    <div className="w-full sm:w-32 h-24 rounded-xl bg-slate-100 shrink-0 overflow-hidden relative">
                      {property.images && property.images.length > 0 ? (
                        <img src={property.images[0].url} alt={property.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">No Image</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-900 truncate">{property.title}</h3>
                      <p className="text-slate-500 text-sm mb-2">{property.city}, {property.region}</p>
                      <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
                        <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5 text-red-500" /> {property.likes?.length || 0}</span>
                        <span className="flex items-center gap-1"><Bookmark className="w-3.5 h-3.5 text-indigo-500" /> {property.saves?.length || 0}</span>
                        <span className="text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded-md">
                          {new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 0 }).format(property.price)}
                        </span>
                      </div>
                    </div>
                    <div className="flex sm:flex-col gap-2 shrink-0">
                      <Link href="/properties" className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl transition-colors">
                        <Edit className="w-5 h-5" />
                      </Link>
                      <DeletePropertyButton propertyId={property.id} propertyTitle={property.title} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Public Profile View */
        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-6">Listings by {targetUser.broker.name}</h2>
          {serializedProperties.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 py-16 text-center">
              <p className="text-slate-500">This broker has no active listings.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {serializedProperties.map((property: any) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
