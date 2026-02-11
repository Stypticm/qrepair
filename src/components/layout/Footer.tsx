'use client';

import { Send } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const Footer = () => {
    return (
        <footer className="bg-gray-50 pt-16 pb-8 border-t border-gray-100">
            <div className="container mx-auto px-4">

                {/* Location Section - CordStore style */}


                {/* Footer Links Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12 border-t border-gray-200 pt-12">
                    <div>
                        <h4 className="font-bold text-gray-900 mb-6">Каталог</h4>
                        <ul className="space-y-3 text-sm text-gray-500">
                            <li><Link href="/catalog" className="hover:text-teal-600">Смартфоны</Link></li>
                            <li><span className="text-gray-400 cursor-not-allowed">Планшеты</span></li>
                            <li><span className="text-gray-400 cursor-not-allowed">Ноутбуки</span></li>
                            <li><span className="text-gray-400 cursor-not-allowed">Гаджеты</span></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 mb-6">Покупателям</h4>
                        <ul className="space-y-3 text-sm text-gray-500">
                            <li><Link href="#" className="hover:text-teal-600">Доставка и оплата</Link></li>
                            <li><Link href="#" className="hover:text-teal-600">Гарантия</Link></li>
                            <li><Link href="#" className="hover:text-teal-600">Возврат</Link></li>
                            <li><Link href="#" className="hover:text-teal-600">Кредит</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 mb-6">Компания</h4>
                        <ul className="space-y-3 text-sm text-gray-500">
                            <li><Link href="/about" className="hover:text-teal-600">О нас</Link></li>
                            <li><span className="text-gray-400 cursor-not-allowed">Блог</span></li>
                            <li><Link href="#" className="hover:text-teal-600">Вакансии</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 mb-6">Подписка</h4>
                        <p className="text-sm text-gray-500 mb-4">Узнавайте о новинках и скидках первыми</p>
                        <div className="flex gap-2">
                            <input type="email" placeholder="Email" className="bg-white border text-sm border-gray-200 rounded-lg px-3 py-2 w-full outline-teal-500" />
                            <Button size="icon" className="bg-teal-500 hover:bg-teal-600 text-white rounded-lg shrink-0">
                                <Send className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-gray-200 text-xs text-gray-400">
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
