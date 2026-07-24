'use client';

import LocationPicker from './LocationPicker';

interface PropertyMapProps {
  latitude: number;
  longitude: number;
}

export default function PropertyMap({ latitude, longitude }: PropertyMapProps) {
  return (
    <LocationPicker
      initialPosition={[latitude, longitude]}
      interactive={false}
      onLocationChange={() => {}}
    />
  );
}
