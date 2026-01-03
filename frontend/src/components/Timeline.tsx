'use client';

import { format, isToday, isYesterday, isSameDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { Conversation } from '@/types';
import { uploadService } from '@/services/upload.service';
import { useEffect, useRef } from 'react';

interface TimelineProps {
  conversations: Conversation[];
  onDelete?: (id: string) => void;
}

// Group conversations by date (oldest first)
const groupByDate = (conversations: Conversation[]) => {
  // Sort by createdAt ascending (oldest first)
  const sorted = [...conversations].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
  
  const groups: { date: Date; items: Conversation[] }[] = [];
  
  sorted.forEach((conv) => {
    const convDate = new Date(conv.createdAt);
    const existingGroup = groups.find((g) => isSameDay(g.date, convDate));
    
    if (existingGroup) {
      existingGroup.items.push(conv);
    } else {
      groups.push({ date: convDate, items: [conv] });
    }
  });
  
  return groups;
};

const getDateLabel = (date: Date): string => {
  if (isToday(date)) return 'Bugun';
  if (isYesterday(date)) return 'Kecha';
  return format(date, 'd MMMM yyyy', { locale: enUS });
};

export default function Timeline({ conversations, onDelete }: TimelineProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new message added
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversations.length]);

  if (conversations.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <div className="w-16 h-16 mx-auto mb-4 bg-[#242f3d] rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <p className="font-medium text-gray-400">Hali suhbat yo'q</p>
        <p className="text-sm mt-1 text-gray-600">Yangi suhbat qo'shish uchun pastdagi input dan foydalaning</p>
      </div>
    );
  }

  const groupedConversations = groupByDate(conversations);

  return (
    <div className="space-y-4">
      {groupedConversations.map((group) => (
        <div key={group.date.toISOString()}>
          {/* Date Separator */}
          <div className="flex justify-center mb-4">
            <span className="px-3 py-1 bg-[#242f3d] text-gray-400 text-xs font-medium rounded-full">
              {getDateLabel(group.date)}
            </span>
          </div>
          
          {/* Messages */}
          <div className="space-y-3">
            {group.items.map((conv) => (
              <MessageBubble key={conv._id} conversation={conv} onDelete={onDelete} />
            ))}
          </div>
        </div>
      ))}
      
      {/* Scroll anchor */}
      <div ref={bottomRef} />
    </div>
  );
}

interface MessageBubbleProps {
  conversation: Conversation;
  onDelete?: (id: string) => void;
}

function MessageBubble({ conversation: conv, onDelete }: MessageBubbleProps) {
  const time = format(new Date(conv.createdAt), 'HH:mm');
  const mediaUrl = conv.type !== 'text' ? uploadService.getFullUrl(conv.content) : conv.content;
  
  return (
    <div className="flex justify-end">
      <div className="max-w-[85%] sm:max-w-[70%]">
        {/* Message Bubble */}
        <div className="bg-primary-500 text-white rounded-2xl rounded-br-md px-4 py-2 shadow-sm">
          {/* Media Content */}
          {conv.type === 'image' && (
            <div className="mb-2 -mx-2 -mt-1">
              <img 
                src={mediaUrl} 
                alt="Rasm" 
                className="rounded-xl max-h-64 w-auto object-cover"
              />
            </div>
          )}
          
          {conv.type === 'audio' && (
            <div className="mb-2">
              <audio controls className="w-full min-w-[200px]">
                <source src={mediaUrl} />
              </audio>
              {conv.metadata?.fileName && (
                <p className="text-xs text-primary-200 mt-1 truncate">{conv.metadata.fileName}</p>
              )}
            </div>
          )}
          
          {conv.type === 'video' && (
            <div className="mb-2 -mx-2 -mt-1">
              <video 
                src={mediaUrl}
                className="rounded-xl max-h-64 w-auto"
                controls
              />
            </div>
          )}
          
          {/* Text Content */}
          {conv.type === 'text' && (
            <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{conv.content}</p>
          )}
          
          {/* Time */}
          <div className="flex items-center justify-end gap-1 mt-1 -mb-0.5">
            <span className="text-[11px] text-primary-200">{time}</span>
            <svg className="w-4 h-4 text-primary-200" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
          </div>
        </div>
        
        {/* Summary Note - Below bubble */}
        <div className="mt-2 ml-2 bg-[#1e2c3a] rounded-xl rounded-tr-md px-3 py-2">
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-sm text-gray-300 flex-1">{conv.summary}</p>
          </div>
          
          {/* Next Follow-up */}
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-700">
            <div className="flex items-center gap-1 text-xs text-orange-400">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Keyingi: {format(new Date(conv.nextFollowUpDate), 'd MMM, HH:mm', { locale: enUS })}</span>
            </div>
            {onDelete && (
              <button
                onClick={() => onDelete(conv._id)}
                className="text-xs text-gray-500 hover:text-red-400 transition-colors"
              >
                O'chirish
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
