'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Newspaper, X, User } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Page } from '@/components/Page';

interface BlogPost {
    id: string;
    title: string;
    content: string;
    excerpt: string | null;
    image: string | null;
    category: string;
    author: string | null;
    published: boolean;
    createdAt: string;
}

export default function PublicBlogPage() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const res = await fetch('/api/blog');
                if (res.ok) {
                    const data = await res.json();
                    setPosts(data);
                }
            } catch (error) {
                console.error('Failed to fetch blog posts:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, []);

    // Scroll lock when modal is open
    useEffect(() => {
        if (selectedPost) {
            document.body.style.overflow = 'hidden';
            document.documentElement.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
        };
    }, [selectedPost]);

    return (
        <Page back={true}>
            <div className="min-h-screen bg-[#FAFAFA]">
                {/* Header with Blur Background */}
                <header className="pt-5 pb-1 px-6 relative overflow-hidden">
                    <div className="absolute inset-0 bg-white/40 backdrop-blur-3xl z-0" />
                    <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

                    <div className="max-w-[1400px] mx-auto relative z-10">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                            className="text-center"
                        >
                            {/* <span className="inline-block px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] mb-6 shadow-sm border border-blue-100/50">
                                Наш журнал
                            </span> */}
                            {/* <h1 className="text-6xl md:text-8xl font-bold text-gray-900 tracking-[-0.04em] mb-6 leading-none">Блог</h1>
                            <p className="text-gray-500 text-xl font-medium max-w-2xl mx-auto leading-relaxed">
                                Свежие новости из мира технологий, экспертные разборы и жизнь Q-Repair в деталях.
                            </p> */}
                        </motion.div>
                    </div>

                    {/* Background decorations */}
                    <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-100/30 rounded-full blur-[100px] pointer-events-none" />
                    <div className="absolute top-1/2 -right-24 w-64 h-64 bg-teal-100/20 rounded-full blur-[80px] pointer-events-none" />
                </header>

                {/* Content Container */}
                <main className="max-w-[1440px] mx-auto px-6 md:px-10 py-12">
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="animate-pulse bg-white rounded-[2.5rem] p-4 border border-gray-100">
                                    <div className="aspect-[16/10] bg-gray-50 rounded-[2rem] mb-6 overflow-hidden">
                                        <div className="w-full h-full bg-gradient-to-r from-gray-50 via-gray-100 to-gray-50 animate-shimmer" />
                                    </div>
                                    <div className="space-y-3 px-4 pb-4">
                                        <div className="h-3 bg-gray-50 rounded w-1/4 mb-4" />
                                        <div className="h-6 bg-gray-50 rounded w-3/4 mb-2" />
                                        <div className="h-4 bg-gray-50 rounded w-full" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : posts.length === 0 ? (
                        <div className="text-center py-40 bg-white rounded-[3rem] border border-gray-100 shadow-sm">
                            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8">
                                <Newspaper className="w-10 h-10 text-gray-200" />
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Пока здесь пусто</h2>
                            <p className="text-gray-400 mt-3 text-lg">Мы уже готовим для вас интересные материалы!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                            {posts.map((post, idx) => (
                                <motion.article
                                    key={post.id}
                                    initial={{ opacity: 0, y: 40 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{
                                        delay: idx * 0.1,
                                        duration: 0.8,
                                        ease: [0.16, 1, 0.3, 1]
                                    }}
                                    className="group cursor-pointer bg-white rounded-[3rem] p-3 border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-gray-200/50 transition-all duration-700 flex flex-col h-full"
                                    onClick={() => setSelectedPost(post)}
                                >
                                    <div className="rounded-[2.5rem] overflow-hidden relative aspect-[16/10] mb-6 bg-gray-50">
                                        {post.image ? (
                                            <img
                                                src={post.image}
                                                alt={post.title}
                                                className="object-cover w-full h-full transition-transform duration-1000 ease-out group-hover:scale-110"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-200">
                                                <Newspaper className="w-16 h-16" />
                                            </div>
                                        )}
                                        {/* Overlay with blur on hover */}
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-700" />

                                        <div className="absolute top-5 left-5 bg-white/80 backdrop-blur-md px-4 py-2 rounded-2xl text-[10px] font-bold text-gray-900 uppercase tracking-widest shadow-sm">
                                            {post.category}
                                        </div>
                                    </div>

                                    <div className="px-5 pb-5 flex flex-col flex-1">
                                        <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400 mb-4 uppercase tracking-[0.1em]">
                                            <span>{new Date(post.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}</span>
                                            <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
                                            <span className="text-blue-500/80">{post.category}</span>
                                        </div>

                                        <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors duration-300 line-clamp-2 leading-[1.2] tracking-tight">
                                            {post.title}
                                        </h3>

                                        <p className="text-base text-gray-500 line-clamp-3 leading-relaxed mb-6 font-medium opacity-80">
                                            {post.excerpt || post.content}
                                        </p>

                                        <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-50">
                                            <div className="flex items-center gap-3">
                                                {post.author && (
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-7 h-7 bg-blue-50 rounded-full flex items-center justify-center border border-blue-100">
                                                            <User className="w-3.5 h-3.5 text-blue-600" />
                                                        </div>
                                                        <span className="text-[11px] font-bold text-gray-600 tracking-tight uppercase">{post.author}</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-blue-600 transition-colors duration-500">
                                                <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-white rotate-180 transition-colors" />
                                            </div>
                                        </div>
                                    </div>
                                </motion.article>
                            ))}
                        </div>
                    )}
                </main>

                {/* Modal for post details with Enhanced Blur */}
                <AnimatePresence>
                    {selectedPost && (
                        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-0 md:p-6 overflow-hidden">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setSelectedPost(null)}
                                className="absolute inset-0 bg-white/60 backdrop-blur-2xl"
                            />
                            <motion.div
                                layoutId={selectedPost.id}
                                initial={{ opacity: 0, y: 100, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 100, scale: 0.98 }}
                                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                className="bg-white w-full max-w-5xl h-full md:h-[94vh] md:rounded-[4rem] shadow-2xl relative overflow-hidden flex flex-col border border-gray-100"
                            >
                                <button
                                    onClick={() => setSelectedPost(null)}
                                    className="absolute top-8 right-8 p-4 bg-white/80 backdrop-blur-xl border border-gray-100 hover:bg-gray-50 rounded-full transition-all z-[100] shadow-xl active:scale-95 group"
                                >
                                    <X className="w-6 h-6 text-gray-900 transition-transform group-hover:rotate-90 duration-300" />
                                </button>

                                <div className="flex-1 overflow-y-auto scrollbar-hide">
                                    <div className="w-full aspect-[21/10] bg-gray-50 relative">
                                        {selectedPost.image && (
                                            <img src={selectedPost.image} alt={selectedPost.title} className="w-full h-full object-cover" />
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/5 to-transparent" />
                                    </div>

                                    <div className="px-8 md:px-24 pb-24 -mt-32 relative z-10">
                                        <div className="flex flex-wrap items-center gap-4 mb-8">
                                            <div className="px-6 py-2 bg-blue-600 text-white rounded-full text-[10px] font-bold uppercase tracking-[0.2em] shadow-2xl shadow-blue-500/40">
                                                {selectedPost.category}
                                            </div>
                                            <div className="text-gray-400 text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                                                <Calendar className="w-4 h-4" />
                                                {new Date(selectedPost.createdAt).toLocaleDateString('ru-RU')}
                                            </div>
                                        </div>

                                        <h2 className="text-4xl md:text-7xl font-bold text-gray-900 mb-12 leading-[1.05] tracking-[-0.03em]">
                                            {selectedPost.title}
                                        </h2>

                                        <div className="prose prose-2xl max-w-none text-gray-700 leading-relaxed font-medium space-y-8 whitespace-pre-wrap selection:bg-blue-100">
                                            {selectedPost.content}
                                        </div>

                                        {/* Bottom Footer in detail */}
                                        <div className="mt-20 pt-10 border-t border-gray-100 flex items-center gap-6">
                                            {selectedPost.author && (
                                                <div className="flex items-center gap-4">
                                                    <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100 shadow-inner">
                                                        <User className="w-7 h-7 text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Опубликовал</p>
                                                        <p className="text-lg font-bold text-gray-900 leading-none">{selectedPost.author}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </Page>
    );
}
