'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { useSafeArea } from '@/hooks/useSafeArea';
import { motion } from 'framer-motion';

export function RepairHeader() {
    const router = useRouter();
    const pathname = usePathname();
    const { isDesktop, isTelegram } = useSafeArea();

    // Не показываем шапку на десктопе (кроме Telegram Mini App), так как там есть основное меню
    if (isDesktop && !isTelegram) return null;

    // Определяем заголовок в зависимости от шага
    let title = 'Ремонт';
    if (pathname.includes('/device')) title = 'Выберите устройство';
    if (pathname.includes('/issue')) title = 'Опишите проблему';
    if (pathname.includes('/estimate')) title = 'Оценка';
    if (pathname.includes('/delivery')) title = 'Доставка';

    return (
        <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="pb-4"
            style={{ paddingTop: 'max(24px, env(safe-area-inset-top))' }}
        >
            <div className="flex flex-col items-center justify-center gap-3">
                <motion.h1
                    key={title}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-2xl font-bold tracking-tight text-foreground text-center"
                >
                    {title}
                </motion.h1>
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-1.5 text-sm font-medium text-muted hover:text-foreground bg-surface-elevated hover:bg-surface px-4 py-1.5 rounded-full border border-border shadow-sm active:scale-95 transition-all"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Назад
                </button>
            </div>
        </motion.div>
    );
}

