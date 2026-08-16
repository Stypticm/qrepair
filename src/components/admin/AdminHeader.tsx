'use client';

import { useRouter, usePathname } from 'next/navigation';
import { ArrowLeft, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/stores/authStore';
import { LogOut } from 'lucide-react';

const sectionTitles: Record<string, string> = {
    'staff': 'Персонал',
    'masters': 'Мастера',
    // 'requests': 'Заявки',
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
    const logout = useAppStore(state => state.logout);

    const isMainAdminPage = pathname === '/admin';
    const currentPath = pathname.split('/').pop() || '';
    const title = sectionTitles[currentPath] || 'Панель управления';

    if (isMainAdminPage) return null;

    return (
        <header className="md:hidden sticky top-0 z-50 w-full bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-gray-100 dark:border-white/5 px-4 pt-[max(12px,env(safe-area-inset-top))] pb-3 min-h-[64px] flex items-start justify-between">
            <div className="flex items-start gap-3 mt-0.5">
                <AnimatePresence mode="wait">
                    {!isMainAdminPage && (
                        <motion.button
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            onClick={() => router.back()}
                            className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-50 dark:bg-white/10 text-gray-900 dark:text-white active:scale-90 transition-transform"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </motion.button>
                    )}
                </AnimatePresence>

                <div className="flex flex-col">
                    <motion.h2
                        key={title}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-lg font-bold text-gray-900 dark:text-white tracking-tight leading-tight"
                    >
                        {title}
                    </motion.h2>
                    {isMainAdminPage && (
                        <button
                            onClick={() => router.push('/')}
                            className="flex items-center gap-1.5 mt-1 text-gray-500 dark:text-gray-400 text-xs font-semibold hover:text-gray-900 dark:hover:text-white transition-colors"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            На сайт
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
}
