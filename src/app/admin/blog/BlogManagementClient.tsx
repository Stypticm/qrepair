'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Plus, Pencil, Trash2, Eye, Newspaper, ExternalLink, Globe, Lock, X, Save, User } from 'lucide-react';
import { toast } from 'sonner';
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

export function BlogManagementClient() {
    const { telegramId } = useAppStore();
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editingPost, setEditingPost] = useState<Partial<BlogPost> | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const fetchPosts = async () => {
        try {
            const adminId = telegramId || sessionStorage.getItem('telegramId');
            const res = await fetch(`/api/admin/blog?adminId=${adminId}`);
            if (!res.ok) throw new Error('Failed to fetch');
            const data = await res.json();
            setPosts(data);
        } catch (error) {
            toast.error('Ошибка при загрузке блога');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, [telegramId]);

    const handleCreate = () => {
        setEditingPost({
            title: '',
            content: '',
            excerpt: '',
            image: '',
            category: 'Новости',
            author: '',
            published: false
        });
        setIsEditorOpen(true);
    };

    const handleEdit = (post: BlogPost) => {
        setEditingPost(post);
        setIsEditorOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Вы уверены, что хотите удалить эту запись?')) return;

        try {
            const adminId = telegramId || sessionStorage.getItem('telegramId');
            const res = await fetch(`/api/admin/blog?id=${id}&adminId=${adminId}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                setPosts(posts.filter(p => p.id !== id));
                toast.success('Запись удалена');
            }
        } catch (error) {
            toast.error('Ошибка при удалении');
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingPost?.title || !editingPost?.content) {
            toast.error('Заголовок и текст обязательны');
            return;
        }

        setIsSaving(true);
        try {
            const adminId = telegramId || sessionStorage.getItem('telegramId');
            const method = editingPost.id ? 'PATCH' : 'POST';
            const res = await fetch('/api/admin/blog', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...editingPost, adminTelegramId: adminId })
            });

            if (res.ok) {
                toast.success(editingPost.id ? 'Статья обновлена' : 'Статья создана');
                setIsEditorOpen(false);
                fetchPosts();
            } else {
                throw new Error('Save failed');
            }
        } catch (error) {
            toast.error('Ошибка при сохранении');
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Newspaper className="w-6 h-6" />
                        Управление Блогом
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">Создавайте и редактируйте статьи для ваших клиентов</p>
                </div>
                <Button
                    onClick={handleCreate}
                    className="bg-gray-900 hover:bg-black text-white rounded-xl px-6 h-12 shadow-lg transition-all active:scale-95 flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Написать статью
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.length === 0 ? (
                    <div className="col-span-full py-20 text-center bg-white rounded-[32px] border border-dashed border-gray-200">
                        <Newspaper className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 font-medium">Статей пока нет</p>
                        <p className="text-sm text-gray-400 mt-1">Самое время написать что-нибудь интересное</p>
                    </div>
                ) : (
                    posts.map((post) => (
                        <Card key={post.id} className="bg-white border-gray-100 rounded-[32px] overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
                            <div className="aspect-video bg-gray-100 relative overflow-hidden">
                                {post.image ? (
                                    <img src={post.image} alt={post.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                        <Newspaper className="w-10 h-10" />
                                    </div>
                                )}
                                <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${post.published ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}`}>
                                    {post.published ? 'Опубликовано' : 'Черновик'}
                                </div>
                            </div>
                            <CardContent className="p-6">
                                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest block mb-2">{post.category}</span>
                                <h3 className="font-bold text-gray-900 line-clamp-2 mb-3 leading-snug group-hover:text-blue-600 transition-colors">{post.title}</h3>
                                <p className="text-sm text-gray-500 line-clamp-2 mb-4 leading-relaxed">{post.excerpt || post.content}</p>

                                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                    <span className="text-[11px] text-gray-400 font-medium">
                                        {new Date(post.createdAt).toLocaleDateString('ru-RU')}
                                    </span>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => handleEdit(post)}
                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                            title="Редактировать"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(post.id)}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                            title="Удалить"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Editor Modal */}
            <AnimatePresence>
                {isEditorOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsEditorOpen(false)}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white w-full max-w-2xl max-h-[90vh] rounded-[32px] shadow-2xl relative overflow-hidden flex flex-col"
                        >
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
                                <h3 className="text-xl font-bold text-gray-900">
                                    {editingPost?.id ? 'Редактирование' : 'Новое сообщение'}
                                </h3>
                                <button onClick={() => setIsEditorOpen(false)} className="p-2 hover:bg-gray-50 rounded-full transition-colors">
                                    <X className="w-5 h-5 text-gray-400" />
                                </button>
                            </div>

                            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-8 space-y-6">
                                <div className="space-y-4">
                                    <div className="grid gap-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase ml-1">Заголовок</label>
                                        <Input
                                            value={editingPost?.title}
                                            onChange={(e) => setEditingPost(prev => ({ ...prev!, title: e.target.value }))}
                                            placeholder="О чем статья?"
                                            className="h-12 rounded-xl border-gray-100 bg-gray-50 focus:bg-white focus:ring-blue-500 transition-all"
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <label className="text-xs font-bold text-gray-400 uppercase ml-1">Категория</label>
                                            <Input
                                                value={editingPost?.category}
                                                onChange={(e) => setEditingPost(prev => ({ ...prev!, category: e.target.value }))}
                                                placeholder="Новости, Обзоры..."
                                                className="h-12 rounded-xl border-gray-100 bg-gray-50 focus:bg-white focus:ring-blue-500 transition-all"
                                            />
                                        </div>
                                        <div className="grid gap-2 text-right">
                                            <label className="text-xs font-bold text-gray-400 uppercase mr-1">Статус</label>
                                            <div className="flex items-center justify-end gap-2 h-12">
                                                <span className={`text-xs font-bold ${editingPost?.published ? 'text-green-600' : 'text-gray-400'}`}>
                                                    {editingPost?.published ? 'Опубликовано' : 'Черновик'}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => setEditingPost(prev => ({ ...prev!, published: !prev?.published }))}
                                                    className={`w-12 h-6 rounded-full relative transition-colors ${editingPost?.published ? 'bg-green-500' : 'bg-gray-200'}`}
                                                >
                                                    <motion.div
                                                        animate={{ x: editingPost?.published ? 26 : 2 }}
                                                        className="w-5 h-5 bg-white rounded-full absolute top-0.5"
                                                    />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid gap-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase ml-1">Автор статьи</label>
                                        <div className="relative group">
                                            <Input
                                                value={editingPost?.author || ''}
                                                onChange={(e) => setEditingPost(prev => ({ ...prev!, author: e.target.value }))}
                                                placeholder="Имя автора или название сайта..."
                                                className="h-12 rounded-xl border-gray-100 bg-gray-50 focus:bg-white focus:ring-blue-500 transition-all pl-10"
                                            />
                                            <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-blue-500 transition-colors" />
                                        </div>
                                    </div>

                                    <div className="grid gap-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase ml-1">Ссылка на обложку (изображение)</label>
                                        <div className="relative group">
                                            <Input
                                                value={editingPost?.image || ''}
                                                onChange={(e) => setEditingPost(prev => ({ ...prev!, image: e.target.value }))}
                                                placeholder="https://example.com/image.jpg"
                                                className="h-12 rounded-xl border-gray-100 bg-gray-50 focus:bg-white focus:ring-blue-500 transition-all pl-10"
                                            />
                                            <ExternalLink className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-blue-500 transition-colors" />
                                        </div>
                                        {editingPost?.image && (
                                            <div className="mt-2 rounded-xl overflow-hidden border border-gray-100 aspect-video bg-gray-50">
                                                <img src={editingPost.image} alt="Preview" className="w-full h-full object-cover" onError={(e) => e.currentTarget.style.display = 'none'} />
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid gap-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase ml-1">Краткое описание (экстракт)</label>
                                        <Input
                                            value={editingPost?.excerpt || ''}
                                            onChange={(e) => setEditingPost(prev => ({ ...prev!, excerpt: e.target.value }))}
                                            placeholder="Коротко о чем статья..."
                                            className="h-12 rounded-xl border-gray-100 bg-gray-50 focus:bg-white focus:ring-blue-500 transition-all"
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase ml-1">Текст статьи</label>
                                        <Textarea
                                            value={editingPost?.content}
                                            onChange={(e) => setEditingPost(prev => ({ ...prev!, content: e.target.value }))}
                                            placeholder="Напишите вашу статью здесь..."
                                            className="min-h-[200px] rounded-[20px] border-gray-100 bg-gray-50 focus:bg-white focus:ring-blue-500 transition-all resize-none p-4"
                                            required
                                        />
                                    </div>
                                </div>
                            </form>

                            <div className="p-6 bg-gray-50/50 border-t border-gray-100 flex gap-3">
                                <Button
                                    type="button"
                                    onClick={() => setIsEditorOpen(false)}
                                    className="flex-1 h-12 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-bold"
                                >
                                    Отмена
                                </Button>
                                <Button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="flex-1 h-12 rounded-xl bg-gray-900 border border-black text-white hover:bg-black font-bold shadow-lg flex items-center justify-center gap-2"
                                >
                                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    {editingPost?.id ? 'Сохранить изменения' : 'Опубликовать'}
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
