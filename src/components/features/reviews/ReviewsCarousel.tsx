'use client';

import { Star, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
// import {
//     Carousel,
//     CarouselContent,
//     CarouselItem,
//     CarouselNext,
//     CarouselPrevious,
// } from '@/components/ui/carousel';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const REVIEWS = [
    {
        id: 1,
        author: 'Евгений',
        date: '2 февраля',
        source: 'Яндекс',
        rating: 5,
        text: 'Случайно узнал о магазине, когда был на Горбушке. Цены оказались ниже рыночных. Устройства оригинальные. Вернулись за вторым телефоном через неделю.',
        avatarColor: 'bg-orange-500'
    },
    {
        id: 2,
        author: 'Алексей Коробков',
        date: '2 февраля',
        source: 'Яндекс',
        rating: 5,
        text: 'Все отлично! Купили приставку и айпад! Консультанты грамотные, помогли с выбором и настройкой.',
        avatarColor: 'bg-red-500'
    },
    {
        id: 3,
        author: 'Pavel S',
        date: '2 февраля',
        source: 'Яндекс',
        rating: 5,
        text: 'Все четко! Цены отличные, качество тоже! Беру уже не первый раз. Лучший магазин на рынке. Рекомендую всем.',
        avatarColor: 'bg-blue-500'
    },
    {
        id: 4,
        author: 'Мария Иванова',
        date: '1 февраля',
        source: '2Gis',
        rating: 5,
        text: 'Очень довольна покупкой. iPhone 15 Pro Max просто космос. Спасибо за скидку и подарок (чехол)!',
        avatarColor: 'bg-green-500'
    },
];

export const ReviewsCarousel = () => {
    return (
        <section className="py-24 bg-background relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 relative">
                <div className="flex items-center gap-4 mb-12">
                    <h2 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">Мнение наших клиентов</h2>
                    <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 rounded-full text-[10px] font-bold uppercase tracking-widest border border-amber-200 dark:border-amber-700 shadow-sm animate-pulse">
                        Скоро
                    </span>
                </div>

                <div className="relative group">
                    {/* Blur Overlay */}
                    <div className="absolute inset-0 z-20 backdrop-blur-[8px] bg-white/40 dark:bg-background/40 rounded-[3rem] flex items-center justify-center border border-white/50 dark:border-white/10">
                        <div className="bg-white/80 dark:bg-white/10 backdrop-blur-xl px-10 py-6 rounded-3xl shadow-2xl border border-gray-100 dark:border-white/10 text-center transform group-hover:scale-105 transition-transform duration-500">
                            <p className="text-gray-900 dark:text-white font-bold text-xl tracking-tight mb-1">Раздел в разработке</p>
                            <p className="text-gray-500 dark:text-gray-400 font-medium">Мы собираем лучшие отзывы для вас</p>
                        </div>
                    </div>

                    {/* Content (Blurred) */}
                    <div className="opacity-40 grayscale-[0.5] pointer-events-none select-none">
                        {/* Aggregate Rating Badge */}
                        <div className="flex items-center gap-6 mb-8 text-sm font-medium">
                            <div className="flex items-center gap-2 bg-gray-50 dark:bg-white/5 px-3 py-1.5 rounded-lg border border-gray-100 dark:border-white/10">
                                <span className="text-xl font-bold text-gray-900 dark:text-white">5.0</span>
                                <div className="flex text-yellow-400">
                                    <Star className="w-4 h-4 fill-current" />
                                </div>
                                <span className="text-gray-400 dark:text-gray-500">3697 отзывов</span>
                            </div>

                            <div className="flex gap-4 text-gray-500 dark:text-gray-400">
                                <span className="flex items-center gap-1"><span className="font-bold text-gray-900 dark:text-white">Яндекс</span> 5.0</span>
                                <span className="flex items-center gap-1"><span className="font-bold text-gray-900 dark:text-white">2Gis</span> 5.0</span>
                                <span className="flex items-center gap-1"><span className="font-bold text-gray-900 dark:text-white">Авито</span> 4.9</span>
                            </div>
                        </div>

                        {/* Filters (Visual Only) */}
                        <div className="flex flex-wrap gap-2 mb-8">
                            {['цена', 'сервис', 'доставка', 'магазин', 'продукт', 'товар', 'персонал'].map((tag) => (
                                <button key={tag} className="px-4 py-1.5 rounded-full border border-gray-200 dark:border-white/10 text-sm text-gray-600 dark:text-gray-400">
                                    {tag}
                                </button>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {REVIEWS.slice(0, 3).map((review) => (
                                <Card key={review.id} className="border-border shadow-sm rounded-[2rem] bg-card">
                                    <CardContent className="p-8">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className={cn("w-12 h-12 rounded-full flex items-center justify-center text-white font-bold", review.avatarColor)}>
                                                {review.author[0]}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900 dark:text-white leading-none mb-1 text-lg">{review.author}</h4>
                                                <span className="text-xs text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wider">{review.date}</span>
                                            </div>
                                        </div>
                                        <div className="flex mb-4 gap-0.5">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                                            ))}
                                        </div>
                                        <p className="text-gray-500 dark:text-gray-400 leading-relaxed font-medium line-clamp-3">
                                            {review.text}
                                        </p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        <div className="mt-12 flex justify-center lg:justify-end">
                            <Button className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-full transition-all shadow-lg shadow-green-500/20">
                                Оставить отзыв
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
