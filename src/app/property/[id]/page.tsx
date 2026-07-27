import React from 'react';
import { prisma } from '@/src/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { MapPin, Maximize, User, Phone, CheckCircle2, ChevronLeft, Calendar, FileText } from 'lucide-react';
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
      broker: true,
    }
  });

  if (!property) {
    notFound();
  }

  const session = await getSession();
  const userId = session?.userId as string | undefined;

  const formatter = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 0 });

  return (
    <ChatProvider>
      <div className="min-h-screen bg-slate-50 flex flex-col pb-24">
      {/* Navigation */}
      <nav className="fixed w-full z-50 glass-panel border-b border-white/50 bg-white/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <BackButton />
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-indigo-500/20">
              B
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">BrokerSpace</span>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-32 w-full flex-1">
        
        {/* Header Section */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-indigo-100 text-indigo-700 text-sm font-bold px-4 py-1.5 rounded-full">
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
              <MapPin className="w-5 h-5 text-indigo-500 shrink-0 mt-1" />
              <span className="break-words">{property.addressLine1}, {property.city}, {property.stateProvince}, {property.region}</span>
            </div>
          </div>
          <div className="md:text-right">
            <p className="text-4xl lg:text-5xl font-black text-indigo-600">
              {formatter.format(Number(property.price))}
            </p>
          </div>
        </div>

        {/* Gallery Section */}
        <PropertyGallery images={property.images} title={property.title} />

        {/* Content Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            
            {/* Overview Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-2">
                <FileText className="w-6 h-6 text-indigo-500" />
                <span className="text-sm font-semibold text-slate-500 uppercase">Property Type</span>
                <span className="text-lg font-bold text-slate-900">{property.propertyType}</span>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-2">
                <Maximize className="w-6 h-6 text-indigo-500" />
                <span className="text-sm font-semibold text-slate-500 uppercase">Size Area</span>
                <span className="text-lg font-bold text-slate-900">{property.sizeSqm ? `${property.sizeSqm} sqm` : 'N/A'}</span>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-2">
                <MapPin className="w-6 h-6 text-indigo-500" />
                <span className="text-sm font-semibold text-slate-500 uppercase">Location</span>
                <span className="text-lg font-bold text-slate-900 line-clamp-1">{property.city}</span>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-2">
                <Calendar className="w-6 h-6 text-indigo-500" />
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
            {property.latitude && property.longitude && (
              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <MapPin className="w-6 h-6 text-indigo-500" />
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
                <div className="w-24 h-24 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-700 font-bold overflow-hidden shadow-inner mb-4">
                  {property.broker.profilePictureUrl ? (
                    <img src={property.broker.profilePictureUrl} alt={property.broker.name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-10 h-10" />
                  )}
                </div>
                <h4 className="text-xl font-bold text-slate-900 flex items-center justify-center gap-1.5">
                  {property.broker.name}
                  {property.broker.licenseNumber && (
                    <CheckCircle2 className="w-5 h-5 text-blue-500" title="Verified License" />
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
                  <a href={property.broker.facebookUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-700 font-medium text-sm text-center">
                    View Facebook Profile
                  </a>
                )}
                {property.broker.linkedinUrl && (
                  <a href={property.broker.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-700 font-medium text-sm text-center">
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
