'use client';

import { useState, useCallback } from 'react';

interface GeolocationPosition {
  latitude: number;
  longitude: number;
  address?: string;
}

interface GeolocationState {
  isLoading: boolean;
  error: string | null;
  position: GeolocationPosition | null;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    isLoading: false,
    error: null,
    position: null,
  });

  const getCurrentPosition = useCallback(async (): Promise<GeolocationPosition | null> => {
    if (!navigator.geolocation) {
      setState((prev) => ({ ...prev, error: 'Geolocation qo\'llab-quvvatlanmaydi' }));
      return null;
    }

    setState({ isLoading: true, error: null, position: null });

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=uz`,
              { headers: { 'User-Agent': 'SalesCRM/1.0' } }
            );
            
            if (response.ok) {
              const data = await response.json();
              const address = formatAddress(data);
              
              const result = { latitude, longitude, address };
              setState({ isLoading: false, error: null, position: result });
              resolve(result);
            } else {
              const result = { latitude, longitude };
              setState({ isLoading: false, error: null, position: result });
              resolve(result);
            }
          } catch {
            const result = { latitude, longitude };
            setState({ isLoading: false, error: null, position: result });
            resolve(result);
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
          
          setState({ isLoading: false, error: errorMessage, position: null });
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    });
  }, []);

  return {
    ...state,
    getCurrentPosition,
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
    county?: string;
  };
  display_name?: string;
}): string {
  const addr = data.address;
  
  if (!addr) return data.display_name || '';

  const parts: string[] = [];
  
  const city = addr.city || addr.town || addr.village;
  if (city) parts.push(city);
  
  const district = addr.suburb || addr.neighbourhood || addr.county;
  if (district && district !== city) parts.push(district);
  
  if (addr.road) {
    const street = addr.house_number ? `${addr.road} ${addr.house_number}` : addr.road;
    parts.push(street);
  }

  return parts.length > 0 ? parts.join(', ') : data.display_name || '';
}
