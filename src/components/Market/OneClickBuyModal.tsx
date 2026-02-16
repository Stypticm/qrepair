'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Phone, User, CheckCircle2, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAppStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface OneClickBuyModalProps {
    isOpen: boolean;
    onClose: () => void;
    productId?: string;
    productTitle: string;
    productPrice: number | null;
}

export function OneClickBuyModal({ isOpen, onClose, productId, productTitle, productPrice }: OneClickBuyModalProps) {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
    const username = useAppStore(state => state.username);
    const telegramId = useAppStore(state => state.telegramId);

    // Check if current user is guest
    const isGuest = !telegramId || telegramId === 'browser_test_user' || telegramId.startsWith('guest_');

    useEffect(() => {
        if (username) setName(username);
    }, [username]);

    const formatPhoneNumber = (value: string) => {
        // Remove all non-digit characters
        const digits = value.replace(/\D/g, '');

        // Handle prefix +7 (if the user starts typing after it)
        // If the user pasted something with 7 or 8 at the start, skip it
        let mainDigits = digits;
        if (digits.startsWith('7') || digits.startsWith('8')) {
            mainDigits = digits.substring(1);
        }

        // Limit to 10 digits (after +7)
        mainDigits = mainDigits.substring(0, 10);

        // Format: +7 (XXX) XXX-XX-XX
        let result = '+7';
        if (mainDigits.length > 0) {
            result += ' (' + mainDigits.substring(0, 3);
        }
        if (mainDigits.length >= 4) {
            result += ') ' + mainDigits.substring(3, 6);
        }
        if (mainDigits.length >= 7) {
            result += '-' + mainDigits.substring(6, 8);
        }
        if (mainDigits.length >= 9) {
            result += '-' + mainDigits.substring(8, 10);
        }

        return result;
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target.value;
        const formatted = formatPhoneNumber(input);
        setPhone(formatted);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Check if phone has enough digits (10 digits + prefix total 11 digits minimum)
        const digits = phone.replace(/\D/g, '');
        if (digits.length < 11) return;

        setStatus('loading');

        try {
            const response = await fetch('/api/market/quick-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    phone,
                    productId,
                    productTitle,
                    price: productPrice,
                    telegramId: useAppStore.getState().telegramId || telegramId
                })
            });

            if (response.ok) {
                setStatus('success');
                // Auto-close after success
                setTimeout(() => {
                    onClose();
                    // Reset after transition
                    setTimeout(() => {
                        setStatus('idle');
                        setPhone('');
                    }, 500);
                }, 4000);
            } else {
                setStatus('idle');
                alert('Ошибка при оформлении заказа. Попробуйте еще раз.');
            }
        } catch (error) {
            console.error('Submit error:', error);
            setStatus('idle');
        }
    };

    const isPhoneValid = phone.replace(/\D/g, '').length === 11;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent
                className="w-full max-w-sm p-0 overflow-hidden rounded-[32px] border-none shadow-2xl"
                showCloseButton={false}
            >
                <div className="relative bg-white">
                    <AnimatePresence>
                        {status === 'success' && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="absolute inset-0 z-50 bg-white flex flex-col items-center justify-center p-8 text-center"
                            >
                                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
                                    <CheckCircle2 className="w-10 h-10 text-green-500" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Заявка принята!</h3>
                                <p className="text-sm text-gray-500">
                                    Менеджер свяжется с вами в течение 15 минут для подтверждения заказа.
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <button
                        type="button"
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors z-[60]"
                    >
                        <X className="w-4 h-4 text-gray-500" />
                    </button>

                    <div className="p-8 pb-10">
                        <DialogHeader className="mb-8 text-left">
                            <DialogTitle className="text-xl font-bold text-gray-900 leading-tight">Купить в 1 клик</DialogTitle>
                            <p className="text-sm text-gray-500 mt-2 line-clamp-1">{productTitle}</p>
                        </DialogHeader>

                        {isGuest && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-6 p-4 bg-blue-50 rounded-2xl border border-blue-100"
                            >
                                <p className="text-blue-800 text-xs font-medium flex items-center gap-2 leading-relaxed">
                                    <span>💡</span>
                                    Совет: установите приложение для получения уведомлений и отслеживания заказов в личном кабинете.
                                </p>
                            </motion.div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-400 ml-4 uppercase tracking-wider">Ваше имя</label>
                                <div className="relative">
                                    <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <Input
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Имя"
                                        autoComplete="name"
                                        className="h-14 pl-12 rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-teal-500 transition-all text-base"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-400 ml-4 uppercase tracking-wider">Телефон</label>
                                <div className="relative">
                                    <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <Input
                                        required
                                        type="tel"
                                        value={phone}
                                        onChange={handlePhoneChange}
                                        placeholder="+7 (___) ___-__-__"
                                        className="h-14 pl-12 rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-teal-500 transition-all text-base font-mono"
                                    />
                                </div>
                            </div>

                            <div className="pt-4">
                                <Button
                                    type="submit"
                                    disabled={status === 'loading' || !isPhoneValid}
                                    className="w-full h-14 rounded-2xl bg-gray-900 hover:bg-black text-white font-semibold text-base shadow-xl shadow-gray-200 transition-all active:scale-[0.98]"
                                >
                                    {status === 'loading' ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            Оформить заказ
                                            <ChevronRight className="w-5 h-5 ml-1" />
                                        </>
                                    )}
                                </Button>
                                <p className="text-[10px] text-gray-400 text-center mt-4 px-4 leading-tight">
                                    Нажимая кнопку, вы соглашаетесь с политикой обработки персональных данных.
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
