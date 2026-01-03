'use client';

import { useForm } from 'react-hook-form';
import { useEffect, useState, lazy, Suspense } from 'react';
import { ClientFormData, ClientStatus, STATUS_LABELS } from '@/types';
import { useGeolocation } from '@/hooks/useGeolocation';

// Lazy load MapPicker to avoid SSR issues with Leaflet
const MapPicker = lazy(() => import('./MapPicker'));

interface ClientFormProps {
  initialData?: Partial<ClientFormData>;
  onSubmit: (data: ClientFormData) => Promise<void>;
  isSubmitting: boolean;
  submitLabel: string;
  autoDetectLocation?: boolean;
}

const STATUSES: ClientStatus[] = ['interested', 'thinking', 'callback', 'not_interested', 'deal_closed'];

export default function ClientForm({ 
  initialData, 
  onSubmit, 
  isSubmitting, 
  submitLabel,
  autoDetectLocation = true 
}: ClientFormProps) {
  const [isMapOpen, setIsMapOpen] = useState(false);
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ClientFormData>({
    defaultValues: {
      fullName: initialData?.fullName || '',
      phoneNumber: initialData?.phoneNumber || '',
      location: initialData?.location || '',
      brandName: initialData?.brandName || '',
      notes: initialData?.notes || '',
      status: initialData?.status || 'interested',
      followUpDate: initialData?.followUpDate 
        ? new Date(initialData.followUpDate).toISOString().slice(0, 16)
        : '',
    },
  });

  const { isLoading: isGeoLoading, error: geoError, getLocation } = useGeolocation();
  const locationValue = watch('location');

  // Auto-detect location on mount for new clients
  useEffect(() => {
    if (autoDetectLocation && !initialData?.location) {
      handleGetLocation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoDetectLocation]);

  const handleGetLocation = async () => {
    const address = await getLocation();
    if (address) {
      setValue('location', address);
    }
  };

  const handleMapSelect = (address: string) => {
    setValue('location', address);
    setIsMapOpen(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="fullName" className="label">
          To'liq ism *
        </label>
        <input
          id="fullName"
          type="text"
          className={`input ${errors.fullName ? 'input-error' : ''}`}
          placeholder="Ism Familiya"
          {...register('fullName', {
            required: 'Ism kiritilishi shart',
            minLength: { value: 2, message: 'Kamida 2 ta belgi' },
          })}
        />
        {errors.fullName && (
          <p className="mt-1 text-sm text-red-400">{errors.fullName.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="phoneNumber" className="label">
          Telefon raqam *
        </label>
        <input
          id="phoneNumber"
          type="tel"
          className={`input ${errors.phoneNumber ? 'input-error' : ''}`}
          placeholder="+998 90 123 45 67"
          {...register('phoneNumber', {
            required: 'Telefon raqam kiritilishi shart',
          })}
        />
        {errors.phoneNumber && (
          <p className="mt-1 text-sm text-red-400">{errors.phoneNumber.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="location" className="label">
          Manzil *
        </label>
        <div className="relative">
          <input
            id="location"
            type="text"
            className={`input pr-24 ${errors.location ? 'input-error' : ''}`}
            placeholder={isGeoLoading ? 'Joylashuv aniqlanmoqda...' : 'Toshkent, Chilonzor tumani'}
            {...register('location', {
              required: 'Manzil kiritilishi shart',
              maxLength: { value: 200, message: 'Maksimum 200 ta belgi' },
            })}
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
            {/* Map button */}
            <button
              type="button"
              onClick={() => setIsMapOpen(true)}
              className="p-2 text-gray-400 hover:text-primary-400 transition-colors"
              title="Xaritadan tanlash"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </button>
            {/* GPS button */}
            <button
              type="button"
              onClick={handleGetLocation}
              disabled={isGeoLoading}
              className="p-2 text-gray-400 hover:text-primary-400 transition-colors disabled:opacity-50"
              title="Joylashuvni aniqlash"
            >
              {isGeoLoading ? (
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
            </button>
          </div>
        </div>
        {errors.location && (
          <p className="mt-1 text-sm text-red-400">{errors.location.message}</p>
        )}
        {geoError && !locationValue && (
          <p className="mt-1 text-sm text-yellow-400">{geoError}</p>
        )}
        {isGeoLoading && (
          <p className="mt-1 text-sm text-gray-500">📍 Joylashuv aniqlanmoqda...</p>
        )}
      </div>

      <div>
        <label htmlFor="brandName" className="label">
          Brand nomi (ixtiyoriy)
        </label>
        <input
          id="brandName"
          type="text"
          className="input"
          placeholder="Kompaniya yoki brand nomi"
          {...register('brandName', {
            maxLength: { value: 100, message: 'Maksimum 100 ta belgi' },
          })}
        />
      </div>

      <div>
        <label htmlFor="status" className="label">
          Status *
        </label>
        <select
          id="status"
          className="input"
          {...register('status', { required: true })}
        >
          {STATUSES.map((status) => (
            <option key={status} value={status}>
              {STATUS_LABELS[status]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="followUpDate" className="label">
          Follow-up sanasi (ixtiyoriy)
        </label>
        <input
          id="followUpDate"
          type="datetime-local"
          className="input"
          {...register('followUpDate')}
        />
      </div>

      <div>
        <label htmlFor="notes" className="label">
          Izohlar (ixtiyoriy)
        </label>
        <textarea
          id="notes"
          rows={3}
          className="input resize-none"
          placeholder="Mijoz haqida qo'shimcha ma'lumot..."
          {...register('notes', {
            maxLength: { value: 2000, message: 'Maksimum 2000 ta belgi' },
          })}
        />
        {errors.notes && (
          <p className="mt-1 text-sm text-red-400">{errors.notes.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn-primary w-full py-3 text-base"
      >
        {isSubmitting ? 'Saqlanmoqda...' : submitLabel}
      </button>

      {/* Map Picker Modal */}
      {isMapOpen && (
        <Suspense fallback={
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-dark-800 rounded-xl p-8">
              <svg className="w-8 h-8 animate-spin text-primary-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
          </div>
        }>
          <MapPicker
            isOpen={isMapOpen}
            onClose={() => setIsMapOpen(false)}
            onSelect={handleMapSelect}
          />
        </Suspense>
      )}
    </form>
  );
}
