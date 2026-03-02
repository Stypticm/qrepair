'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { useSafeArea } from '@/hooks/useSafeArea';

export function RepairHeader() {
    const router = useRouter();
    const pathname = usePathname();
    const { isDesktop } = useSafeArea();

    // Не показываем шапку на десктопе, так как там есть основное меню
    if (isDesktop) return null;

    // Определяем заголовок в зависимости от шага
    let title = 'Ремонт';
    if (pathname.includes('/device')) title = 'Устройство';
    if (pathname.includes('/issue')) title = 'Проблема';
    if (pathname.includes('/estimate')) title = 'Оценка';
    if (pathname.includes('/delivery')) title = 'Доставка';
    return (
        <div className="pt-6 pb-4">
            <div className="flex flex-col items-center justify-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight text-gray-900 text-center">
                    {title}
                </h1>
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 bg-white hover:bg-gray-50 px-4 py-1.5 rounded-full border border-gray-200 shadow-sm active:scale-95 transition-all"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Назад
                </button>
            </div>
        </div>
    );
}
