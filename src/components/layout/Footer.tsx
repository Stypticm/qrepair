'use client';

import { Send } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const Footer = () => {
    return (
        <footer className="bg-surface pt-16 pb-8 border-t border-border">
            <div className="container mx-auto px-4">

                {/* Footer Links Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12 border-t border-gray-200 dark:border-white/10 pt-12">
                    <div>
                        <h4 className="font-bold text-foreground mb-6">Каталог</h4>
                        <ul className="space-y-3 text-sm text-muted">
                            <li><Link href="/catalog" className="hover:text-teal-600 dark:hover:text-teal-400">Смартфоны</Link></li>
                            <li><span className="text-gray-400 dark:text-gray-500 cursor-not-allowed">Планшеты</span></li>
                            <li><span className="text-gray-400 dark:text-gray-500 cursor-not-allowed">Ноутбуки</span></li>
                            <li><span className="text-gray-400 dark:text-gray-500 cursor-not-allowed">Гаджеты</span></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-foreground mb-6">Покупателям</h4>
                        <ul className="space-y-3 text-sm text-muted">
                            <li><Link href="#" className="hover:text-teal-600 dark:hover:text-teal-400">Доставка и оплата</Link></li>
                            <li><Link href="#" className="hover:text-teal-600 dark:hover:text-teal-400">Гарантия</Link></li>
                            <li><Link href="#" className="hover:text-teal-600 dark:hover:text-teal-400">Возврат</Link></li>
                            <li><Link href="#" className="hover:text-teal-600 dark:hover:text-teal-400">Кредит</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-foreground mb-6">Компания</h4>
                        <ul className="space-y-3 text-sm text-muted">
                            <li><Link href="/about" className="hover:text-teal-600 dark:hover:text-teal-400">О нас</Link></li>
                            <li><Link href="/blog" className="hover:text-teal-600 dark:hover:text-teal-400">Блог</Link></li>
                            <li><Link href="#" className="hover:text-teal-600 dark:hover:text-teal-400">Вакансии</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-foreground mb-6">Подписка</h4>
                        <p className="text-sm text-muted mb-4">Узнавайте о новинках и скидках первыми</p>
                        <div className="flex gap-2">
                            <input type="email" placeholder="Email" className="bg-card border border-border text-sm rounded-lg px-3 py-2 w-full outline-teal-500 text-foreground" />
                            <Button size="icon" className="bg-teal-500 hover:bg-teal-600 text-white rounded-lg shrink-0">
                                <Send className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-gray-200 dark:border-white/10 text-xs text-gray-400 dark:text-gray-500">
                    <p>&copy; 2025 QOQOS. Все права защищены.</p>
                    <div className="flex gap-6 mt-4 md:mt-0">
                        <Link href="#">Политика конфиденциальности</Link>
                        <Link href="#">Публичная оферта</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};
