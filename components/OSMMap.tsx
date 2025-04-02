'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Define props interface
interface OSMMapProps {
  lat: number;
  lng: number;
}

// Create a dynamic import for the map component with SSR disabled
const MapWithNoSSR = dynamic(
  () => import('./MapComponent'), // Importing from a separate file
  { 
    ssr: false, // This is the key - disable server-side rendering
    loading: () => (
      <div className="w-full h-full bg-muted/20 flex items-center justify-center">
        <p>Loading map...</p>
      </div>
    )
  }
);

// The main component is just a wrapper around the dynamically imported component
const OSMMap: React.FC<OSMMapProps> = ({ lat, lng }) => {
  return <MapWithNoSSR lat={lat} lng={lng} />;
};

export default OSMMap;