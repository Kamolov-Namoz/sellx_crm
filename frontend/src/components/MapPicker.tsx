'use client';

import { useEffect, useState, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (lat: number, lng: number, address: string) => void;
  initialPosition?: [number, number];
}

const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function MapPicker({ isOpen, onClose, onSelect, initialPosition }: MapPickerProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [selectedLat, setSelectedLat] = useState(initialPosition?.[0] || 41.2995);
  const [selectedLng, setSelectedLng] = useState(initialPosition?.[1] || 69.2401);
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const getAddressFromCoords = async (lat: number, lng: number) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=uz`
      );
      const data = await response.json();
      if (data.display_name) {
        setAddress(data.display_name);
      } else {
        setAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      }
    } catch {
      setAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolokatsiya qo\'llab-quvvatlanmaydi');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setSelectedLat(latitude);
        setSelectedLng(longitude);
        
        if (mapRef.current) {
          mapRef.current.setView([latitude, longitude], 16);
          if (markerRef.current) {
            markerRef.current.setLatLng([latitude, longitude]);
          }
        }
        
        getAddressFromCoords(latitude, longitude);
        setIsLocating(false);
      },
      () => {
        alert('Joylashuvni aniqlab bo\'lmadi');
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  useEffect(() => {
    if (!isOpen || !containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current).setView([selectedLat, selectedLng], 13);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    const marker = L.marker([selectedLat, selectedLng], { 
      icon: defaultIcon,
      draggable: true 
    }).addTo(map);

    marker.on('dragend', () => {
      const pos = marker.getLatLng();
      setSelectedLat(pos.lat);
      setSelectedLng(pos.lng);
      getAddressFromCoords(pos.lat, pos.lng);
    });

    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      marker.setLatLng([lat, lng]);
      setSelectedLat(lat);
      setSelectedLng(lng);
      getAddressFromCoords(lat, lng);
    });

    mapRef.current = map;
    markerRef.current = marker;

    getAddressFromCoords(selectedLat, selectedLng);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen && mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
      markerRef.current = null;
    }
  }, [isOpen]);

  const handleConfirm = () => {
    onSelect(selectedLat, selectedLng, address);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-dark-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-dark-700">
          <h2 className="text-lg font-semibold text-white">Xaritadan manzil tanlang</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div ref={containerRef} className="h-[400px] w-full" />

        <div className="p-4 border-t border-dark-700">
          <div className="flex items-start gap-2 mb-2">
            <svg className="w-5 h-5 text-primary-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="text-sm text-gray-300 flex-1">
              {isLoading ? 'Manzil aniqlanmoqda...' : address || 'Xaritadan joy tanlang'}
            </p>
          </div>
          
          <p className="text-xs text-gray-500 mb-4">
            Koordinatalar: {selectedLat.toFixed(6)}, {selectedLng.toFixed(6)}
          </p>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={getCurrentLocation}
              disabled={isLocating}
              className="flex-1 btn-secondary py-2.5 flex items-center justify-center gap-2"
            >
              {isLocating ? (
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
              )}
              Mening joylashuvim
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isLoading}
              className="flex-1 btn-primary py-2.5"
            >
              Tasdiqlash
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
