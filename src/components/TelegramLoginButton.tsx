'use client';

import { useEffect, useRef, useState } from 'react';
import { useAppStore } from '@/stores/authStore';
import { useSafeArea } from '@/hooks/useSafeArea';
import { useSignal, initDataState as _initDataState } from '@telegram-apps/sdk-react';

interface TelegramLoginButtonProps {
    botName?: string;
    onAuth?: (user: any) => void;
    className?: string;
}

export const TelegramLoginButton = ({
    botName = process.env.NEXT_PUBLIC_BOT_USERNAME || 'QoqosAppBot',
    onAuth,
    className = ''
}: TelegramLoginButtonProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const scriptLoadedRef = useRef(false);
    const [widgetState, setWidgetState] = useState<'loading' | 'loaded' | 'error' | 'domain_error'>('loading');
    const { setTelegramId, setUsername, setUserPhotoUrl, addDebugInfo, initializeTelegram } = useAppStore();
    const { isTelegram, isMobile: isMobilePlatform } = useSafeArea();
    const initDataState = useSignal(_initDataState);

    const [isPolling, setIsPolling] = useState(false);
    const [authUuid, setAuthUuid] = useState<string | null>(null);

    // Polling logic for PWA success
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isPolling && authUuid) {
            interval = setInterval(async () => {
                try {
                    const res = await fetch(`/api/auth/qr/check?uuid=${authUuid}`);
                    const data = await res.json();
                    if (data.status === 'success' && data.telegram_id) {
                        console.log('✅ PWA Auth Success via Polling:', data);
                        setTelegramId(data.telegram_id);
                        if (data.telegram_username) setUsername(data.telegram_username);
                        if (data.telegram_data?.photo_url) setUserPhotoUrl(data.telegram_data.photo_url);
                        if (onAuth) onAuth(data.telegram_data);
                        setWidgetState('loaded');
                        setIsPolling(false);
                        clearInterval(interval);
                    }
                } catch (e) {
                    console.error('Polling error:', e);
                }
            }, 2000);
        }
        return () => clearInterval(interval);
    }, [isPolling, authUuid, setTelegramId, setUsername, setUserPhotoUrl, onAuth]);

    // For TWA, we use the SDK's initData
    const handleTwaAuth = async (e?: React.MouseEvent) => {
        e?.preventDefault();
        e?.stopPropagation();

        const hasSDK = typeof window !== 'undefined' && !!(window as any).Telegram?.WebApp;
        addDebugInfo(`🚀 Клик: Вход через TWA (SDK: ${hasSDK})`);
        addDebugInfo(`📱 Платформа: TG=${isTelegram}, Mob=${isMobilePlatform}`);

        // Попытка инициализации TWA
        initializeTelegram(initDataState);

        const currentId = useAppStore.getState().telegramId;
        if (currentId) {
            addDebugInfo(`✅ TWA ID получен: ${currentId}`);
            if (onAuth) onAuth({ id: currentId });
        } else {
            addDebugInfo('⚠️ TWA данные не найдены, переключение на Bot-авторизацию...');
            await handleMobileAuth(e);
        }
    };

    const handleMobileAuth = async (e?: React.MouseEvent) => {
        e?.preventDefault();
        e?.stopPropagation();
        addDebugInfo('📱 Запуск процесса Bot-авторизации...');

        try {
            setWidgetState('loading');
            addDebugInfo('📡 Запрос UUID...');

            const res = await fetch('/api/auth/qr/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!res.ok) {
                let errorMsg = `HTTP ${res.status}`;
                try {
                    const errorData = await res.json();
                    errorMsg = errorData.message || errorData.error || errorMsg;
                    if (errorData.details) {
                        const details = typeof errorData.details === 'string'
                            ? errorData.details
                            : JSON.stringify(errorData.details);
                        errorMsg += ` (${details})`;
                    }
                } catch (e) { }
                throw new Error(errorMsg);
            }

            const data = await res.json();
            if (data.uuid) {
                addDebugInfo(`✅ UUID получен: ${data.uuid}`);
                setAuthUuid(data.uuid);
                setIsPolling(true);

                const botUser = botName;
                const url = `https://t.me/${botUser}?start=auth_${data.uuid}`;

                addDebugInfo(`🔗 Переход к @${botUser}...`);

                // Пробуем автоматический переход
                window.location.href = url;
            } else {
                addDebugInfo('❌ Ошибка: UUID не получен');
                setWidgetState('error');
            }
        } catch (e: any) {
            addDebugInfo(`❌ Ошибка: ${e.message}`);
            setWidgetState('error');
        }
    };

    // Возобновление опроса при возврате в приложение (важно для PWA)
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && authUuid) {
                addDebugInfo('📱 Приложение активно, проверка статуса авторизации...');
                setIsPolling(true);
            }
        };
        window.addEventListener('visibilitychange', handleVisibilityChange);
        return () => window.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [authUuid]);

    useEffect(() => {
        // Prevent double loading
        if (scriptLoadedRef.current) return;
        if (isTelegram || isMobilePlatform) {
            setWidgetState('loaded'); // Mark as loaded to show our mobile button
            return;
        }

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
    }, [botName, onAuth, setTelegramId, setUsername, setUserPhotoUrl, addDebugInfo, isMobilePlatform, isTelegram]);

    const buttonStyle = "w-full h-14 bg-gradient-to-r from-[#54A9EB] to-[#4397d7] hover:from-[#499cdc] hover:to-[#3b85bf] text-white font-bold rounded-2xl shadow-xl shadow-blue-500/20 transition-all flex items-center justify-center gap-3 active:scale-[0.98] relative overflow-hidden group";

    return (
        <div className={`telegram-login-wrapper ${className}`}>
            {(!isMobilePlatform && !isTelegram) && <div ref={containerRef} className="telegram-login-container min-h-[40px]" />}

            {(isMobilePlatform || isTelegram) && widgetState !== 'domain_error' && (
                <div className="space-y-3">
                    <button
                        onClick={isTelegram ? handleTwaAuth : handleMobileAuth}
                        disabled={isPolling && !authUuid}
                        className={buttonStyle}
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-sm">
                            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM16.64 8.8C16.49 10.38 15.86 14.12 15.54 15.84C15.41 16.56 15.14 16.81 14.88 16.83C14.32 16.89 13.89 16.47 13.35 16.11C12.5 15.55 12.02 15.2 11.2 14.66C10.25 14.04 10.86 13.7 11.41 13.13C11.55 12.98 14.05 10.71 14.1 10.51C14.11 10.48 14.11 10.38 14.05 10.33C14 10.28 13.92 10.3 13.86 10.31C13.77 10.34 11.66 11.73 10.61 12.44C10.45 12.55 10.31 12.6 10.18 12.6C10.04 12.6 9.77 12.52 9.56 12.45C9.31 12.37 9.11 12.32 9.13 12.19C9.14 12.12 9.24 12.04 9.43 11.95C10.61 11.44 14.47 9.84 15.4 9.45C16.63 8.94 16.8 8.8 17.07 8.8C17.13 8.8 17.27 8.82 17.36 8.89C17.44 8.95 17.46 9.04 17.46 9.11C17.46 9.18 17.45 9.25 17.43 9.32L16.64 8.8Z" fill="white" />
                        </svg>
                        <span className="relative">{isPolling ? 'Ожидание входа...' : 'Войти через Telegram'}</span>
                    </button>

                    {isPolling && authUuid && (
                        <div className="text-center animate-in fade-in slide-in-from-top-1 duration-300">
                            <a
                                href={`https://t.me/${botName}?start=auth_${authUuid}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-500 font-medium hover:underline flex items-center justify-center gap-1.5 p-2 bg-blue-50 rounded-xl"
                            >
                                <span>Не перебросило? Нажмите здесь</span>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                            </a>
                        </div>
                    )}
                </div>
            )}

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
