'use client';

import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

const POSTS = [
    {
        id: 1,
        title: 'Apple рассматривает возможность выпуска складного iPhone Flip',
        date: '04.02.2026',
        category: 'Новости',
        image: 'https://placehold.co/600x400/e2e8f0/64748b?text=iPhone+Flip',
        excerpt: 'Инсайдеры сообщают, что компания готовит конкурента Samsung Galaxy Z Flip с уникальным шарниром.'
    },
    {
        id: 2,
        title: '5 причин обновиться до MacBook Air M4',
        date: '01.02.2026',
        category: 'Обзоры',
        image: 'https://placehold.co/600x400/e2e8f0/64748b?text=MacBook+Air',
        excerpt: 'Новый чип, улучшенный экран и невероятная автономность. Разбираемся, стоит ли он своих денег.'
    },
    {
        id: 3,
        title: 'Как выбрать идеальный геймпад для PS5',
        date: '28.01.2026',
        category: 'Гайды',
        image: 'https://placehold.co/600x400/e2e8f0/64748b?text=DualSense',
        excerpt: 'Сравнение DualSense и DualSense Edge. Какой контроллер лучше подойдет для ваших задач?'
    },
];

export const BlogGrid = () => {
    return (
        <section className="py-12 bg-gray-50 border-t border-gray-100 relative">
            {/* Overlay with "Скоро" label - optimized for performance */}
            <div className="absolute inset-0 bg-white/70 z-10 flex items-center justify-center" style={{ backdropFilter: 'blur(4px)' }}>
                <div className="bg-gray-900 text-white px-8 py-4 rounded-apple-lg shadow-2xl">
                    <p className="text-2xl font-bold">Скоро</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-bold text-gray-900">Блог</h2>
                    <Link href="/blog" className="text-teal-600 font-medium hover:text-teal-700 flex items-center gap-1 text-sm">
                        Все статьи <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {POSTS.map((post) => (
                        <article key={post.id} className="group cursor-pointer">
                            <div className="rounded-apple-lg overflow-hidden mb-4 relative aspect-[16/10] bg-gray-200">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={post.image}
                                    alt={post.title}
                                    className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                                />
                                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-gray-900">
                                    {post.category}
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                                <span>{post.date}</span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-teal-600 transition-colors line-clamp-2">
                                {post.title}
                            </h3>
                            <p className="text-sm text-gray-500 line-clamp-3 leading-relaxed">
                                {post.excerpt}
                            </p>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
};
