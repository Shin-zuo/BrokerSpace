'use client';

import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Next.js
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapComponentProps {
  position: [number, number];
  onPositionChange: (pos: [number, number]) => void;
  interactive?: boolean;
}

function LocationMarker({ position, onPositionChange, interactive }: MapComponentProps) {
  const map = useMap();
  
  useEffect(() => {
    map.flyTo(position, map.getZoom());
  }, [position, map]);

  useMapEvents({
    click(e) {
      if (interactive) {
        onPositionChange([e.latlng.lat, e.latlng.lng]);
      }
    },
  });

  return position === null ? null : (
    <Marker 
      position={position} 
      draggable={interactive}
      eventHandlers={{
        dragend: (e) => {
          if (interactive) {
            const marker = e.target;
            const pos = marker.getLatLng();
            onPositionChange([pos.lat, pos.lng]);
          }
        },
      }}
    />
  );
}

export default function MapComponent({ position, onPositionChange, interactive = true }: MapComponentProps) {
  return (
    <div className="w-full h-[300px] z-0 relative rounded-2xl overflow-hidden border border-slate-200 shadow-inner">
      <MapContainer 
        center={position} 
        zoom={13} 
        scrollWheelZoom={true} 
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker position={position} onPositionChange={onPositionChange} interactive={interactive} />
      </MapContainer>
    </div>
  );
}
