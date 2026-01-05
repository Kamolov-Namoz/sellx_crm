'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useToast } from '@/contexts/ToastContext';
import { useAuth } from '@/contexts/AuthContext';
import { projectChatService, ChatMessage, ProjectInfo, TaskAttachment } from '@/services/projectChat.service';
import { projectTaskService } from '@/services/projectTask.service';
import { uploadService } from '@/services/upload.service';

export default function DeveloperProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [projectInfo, setProjectInfo] = useState<ProjectInfo | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'info' | 'chat'>('info');
  const toast = useToast();

  const fetchData = async () => {
    try {
      const [infoRes, messagesRes] = await Promise.all([
        projectChatService.getProjectInfo(params.id as string),
        projectChatService.getMessages(params.id as string),
      ]);
      if (infoRes.success) setProjectInfo(infoRes.data || null);
      if (messagesRes.success) setMessages(messagesRes.data?.messages || []);
    } catch {
      toast.error('Ma\'lumotlarni yuklashda xatolik');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [params.id]);

  const handleAcceptTask = async (taskId: string) => {
    try {
      await projectTaskService.acceptTask(taskId);
      toast.success('Vazifa tasdiqlandi!');
      fetchData();
    } catch {
      toast.error('Xatolik yuz berdi');
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute requiredRole="developer">
        <div className="min-h-screen bg-[#0e1621] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </ProtectedRoute>
    );
  }

  if (!projectInfo) {
    return (
      <ProtectedRoute requiredRole="developer">
        <div className="min-h-screen bg-[#0e1621] flex items-center justify-center">
          <p className="text-gray-500">Loyiha topilmadi</p>
        </div>
      </ProtectedRoute>
    );
  }

  // Faqat mening vazifalarim
  const myTasks = projectInfo.tasks.filter(t => {
    const dev = t.developerId as any;
    return dev?._id === user?.userId;
  });

  return (
    <ProtectedRoute requiredRole="developer">
      <div className="min-h-screen bg-[#0e1621] flex flex-col">
        <header className="bg-[#17212b] text-white sticky top-0 z-50 safe-top">
          <div className="flex items-center gap-3 px-4 py-3">
            <button onClick={() => router.back()} className="p-1 hover:bg-white/10 rounded-full">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex-1">
              <h1 className="font-semibold truncate">{projectInfo.title}</h1>
              <span className="text-xs text-gray-400">{projectInfo.progress}% tugallangan</span>
            </div>
          </div>
          <div className="flex border-b border-dark-700">
            <button onClick={() => setActiveTab('info')} className={`flex-1 py-3 text-sm font-medium ${activeTab === 'info' ? 'text-primary-400 border-b-2 border-primary-400' : 'text-gray-400'}`}>
              Vazifalar
            </button>
            <button onClick={() => setActiveTab('chat')} className={`flex-1 py-3 text-sm font-medium ${activeTab === 'chat' ? 'text-primary-400 border-b-2 border-primary-400' : 'text-gray-400'}`}>
              Chat
            </button>
          </div>
        </header>

        {activeTab === 'info' ? (
          <main className="flex-1 overflow-y-auto p-4 pb-20">
            <div className="bg-dark-800 rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-400">Mening progressim</span>
                <span className="text-2xl font-bold text-primary-400">
                  {myTasks.length > 0 ? Math.round((myTasks.filter(t => t.isAccepted).length / myTasks.length) * 100) : 0}%
                </span>
              </div>
              <div className="w-full bg-dark-700 rounded-full h-3">
                <div className="bg-primary-500 h-3 rounded-full" style={{ width: `${myTasks.length > 0 ? (myTasks.filter(t => t.isAccepted).length / myTasks.length) * 100 : 0}%` }} />
              </div>
              <p className="text-xs text-gray-500 mt-2">{myTasks.filter(t => t.isAccepted).length} / {myTasks.length} vazifa bajarildi</p>
            </div>

            <h2 className="text-white font-semibold mb-3">Mening vazifalarim</h2>
            {myTasks.length > 0 ? (
              <div className="space-y-3">
                {myTasks.map((task) => (
                  <div key={task._id} className={`bg-dark-800 rounded-xl p-4 ${task.isAccepted ? 'border border-green-500/30' : ''}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium text-white flex-1">{task.title}</h3>
                      {task.isAccepted && <span className="text-green-400">✓</span>}
                    </div>
                    {task.description && (
                      <p className="text-sm text-gray-400 mb-3">{task.description}</p>
                    )}
                    {/* Attachments */}
                    {task.attachments && task.attachments.length > 0 && (
                      <div className="mb-3 space-y-2">
                        <p className="text-xs text-gray-500">Biriktirilgan fayllar:</p>
                        {task.attachments.map((att, idx) => (
                          <div key={idx} className="bg-dark-700 rounded-lg p-2">
                            {att.type === 'image' && (
                              <img src={uploadService.getFullUrl(att.url)} alt={att.fileName || 'Rasm'} className="rounded-lg max-w-full max-h-48 object-contain" />
                            )}
                            {att.type === 'video' && (
                              <video src={uploadService.getFullUrl(att.url)} controls className="rounded-lg max-w-full max-h-48" />
                            )}
                            {att.type === 'audio' && (
                              <audio src={uploadService.getFullUrl(att.url)} controls className="w-full" />
                            )}
                            {att.fileName && <p className="text-xs text-gray-400 mt-1">{att.fileName}</p>}
                          </div>
                        ))}
                      </div>
                    )}
                    <div className={`text-xs px-2 py-1 rounded inline-block mb-3 ${task.isAccepted ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                      {task.isAccepted ? 'Tasdiqlangan' : 'Kutilmoqda'}
                    </div>
                    {!task.isAccepted && (
                      <button onClick={() => handleAcceptTask(task._id)} className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-xl flex items-center justify-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Bajarildi - Tasdiqlash
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Bu loyihada sizga vazifa berilmagan</p>
              </div>
            )}
          </main>
        ) : (
          <DeveloperChatTab projectId={params.id as string} messages={messages} onNewMessage={(msg) => setMessages(prev => [...prev, msg])} />
        )}
      </div>
    </ProtectedRoute>
  );
}

function DeveloperChatTab({ projectId, messages, onNewMessage }: { projectId: string; messages: ChatMessage[]; onNewMessage: (msg: ChatMessage) => void; }) {
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSendText = async () => {
    if (!newMessage.trim() || isSending) return;
    setIsSending(true);
    try {
      const res = await projectChatService.sendMessage(projectId, { type: 'text', content: newMessage.trim() });
      if (res.success && res.data) { onNewMessage(res.data); setNewMessage(''); }
    } catch { toast.error('Xabar yuborishda xatolik'); }
    finally { setIsSending(false); }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const uploadRes = await uploadService.uploadFile(file);
      if (uploadRes.success && uploadRes.data) {
        const type = file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : 'audio';
        const res = await projectChatService.sendMessage(projectId, { type: type as any, content: uploadRes.data.url, metadata: { fileName: uploadRes.data.originalName, fileSize: uploadRes.data.size, mimeType: uploadRes.data.mimeType } });
        if (res.success && res.data) onNewMessage(res.data);
      }
    } catch { toast.error('Fayl yuklashda xatolik'); }
    finally { setIsUploading(false); if (fileInputRef.current) fileInputRef.current.value = ''; }
  };

  const getMediaUrl = (url: string) => uploadService.getFullUrl(url);

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center py-8"><p className="text-gray-500">Xabarlar yo'q</p></div>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.senderId._id === user?.userId;
            return (
              <div key={msg._id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl p-3 ${isOwn ? 'bg-primary-500 text-white' : 'bg-dark-700 text-white'}`}>
                  {!isOwn && <p className="text-xs text-gray-400 mb-1">{msg.senderId.firstName} {msg.senderId.lastName}</p>}
                  {msg.type === 'text' && <p>{msg.content}</p>}
                  {msg.type === 'image' && <img src={getMediaUrl(msg.content)} alt="" className="rounded-lg max-w-full" />}
                  {msg.type === 'video' && <video src={getMediaUrl(msg.content)} controls className="rounded-lg max-w-full" />}
                  {msg.type === 'audio' && <audio src={getMediaUrl(msg.content)} controls className="w-full" />}
                  {msg.type === 'task' && msg.taskId && <div className="bg-dark-600 rounded-lg p-2"><p className="text-xs text-gray-400">Yangi vazifa:</p><p className="font-medium">{msg.taskId.title}</p></div>}
                  <p className={`text-xs mt-1 ${isOwn ? 'text-white/70' : 'text-gray-500'}`}>{new Date(msg.createdAt).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="bg-dark-800 p-3 border-t border-dark-700 safe-bottom">
        <div className="flex items-center gap-2">
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*,video/*,audio/*" className="hidden" />
          <button onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="p-2 text-gray-400 hover:text-white disabled:opacity-50">
            {isUploading ? <div className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" /> : <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>}
          </button>
          <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendText()} placeholder="Xabar yozing..." className="flex-1 bg-dark-700 rounded-full px-4 py-2 text-white placeholder-gray-500 focus:outline-none" />
          <button onClick={handleSendText} disabled={!newMessage.trim() || isSending} className="p-2 text-primary-400 hover:text-primary-300 disabled:opacity-50">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
