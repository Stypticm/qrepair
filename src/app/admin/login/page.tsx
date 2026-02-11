'use client';

import { TelegramQRLogin } from '@/components/TelegramQRLogin';
import { useAppStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { isAdminTelegramId } from '@/core/lib/admin';

export default function AdminLoginPage() {
    const { telegramId } = useAppStore();
    const router = useRouter();

    useEffect(() => {
        if (telegramId) {
            if (isAdminTelegramId(telegramId)) {
                router.push('/admin');
            } else {
                // Если пользователь не админ, но авторизован - можно показать ошибку или просто оставить на странице
                // пока просто редиректим на главную для чистоты
                alert('У вас нет прав администратора');
                router.push('/');
            }
        }
    }, [telegramId, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 mx-4">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Вход в админ-панель</h1>
                    <p className="text-gray-500">
                        Используйте Telegram для входа
                    </p>
                </div>

                <div className="flex justify-center">
                    <TelegramQRLogin
                        botName="QoqosAppBot"
                        onSuccess={() => {
                            // Redirection handled by useEffect
                            console.log('Admin auth success');
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
