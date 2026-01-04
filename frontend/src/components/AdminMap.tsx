'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { MapClient } from '@/services/admin.service';
import { STATUS_LABELS } from '@/types';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default marker icons - must be done before component renders
const icon = L.icon({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface AdminMapProps {
  clients: MapClient[];
  onClientSelect: (client: MapClient) => void;
}

export default function AdminMap({ clients, onClientSelect }: AdminMapProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const center: [number, number] = clients.length > 0 
    ? [clients[0].location.latitude, clients[0].location.longitude]
    : [41.2995, 69.2401];

  if (!isClient) {
    return <div className="h-full w-full bg-dark-800 animate-pulse" />;
  }

  return (
    <MapContainer
      center={center}
      zoom={12}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {clients.map((client) => (
        <Marker
          key={client._id}
          position={[client.location.latitude, client.location.longitude]}
          icon={icon}
          eventHandlers={{
            click: () => onClientSelect(client),
          }}
        >
          <Popup>
            <div className="text-sm">
              <p className="font-semibold">{client.fullName || client.companyName || client.phoneNumber}</p>
              <p className="text-gray-600">{client.phoneNumber}</p>
              <p className="text-gray-600">{STATUS_LABELS[client.status]}</p>
              {client.userId && (
                <p className="text-xs text-gray-500 mt-1">
                  Sotuvchi: {client.userId.firstName} {client.userId.lastName}
                </p>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
