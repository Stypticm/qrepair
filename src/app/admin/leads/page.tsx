'use client';

import { Suspense } from 'react';
import { LeadsListClient } from './LeadsListClient';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ShoppingBag, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/stores/authStore';
import { isAdminTelegramId } from '@/core/lib/admin';
import { useEffect, useState } from 'react';

export default function LeadsPage() {
    const router = useRouter();
    const { telegramId } = useAppStore();
    const [accessDenied, setAccessDenied] = useState<boolean | null>(null);

    useEffect(() => {
        if (telegramId) {
            setAccessDenied(!isAdminTelegramId(telegramId));
        } else {
            const timer = setTimeout(() => {
                if (!useAppStore.getState().telegramId) {
                    setAccessDenied(true);
                } else {
                    setAccessDenied(!isAdminTelegramId(useAppStore.getState().telegramId));
                }
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [telegramId]);

    if (accessDenied === true) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center p-6 text-center">
                <div>
                    <h1 className="text-2xl font-bold text-red-600 mb-2">Доступ ограничен</h1>
                    <p className="text-gray-500 mb-6">У вас нет прав для просмотра этого раздела.</p>
                    <Button onClick={() => router.push('/')} className="rounded-2xl px-8 h-12 font-bold">На главную</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8f9fa] pt-20 pb-12">
            <div className="max-w-4xl mx-auto px-6">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <Button
                            variant="ghost"
                            onClick={() => router.push('/admin')}
                            className="mb-4 -ml-4 rounded-xl hover:bg-white text-gray-500 font-bold"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Админ-панель
                        </Button>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Быстрые заявки</h1>
                        <p className="text-gray-500 font-medium mt-1">Клиенты, ожидающие звонка по покупке в 1 клик</p>
                    </div>
                </div>

                <Suspense fallback={
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    </div>
                }>
                    <LeadsListClient />
                </Suspense>
            </div>
        </div>
    );
}
