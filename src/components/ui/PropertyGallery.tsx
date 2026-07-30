'use client';

import React, { useState } from 'react';
import { PropertyImage } from '@/src/generated/prisma/client';

export default function PropertyGallery({ images, title }: { images: PropertyImage[], title: string }) {
  // Find the primary image or default to the first one, else use placeholder
  const initialPrimary = images.find(img => img.isPrimary) || images[0] || { url: '/placeholder.jpg' };
  
  const [activeImage, setActiveImage] = useState(initialPrimary.url);

  // Get up to 4 other images to show in the sidebar (excluding the currently active one)
  const sidebarImages = images.filter(img => img.url !== activeImage).slice(0, 4);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12 h-[400px] md:h-[600px] overflow-hidden">
      {/* Active/Main Image */}
      <div className={`w-full h-full min-h-0 min-w-0 rounded-3xl overflow-hidden shadow-sm ${sidebarImages.length > 0 ? 'md:col-span-3' : 'md:col-span-4'}`}>
        <img 
          src={activeImage} 
          alt={title} 
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" 
        />
      </div>

      {/* Sidebar Images */}
      {sidebarImages.length > 0 && (
        <div className="hidden md:flex flex-col gap-4 h-full min-h-0">
          {sidebarImages.map((img, idx) => (
            <div 
              key={img.id || idx} 
              className="flex-1 rounded-2xl overflow-hidden shadow-sm min-h-0 cursor-pointer group border-2 border-transparent hover:border-teal-400 transition-colors"
              onClick={() => setActiveImage(img.url)}
            >
              <img 
                src={img.url} 
                alt={`${title} view ${idx + 1}`} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-90 group-hover:opacity-100" 
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
