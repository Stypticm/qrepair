'use client';

import { useState, useEffect } from 'react';
import { ArrowRight, X, Calendar, User, Tag, Clock, Newspaper } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

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

export const BlogGrid = () => {
    const pathname = usePathname();
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const res = await fetch('/api/blog');
                if (res.ok) {
                    const data = await res.json();
                    setPosts(data.slice(0, 3)); // Display only 3 posts on home as requested
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
        <section
            className="py-20 bg-white border-t border-gray-100 relative overflow-hidden"
        >
            {/* Background elements for premium look */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-50/30 rounded-full blur-[120px] -mr-64 -mt-64" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-teal-50/20 rounded-full blur-[120px] -ml-64 -mb-64" />

            <div className="max-w-7xl mx-auto px-6 relative">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div className="flex flex-col md:flex-row md:items-end gap-6">
                        <div>
                            <h2 className="text-4xl font-bold text-gray-900 tracking-tight">Блог</h2>
                            <p className="text-gray-500 mt-2 font-medium">Новости, обзоры и полезные советы</p>
                        </div>
                        {!loading && (
                            <Link
                                href="/blog"
                                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 !text-black rounded-full font-bold text-sm transition-all active:scale-95 shadow-lg shadow-blue-500/25 w-fit min-w-[140px] relative z-10"
                            >
                                <span className="text-black">Читать все</span>
                                <ArrowRight className="w-4 h-4 text-black" />
                            </Link>
                        )}
                    </div>
                </div>

                {loading ? (
                    <div className="grid md:grid-cols-3 gap-10">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="group">
                                <div className="relative aspect-[16/10] rounded-[2rem] overflow-hidden bg-gray-50 mb-6">
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-shimmer" />
                                    <div className="w-full h-full bg-gray-100 animate-pulse" />
                                </div>
                                <div className="space-y-4 px-1">
                                    <div className="h-3 bg-gray-100 rounded-full w-1/3 animate-pulse" />
                                    <div className="h-6 bg-gray-100 rounded-full w-3/4 animate-pulse" />
                                    <div className="space-y-2">
                                        <div className="h-4 bg-gray-50 rounded-full w-full animate-pulse" />
                                        <div className="h-4 bg-gray-50 rounded-full w-2/3 animate-pulse" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : posts.length === 0 ? (
                    <div className="bg-gray-50/50 rounded-[2.5rem] border border-dashed border-gray-200 py-20 text-center">
                        <Newspaper className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-gray-900">Блог находится в разработке</h3>
                        <p className="text-gray-500 mt-1 max-w-xs mx-auto">Совсем скоро здесь появятся интересные обзоры и новости мира технологий.</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-3 gap-10">
                        <AnimatePresence>
                            {posts.map((post, index) => (
                                <motion.div
                                    key={post.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className="group cursor-pointer"
                                    onClick={() => setSelectedPost(post)}
                                >
                                    <div className="relative aspect-[16/10] rounded-[2rem] overflow-hidden bg-white/40 backdrop-blur-xl border border-white/50 mb-6 shadow-sm group-hover:shadow-xl transition-all duration-500">
                                        {post.image ? (
                                            <Image
                                                src={post.image}
                                                alt={post.title}
                                                fill
                                                className="object-cover group-hover:scale-110 transition-transform duration-700"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 italic text-gray-400">
                                                <Newspaper className="w-10 h-10 opacity-20" />
                                            </div>
                                        )}
                                        <div className="absolute top-4 left-4">
                                            <span className="px-4 py-1.5 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-bold text-gray-900 uppercase tracking-widest shadow-sm">
                                                {post.category}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 text-xs font-bold text-gray-400 uppercase tracking-widest">
                                            <span>{new Date(post.createdAt).toLocaleDateString('ru-RU')}</span>
                                            <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
                                            <span>{post.category}</span>
                                            {post.author && (
                                                <>
                                                    <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
                                                    <span className="text-gray-900">{post.author}</span>
                                                </>
                                            )}
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                                            {post.title}
                                        </h3>
                                        <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed">
                                            {post.excerpt || (post.content ? post.content.substring(0, 100) + '...' : '')}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* Modal for post details */}
            <AnimatePresence>
                {selectedPost && (
                    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedPost(null)}
                            className="absolute inset-0 bg-white/40 backdrop-blur-[32px]"
                        />
                        <motion.div
                            layoutId={selectedPost.id}
                            initial={{ opacity: 0, scale: 0.95, y: 40 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 40 }}
                            className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[48px] shadow-2xl relative overflow-hidden flex flex-col border border-gray-100"
                        >
                            <button
                                onClick={() => setSelectedPost(null)}
                                className="absolute top-8 right-8 p-3 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors z-20"
                            >
                                <X className="w-5 h-5 text-gray-900" />
                            </button>

                            <div className="flex-1 overflow-y-auto scrollbar-hide">
                                <div className="w-full aspect-[21/9] bg-gray-100 relative">
                                    {selectedPost.image && (
                                        <img src={selectedPost.image} alt={selectedPost.title} className="w-full h-full object-cover" />
                                    )}
                                    <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-white to-transparent"></div>
                                </div>

                                <div className="px-8 md:px-16 pb-16 -mt-20 relative z-10">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="px-4 py-1.5 bg-blue-600 text-white rounded-full text-[11px] font-bold uppercase tracking-widest shadow-lg shadow-blue-500/20">
                                            {selectedPost.category}
                                        </div>
                                        <div className="text-gray-400 text-sm flex items-center gap-2">
                                            <Calendar className="w-4 h-4" />
                                            {new Date(selectedPost.createdAt).toLocaleDateString('ru-RU')}
                                        </div>
                                        {selectedPost.author && (
                                            <div className="text-gray-400 text-sm flex items-center gap-2">
                                                <User className="w-4 h-4" />
                                                <span>{selectedPost.author}</span>
                                            </div>
                                        )}
                                    </div>

                                    <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-8 leading-[1.15] tracking-tight">
                                        {selectedPost.title}
                                    </h2>

                                    <div className="prose prose-lg max-w-none text-gray-600 leading-relaxed space-y-4 whitespace-pre-wrap">
                                        {selectedPost.content}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </section>
    );
};
