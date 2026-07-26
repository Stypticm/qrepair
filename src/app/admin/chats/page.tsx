'use client';

import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useAppStore } from '@/stores/authStore';
import { isAdminTelegramId } from '@/core/lib/admin';
import { Button } from '@/components/ui/button';
import { Send, User, MessageCircle, ArrowLeft, ChevronLeft, Archive, ArchiveRestore, Trash2, Inbox, ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useSafeArea } from '@/hooks/useSafeArea';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface Message {
  id: string;
  senderId: string;
  senderType: 'user' | 'admin';
  text: string;
  createdAt: string;
}

type ChatStatus = 'active' | 'archived';

interface Chat {
  id: string;
  telegramId: string;
  userNickname: string | null;
  status: ChatStatus;
  updatedAt: string;
  messages: Message[];
}

function AdminChatsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const chatIdFromUrl = searchParams.get('id');

  const { telegramId } = useAppStore();
  const { isDesktop, isTelegram, isStandalone } = useSafeArea();

  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<ChatStatus>('active');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Robust mobile detection based on screen size
  const [isMobileView, setIsMobileView] = useState(true);

  useEffect(() => {
    const checkSize = () => {
      setIsMobileView(window.innerWidth < 1024);
    };
    checkSize();
    window.addEventListener('resize', checkSize);
    return () => window.removeEventListener('resize', checkSize);
  }, []);

  const fetchChats = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/chats?status=${activeTab}`, {
        headers: { 'x-telegram-id': telegramId || '' }
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setChats(data);
      }
    } catch (error) {
      console.error('Failed to fetch chats:', error);
    }
  }, [telegramId, activeTab]);

  const fetchChatMessages = useCallback(async (chatId: string) => {
    try {
      const res = await fetch(`/api/admin/chats/${chatId}`, {
        headers: { 'x-telegram-id': telegramId || '' }
      });
      const data = await res.json();
      if (data.messages) {
        setMessages(data.messages);
      }

      // Update selected chat status locally if it changed (e.g. from archived to active by new msg)
      if (data.status && selectedChat && data.status !== selectedChat.status) {
        setSelectedChat(prev => prev ? { ...prev, status: data.status } : null);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  }, [telegramId, selectedChat]);

  useEffect(() => {
    fetchChats();
    const interval = setInterval(fetchChats, 10000);
    return () => clearInterval(interval);
  }, [fetchChats]);

  useEffect(() => {
    if (selectedChat) {
      fetchChatMessages(selectedChat.id);
      const interval = setInterval(() => fetchChatMessages(selectedChat.id), 5000);
      return () => clearInterval(interval);
    }
  }, [selectedChat, fetchChatMessages]);

  // Sync selection with URL
  useEffect(() => {
    if (chats.length > 0) {
      if (chatIdFromUrl) {
        const chat = chats.find(c => c.id === chatIdFromUrl);
        if (chat) {
          setSelectedChat(chat);
          // If the chat from URL is archived but we are on Active tab, we might want to switch tabs
          // but for now let's just show it.
        }
      } else {
        setSelectedChat(null);
      }
    }
  }, [chatIdFromUrl, chats]);

  const handleSendMessage = async () => {
    if (!input.trim() || !selectedChat || !telegramId || isLoading) return;

    setIsLoading(true);
    const text = input.trim();
    setInput('');

    try {
      const res = await fetch(`/api/admin/chats/${selectedChat.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-telegram-id': telegramId
        },
        body: JSON.stringify({ text }),
      });

      if (res.ok) {
        fetchChatMessages(selectedChat.id);
        fetchChats();
        // If it was archived, it will become active and might disappear from current "Archive" tab view
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (chatId: string, newStatus: ChatStatus) => {
    try {
      const res = await fetch(`/api/admin/chats/${chatId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-telegram-id': telegramId || ''
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        toast.success(newStatus === 'archived' ? 'Чат архивирован' : 'Чат восстановлен');
        fetchChats();
        if (selectedChat?.id === chatId) {
          handleSelect(null);
        }
      }
    } catch (error) {
      toast.error('Ошибка при обновлении статуса');
    }
  };

  const handleSelect = (chatId: string | null) => {
    if (chatId) {
      router.replace(`/admin/chats?id=${chatId}`);
    } else {
      router.replace('/admin/chats');
    }
  };

  if (!isAdminTelegramId(telegramId)) {
    return <div className="p-8 text-center">Доступ запрещен</div>;
  }

  const renderSidebar = () => (
    <div className={cn(
      "bg-white dark:bg-[#0a0a0a] border-r border-gray-100 dark:border-white/5 flex flex-col h-full transition-all duration-300",
      isMobileView ? "w-full" : "w-80"
    )}>
      <div className={cn(
        "p-4 border-b border-gray-100 dark:border-white/5 flex flex-col gap-4 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md sticky top-0 z-20",
        isMobileView && "pt-[calc(1rem+env(safe-area-inset-top,0px))]"
      )}>
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-lg text-gray-900 dark:text-white">Чаты</h2>
          <Link href="/admin">
            <Button variant="ghost" size="sm" className="h-8 px-2 text-blue-600 dark:text-blue-400 font-bold">
              <ArrowLeft size={16} className="mr-1" /> Админ панель
            </Button>
          </Link>
        </div>

        {/* Status Tabs */}
        <div className="flex bg-gray-100 dark:bg-white/10 p-1 rounded-xl translate-z-0">
          <button
            onClick={() => setActiveTab('active')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-bold rounded-lg transition-all",
              activeTab === 'active' ? "bg-white dark:bg-white/10 text-blue-600 dark:text-blue-400 shadow-sm" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            )}
          >
            <Inbox size={14} />
            Активные
          </button>
          <button
            onClick={() => setActiveTab('archived')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-bold rounded-lg transition-all",
              activeTab === 'archived' ? "bg-white dark:bg-white/10 text-blue-600 dark:text-blue-400 shadow-sm" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            )}
          >
            <Archive size={14} />
            Архив
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {chats.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400 text-sm">
            {activeTab === 'active' ? 'Нет активных чатов' : 'Архив пуст'}
          </div>
        ) : (
          chats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => handleSelect(chat.id)}
              className={cn(
                "w-full p-4 flex items-start gap-3 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors border-b border-gray-100 dark:border-white/5",
                selectedChat?.id === chat.id && !isMobileView && "bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-50 dark:hover:bg-blue-900/20 border-r-4 border-r-blue-600"
              )}
            >
              <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center shrink-0">
                <User size={20} className="text-gray-400 dark:text-gray-500" />
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-semibold text-sm truncate text-gray-900 dark:text-white">
                    {chat.userNickname || `ID: ${chat.telegramId}`}
                  </span>
                  <span className="text-[10px] text-gray-400 dark:text-gray-500">
                    {new Date(chat.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {chat.messages?.[0]?.text || 'Нет сообщений'}
                </p>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );

  const renderChatArea = () => (
    <div className="flex-1 flex flex-col min-w-0 h-full bg-[#f0f2f5] dark:bg-[#0a0a0a]">
      {selectedChat ? (
        <>
          {/* Header */}
          <div className={cn(
            "p-3 bg-white dark:bg-[#0a0a0a] border-b border-gray-100 dark:border-white/5 flex items-center justify-between shadow-sm z-10 sticky top-0",
            isMobileView && "pt-[calc(0.75rem+env(safe-area-inset-top,0px))]"
          )}>
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {isMobileView && !isStandalone && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 -ml-2 text-gray-400 dark:text-gray-500"
                  onClick={() => handleSelect(null)}
                >
                  <ChevronLeft size={24} />
                </Button>
              )}
              <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center shrink-0">
                <User size={18} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-sm truncate leading-tight text-gray-900 dark:text-white">
                  {selectedChat.userNickname || 'Пользователь'}
                </h3>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">ID: {selectedChat.telegramId}</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Create Order Button */}
              <Button
                variant="ghost"
                size="sm"
                className="h-9 px-2 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                onClick={() => {
                  const name = selectedChat.userNickname || '';
                  const telegramId = selectedChat.telegramId || '';
                  router.push(`/admin/orders?create=true&name=${encodeURIComponent(name)}&telegramId=${encodeURIComponent(telegramId)}`);
                }}
              >
                <ShoppingCart size={16} className="mr-1" /> Создать заказ
              </Button>

              {/* Archive Toggle Button */}
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-9 px-2 text-xs font-bold",
                  selectedChat.status === 'active' ? "text-gray-400 dark:text-gray-500 hover:text-amber-600 dark:hover:text-amber-400" : "text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300"
                )}
                onClick={() => handleStatusUpdate(selectedChat.id, selectedChat.status === 'active' ? 'archived' : 'active')}
              >
                {selectedChat.status === 'active' ? (
                  <><Archive size={16} className="mr-1" /> В архив</>
                ) : (
                  <><ArchiveRestore size={16} className="mr-1" /> Восстановить</>
                )}
              </Button>

              {isMobileView && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 px-2 text-xs text-blue-600 dark:text-blue-400 font-bold"
                  onClick={() => handleSelect(null)}
                >
                  <ChevronLeft size={16} className="mr-1" /> Чаты
                </Button>
              )}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-12 w-full">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex flex-col w-full",
                  msg.senderType === 'admin' ? "items-end" : "items-start"
                )}
              >
                <div
                  className={cn(
                    "px-4 py-2 rounded-2xl text-[13px] shadow-sm leading-relaxed max-w-[85%] sm:max-w-[70%] break-words",
                    msg.senderType === 'admin'
                      ? "bg-blue-600 text-white rounded-tr-none"
                      : "bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white rounded-tl-none"
                  )}
                >
                  {msg.text}
                </div>
                <span className="text-[9px] text-gray-400 dark:text-gray-500 mt-1 px-1">
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
            <div ref={messagesEndRef} className="h-0 w-0" />
          </div>

          {/* Input Area */}
          <div className={cn(
            "p-3 bg-white dark:bg-[#0a0a0a] border-t border-gray-100 dark:border-white/5",
            isMobileView && "pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]"
          )}>
            <div className="flex items-center gap-2 max-w-4xl mx-auto">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Напишите ответ..."
                  className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-gray-900 dark:text-white"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                />
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={!input.trim() || isLoading}
                size="icon"
                className="rounded-2xl bg-blue-600 hover:bg-blue-700 h-11 w-11 shrink-0 shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center p-0"
              >
                <Send size={18} className="text-white" />
              </Button>
            </div>
          </div>
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400 dark:text-gray-500 p-8">
          <div className="w-20 h-20 bg-white dark:bg-[#1a1a1a] rounded-3xl flex items-center justify-center mb-6 shadow-sm ring-1 ring-gray-100 dark:ring-white/10">
            <MessageCircle size={40} className="text-gray-200 dark:text-gray-700" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Выберите чат</h3>
          <p className="max-w-xs text-sm text-gray-500 dark:text-gray-400">
            Выберите пользователя из списка слева, чтобы начать переписку.
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div className={cn(
      "flex h-[100dvh] w-full bg-gray-100 dark:bg-[#0a0a0a] overflow-hidden",
      !isMobileView && "pt-20" // Header offset for desktop
    )}>
      {/* Mobile Logic: Either List or Chat */}
      {isMobileView ? (
        selectedChat ? renderChatArea() : renderSidebar()
      ) : (
        <>
          {renderSidebar()}
          {renderChatArea()}
        </>
      )}
    </div>
  );
}

export default function AdminChatsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">Загрузка чатов...</div>}>
      <AdminChatsContent />
    </Suspense>
  );
}
