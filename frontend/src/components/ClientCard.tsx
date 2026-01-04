'use client';

import Link from 'next/link';
import { format, isPast, isToday, isTomorrow } from 'date-fns';
import { Client, STATUS_LABELS, ClientStatus } from '@/types';

interface ClientCardProps {
  client: Client;
  onDelete?: () => void;
}

const statusColors: Record<ClientStatus, string> = {
  new: 'bg-blue-500',
  thinking: 'bg-yellow-500',
  agreed: 'bg-green-500',
  rejected: 'bg-red-500',
  callback: 'bg-purple-500',
};

const badgeColors: Record<ClientStatus, string> = {
  new: 'bg-blue-500/20 text-blue-400',
  thinking: 'bg-yellow-500/20 text-yellow-400',
  agreed: 'bg-green-500/20 text-green-400',
  rejected: 'bg-red-500/20 text-red-400',
  callback: 'bg-purple-500/20 text-purple-400',
};

export default function ClientCard({ client, onDelete }: ClientCardProps) {
  const followUpDate = client.followUpDate ? new Date(client.followUpDate) : null;
  const displayName = client.fullName || client.companyName || client.phoneNumber;
  
  const getFollowUpLabel = () => {
    if (!followUpDate) return null;
    
    if (isPast(followUpDate) && !isToday(followUpDate)) {
      return { text: 'O\'tib ketgan', color: 'text-red-400 bg-red-500/20' };
    }
    if (isToday(followUpDate)) {
      return { text: 'Bugun', color: 'text-orange-400 bg-orange-500/20' };
    }
    if (isTomorrow(followUpDate)) {
      return { text: 'Ertaga', color: 'text-blue-400 bg-blue-500/20' };
    }
    return { text: format(followUpDate, 'd MMM'), color: 'text-gray-400 bg-[#242f3d]' };
  };

  const followUpLabel = getFollowUpLabel();

  return (
    <div className="card-interactive group relative">
      <Link href={`/clients/${client._id}`} className="flex items-center gap-3">
        <div className={`w-12 h-12 rounded-full ${statusColors[client.status]} flex items-center justify-center text-white font-semibold flex-shrink-0`}>
          {displayName.charAt(0).toUpperCase()}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="font-semibold text-white truncate">{displayName}</h3>
            <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${badgeColors[client.status]}`}>
              {STATUS_LABELS[client.status]}
            </span>
          </div>
          
          <p className="text-sm text-gray-500 truncate">
            {client.phoneNumber}
            {client.companyName && client.fullName && ` • ${client.companyName}`}
          </p>
          
          {client.location?.address && (
            <p className="text-xs text-gray-600 truncate mt-0.5">
              📍 {client.location.address}
            </p>
          )}
          
          {followUpLabel && (
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${followUpLabel.color}`}>
                <svg className="w-3 h-3 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {followUpLabel.text}
              </span>
              <span className="text-xs text-gray-600">
                {format(followUpDate!, 'HH:mm')}
              </span>
            </div>
          )}
        </div>
        
        <svg className="w-5 h-5 text-gray-600 group-hover:text-gray-400 transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </Link>
      
      {onDelete && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDelete();
          }}
          className="absolute top-2 right-2 p-2 text-gray-600 hover:text-red-400 hover:bg-red-500/20 rounded-full opacity-0 group-hover:opacity-100 transition-all"
          title="O'chirish"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      )}
    </div>
  );
}
