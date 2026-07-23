'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MapPin, Maximize, User, Phone, CheckCircle2, ChevronLeft, ChevronRight, MessageCircle } from 'lucide-react';
import { Property, PropertyImage, Broker } from '@/src/generated/prisma/client';
import InquiryModal from './InquiryModal';

type PropertyWithRelations = Property & {
  images: PropertyImage[];
  broker: Broker;
};

export default function PropertyCard({ property }: { property: PropertyWithRelations }) {
  const [currentImage, setCurrentImage] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const formatter = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 0 });
  const images = property.images && property.images.length > 0 ? property.images : [{ url: '/placeholder.jpg' } as any];

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImage((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 flex flex-col h-full">
      {/* Image Container */}
      <div className="relative h-64 overflow-hidden block bg-slate-100">
        <Link href={`/property/${property.id}`} className="block w-full h-full">
          <img
            src={images[currentImage].url}
            alt={property.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>
        
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 text-slate-800 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-white shadow-sm z-10 cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 text-slate-800 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-white shadow-sm z-10 cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10 bg-black/20 px-2 py-1 rounded-full backdrop-blur-sm">
              {images.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === currentImage ? 'bg-white w-3' : 'bg-white/60 w-1.5'
                  }`}
                />
              ))}
            </div>
          </>
        )}

        <div className="absolute top-4 left-4 z-10 pointer-events-none">
          <span className="bg-white/90 backdrop-blur-sm text-indigo-700 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
            {property.propertyType}
          </span>
        </div>
        <div className="absolute top-4 right-4 z-10 pointer-events-none">
          <span className={`text-xs font-bold px-3 py-1.5 rounded-full shadow-sm text-white ${
            property.status === 'Available' ? 'bg-emerald-500' : 'bg-slate-500'
          }`}>
            {property.status}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-1">
        <Link href={`/property/${property.id}`}>
          <h3 className="text-xl font-bold text-slate-900 mb-2 line-clamp-1 group-hover:text-indigo-600 transition-colors">
            {property.title}
          </h3>
        </Link>
        <p className="text-2xl font-black text-indigo-600 mb-4">
          {formatter.format(Number(property.price))}
        </p>
        
        <div className="flex items-center gap-4 text-slate-500 text-sm mb-6 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-slate-400" />
            <span className="line-clamp-1">{property.city}, {property.stateProvince}</span>
          </div>
          {property.sizeSqm && (
            <div className="flex items-center gap-1.5">
              <Maximize className="w-4 h-4 text-slate-400" />
              <span>{property.sizeSqm.toString()} sqm</span>
            </div>
          )}
        </div>

        {/* Broker Info */}
        <div className="mt-auto pt-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold overflow-hidden shadow-sm">
              {property.broker.profilePictureUrl ? (
                <img src={property.broker.profilePictureUrl} alt={property.broker.name} className="w-full h-full object-cover" />
              ) : (
                <User className="w-5 h-5" />
              )}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 flex items-center gap-1">
                {property.broker.name}
                {property.broker.licenseNumber && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                )}
              </p>
              <p className="text-xs text-slate-500">{property.broker.companyName || 'Independent Broker'}</p>
            </div>
          </div>
          
          <button
            type="button"
            className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-100 hover:text-emerald-700 transition-colors shadow-sm cursor-pointer"
            title="Inquire via WhatsApp"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsModalOpen(true);
            }}
          >
            <MessageCircle className="w-5 h-5 text-emerald-600" />
          </button>
        </div>
      </div>

      <InquiryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        propertyId={property.id}
        propertyTitle={property.title}
        propertyPrice={property.price as any}
        brokerName={property.broker.name}
        brokerWhatsApp={property.broker.whatsappNumber}
      />
    </div>
  );
}
