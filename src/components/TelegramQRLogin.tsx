'use client';

import { useEffect, useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useAppStore } from '@/stores/authStore';

export const TelegramQRLogin = ({ onSuccess }: { onSuccess?: () => void }) => {
    const [uuid, setUuid] = useState<string | null>(null);
    const [status, setStatus] = useState<'loading' | 'pending' | 'success' | 'expired' | 'error'>('loading');
    const [botUsername, setBotUsername] = useState<string>('');
    const pollInterval = useRef<NodeJS.Timeout | null>(null);
    const { initializeTelegram, telegramId } = useAppStore(); // Get telegramId to check if already logged in

    const [errorDetails, setErrorDetails] = useState<string>('');

    // If we are already logged in via polling or store update
    useEffect(() => {
        if (status === 'success' && onSuccess) {
            const timer = setTimeout(() => {
                onSuccess();
            }, 2000); // Close after 2 seconds
            return () => clearTimeout(timer);
        }
    }, [status, onSuccess]);


    // 1. Initial Auth Request Creation
    useEffect(() => {
        // Fetch Bot Username from env
        const botName = process.env.NEXT_PUBLIC_BOT_USERNAME || 'QoqosAppBot';
        setBotUsername(botName);

        const createAuthRequest = async () => {
            try {
                const res = await fetch('/api/auth/qr/create', { method: 'POST' });

                if (!res.ok) {
                    // Try to parse error details
                    try {
                        const errData = await res.json();
                        const msg = errData.error && errData.details
                            ? `${errData.error} ${JSON.stringify(errData.details)}`
                            : errData.message || errData.error || res.statusText;
                        setErrorDetails(msg);
                    } catch (e) {
                        setErrorDetails(`HTTP Error: ${res.status} ${res.statusText}`);
                    }
                    setStatus('error');
                    return;
                }

                const data = await res.json();
                if (data.uuid) {
                    setUuid(data.uuid);
                    setStatus('pending');
                } else {
                    setErrorDetails('No UUID returned from server');
                    setStatus('error');
                }
            } catch (e: any) {
                console.error(e);
                setErrorDetails(e.message || 'Network request failed');
                setStatus('error');
            }
        };

        createAuthRequest();

        return () => {
            if (pollInterval.current) clearInterval(pollInterval.current);
        };
    }, []);

    // 2. Polling Logic
    useEffect(() => {
        if (!uuid || status !== 'pending') return;

        pollInterval.current = setInterval(async () => {
            try {
                const res = await fetch(`/api/auth/qr/check?uuid=${uuid}`);
                const data = await res.json();

                if (data.status === 'success') {
                    if (pollInterval.current) clearInterval(pollInterval.current);
                    setStatus('success');

                    // Update Global Store
                    useAppStore.setState({
                        telegramId: String(data.telegram_id),
                        username: data.telegram_username || data.telegram_data?.first_name || 'User',
                        userPhotoUrl: data.telegram_data?.photo_url || null,
                        isManualLogout: false
                    });
                } else if (data.status === 'expired') {
                    if (pollInterval.current) clearInterval(pollInterval.current);
                    setStatus('expired');
                }
            } catch (e) {
                console.error('Polling error', e);
            }
        }, 2000);

        return () => {
            if (pollInterval.current) clearInterval(pollInterval.current);
        };
    }, [uuid, status]);


    // 3. Render
    if (status === 'success') {
        return (
            <div className="flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-300">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Успешно!</h3>
                <p className="text-gray-500">Выполняется вход...</p>
            </div>
        );
    }

    const qrUrl = uuid && botUsername ? `https://t.me/${botUsername}?start=auth_${uuid}` : '';

    return (
        <div className="flex flex-col items-center p-4">
            <h3 className="text-lg font-bold text-gray-900 mb-6 text-center">Вход через Telegram</h3>

            <div className="relative group p-4 bg-white rounded-2xl shadow-sm border border-gray-100 min-h-[250px] min-w-[250px] flex items-center justify-center flex-col">
                {status === 'loading' && (
                    <div className="w-48 h-48 flex items-center justify-center text-gray-400">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                )}

                {status === 'pending' && uuid && (
                    <a href={qrUrl} target="_blank" rel="noopener noreferrer" className="block relative group-hover:scale-[1.02] transition-transform">
                        <QRCodeSVG
                            value={qrUrl}
                            size={192}
                            level="M"
                            className="rounded-lg"
                        />
                    </a>
                )}

                {status === 'error' && (
                    <div className="w-64 min-h-[12rem] flex items-center justify-center text-red-500 flex-col gap-2 p-2">
                        <span className="font-bold text-lg">Ошибка</span>
                        <div className="text-xs bg-red-50 p-3 rounded text-left break-all max-h-40 overflow-auto w-full border border-red-100 font-mono">
                            {errorDetails || 'Unknown error'}
                        </div>
                        <button
                            onClick={() => window.location.reload()}
                            className="text-sm bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg mt-2 transition-colors font-medium"
                        >
                            Попробовать снова
                        </button>
                    </div>
                )}

                {status === 'expired' && (
                    <div className="w-48 h-48 flex items-center justify-center text-orange-500 flex-col gap-2">
                        <span className="font-semibold">Код истек</span>
                        <button
                            onClick={() => window.location.reload()}
                            className="text-sm bg-orange-100 hover:bg-orange-200 text-orange-700 px-4 py-2 rounded-lg text-center transition-colors font-medium"
                        >
                            Обновить
                        </button>
                    </div>
                )}
            </div>

            <div className="mt-8 text-center max-w-xs">
                <p className="text-sm text-gray-400 mb-4 leading-relaxed">
                    1. Откройте камеру телефона<br />
                    2. Отсканируйте код<br />
                    3. Нажмите <b>Start</b> в боте
                </p>

            </div>
        </div>
    );
};
