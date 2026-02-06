'use client';

import { useEffect, useRef, useState } from 'react';
import { useAppStore } from '@/stores/authStore';

interface TelegramLoginButtonProps {
    botName?: string;
    onAuth?: (user: any) => void;
    className?: string;
}

export const TelegramLoginButton = ({
    botName = process.env.NEXT_PUBLIC_BOT_USERNAME || 'qoqos_bot',
    onAuth,
    className = ''
}: TelegramLoginButtonProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const scriptLoadedRef = useRef(false);
    const [widgetState, setWidgetState] = useState<'loading' | 'loaded' | 'error' | 'domain_error'>('loading');
    const { setTelegramId, setUsername, setUserPhotoUrl, addDebugInfo } = useAppStore();

    useEffect(() => {
        // Prevent double loading
        if (scriptLoadedRef.current) return;

        // Check if we're on localhost - show warning
        const isLocalhost = typeof window !== 'undefined' &&
            (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

        if (isLocalhost) {
            console.warn('⚠️ Telegram Login Widget на localhost может не работать. Добавьте "localhost" в /setdomain в BotFather');
        }

        // Define the global callback function BEFORE loading the script
        (window as any).onTelegramAuth = (user: any) => {
            console.log('✅ Telegram Auth Success:', user);
            addDebugInfo(`Telegram Auth: ${user.id} (@${user.username || 'no username'})`);

            if (user?.id) {
                setTelegramId(user.id.toString());
                if (user.username) setUsername(user.username);
                if (user.photo_url) setUserPhotoUrl(user.photo_url);
                if (onAuth) onAuth(user);
                setWidgetState('loaded');
            }
        };

        // Load Telegram Widget Script
        if (containerRef.current && !scriptLoadedRef.current) {
            console.log('🔄 Loading Telegram widget for bot:', botName);

            // Clear container
            containerRef.current.innerHTML = '';

            const script = document.createElement('script');
            script.src = 'https://telegram.org/js/telegram-widget.js?22';
            script.async = true;
            script.setAttribute('data-telegram-login', botName);
            script.setAttribute('data-size', 'large');
            script.setAttribute('data-radius', '8');
            script.setAttribute('data-request-access', 'write');
            script.setAttribute('data-userpic', 'false');
            script.setAttribute('data-onauth', 'onTelegramAuth(user)');

            script.onload = () => {
                console.log('✅ Telegram widget script loaded');
                scriptLoadedRef.current = true;

                // Check if widget actually rendered or showed error
                setTimeout(() => {
                    if (containerRef.current) {
                        const hasError = containerRef.current.textContent?.includes('Bot domain invalid');
                        if (hasError) {
                            console.error('❌ Bot domain invalid error detected');
                            setWidgetState('domain_error');
                        } else {
                            setWidgetState('loaded');
                        }
                    }
                }, 500);
            };

            script.onerror = (error) => {
                console.error('❌ Failed to load Telegram widget:', error);
                setWidgetState('error');
            };

            containerRef.current.appendChild(script);

            // Fallback timeout
            const timeout = setTimeout(() => {
                if (!scriptLoadedRef.current) {
                    console.warn('⚠️ Telegram widget loading timeout');
                }
            }, 10000);

            return () => {
                clearTimeout(timeout);
            };
        }
    }, [botName, onAuth, setTelegramId, setUsername, setUserPhotoUrl, addDebugInfo]);

    return (
        <div className={`telegram-login-wrapper ${className}`}>
            <div ref={containerRef} className="telegram-login-container min-h-[40px]" />

            {widgetState === 'loading' && (
                <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
                    <div className="w-3 h-3 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                    <span>Загрузка...</span>
                </div>
            )}

            {widgetState === 'domain_error' && (
                <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm">
                    <p className="font-medium text-red-900 mb-2">❌ Bot domain invalid</p>
                    <div className="text-red-700 text-xs space-y-1">
                        <p>Откройте <a href="https://t.me/botfather" target="_blank" className="underline font-medium">@BotFather</a> в Telegram:</p>
                        <ol className="list-decimal list-inside space-y-1 ml-2">
                            <li>Отправьте команду: <code className="bg-red-100 px-1 rounded">/setdomain</code></li>
                            <li>Выберите бота: <code className="bg-red-100 px-1 rounded">@{botName}</code></li>
                            <li>Для production: <code className="bg-red-100 px-1 rounded">qrepair.vercel.app</code></li>
                            <li>Для разработки: <code className="bg-red-100 px-1 rounded">localhost</code></li>
                        </ol>
                        <p className="mt-2 text-xs text-red-600">После настройки перезагрузите страницу</p>
                    </div>

                    {/* Dev Mode: Manual Login */}
                    {(window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && (
                        <div className="mt-3 pt-3 border-t border-red-200">
                            <p className="text-xs text-gray-600 mb-2">🔧 Режим разработки:</p>
                            <button
                                onClick={() => {
                                    const devUser = {
                                        id: parseInt(process.env.NEXT_PUBLIC_DEV_TELEGRAM_ID || '0'),
                                        username: process.env.NEXT_PUBLIC_DEV_TELEGRAM_USERNAME || 'DevUser',
                                        first_name: 'Dev',
                                        last_name: 'User',
                                        photo_url: ''
                                    };
                                    console.log('🔧 Dev Mode Login:', devUser);
                                    setTelegramId(devUser.id.toString());
                                    setUsername(devUser.username);
                                    if (onAuth) onAuth(devUser);
                                    setWidgetState('loaded');
                                }}
                                className="w-full px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
                            >
                                Войти как Dev User (localhost)
                            </button>
                        </div>
                    )}
                </div>
            )}

            {widgetState === 'error' && (
                <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm">
                    <p className="font-medium text-amber-900 mb-1">⚠️ Не удалось загрузить виджет</p>
                    <p className="text-amber-700 text-xs">
                        Проверьте подключение к интернету или попробуйте перезагрузить страницу
                    </p>
                </div>
            )}
        </div>
    );
};

// Global type declaration
declare global {
    interface Window {
        onTelegramAuth: (user: any) => void;
    }
}
