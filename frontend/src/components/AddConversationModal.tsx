'use client';

import { useState, useRef, useEffect } from 'react';
import { ConversationType } from '@/types';
import { uploadService } from '@/services/upload.service';

interface ConversationInput {
  type: ConversationType;
  content: string;
  nextFollowUpDate?: string;
  metadata?: { fileName?: string; fileSize?: number; mimeType?: string };
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
  const [selectedType, setSelectedType] = useState<ConversationType>('text');
  const [content, setContent] = useState('');
  const [nextFollowUpDate, setNextFollowUpDate] = useState('');
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaMetadata, setMediaMetadata] = useState<{ fileName?: string; fileSize?: number; mimeType?: string } | null>(null);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
      if (mediaRecorderRef.current && isRecording) mediaRecorderRef.current.stop();
    };
  }, [isRecording]);

  const handleClose = () => {
    setContent('');
    setNextFollowUpDate('');
    setSelectedType('text');
    setShowAttachMenu(false);
    setShowDatePicker(false);
    setMediaPreview(null);
    setMediaMetadata(null);
    stopRecording();
    onClose();
  };

  const handleSend = async () => {
    if (!content.trim() || isSubmitting) return;
    
    await onSubmit({
      type: selectedType,
      content: content.trim(),
      nextFollowUpDate: nextFollowUpDate || undefined,
      metadata: mediaMetadata || undefined,
    });
    handleClose();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setShowAttachMenu(false);

    try {
      const response = await uploadService.uploadFile(file);
      if (response.success && response.data) {
        setContent(response.data.url);
        setMediaPreview(uploadService.getFullUrl(response.data.url));
        setMediaMetadata({
          fileName: response.data.originalName,
          fileSize: response.data.size,
          mimeType: response.data.mimeType,
        });
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const openFilePicker = (type: 'image' | 'video') => {
    setSelectedType(type);
    if (fileInputRef.current) {
      fileInputRef.current.accept = type === 'image' ? 'image/*' : 'video/*';
      fileInputRef.current.click();
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop());
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioFile = new File([audioBlob], `voice_${Date.now()}.webm`, { type: 'audio/webm' });
        
        setIsUploading(true);
        try {
          const response = await uploadService.uploadFile(audioFile);
          if (response.success && response.data) {
            setSelectedType('audio');
            setContent(response.data.url);
            setMediaPreview(uploadService.getFullUrl(response.data.url));
            setMediaMetadata({
              fileName: response.data.originalName,
              fileSize: response.data.size,
              mimeType: response.data.mimeType,
            });
          }
        } catch (error) {
          console.error('Audio upload failed:', error);
        } finally {
          setIsUploading(false);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      recordingIntervalRef.current = setInterval(() => setRecordingTime(prev => prev + 1), 1000);
    } catch (error) {
      console.error('Microphone access denied:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
    }
  };

  const toggleRecording = () => {
    if (isRecording) stopRecording();
    else startRecording();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const clearMedia = () => {
    setContent('');
    setMediaPreview(null);
    setMediaMetadata(null);
    setSelectedType('text');
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />
      
      <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelect} />
      
      <div className="absolute bottom-0 left-0 right-0 bg-[#17212b] safe-bottom animate-slide-up">
        {/* Attach Menu */}
        {showAttachMenu && (
          <div className="absolute bottom-full left-0 right-0 bg-[#17212b] border-t border-gray-700 p-4 animate-slide-up">
            <div className="grid grid-cols-3 gap-4 max-w-xs mx-auto">
              <button onClick={() => openFilePicker('image')} className="flex flex-col items-center gap-2">
                <div className="w-14 h-14 rounded-full bg-purple-500 flex items-center justify-center">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-xs text-gray-400">Rasm</span>
              </button>
              
              <button onClick={() => openFilePicker('video')} className="flex flex-col items-center gap-2">
                <div className="w-14 h-14 rounded-full bg-red-500 flex items-center justify-center">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-xs text-gray-400">Video</span>
              </button>
              
              <button onClick={() => { setSelectedType('text'); setShowAttachMenu(false); clearMedia(); }} className="flex flex-col items-center gap-2">
                <div className="w-14 h-14 rounded-full bg-blue-500 flex items-center justify-center">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <span className="text-xs text-gray-400">Matn</span>
              </button>
            </div>
          </div>
        )}

        {/* Date Picker */}
        {showDatePicker && (
          <div className="p-3 border-b border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Keyingi uchrashuv</span>
              <button onClick={() => { setNextFollowUpDate(''); setShowDatePicker(false); }} className="text-xs text-red-400">
                Tozalash
              </button>
            </div>
            <input
              type="datetime-local"
              value={nextFollowUpDate}
              onChange={(e) => setNextFollowUpDate(e.target.value)}
              className="w-full bg-[#242f3d] text-white rounded-xl px-4 py-3 outline-none"
            />
            <button
              onClick={() => setShowDatePicker(false)}
              className="w-full mt-2 bg-primary-500 text-white py-2 rounded-xl"
            >
              Tayyor
            </button>
          </div>
        )}

        {/* Media Preview */}
        {mediaPreview && (selectedType === 'image' || selectedType === 'video') && (
          <div className="p-3 border-b border-gray-700">
            <div className="relative inline-block">
              {selectedType === 'image' ? (
                <img src={mediaPreview} alt="Preview" className="max-h-32 rounded-lg" />
              ) : (
                <video src={mediaPreview} className="max-h-32 rounded-lg" controls />
              )}
              <button onClick={clearMedia} className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Audio Preview */}
        {mediaPreview && selectedType === 'audio' && (
          <div className="p-3 border-b border-gray-700">
            <div className="flex items-center gap-3">
              <audio src={mediaPreview} controls className="flex-1 h-10" />
              <button onClick={clearMedia} className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Recording indicator */}
        {isRecording && (
          <div className="p-3 border-b border-gray-700 flex items-center gap-3">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            <span className="text-red-400 font-medium">{formatTime(recordingTime)}</span>
            <span className="text-gray-400 text-sm">Ovoz yozilmoqda...</span>
          </div>
        )}

        {/* Uploading indicator */}
        {isUploading && (
          <div className="p-3 border-b border-gray-700 flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-gray-400">Yuklanmoqda...</span>
          </div>
        )}

        {/* Next follow-up indicator */}
        {nextFollowUpDate && !showDatePicker && (
          <div className="px-3 py-2 border-b border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-2 text-orange-400 text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Keyingi: {new Date(nextFollowUpDate).toLocaleString('uz-UZ')}</span>
            </div>
            <button onClick={() => setNextFollowUpDate('')} className="text-gray-500 text-xs">✕</button>
          </div>
        )}

        {/* Input Bar */}
        <div className="flex items-end gap-2 p-2">
          <button
            onClick={() => { setShowAttachMenu(!showAttachMenu); setShowDatePicker(false); }}
            className={`p-2.5 rounded-full transition-colors ${showAttachMenu ? 'bg-gray-600' : 'hover:bg-gray-700'}`}
          >
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>

          {/* Calendar button */}
          <button
            onClick={() => { setShowDatePicker(!showDatePicker); setShowAttachMenu(false); }}
            className={`p-2.5 rounded-full transition-colors ${showDatePicker || nextFollowUpDate ? 'text-orange-400' : 'text-gray-400'} hover:bg-gray-700`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>

          <div className="flex-1 bg-[#242f3d] rounded-2xl px-4 py-2">
            {selectedType === 'text' && !mediaPreview ? (
              <textarea
                ref={textareaRef}
                value={content}
                onChange={handleTextareaChange}
                placeholder="Xabar yozing..."
                className="w-full bg-transparent text-white placeholder-gray-500 resize-none outline-none text-[15px] max-h-[120px]"
                rows={1}
              />
            ) : (
              <div className="py-1 text-gray-400 text-[15px]">
                {selectedType === 'image' && '🖼 Rasm tanlandi'}
                {selectedType === 'video' && '🎬 Video tanlandi'}
                {selectedType === 'audio' && '🎵 Ovoz yozildi'}
              </div>
            )}
          </div>

          {content.trim() ? (
            <button
              onClick={handleSend}
              disabled={isUploading || isSubmitting}
              className="p-2.5 bg-primary-500 rounded-full hover:bg-primary-600 transition-colors disabled:opacity-50"
            >
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
            </button>
          ) : (
            <button
              onClick={toggleRecording}
              disabled={isUploading}
              className={`p-2.5 rounded-full transition-colors ${isRecording ? 'bg-red-500 hover:bg-red-600' : 'hover:bg-gray-700'}`}
            >
              <svg className={`w-6 h-6 ${isRecording ? 'text-white' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
