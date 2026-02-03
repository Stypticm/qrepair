'use client';

import { useEffect, useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useAppStore } from '@/stores/authStore';
import { motion, AnimatePresence } from 'framer-motion';

export const TelegramQRLogin = () => {
    const [uuid, setUuid] = useState<string | null>(null);
    const [status, setStatus] = useState<'loading' | 'pending' | 'success' | 'expired' | 'error'>('loading');
    const [botUsername, setBotUsername] = useState<string>('');
    const pollInterval = useRef<NodeJS.Timeout | null>(null);
    const { initializeTelegram } = useAppStore();

    useEffect(() => {
        // Fetch Bot Username
        // In local, use .env.local override if present, otherwise default
        const botName = process.env.NEXT_PUBLIC_BOT_USERNAME || 'QoqosAppBot';
        setBotUsername(botName);

        // Generate Auth Request
        const createAuthRequest = async () => {
            try {
                const res = await fetch('/api/auth/qr/create', { method: 'POST' });
                const data = await res.json();
                if (data.uuid) {
                    setUuid(data.uuid);
                    setStatus('pending');
                } else {
                    setStatus('error');
                }
            } catch (e) {
                console.error(e);
                setStatus('error');
            }
        };

        createAuthRequest();

        return () => {
            if (pollInterval.current) clearInterval(pollInterval.current);
        };
    }, []);

    useEffect(() => {
        if (!uuid || status !== 'pending') return;

        // Poll for updates
        pollInterval.current = setInterval(async () => {
            try {
                const res = await fetch(`/api/auth/qr/check?uuid=${uuid}`);
                const data = await res.json();

                if (data.status === 'success') {
                    if (pollInterval.current) clearInterval(pollInterval.current);
                    setStatus('success');

                    // Log in the user
                    // We need to construct a user object compatible with what authStore expects
                    // authStore expects partial user data
                    // We might need to map manual fields or just use what we have

                    useAppStore.setState({
                        telegramId: String(data.telegram_id),
                        username: data.telegram_username || data.telegram_data?.first_name || 'User',
                        userPhotoUrl: data.telegram_data?.photo_url || null, // Note: standard bot doesn't permit photo_url easily in messages unless we ask for it specifically or get it from getChat.
                        // For now we might not have photo.
                        isManualLogout: false
                    });

                    // Persist logic handled by store usually? 
                    // initializeTelegram usually handles Telegram WebApp initData but here we are manual.
                    // We should likely just set the state directly.
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

            <div className="relative group p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
                {status === 'loading' && (
                    <div className="w-48 h-48 flex items-center justify-center text-gray-400">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                )}

                {status === 'pending' && uuid && (
                    <a href={qrUrl} target="_blank" rel="noopener noreferrer" className="block">
                        <QRCodeSVG
                            value={qrUrl}
                            size={192}
                            level="M"
                            className="rounded-lg"
                        />
                    </a>
                )}

                {status === 'error' && (
                    <div className="w-48 h-48 flex items-center justify-center text-red-500 flex-col gap-2">
                        <span>Ошибка</span>
                        <button onClick={() => window.location.reload()} className="text-sm underline">Попробовать снова</button>
                    </div>
                )}

                {status === 'expired' && (
                    <div className="w-48 h-48 flex items-center justify-center text-orange-500 flex-col gap-2">
                        <span>Код истек</span>
                        <button onClick={() => window.location.reload()} className="text-sm underline">Обновить</button>
                    </div>
                )}
            </div>

            <div className="mt-8 text-center max-w-xs">
                <p className="text-sm text-gray-500 mb-2">
                    1. Откройте камеру телефона<br />
                    2. Отсканируйте код<br />
                    3. Нажмите <b>Start</b> в боте
                </p>
            </div>
        </div>
    );
};
