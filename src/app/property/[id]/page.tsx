import React from 'react';
import { prisma } from '@/src/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { MapPin, Maximize, User, CheckCircle2, Calendar, FileText } from 'lucide-react';
import BackButton from '@/src/components/ui/BackButton';
import PropertyGallery from '@/src/components/ui/PropertyGallery';
import { ChatProvider } from '@/src/components/chat/ChatContext';
import FloatingChat from '@/src/components/chat/FloatingChat';
import { getSession } from '@/src/lib/auth';
import MessageBrokerButton from './MessageBrokerButton';
import PropertyMap from '@/src/components/ui/PropertyMap';

export default async function PropertyDetailsPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;

  const property = await prisma.property.findUnique({
    where: { id },
    include: {
      images: true,
      broker: { include: { user: true } },
    }
  });

  if (!property) {
    notFound();
  }

  const session = await getSession();
  const userId = session?.userId as string | undefined;

  let canView = false;
  if (property.visibility === 'PUBLIC') {
    canView = true;
  } else if (userId) {
    // If it's the owner
    if (property.broker.user?.id === userId) {
      canView = true;
    } else if (property.visibility === 'FRIENDS' && property.broker.user) {
      const connection = await prisma.connection.findFirst({
        where: {
          status: 'ACCEPTED',
          OR: [
            { requesterId: userId, receiverId: property.broker.user.id },
            { requesterId: property.broker.user.id, receiverId: userId }
          ]
        }
      });
      if (connection) canView = true;
    }
  }

  if (!canView) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm max-w-md w-full text-center">
          <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Private Property</h1>
          <p className="text-slate-500 mb-6">
            This property is not available for public view. It may be restricted to the broker&apos;s connections.
          </p>
          <Link href="/feed" className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-6 rounded-xl transition-colors block w-full">
            Return to Feed
          </Link>
        </div>
      </div>
    );
  }

  const formatter = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 0 });

  // Unauthenticated Restricted View for Public Properties
  if (!userId) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col pb-24">
        {/* Navigation */}
        <nav className="fixed w-full z-50 glass-panel border-b border-white/50 bg-white/70 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <BackButton />
            <div className="flex items-center gap-3">
              <img src="/brokerSpace.png" alt="BrokerSpace Logo" className="h-12 w-auto object-contain" />
              <span className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">BrokerSpace</span>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-6 pt-32 w-full flex-1">
          {/* Header Section */}
          <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-teal-100 text-teal-700 text-sm font-bold px-4 py-1.5 rounded-full">
                  {property.propertyType}
                </span>
                <span className={`text-sm font-bold px-4 py-1.5 rounded-full text-white ${
                  property.status === 'Available' ? 'bg-emerald-500' : 'bg-slate-500'
                }`}>
                  {property.status}
                </span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight mb-4 break-words">
                {property.title}
              </h1>
              <div className="flex items-start gap-2 text-slate-500 text-lg">
                <MapPin className="w-5 h-5 text-teal-500 shrink-0 mt-1" />
                <span className="break-words">
                  {[property.addressLine1, property.city, property.stateProvince, property.region].filter(Boolean).join(', ') || 'Address not specified'}
                </span>
              </div>
            </div>
            <div className="md:text-right">
              <p className="text-4xl lg:text-5xl font-black text-teal-600">
                {formatter.format(Number(property.price))}
              </p>
            </div>
          </div>

          {/* Restricted Content Area */}
          <div className="relative rounded-3xl overflow-hidden border border-slate-200 bg-slate-200 min-h-[450px] flex items-center justify-center shadow-inner">
            {property.images && property.images.length > 0 && (
              <div className="absolute inset-0 z-0">
                <img src={property.images[0].url} alt={property.title} className="w-full h-full object-cover blur-lg opacity-50 scale-110" />
              </div>
            )}
            <div className="relative z-10 bg-white/95 backdrop-blur-xl p-8 sm:p-10 rounded-3xl shadow-2xl max-w-lg w-full mx-4 text-center border border-white/50">
              <div className="w-16 h-16 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                <Maximize className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-3">Sign up to see full details</h2>
              <p className="text-slate-600 mb-8 leading-relaxed">
                Join BrokerSpace to view all property photos, full descriptions, location details, and directly contact the broker for this listing.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/signup" className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-md hover:shadow-lg text-center">
                  Create an Account
                </Link>
                <Link href="/login" className="flex-1 bg-white hover:bg-slate-50 text-slate-700 border-2 border-slate-200 font-bold py-3.5 px-6 rounded-xl transition-colors text-center">
                  Log In
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Authenticated View
  return (
    <ChatProvider>
      <div className="min-h-screen bg-slate-50 flex flex-col pb-24">
      {/* Navigation */}
      <nav className="fixed w-full z-50 glass-panel border-b border-white/50 bg-white/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <BackButton />
          <div className="flex items-center gap-3">
            <img src="/brokerSpace.png" alt="BrokerSpace Logo" className="h-12 w-auto object-contain" />
            <span className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">BrokerSpace</span>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-32 w-full flex-1">
        
        {/* Header Section */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-teal-100 text-teal-700 text-sm font-bold px-4 py-1.5 rounded-full">
                {property.propertyType}
              </span>
              <span className={`text-sm font-bold px-4 py-1.5 rounded-full text-white ${
                property.status === 'Available' ? 'bg-emerald-500' : 'bg-slate-500'
              }`}>
                {property.status}
              </span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight mb-4 break-words">
              {property.title}
            </h1>
            <div className="flex items-start gap-2 text-slate-500 text-lg">
              <MapPin className="w-5 h-5 text-teal-500 shrink-0 mt-1" />
              <span className="break-words">
                {[property.addressLine1, property.city, property.stateProvince, property.region].filter(Boolean).join(', ') || 'Address not specified'}
              </span>
            </div>
          </div>
          <div className="md:text-right">
            <p className="text-4xl lg:text-5xl font-black text-teal-600">
              {formatter.format(Number(property.price))}
            </p>
          </div>
        </div>

        {/* Gallery Section */}
        {property.images && property.images.length > 0 && (
          <PropertyGallery images={property.images} title={property.title} />
        )}

        {/* Content Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            
            {/* Overview Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-2">
                <FileText className="w-6 h-6 text-teal-500" />
                <span className="text-sm font-semibold text-slate-500 uppercase">Property Type</span>
                <span className="text-lg font-bold text-slate-900">{property.propertyType}</span>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-2">
                <Maximize className="w-6 h-6 text-teal-500" />
                <span className="text-sm font-semibold text-slate-500 uppercase">Size Area</span>
                <span className="text-lg font-bold text-slate-900">{property.sizeSqm ? `${property.sizeSqm} sqm` : 'N/A'}</span>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-2">
                <MapPin className="w-6 h-6 text-teal-500" />
                <span className="text-sm font-semibold text-slate-500 uppercase">Location</span>
                <span className="text-lg font-bold text-slate-900 line-clamp-1">
                  {property.locationVisibility === 'PRIVATE' ? <span className="italic text-slate-500">{property.stateProvince || property.city || 'Private Location'}</span> : (property.city || 'N/A')}
                </span>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-2">
                <Calendar className="w-6 h-6 text-teal-500" />
                <span className="text-sm font-semibold text-slate-500 uppercase">Listed Date</span>
                <span className="text-lg font-bold text-slate-900">{new Date(property.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">About this Property</h2>
              <div className="prose prose-slate prose-lg max-w-none text-slate-600 leading-relaxed whitespace-pre-wrap break-words">
                {property.description}
              </div>
            </div>

            {/* Map Location */}
            {property.locationVisibility !== 'PRIVATE' && property.latitude && property.longitude && (
              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <MapPin className="w-6 h-6 text-teal-500" />
                  Map Location
                </h2>
                <div className="h-[300px] w-full relative z-0">
                  <PropertyMap 
                    latitude={Number(property.latitude)} 
                    longitude={Number(property.longitude)} 
                  />
                </div>
              </div>
            )}
            
          </div>

          {/* Sidebar / Broker Info */}
          <div className="lg:col-span-1">
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 sticky top-28">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Contact Broker</h3>
              
              <div className="flex flex-col items-center text-center mb-8">
                <div className="w-24 h-24 rounded-full bg-teal-50 flex items-center justify-center text-teal-700 font-bold overflow-hidden shadow-inner mb-4">
                  {property.broker.profilePictureUrl ? (
                    <img src={property.broker.profilePictureUrl} alt={property.broker.name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-10 h-10" />
                  )}
                </div>
                <h4 className="text-xl font-bold text-slate-900 flex items-center justify-center gap-1.5">
                  {property.broker.name}
                  {property.broker.licenseNumber && (
                    <span title="Verified License">
                      <CheckCircle2 className="w-5 h-5 text-blue-500" />
                    </span>
                  )}
                </h4>
                <p className="text-slate-500 mt-1">{property.broker.companyName || 'Independent Broker'}</p>
                {property.broker.licenseNumber && (
                  <p className="text-sm text-slate-400 mt-2">PRC License: {property.broker.licenseNumber}</p>
                )}
              </div>

              <MessageBrokerButton brokerId={property.broker.id} propertyId={property.id} />

              {/* Additional Broker Links */}
              <div className="flex flex-col gap-3 pt-6 border-t border-slate-100">
                {property.broker.facebookUrl && (
                  <a href={property.broker.facebookUrl} target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:text-teal-700 font-medium text-sm text-center">
                    View Facebook Profile
                  </a>
                )}
                {property.broker.linkedinUrl && (
                  <a href={property.broker.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:text-teal-700 font-medium text-sm text-center">
                    View LinkedIn Profile
                  </a>
                )}
              </div>
            </div>
          </div>

        </div>
      </main>
      {userId && <FloatingChat currentUserId={userId} />}
    </div>
    </ChatProvider>
  );
}
