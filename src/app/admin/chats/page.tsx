'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAppStore } from '@/stores/authStore';
import { isAdminTelegramId } from '@/core/lib/admin';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Send, User, MessageCircle, ArrowLeft, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useSafeArea } from '@/hooks/useSafeArea';

interface Message {
  id: string;
  senderId: string;
  senderType: 'user' | 'admin';
  text: string;
  createdAt: string;
}

interface Chat {
  id: string;
  userTelegramId: string;
  userNickname: string | null;
  updatedAt: string;
  messages: Message[];
}

export default function AdminChatsPage() {
  const { telegramId } = useAppStore();
  const { isDesktop, isTelegram } = useSafeArea();
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mobile mode if not on desktop
  const isMobileView = !isDesktop;

  const fetchChats = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/chats', {
        headers: { 'x-telegram-id': telegramId || '' }
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setChats(data);
      }
    } catch (error) {
      console.error('Failed to fetch chats:', error);
    }
  }, [telegramId]);

  const fetchChatMessages = useCallback(async (chatId: string) => {
    try {
      const res = await fetch(`/api/admin/chats/${chatId}`, {
        headers: { 'x-telegram-id': telegramId || '' }
      });
      const data = await res.json();
      if (data.messages) {
        setMessages(data.messages);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  }, [telegramId]);

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
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAdminTelegramId(telegramId)) {
    return <div className="p-8 text-center">Доступ запрещен</div>;
  }

  const renderSidebar = () => (
    <div className={cn(
      "bg-white border-r flex flex-col h-full transition-all duration-300",
      isMobileView ? "w-full" : "w-80"
    )}>
      <div className={cn(
        "p-4 border-b flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-20",
        isTelegram && "pt-[calc(1rem+env(safe-area-inset-top,0px))]"
      )}>
        <h2 className="font-bold text-lg">Чаты</h2>
        <Link href="/admin">
          <Button variant="ghost" size="sm" className="h-8 px-2">
            <ArrowLeft size={16} className="mr-1" /> Админ
          </Button>
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto">
        {chats.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">Нет активных чатов</div>
        ) : (
          chats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => setSelectedChat(chat)}
              className={cn(
                "w-full p-4 flex items-start gap-3 hover:bg-gray-50 transition-colors border-b",
                selectedChat?.id === chat.id && !isMobileView && "bg-blue-50 hover:bg-blue-50 border-r-4 border-r-blue-600"
              )}
            >
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                <User size={20} className="text-gray-400" />
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-semibold text-sm truncate">
                    {chat.userNickname || `ID: ${chat.userTelegramId}`}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {new Date(chat.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-gray-500 truncate">
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
    <div className="flex-1 flex flex-col min-w-0 h-full bg-[#f0f2f5]">
      {selectedChat ? (
        <>
          {/* Header */}
          <div className={cn(
            "p-3 bg-white border-b flex items-center justify-between shadow-sm z-10 sticky top-0",
            isTelegram && isMobileView && "pt-[calc(0.75rem+env(safe-area-inset-top,0px))]"
          )}>
            <div className="flex items-center gap-2">
              {isMobileView && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 -ml-2 text-gray-400"
                  onClick={() => setSelectedChat(null)}
                >
                  <ChevronLeft size={24} />
                </Button>
              )}
              <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                <User size={18} className="text-blue-600" />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-sm truncate leading-tight">
                  {selectedChat.userNickname || 'Пользователь'}
                </h3>
                <p className="text-[10px] text-gray-500">ID: {selectedChat.userTelegramId}</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-8">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex flex-col max-w-[85%] sm:max-w-[70%]",
                  msg.senderType === 'admin' ? "ml-auto items-end" : "mr-auto items-start"
                )}
              >
                <div
                  className={cn(
                    "px-4 py-2 rounded-2xl text-[13px] shadow-sm leading-relaxed",
                    msg.senderType === 'admin'
                      ? "bg-blue-600 text-white rounded-tr-none"
                      : "bg-white text-gray-900 rounded-tl-none"
                  )}
                >
                  {msg.text}
                </div>
                <span className="text-[9px] text-gray-400 mt-1 px-1">
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className={cn(
            "p-3 bg-white border-t",
            isTelegram && isMobileView && "pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]"
          )}>
            <div className="flex items-center gap-2 max-w-4xl mx-auto">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Напишите ответ..."
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
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
        <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400 p-8">
          <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mb-6 shadow-sm ring-1 ring-gray-100">
            <MessageCircle size={40} className="text-gray-200" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Выберите чат</h3>
          <p className="max-w-xs text-sm text-gray-500">
            Выберите пользователя из списка слева, чтобы начать переписку.
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div className={cn(
      "flex h-screen bg-gray-100",
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
