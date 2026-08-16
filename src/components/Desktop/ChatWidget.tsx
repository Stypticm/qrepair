'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { MessageCircle, X, Send, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/stores/authStore';
import { useSafeArea } from '@/hooks/useSafeArea';
import { isAdminTelegramId } from '@/core/lib/admin';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Message } from '@/types/chat';
import { useChatStore } from '@/stores/chatStore';

export function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const messages = useChatStore(state => state.messages);
    const addMessage = useChatStore(state => state.addMessage);
    const clearMessages = useChatStore(state => state.clearMessages);
    const [isLoading, setIsLoading] = useState(false);
    const telegramId = useAppStore(state => state.telegramId);
    const username = useAppStore(state => state.username);
    const guestId = useAppStore(state => state.guestId);
    const { isNativeTelegram } = useSafeArea();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // If no telegramId and no guestId, generate one when opening
    useEffect(() => {
        if (isOpen && !telegramId && !guestId) {
            const newGuestId = `guest_${Math.random().toString(36).substring(2, 9)}`;
            useAppStore.setState({ guestId: newGuestId });
        }
    }, [isOpen, telegramId, guestId]);

    const activeId = telegramId || guestId;

    // Cleanup on exit
    useEffect(() => {
        if (!guestId) return;

        const handleUnload = () => {
            if (guestId) {
                const url = `/api/chats/cleanup?telegramId=${guestId}`;
                if (navigator.sendBeacon) {
                    navigator.sendBeacon(url);
                } else {
                    fetch(url, { method: 'DELETE', keepalive: true });
                }
            }
        };

        window.addEventListener('beforeunload', handleUnload);
        return () => window.removeEventListener('beforeunload', handleUnload);
    }, [guestId]);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading, scrollToBottom]);

    // Polling for Operator Replies
    useEffect(() => {
        if (!isOpen || !guestId) return;

        const interval = setInterval(async () => {
            try {
                const res = await fetch(`/api/agents/poll?guestId=${guestId}`);
                if (!res.ok) return;
                const data = await res.json();

                if (data.messages && data.messages.length > 0) {
                    data.messages.forEach((msg: any) => {
                        addMessage({
                            id: msg.id || crypto.randomUUID(),
                            senderId: 'admin',
                            senderType: 'admin',
                            text: msg.text,
                            createdAt: msg.createdAt || new Date().toISOString(),
                        });
                    });
                }
            } catch (err) {
                console.error('Polling error:', err);
            }
        }, 3000);

        return () => clearInterval(interval);
    }, [isOpen, guestId, addMessage]);

    const handleSendMessage = async () => {
        if (!input.trim() || !activeId || isLoading) return;

        const text = input.trim();
        setInput('');

        const userMsg: Message = {
            id: crypto.randomUUID(),
            senderId: activeId,
            senderType: 'user',
            text,
            createdAt: new Date().toISOString(),
        };
        addMessage(userMsg);
        setIsLoading(true);

        try {
            const reqId = `client_${crypto.randomUUID()}`;
            const res = await fetch('/api/agents/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: activeId,
                    requestId: reqId,
                    messages: [
                        ...messages.map(m => ({
                            role: m.senderType === 'user' ? 'user' : 'assistant',
                            content: m.text,
                        })),
                        {
                            role: 'user',
                            content: text,
                        },
                    ],
                }),
            });

            const data = await res.json();

            const botMsg: Message = {
                id: crypto.randomUUID(),
                senderId: 'bot',
                senderType: 'admin',
                text: data.ok ? data.reply : (data.reply || "Сервис временно недоступен, попробуйте через минуту."),
                createdAt: new Date().toISOString(),
                requestId: data.requestId || reqId,
            };
            addMessage(botMsg);
        } catch (error) {
            console.error('Failed to send message:', error);
            const errorMsg: Message = {
                id: crypto.randomUUID(),
                senderId: 'bot',
                senderType: 'admin',
                text: "Не удалось отправить сообщение. Проверьте подключение к сети.",
                createdAt: new Date().toISOString(),
            };
            addMessage(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    // For Telegram, we prefer opening a direct link to the support bot/manager
    const handleTelegramSupport = useCallback(() => {
        const supportLink = `https://t.me/${process.env.NEXT_PUBLIC_BOT_USERNAME || 'QoqosAppBot'}`;
        if (typeof window !== 'undefined') {
            window.open(supportLink, '_blank');
        }
    }, []);

    // Listen for custom events to open the chat
    useEffect(() => {
        const handleToggleChat = () => {
            setIsOpen(prev => !prev);
        };
        window.addEventListener('toggleChat', handleToggleChat);
        return () => window.removeEventListener('toggleChat', handleToggleChat);
    }, []);

    // Hide the chat widget for admin Telegram IDs
    // Correct way to handle body scroll lock
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            return () => {
                document.body.style.overflow = '';
            };
        }
    }, [isOpen]);

    const handleBackdropTouchMove = (e: React.TouchEvent) => {
        e.preventDefault();
    };

    // CRITICAL: Hooks must be called before this return
    // Плавающая кнопка убрана — чат открывается через нижнее меню (ClubNavigation).
    // Этот компонент рендерит только модальное окно чата.
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center pointer-events-auto px-4">
                    {/* Backdrop for mobile */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        onTouchMove={handleBackdropTouchMove}
                        className="fixed inset-0 bg-black/40 backdrop-blur-md pointer-events-auto"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-md max-h-[65dvh] bg-white/80 dark:bg-background/80 backdrop-blur-2xl border border-white/40 dark:border-white/10 shadow-2xl rounded-3xl overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-4 bg-gray-900 text-white flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                                    <MessageCircle size={20} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-sm">Ассистент QRepair</h3>
                                    <div className="flex items-center gap-1.5">
                                        {isLoading ? (
                                            <>
                                                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                                                <span className="text-[10px] text-gray-400 capitalize">Печатает...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                                <span className="text-[10px] text-gray-400 capitalize">В сети</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                                aria-label="Minimze chat"
                            >
                                <Minus size={20} />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
                            {messages.length === 0 ? (
                                <div className="flex flex-col items-start max-w-[80%] mr-auto">
                                    <div className="px-4 py-2.5 rounded-2xl text-sm shadow-sm bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white rounded-tl-none">
                                        Здравствуйте! Я на связи и готов помочь. Какой у вас вопрос?
                                    </div>
                                    <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 px-1">
                                        Администратор
                                    </span>
                                </div>
                            ) : (
                                messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={cn(
                                            "flex flex-col max-w-[80%]",
                                            msg.senderType === 'user' ? "ml-auto items-end" : "mr-auto items-start"
                                        )}
                                    >
                                        <div
                                            className={cn(
                                                "px-4 py-2.5 rounded-2xl text-sm shadow-sm",
                                                msg.senderType === 'user'
                                                    ? "bg-blue-600 text-white rounded-tr-none"
                                                    : "bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white rounded-tl-none"
                                            )}
                                        >
                                            {msg.text}
                                        </div>
                                        <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 px-1">
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                ))
                            )}
                            {isLoading && (
                                <div className="flex flex-col items-start max-w-[80%] mr-auto">
                                    <div className="px-4 py-3 rounded-2xl text-sm shadow-sm bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white rounded-tl-none flex items-center gap-1.5 h-10 w-16">
                                        <div className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                        <div className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                        <div className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" />
                                    </div>
                                    <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 px-1">
                                        Ассистент печатает...
                                    </span>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="p-4 bg-white/50 dark:bg-white/5 border-t border-gray-100 dark:border-white/10">
                            <div className="relative flex items-center gap-2">
                                <input
                                    type="text"
                                    placeholder="Напишите сообщение..."
                                    className="flex-1 bg-gray-100 dark:bg-white/5 border-none rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-gray-900 dark:text-white"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                />
                                <Button
                                    onClick={handleSendMessage}
                                    disabled={!input.trim() || isLoading}
                                    size="icon"
                                    className="rounded-xl bg-blue-600 hover:bg-blue-700 h-11 w-11 shrink-0 shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                                    aria-label="Send message"
                                >
                                    <Send size={18} />
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
