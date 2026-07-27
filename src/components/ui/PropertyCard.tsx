'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { MapPin, Maximize, User, CheckCircle2, ChevronLeft, ChevronRight, MessageCircle, Heart, Share2 } from 'lucide-react';
import { Property, PropertyImage, Broker } from '@/src/generated/prisma/client';
import { toggleLike, toggleSave } from '@/src/app/actions/social';
import { useChat } from '@/src/components/chat/ChatContext';


type PropertyWithRelations = Property & {
  images: PropertyImage[];
  broker: Broker & { user?: { username: string } };
  isLiked?: boolean;
  isSaved?: boolean;
};

// Simple relative time formatter
function timeAgo(dateString: Date) {
  const date = new Date(dateString);
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + "y ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + "mo ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + "d ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + "h ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + "m ago";
  return "just now";
}

export default function PropertyCard({ property }: { property: PropertyWithRelations }) {
  const [currentImage, setCurrentImage] = useState(0);
  const [isLiked, setIsLiked] = useState(property.isLiked || false);
  const [isSaved, setIsSaved] = useState(property.isSaved || false);
  const [isPendingLike, startTransitionLike] = useTransition();
  const [isPendingSave, startTransitionSave] = useTransition();
  const [isOpeningChat, setIsOpeningChat] = useState(false);
  const chatContext = useChat();
  const formatter = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 0 });
  const images = property.images && property.images.length > 0 ? property.images : [{ url: '/placeholder.jpg' } as any];

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    setCurrentImage((prev) => (prev + 1) % images.length);
  };
  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    setCurrentImage((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200 flex flex-col mb-2">
      {/* Header: Broker Info (Social Post Style) */}
      <div className="p-4 flex items-center justify-between border-b border-slate-50">
        <Link href={`/${property.broker.user?.username || property.broker.name.toLowerCase().replace(/\s+/g, '')}`} className="flex items-center gap-3 group cursor-pointer">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold overflow-hidden border border-slate-200 group-hover:border-indigo-300 transition-colors shrink-0">
            {property.broker.profilePictureUrl ? (
              <img src={property.broker.profilePictureUrl} alt={property.broker.name} className="w-full h-full object-cover" />
            ) : (
              <User className="w-5 h-5" />
            )}
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900 flex items-center gap-1 group-hover:text-indigo-600 transition-colors">
              {property.broker.name}
              {property.broker.licenseNumber && (
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
              )}
            </p>
            <p className="text-xs text-slate-500 font-medium">
              {property.broker.companyName || 'Independent Broker'} • {timeAgo(property.createdAt)}
            </p>
          </div>
        </Link>
        
        {/* Status Badge */}
        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
          property.status === 'Available' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600'
        }`}>
          {property.status}
        </span>
      </div>

      {/* Content: Details */}
      <div className="px-4 py-3">
        <p className="text-2xl font-black text-indigo-600 mb-1 leading-tight">
          {formatter.format(Number(property.price))}
        </p>
        <Link href={`/property/${property.id}`} className="block group">
          <h3 className="text-lg font-bold text-slate-800 mb-2 leading-snug group-hover:text-indigo-600 transition-colors cursor-pointer">
            {property.title}
          </h3>
        </Link>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600 font-medium">
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
          <div className="px-2 py-0.5 bg-slate-100 rounded text-xs text-slate-600">
            {property.propertyType}
          </div>
        </div>
      </div>

      {/* Image Gallery */}
      <div className="relative group h-[350px] sm:h-[450px] w-full bg-slate-100 mt-2">
        <Link href={`/property/${property.id}`} className="block w-full h-full cursor-pointer">
          <img
            src={images[currentImage].url}
            alt={property.title}
            className="w-full h-full object-cover"
          />
        </Link>
        
        {images.length > 1 && (
          <>
            <button onClick={prevImage} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 text-slate-800 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-white shadow-md z-10 cursor-pointer hover:scale-105">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={nextImage} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 text-slate-800 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-white shadow-md z-10 cursor-pointer hover:scale-105">
              <ChevronRight className="w-5 h-5" />
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10 bg-black/30 px-3 py-2 rounded-full backdrop-blur-md">
              {images.map((_, idx) => (
                <div key={idx} className={`h-1.5 rounded-full transition-all ${idx === currentImage ? 'bg-white w-4' : 'bg-white/50 w-1.5'}`} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Footer: Social Actions */}
      <div className="p-2 border-t border-slate-100 flex items-center gap-1">
        <button 
          onClick={async (e) => {
            e.preventDefault(); e.stopPropagation();
            if (isOpeningChat) return;
            setIsOpeningChat(true);
            try {
              const res = await fetch('/api/conversations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ brokerId: property.brokerId, propertyId: property.id })
              });
              const data = await res.json();
              if (data && data.id) {
                chatContext.openChat(data.id);
              }
            } catch (err) {
              console.error('Error starting chat', err);
            } finally {
              setIsOpeningChat(false);
            }
          }}
          disabled={isOpeningChat}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-indigo-600 font-semibold hover:bg-indigo-50 transition-colors cursor-pointer"
        >
          <MessageCircle className="w-5 h-5" />
          Message
        </button>
        <button 
          onClick={(e) => {
            e.preventDefault(); e.stopPropagation();
            setIsLiked(!isLiked);
            startTransitionLike(async () => {
              const res = await toggleLike(property.id);
              if (res && res.success === false) {
                setIsLiked(isLiked); // revert on failure
              }
            });
          }}
          disabled={isPendingLike}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium transition-colors cursor-pointer ${isLiked ? 'text-red-500 bg-red-50 hover:bg-red-100' : 'text-slate-600 hover:bg-slate-50'}`}
        >
          <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
          Like
        </button>
        <button 
          onClick={(e) => {
            e.preventDefault(); e.stopPropagation();
            setIsSaved(!isSaved);
            startTransitionSave(async () => {
              const res = await toggleSave(property.id);
              if (res && res.success === false) {
                setIsSaved(isSaved); // revert on failure
              }
            });
          }}
          disabled={isPendingSave}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium transition-colors cursor-pointer ${isSaved ? 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100' : 'text-slate-600 hover:bg-slate-50'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bookmark">
            <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>
          </svg>
          Save
        </button>
      </div>


    </div>
  );
}
