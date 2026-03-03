'use client';

import { useRouter, usePathname } from 'next/navigation';
import { ArrowLeft, ChevronLeft } from 'lucide-react';
import { useSafeArea } from '@/hooks/useSafeArea';
import { motion, AnimatePresence } from 'framer-motion';

const sectionTitles: Record<string, string> = {
    'staff': 'Персонал',
    'masters': 'Мастера',
    'requests': 'Заявки',
    'orders': 'Заказы',
    'add-lot': 'Новый лот',
    'chats': 'Чат-центр',
    'leads': 'Быстрые заявки',
    'trade-in': 'Оценки',
    'repair': 'Ремонт',
};

export function AdminHeader() {
    const router = useRouter();
    const pathname = usePathname();
    const { isDesktop } = useSafeArea();

    const isMainAdminPage = pathname === '/admin';
    const currentPath = pathname.split('/').pop() || '';
    const title = sectionTitles[currentPath] || 'Панель управления';

    if (isDesktop) return null;

    return (
        <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-xl border-b border-gray-100 px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <AnimatePresence mode="wait">
                    {!isMainAdminPage && (
                        <motion.button
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            onClick={() => router.push('/admin')}
                            className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 text-gray-900 active:scale-90 transition-transform"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </motion.button>
                    )}
                </AnimatePresence>

                <motion.h2
                    key={title}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-lg font-bold text-gray-900 tracking-tight"
                >
                    {title}
                </motion.h2>
            </div>

            {isMainAdminPage && (
                <button
                    onClick={() => router.push('/')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 text-gray-500 text-xs font-bold"
                >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Сайт
                </button>
            )}
        </header>
    );
}
