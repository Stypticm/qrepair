'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { MessageCircle, X, Send, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/stores/authStore';
import { useSafeArea } from '@/hooks/useSafeArea';
import { isAdminTelegramId } from '@/core/lib/admin';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Message {
    id: string;
    senderId: string;
    senderType: 'user' | 'admin';
    text: string;
    createdAt: string;
}

export function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const telegramId = useAppStore(state => state.telegramId);
    const username = useAppStore(state => state.username);
    const guestId = useAppStore(state => state.guestId);
    const { isTelegram, isDesktop } = useSafeArea();
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

    const fetchChat = useCallback(async () => {
        if (!activeId) return;
        try {
            const res = await fetch(`/api/chats?telegramId=${activeId}`);
            const data = await res.json();
            if (data.messages) {
                setMessages(data.messages);
            }
        } catch (error) {
            console.error('Failed to fetch chat:', error);
        }
    }, [activeId]);

    useEffect(() => {
        if (isOpen && activeId) {
            fetchChat();
            const interval = setInterval(fetchChat, 5000); // Polling every 5 seconds
            return () => clearInterval(interval);
        }
    }, [isOpen, activeId, fetchChat]);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    const handleSendMessage = async () => {
        if (!input.trim() || !activeId || isLoading) return;

        setIsLoading(true);
        const text = input.trim();
        setInput('');

        try {
            const res = await fetch('/api/chats', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    telegramId: activeId,
                    username: username || 'Гость',
                    text,
                }),
            });

            if (res.ok) {
                fetchChat();
            }
        } catch (error) {
            console.error('Failed to send message:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // For Telegram, we prefer opening a direct link to the support bot/manager
    const handleTelegramSupport = useCallback(() => {
        const supportLink = 'https://t.me/qoqos_support';
        if (typeof window !== 'undefined') {
            window.open(supportLink, '_blank');
        }
    }, []);

    // Listen for custom events to open the chat
    useEffect(() => {
        const handleToggleChat = () => {
            if (isTelegram && !isDesktop) {
                handleTelegramSupport();
            } else {
                setIsOpen(prev => !prev);
            }
        };
        window.addEventListener('toggleChat', handleToggleChat);
        return () => window.removeEventListener('toggleChat', handleToggleChat);
    }, [isTelegram, isDesktop, handleTelegramSupport]);

    // Hide the chat widget for admin Telegram IDs
    // CRITICAL: Hooks must be called before this return
    if (isAdminTelegramId(telegramId)) return null;

    // On mobile (non-desktop), we don't show floating buttons anymore as they are in the menu
    if (!isDesktop) return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[10000] flex items-end justify-center pointer-events-none p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="pointer-events-auto w-full max-w-md h-[80vh] bg-white/80 backdrop-blur-2xl border border-white/40 shadow-2xl rounded-3xl overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-4 bg-gray-900 text-white flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                                    <MessageCircle size={20} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-sm">Поддержка Qoqos</h3>
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                        <span className="text-[10px] text-gray-400 capitalize">Оператор онлайн</span>
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
                                <div className="h-full flex flex-col items-center justify-center text-center px-6">
                                    <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
                                        <MessageCircle size={32} className="text-gray-300" />
                                    </div>
                                    <h4 className="font-medium text-gray-900 mb-1">Задайте нам вопрос</h4>
                                    <p className="text-sm text-gray-500">
                                        Опишите вашу проблему или задайте интересующий вопрос, и наш оператор ответит вам в ближайшее время.
                                    </p>
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
                                                    : "bg-gray-100 text-gray-900 rounded-tl-none"
                                            )}
                                        >
                                            {msg.text}
                                        </div>
                                        <span className="text-[10px] text-gray-400 mt-1 px-1">
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                ))
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="p-4 bg-white/50 border-t border-gray-100">
                            <div className="relative flex items-center gap-2">
                                <input
                                    type="text"
                                    placeholder="Напишите сообщение..."
                                    className="flex-1 bg-gray-100 border-none rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
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

    return (
        <div className="fixed bottom-6 right-6 z-[100]">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="mb-4 w-[calc(100vw-32px)] md:w-[380px] h-[70vh] md:h-[550px] bg-white/80 backdrop-blur-2xl border border-white/40 shadow-2xl rounded-3xl overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-4 bg-gray-900 text-white flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                                    <MessageCircle size={20} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-sm">Поддержка Qoqos</h3>
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                        <span className="text-[10px] text-gray-400 capitalize">Оператор онлайн</span>
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
                                <div className="h-full flex flex-col items-center justify-center text-center px-6">
                                    <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
                                        <MessageCircle size={32} className="text-gray-300" />
                                    </div>
                                    <h4 className="font-medium text-gray-900 mb-1">Задайте нам вопрос</h4>
                                    <p className="text-sm text-gray-500">
                                        Опишите вашу проблему или задайте интересующий вопрос, и наш оператор ответит вам в ближайшее время.
                                    </p>
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
                                                    : "bg-gray-100 text-gray-900 rounded-tl-none"
                                            )}
                                        >
                                            {msg.text}
                                        </div>
                                        <span className="text-[10px] text-gray-400 mt-1 px-1">
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                ))
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="p-4 bg-white/50 border-t border-gray-100">
                            <div className="relative flex items-center gap-2">
                                <input
                                    type="text"
                                    placeholder="Напишите сообщение..."
                                    className="flex-1 bg-gray-100 border-none rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
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
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "h-16 w-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300",
                    isOpen ? "bg-white text-gray-900 rotate-90" : "bg-gray-900 text-white"
                )}
                aria-label={isOpen ? "Close chat" : "Open chat"}
            >
                {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
            </motion.button>
        </div>
    );
}
