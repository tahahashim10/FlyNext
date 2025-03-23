'use client';

import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Workaround for default icon issue in Next.js with Leaflet
delete (L.Icon.Default as any)._getIconUrl;
(L.Icon.Default as any).mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
});

interface OSMMapProps {
  lat: number;
  lng: number;
}

const OSMMap: React.FC<OSMMapProps> = ({ lat, lng }) => {
  const position: [number, number] = [lat, lng];
  return (
    <MapContainer center={position} zoom={15} style={{ height: '300px', width: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={position}>
        <Popup>Here is the hotel location</Popup>
      </Marker>
    </MapContainer>
  );
};

export default OSMMap;
