'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Phone, Laptop, Watch, Headphones, Gamepad, Camera, Home } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface MegaMenuProps {
    isOpen: boolean;
    onClose: () => void;
}

const CATEGORIES = [
    {
        id: 'smartphones', label: 'Смартфоны', icon: Phone,
        items: ['Apple iPhone', 'Samsung Galaxy', 'Xiaomi', 'Google Pixel', 'Realme', 'Huawei', 'OnePlus']
    },
    {
        id: 'laptops', label: 'Ноутбуки', icon: Laptop,
        items: ['Apple MacBook', 'ASUS', 'Lenovo', 'MSI', 'Acer', 'HP', 'Dell']
    },
    {
        id: 'tablets', label: 'Планшеты', icon: Laptop,
        items: ['Apple iPad', 'Samsung Galaxy Tab', 'Xiaomi Pad', 'Huawei MatePad']
    },
    {
        id: 'watches', label: 'Умные часы', icon: Watch,
        items: ['Apple Watch', 'Samsung Galaxy Watch', 'Garmin', 'Xiaomi Watch']
    },
    {
        id: 'audio', label: 'Аудио', icon: Headphones,
        items: ['AirPods', 'JBL', 'Sony', 'Marshall', 'Яндекс Станция']
    },
    {
        id: 'games', label: 'Игры и консоли', icon: Gamepad,
        items: ['PlayStation 5', 'Nintendo Switch', 'Xbox Series', 'Steam Deck', 'Игры для PS5']
    },
    {
        id: 'home', label: 'Для дома', icon: Home,
        items: ['Умный дом', 'Роботы-пылесосы', 'Климатическая техника', 'Освещение']
    },
];

export const MegaMenu = ({ isOpen, onClose }: MegaMenuProps) => {
    const [activeCategory, setActiveCategory] = useState<string>(CATEGORIES[0].id);

    if (!isOpen) return null;

    const currentCategory = CATEGORIES.find(c => c.id === activeCategory);

    return (
        <>
            <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[40]" onClick={onClose} />
            <div className="absolute top-[140px] left-0 right-0 z-[41] container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-white rounded-apple-xl shadow-2xl border border-gray-100 overflow-hidden flex min-h-[500px]"
                >
                    {/* Sidebar */}
                    <div className="w-[300px] border-r border-gray-100 bg-gray-50/50 py-4">
                        {CATEGORIES.map((category) => (
                            <button
                                key={category.id}
                                onMouseEnter={() => setActiveCategory(category.id)}
                                className={cn(
                                    "w-full flex items-center justify-between px-6 py-3 text-sm font-medium transition-all",
                                    activeCategory === category.id
                                        ? "bg-white text-teal-600 shadow-sm border-r-2 border-teal-500 transform scale-105 origin-left"
                                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/50"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <category.icon className="w-5 h-5" strokeWidth={1.5} />
                                    <span>{category.label}</span>
                                </div>
                                {activeCategory === category.id && (
                                    <ChevronRight className="w-4 h-4" />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 p-8 grid grid-cols-3 gap-8 content-start">
                        {currentCategory && (
                            <>
                                <div className="col-span-2">
                                    <h3 className="text-xl font-bold mb-6 text-gray-900">{currentCategory.label}</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        {currentCategory.items.map((item) => (
                                            <Link
                                                key={item}
                                                href={`/catalog/${currentCategory.id}/${item.toLowerCase().replace(/ /g, '-')}`}
                                                className="text-gray-600 hover:text-teal-600 hover:translate-x-1 transition-all flex items-center gap-2"
                                            >
                                                <span className="w-1.5 h-1.5 rounded-full bg-gray-200 group-hover:bg-teal-500"></span>
                                                {item}
                                            </Link>
                                        ))}
                                    </div>
                                </div>

                                {/* Promo Column */}
                                <div className="col-span-1">
                                    <div className="bg-teal-50 rounded-apple-lg p-6 h-full flex flex-col justify-center items-center text-center">
                                        <span className="text-teal-600 font-bold mb-2">Хит продаж</span>
                                        <h4 className="text-lg font-bold text-gray-900 mb-4">{currentCategory.items[0]}</h4>
                                        <Button variant="outline" className="border-teal-200 text-teal-700 hover:bg-teal-100">
                                            Подробнее
                                        </Button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </motion.div>
            </div>
        </>
    );
};
