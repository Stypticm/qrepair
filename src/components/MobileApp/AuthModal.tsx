'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { motion, AnimatePresence } from 'framer-motion';
import { useSafeArea } from '@/hooks/useSafeArea';
import { X, LogIn, UserPlus } from 'lucide-react';
import { useEffect, useState } from 'react';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: (user: any) => void;
}

export const AuthModal = ({ isOpen, onClose, onSuccess }: AuthModalProps) => {
    const { isDesktop } = useSafeArea();
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setMode('login');
            setLogin('');
            setPassword('');
            setConfirmPassword('');
            setError('');
        }
    }, [isOpen]);

    // Body scroll locking when modal is open
    useEffect(() => {
        if (isOpen && isDesktop) {
            const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
            const originalOverflow = document.body.style.overflow;
            const originalPaddingRight = document.body.style.paddingRight;

            document.body.style.overflow = 'hidden';
            document.body.style.paddingRight = `${scrollbarWidth}px`;

            return () => {
                document.body.style.overflow = originalOverflow;
                document.body.style.paddingRight = originalPaddingRight;
            };
        }
    }, [isOpen, isDesktop]);

    const handleSubmit = async () => {
        if (!login || !password) {
            setError('Заполните все поля');
            return;
        }

        if (mode === 'register') {
            if (password !== confirmPassword) {
                setError('Пароли не совпадают');
                return;
            }
            if (password.length < 6) {
                setError('Пароль должен быть не менее 6 символов');
                return;
            }
        }

        setLoading(true);
        setError('');

        try {
            if (mode === 'login') {
                const { login: loginAction } = await import('@/stores/authStore').then(m => ({ login: m.useAppStore.getState().login }));
                const success = await loginAction(login, password);

                if (success) {
                    const user = await import('@/stores/authStore').then(m => m.useAppStore.getState().user);
                    onSuccess?.(user);
                    onClose();
                } else {
                    setError('Неверный логин или пароль');
                }
            } else {
                // Register
                const res = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ login, password }),
                });

                const data = await res.json();

                if (!res.ok) {
                    setError(data.error || 'Ошибка');
                    return;
                }

                // Update store
                const { setAuthData } = await import('@/stores/authStore').then(m => m.useAppStore.getState());
                setAuthData({ user: data.user, token: data.token });

                onSuccess?.(data.user);
                onClose();
            }
        } catch (err: any) {
            console.error(err);
            setError('Ошибка сервера');
        } finally {
            setLoading(false);
        }
    };

    const formContent = (
        <div className="space-y-4">
            <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
                <button
                    onClick={() => setMode('login')}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${mode === 'login'
                        ? 'bg-white text-[#54A9EB] shadow-sm'
                        : 'text-gray-600'
                        }`}
                >
                    Вход
                </button>
                <button
                    onClick={() => setMode('register')}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${mode === 'register'
                        ? 'bg-white text-[#54A9EB] shadow-sm'
                        : 'text-gray-600'
                        }`}
                >
                    Регистрация
                </button>
            </div>

            {mode === 'login' ? (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Логин
                        </label>
                        <input
                            type="text"
                            value={login}
                            onChange={(e) => setLogin(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#54A9EB] focus:ring-2 focus:ring-[#54A9EB]/20 outline-none transition-all"
                            placeholder="Введите логин"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Пароль
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#54A9EB] focus:ring-2 focus:ring-[#54A9EB]/20 outline-none transition-all"
                            placeholder="Введите пароль"
                        />
                    </div>

                    {error && (
                        <div className="text-sm text-red-500 bg-red-50 px-4 py-2 rounded-lg">
                            {error}
                        </div>
                    )}

                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-full bg-[#54A9EB] text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-500/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                {mode === 'login' ? <LogIn size={20} /> : <UserPlus size={20} />}
                                <span>{mode === 'login' ? 'Войти' : 'Зарегистрироваться'}</span>
                            </>
                        )}
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Логин
                        </label>
                        <input
                            type="text"
                            value={login}
                            onChange={(e) => setLogin(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#54A9EB] focus:border-transparent transition-all"
                            placeholder="Введите логин"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Пароль (минимум 6 символов)
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#54A9EB] focus:border-transparent transition-all"
                            placeholder="Введите пароль"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Подтвердите пароль
                        </label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#54A9EB] focus:border-transparent transition-all"
                            placeholder="Повторите пароль"
                        />
                    </div>
                </div>
            )}
        </div>
    );

    // On Desktop we use the standard dialog
    if (isDesktop) {
        return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="sm:max-w-[420px] w-[95%] rounded-3xl border-none bg-white/95 backdrop-blur-xl p-0 overflow-hidden shadow-2xl">
                    <div className="bg-gradient-to-b from-[#54A9EB]/10 to-transparent p-6 pb-2">
                        <DialogHeader>
                            <DialogTitle className="text-center text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#54A9EB] to-[#4397d7]">
                                {mode === 'login' ? 'Вход в аккаунт' : 'Регистрация'}
                            </DialogTitle>
                        </DialogHeader>
                    </div>

                    <div className="p-6 pt-2">
                        {formContent}
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    // On Mobile we use a custom full-screen modal
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        className="fixed inset-x-0 bottom-0 z-[9999] bg-white rounded-t-3xl shadow-2xl max-h-[90vh] overflow-y-auto"
                    >
                        {/* Header */}
                        <div className="sticky top-0 bg-gradient-to-b from-[#54A9EB]/10 to-transparent p-6 pb-4 flex items-center justify-between border-b border-gray-100">
                            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#54A9EB] to-[#4397d7]">
                                Авторизация
                            </h2>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X size={24} className="text-gray-600" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            {formContent}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
