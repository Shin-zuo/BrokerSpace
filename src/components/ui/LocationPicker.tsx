'use client';

import React, { useState, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Loader2, MapPin, Search } from 'lucide-react';

// Dynamically import the map component to avoid SSR issues with Leaflet window object
const MapComponent = dynamic(() => import('./MapComponent'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-[300px] bg-slate-100 rounded-2xl flex items-center justify-center border border-slate-200">
      <div className="flex flex-col items-center gap-2 text-slate-400">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span className="text-sm font-medium">Loading Map...</span>
      </div>
    </div>
  )
});

export type LocationDetails = {
  lat: number;
  lng: number;
  addressLine1?: string;
  city?: string;
  stateProvince?: string;
  country?: string;
  postalCode?: string;
};

interface LocationPickerProps {
  initialPosition?: [number, number];
  onLocationChange: (details: LocationDetails) => void;
  interactive?: boolean;
}

export default function LocationPicker({ 
  initialPosition = [14.5995, 120.9842], // Default to Manila, PH
  onLocationChange,
  interactive = true
}: LocationPickerProps) {
  const [position, setPosition] = useState<[number, number]>(initialPosition);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);

  useEffect(() => {
    if (!searchQuery.trim()) return;
    
    const timeoutId = setTimeout(() => {
      executeSearch(searchQuery);
    }, 800);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const executeSearch = async (query: string) => {
    setIsSearching(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
      const data = await response.json();
      
      if (data && data.length > 0) {
        const newPos: [number, number] = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
        handlePositionChange(newPos);
      }
    } catch (error) {
      console.error("Search failed", error);
    } finally {
      setIsSearching(false);
    }
  };

  // Reverse Geocoding: Get address from Lat/Lng
  const handlePositionChange = useCallback(async (pos: [number, number]) => {
    setPosition(pos);
    setIsGeocoding(true);

    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos[0]}&lon=${pos[1]}`);
      const data = await response.json();
      
      if (data && data.address) {
        const details: LocationDetails = {
          lat: pos[0],
          lng: pos[1],
          addressLine1: data.address.road || data.address.suburb || data.name || '',
          city: data.address.city || data.address.town || data.address.village || '',
          stateProvince: data.address.state || data.address.region || '',
          country: data.address.country || '',
          postalCode: data.address.postcode || '',
        };
        onLocationChange(details);
      } else {
        onLocationChange({ lat: pos[0], lng: pos[1] });
      }
    } catch (error) {
      console.error("Geocoding failed", error);
      onLocationChange({ lat: pos[0], lng: pos[1] });
    } finally {
      setIsGeocoding(false);
    }
  }, [onLocationChange]);

  return (
    <div className="space-y-4">
      {interactive && (
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-24 py-3 bg-white border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-sm"
            placeholder="Search for a city, street, or landmark to pin..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {isSearching && (
            <div className="absolute inset-y-0 right-3 flex items-center">
              <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
            </div>
          )}
        </div>
      )}

      <div className="relative">
        <MapComponent 
          position={position} 
          onPositionChange={handlePositionChange} 
          interactive={interactive} 
        />
        
        {isGeocoding && (
          <div className="absolute top-4 left-4 z-[400] bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm border border-slate-200 flex items-center gap-2 text-xs font-semibold text-slate-600">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-500" />
            Resolving address...
          </div>
        )}

        {interactive && !isGeocoding && (
          <div className="absolute top-4 left-4 z-[400] bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm border border-slate-200 flex items-center gap-2 text-xs font-semibold text-slate-600 pointer-events-none">
            <MapPin className="w-3.5 h-3.5 text-teal-500" />
            Drag the pin to set exact location
          </div>
        )}
      </div>
    </div>
  );
}
