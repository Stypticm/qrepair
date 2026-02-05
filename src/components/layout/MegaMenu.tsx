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
        items: [
            { label: 'Apple iPhone', comingSoon: false },
            { label: 'Samsung Galaxy', comingSoon: true },
            { label: 'Xiaomi', comingSoon: true },
            { label: 'Google Pixel', comingSoon: true },
            { label: 'Realme', comingSoon: true },
            { label: 'Huawei', comingSoon: true },
            { label: 'OnePlus', comingSoon: true }
        ]
    },
    {
        id: 'laptops', label: 'Ноутбуки', icon: Laptop, comingSoon: true,
        items: [
            { label: 'Apple MacBook', comingSoon: true },
            { label: 'ASUS', comingSoon: true },
            { label: 'Lenovo', comingSoon: true }
        ]
    },
    {
        id: 'tablets', label: 'Планшеты', icon: Laptop, comingSoon: true,
        items: [
            { label: 'Apple iPad', comingSoon: true },
            { label: 'Samsung Galaxy Tab', comingSoon: true },
            { label: 'Xiaomi Pad', comingSoon: true }
        ]
    },
    {
        id: 'watches', label: 'Умные часы', icon: Watch, comingSoon: true,
        items: [
            { label: 'Apple Watch', comingSoon: true },
            { label: 'Samsung Galaxy Watch', comingSoon: true },
            { label: 'Garmin', comingSoon: true }
        ]
    },
    {
        id: 'audio', label: 'Аудио', icon: Headphones, comingSoon: true,
        items: [
            { label: 'AirPods', comingSoon: true },
            { label: 'JBL', comingSoon: true },
            { label: 'Sony', comingSoon: true }
        ]
    },
    {
        id: 'games', label: 'Игры и консоли', icon: Gamepad, comingSoon: true,
        items: [
            { label: 'PlayStation 5', comingSoon: true },
            { label: 'Nintendo Switch', comingSoon: true },
            { label: 'Xbox Series', comingSoon: true }
        ]
    },
    {
        id: 'home', label: 'Для дома', icon: Home, comingSoon: true,
        items: [
            { label: 'Умный дом', comingSoon: true },
            { label: 'Роботы-пылесосы', comingSoon: true }
        ]
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
                                    "w-full flex items-center justify-between px-6 py-3 text-sm font-medium transition-all relative group",
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
                                {category.comingSoon && (
                                    <div className="absolute right-2 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                        Скоро
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 p-8 grid grid-cols-3 gap-8 content-start">
                        {currentCategory && (
                            <>
                                <div className="col-span-2">
                                    <h3 className="text-xl font-bold mb-6 text-gray-900 flex items-center gap-3">
                                        {currentCategory.label}
                                        {currentCategory.comingSoon && (
                                            <span className="text-xs font-normal bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
                                                Скоро в продаже
                                            </span>
                                        )}
                                    </h3>

                                    <div className="grid grid-cols-2 gap-4">
                                        {currentCategory.items.map((item, index) => (
                                            item.comingSoon ? (
                                                <div key={index} className="text-gray-400 flex items-center gap-2 cursor-not-allowed group">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-gray-200"></span>
                                                    {item.label}
                                                    <span className="text-[10px] bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">Скоро</span>
                                                </div>
                                            ) : (
                                                <Link
                                                    key={index}
                                                    href={`/catalog?q=${item.label}`}
                                                    className="text-gray-600 hover:text-teal-600 hover:translate-x-1 transition-all flex items-center gap-2"
                                                >
                                                    <span className="w-1.5 h-1.5 rounded-full bg-gray-200 group-hover:bg-teal-500"></span>
                                                    {item.label}
                                                </Link>
                                            )
                                        ))}
                                    </div>
                                </div>

                                {/* Promo Column */}
                                <div className="col-span-1">
                                    {currentCategory.items.some(i => !i.comingSoon) ? (
                                        <div className="bg-teal-50 rounded-apple-lg p-6 h-full flex flex-col justify-center items-center text-center">
                                            <span className="text-teal-600 font-bold mb-2">Хит продаж</span>
                                            <h4 className="text-lg font-bold text-gray-900 mb-4">iPhone 15 Pro Max</h4>
                                            <Button variant="outline" className="border-teal-200 text-teal-700 hover:bg-teal-100">
                                                Перейти в каталог
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="bg-gray-50 rounded-apple-lg p-6 h-full flex flex-col justify-center items-center text-center border border-dashed border-gray-200">
                                            <span className="text-gray-400 font-bold mb-2">Раздел в разработке</span>
                                            <p className="text-sm text-gray-400">
                                                Мы работаем над наполнением этого раздела.
                                                <br />Загляните позже!
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </motion.div>
            </div>
        </>
    );
};
