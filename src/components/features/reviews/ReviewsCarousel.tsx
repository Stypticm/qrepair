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
        <section className="py-12 bg-white">
            <div className="max-w-7xl mx-auto px-6">
                <h2 className="text-3xl font-bold mb-8 text-gray-900">Мнение наших клиентов</h2>

                {/* Aggregate Rating Badge */}
                <div className="flex items-center gap-6 mb-8 text-sm font-medium">
                    <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                        <span className="text-xl font-bold text-gray-900">5.0</span>
                        <div className="flex text-yellow-400">
                            <Star className="w-4 h-4 fill-current" />
                        </div>
                        <span className="text-gray-400">3697 отзывов</span>
                    </div>

                    <div className="flex gap-4 text-gray-500">
                        <span className="flex items-center gap-1"><span className="font-bold text-gray-900">Яндекс</span> 5.0</span>
                        <span className="flex items-center gap-1"><span className="font-bold text-gray-900">2Gis</span> 5.0</span>
                        <span className="flex items-center gap-1"><span className="font-bold text-gray-900">Авито</span> 4.9</span>
                    </div>
                </div>

                {/* Filters (Visual Only) */}
                <div className="flex flex-wrap gap-2 mb-8">
                    {['цена', 'сервис', 'доставка', 'магазин', 'продукт', 'товар', 'персонал'].map((tag) => (
                        <button key={tag} className="px-4 py-1.5 rounded-full border border-gray-200 text-sm text-gray-600 hover:border-teal-500 hover:text-teal-600 transition-colors">
                            {tag}
                        </button>
                    ))}
                </div>

                {/* <Carousel
                    opts={{
                        align: "start",
                        loop: true,
                    }}
                    className="w-full"
                >
                    <CarouselContent className="-ml-4">
                        {REVIEWS.map((review) => (
                            <CarouselItem key={review.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                                <div className="p-1">
                                    <Card className="border-gray-100 shadow-sm hover:shadow-md transition-shadow h-full min-h-[220px]">
                                        <CardContent className="p-6">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-white font-bold", review.avatarColor || 'bg-gray-400')}>
                                                        {review.author[0]}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-gray-900 leading-none mb-1">{review.author}</h4>
                                                        <div className="flex items-center gap-2 text-xs text-gray-400">
                                                            <span>{review.date}</span>
                                                            <span>на <span className={cn("font-medium", review.source === 'Яндекс' ? 'text-red-500' : 'text-green-500')}>{review.source}</span></span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex mb-3">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} className={cn("w-3.5 h-3.5", i < review.rating ? "text-yellow-400 fill-current" : "text-gray-300")} />
                                                ))}
                                            </div>

                                            <p className="text-gray-600 text-sm line-clamp-4 leading-relaxed">
                                                {review.text}
                                            </p>
                                        </CardContent>
                                    </Card>
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious className="-left-2 lg:-left-6" />
                    <CarouselNext className="-right-2 lg:-right-6" />
                </Carousel> */}

                <div className="mt-8 flex justify-center lg:justify-end">
                    <Button className="bg-green-500 hover:bg-green-600 text-white font-medium py-2.5 px-6 rounded-apple-lg transition-colors shadow-sm">
                        Оставить отзыв
                    </Button>
                </div>
            </div>
        </section>
    );
};
