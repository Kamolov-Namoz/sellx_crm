'use client';

import { useState, useCallback } from 'react';

interface GeolocationState {
  isLoading: boolean;
  error: string | null;
  address: string | null;
  coords: { lat: number; lng: number } | null;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    isLoading: false,
    error: null,
    address: null,
    coords: null,
  });

  const getLocation = useCallback(async (): Promise<string | null> => {
    if (!navigator.geolocation) {
      setState((prev) => ({ ...prev, error: 'Geolocation qo\'llab-quvvatlanmaydi' }));
      return null;
    }

    setState({ isLoading: true, error: null, address: null, coords: null });

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          try {
            // Reverse geocoding with OpenStreetMap Nominatim
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=uz`,
              {
                headers: {
                  'User-Agent': 'SalesCRM/1.0',
                },
              }
            );
            
            if (response.ok) {
              const data = await response.json();
              const address = formatAddress(data);
              
              setState({
                isLoading: false,
                error: null,
                address,
                coords: { lat: latitude, lng: longitude },
              });
              
              resolve(address);
            } else {
              // Fallback to coordinates
              const fallback = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
              setState({
                isLoading: false,
                error: null,
                address: fallback,
                coords: { lat: latitude, lng: longitude },
              });
              resolve(fallback);
            }
          } catch {
            // Fallback to coordinates on error
            const fallback = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
            setState({
              isLoading: false,
              error: null,
              address: fallback,
              coords: { lat: latitude, lng: longitude },
            });
            resolve(fallback);
          }
        },
        (error) => {
          let errorMessage = 'Joylashuvni aniqlab bo\'lmadi';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Joylashuv ruxsati berilmagan';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Joylashuv ma\'lumoti mavjud emas';
              break;
            case error.TIMEOUT:
              errorMessage = 'Joylashuvni aniqlash vaqti tugadi';
              break;
          }
          
          setState({
            isLoading: false,
            error: errorMessage,
            address: null,
            coords: null,
          });
          
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    });
  }, []);

  return {
    ...state,
    getLocation,
  };
}

function formatAddress(data: {
  address?: {
    city?: string;
    town?: string;
    village?: string;
    suburb?: string;
    neighbourhood?: string;
    road?: string;
    house_number?: string;
    state?: string;
    county?: string;
    country?: string;
  };
  display_name?: string;
}): string {
  const addr = data.address;
  
  if (!addr) {
    return data.display_name || 'Noma\'lum manzil';
  }

  const parts: string[] = [];
  
  // City/Town/Village
  const city = addr.city || addr.town || addr.village;
  if (city) parts.push(city);
  
  // District/Suburb
  const district = addr.suburb || addr.neighbourhood || addr.county;
  if (district && district !== city) parts.push(district);
  
  // Street
  if (addr.road) {
    const street = addr.house_number ? `${addr.road} ${addr.house_number}` : addr.road;
    parts.push(street);
  }

  if (parts.length === 0) {
    return data.display_name || 'Noma\'lum manzil';
  }

  return parts.join(', ');
}
