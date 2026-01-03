'use client';

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { ConversationType } from '@/types';

interface ConversationInput {
  type: ConversationType;
  content: string;
  summary: string;
  nextFollowUpDate: string;
}

interface AddConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ConversationInput) => Promise<void>;
  isSubmitting: boolean;
}

export default function AddConversationModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
}: AddConversationModalProps) {
  const [step, setStep] = useState<'input' | 'details'>('input');
  const [selectedType, setSelectedType] = useState<ConversationType>('text');
  const [content, setContent] = useState('');
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<{ summary: string; nextFollowUpDate: string }>();

  const handleClose = () => {
    reset();
    setContent('');
    setStep('input');
    setSelectedType('text');
    setShowAttachMenu(false);
    onClose();
  };

  const handleSendClick = () => {
    if (!content.trim()) return;
    setStep('details');
  };

  const onFormSubmit = async (data: { summary: string; nextFollowUpDate: string }) => {
    await onSubmit({
      type: selectedType,
      content: content.trim(),
      summary: data.summary,
      nextFollowUpDate: data.nextFollowUpDate,
    });
    handleClose();
  };

  const handleAttachSelect = (type: ConversationType) => {
    setSelectedType(type);
    setShowAttachMenu(false);
    if (type !== 'text') {
      // For media types, show URL input placeholder
      setContent('');
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />
      
      {/* Step 1: Telegram-style input bar */}
      {step === 'input' && (
        <div className="absolute bottom-0 left-0 right-0 bg-[#17212b] safe-bottom animate-slide-up">
          {/* Attach Menu */}
          {showAttachMenu && (
            <div className="absolute bottom-full left-0 right-0 bg-[#17212b] border-t border-gray-700 p-4 animate-slide-up">
              <div className="grid grid-cols-4 gap-4 max-w-sm mx-auto">
                <button
                  onClick={() => handleAttachSelect('image')}
                  className="flex flex-col items-center gap-2"
                >
                  <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span className="text-xs text-gray-400">Rasm</span>
                </button>
                
                <button
                  onClick={() => handleAttachSelect('video')}
                  className="flex flex-col items-center gap-2"
                >
                  <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span className="text-xs text-gray-400">Video</span>
                </button>
                
                <button
                  onClick={() => handleAttachSelect('audio')}
                  className="flex flex-col items-center gap-2"
                >
                  <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                  </div>
                  <span className="text-xs text-gray-400">Audio</span>
                </button>
                
                <button
                  onClick={() => handleAttachSelect('text')}
                  className="flex flex-col items-center gap-2"
                >
                  <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <span className="text-xs text-gray-400">Matn</span>
                </button>
              </div>
            </div>
          )}

          {/* Input Bar */}
          <div className="flex items-end gap-2 p-2">
            {/* Attach Button */}
            <button
              onClick={() => setShowAttachMenu(!showAttachMenu)}
              className={`p-2.5 rounded-full transition-colors ${showAttachMenu ? 'bg-gray-600' : 'hover:bg-gray-700'}`}
            >
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
            </button>

            {/* Input Field */}
            <div className="flex-1 bg-[#242f3d] rounded-2xl px-4 py-2">
              {selectedType === 'text' ? (
                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={handleTextareaChange}
                  placeholder="Xabar yozing..."
                  className="w-full bg-transparent text-white placeholder-gray-500 resize-none outline-none text-[15px] max-h-[120px]"
                  rows={1}
                  style={{ height: 'auto' }}
                />
              ) : (
                <input
                  type="url"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={`${selectedType === 'image' ? 'Rasm' : selectedType === 'video' ? 'Video' : 'Audio'} URL kiriting...`}
                  className="w-full bg-transparent text-white placeholder-gray-500 outline-none text-[15px] py-1"
                />
              )}
              
              {/* Type indicator */}
              {selectedType !== 'text' && (
                <div className="flex items-center gap-1 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    selectedType === 'image' ? 'bg-purple-500/20 text-purple-400' :
                    selectedType === 'video' ? 'bg-red-500/20 text-red-400' :
                    'bg-orange-500/20 text-orange-400'
                  }`}>
                    {selectedType === 'image' ? '🖼 Rasm' : selectedType === 'video' ? '🎬 Video' : '🎵 Audio'}
                  </span>
                </div>
              )}
            </div>

            {/* Send/Mic Button */}
            {content.trim() ? (
              <button
                onClick={handleSendClick}
                className="p-2.5 bg-primary-500 rounded-full hover:bg-primary-600 transition-colors"
              >
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                </svg>
              </button>
            ) : (
              <button className="p-2.5 rounded-full hover:bg-gray-700 transition-colors">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Step 2: Details form (summary + follow-up) */}
      {step === 'details' && (
        <div className="absolute bottom-0 left-0 right-0 bg-[#17212b] rounded-t-2xl safe-bottom animate-slide-up">
          <div className="p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setStep('input')}
                className="p-2 hover:bg-gray-700 rounded-full transition-colors"
              >
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h3 className="text-white font-medium">Xulosa qo'shish</h3>
              <div className="w-9" />
            </div>

            {/* Preview */}
            <div className="bg-[#242f3d] rounded-xl p-3 mb-4">
              <p className="text-xs text-gray-500 mb-1">Xabar:</p>
              <p className="text-white text-sm line-clamp-2">{content}</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Xulosa / Izoh *</label>
                <textarea
                  rows={3}
                  className={`w-full bg-[#242f3d] text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary-500 resize-none placeholder-gray-500 ${errors.summary ? 'ring-2 ring-red-500' : ''}`}
                  placeholder="Suhbat haqida qisqacha xulosa..."
                  {...register('summary', { required: true })}
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 mb-1 block">Keyingi qo'ng'iroq (ixtiyoriy)</label>
                <input
                  type="datetime-local"
                  className="w-full bg-[#242f3d] text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary-500"
                  {...register('nextFollowUpDate')}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary-500 text-white font-medium py-3 rounded-xl hover:bg-primary-600 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Saqlanmoqda...' : 'Yuborish'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
