import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TelegramLoginButton } from '@/components/TelegramLoginButton';
import { motion, AnimatePresence } from 'framer-motion';
import { useSafeArea } from '@/hooks/useSafeArea';
import { X } from 'lucide-react';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
    const { isDesktop } = useSafeArea();

    // On Desktop we use the standard dialog
    if (isDesktop) {
        return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="sm:max-w-[420px] w-[95%] rounded-3xl border-none bg-white/95 backdrop-blur-xl p-0 overflow-hidden shadow-2xl">
                    <div className="bg-gradient-to-b from-[#54A9EB]/10 to-transparent p-6 pb-2">
                        <DialogHeader>
                            <DialogTitle className="text-center text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#54A9EB] to-[#4397d7]">
                                Авторизация
                            </DialogTitle>
                        </DialogHeader>
                    </div>

                    <div className="p-6 pt-2 flex flex-col items-center gap-6">
                        <div className="w-20 h-20 bg-gradient-to-br from-[#54A9EB] to-[#4397d7] rounded-3xl flex items-center justify-center shadow-lg transform rotate-3">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM16.64 8.8C16.49 10.38 15.86 14.12 15.54 15.84C15.41 16.56 15.14 16.81 14.88 16.83C14.32 16.89 13.89 16.47 13.35 16.11C12.5 15.55 12.02 15.2 11.2 14.66C10.25 14.04 10.86 13.7 11.41 13.13C11.55 12.98 14.05 10.71 14.1 10.51C14.11 10.48 14.11 10.38 14.05 10.33C14 10.28 13.92 10.3 13.86 10.31C13.77 10.34 11.66 11.73 10.61 12.44C10.45 12.55 10.31 12.6 10.18 12.6C10.04 12.6 9.77 12.52 9.56 12.45C9.31 12.37 9.11 12.32 9.13 12.19C9.14 12.12 9.24 12.04 9.43 11.95C10.61 11.44 14.47 9.84 15.4 9.45C16.63 8.94 16.8 8.8 17.07 8.8C17.13 8.8 17.27 8.82 17.36 8.89C17.44 8.95 17.46 9.04 17.46 9.11C17.46 9.18 17.45 9.25 17.43 9.32L16.64 8.8Z" fill="white" />
                            </svg>
                        </div>

                        <p className="text-center text-gray-600 font-medium px-4">
                            Войдите через Telegram, чтобы получить доступ к своим устройствам, избранному и корзине.
                        </p>

                        <div className="w-full px-4 mb-2">
                            <TelegramLoginButton
                                onAuth={onClose}
                                className="w-full"
                            />
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    // On Mobile/TWA we use a custom bottom sheet
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[10000] flex items-end justify-center">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
                    />

                    {/* Bottom Sheet */}
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="relative w-full max-w-[500px] bg-white rounded-t-[32px] shadow-2xl overflow-hidden pb-[env(safe-area-inset-bottom,20px)]"
                    >
                        {/* Apple-style handle */}
                        <div className="w-full flex justify-center pt-3 pb-1">
                            <div className="w-12 h-1.5 bg-gray-200 rounded-full" />
                        </div>

                        {/* Close button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 bg-gray-100/80 rounded-full active:scale-95 transition-all"
                        >
                            <X size={20} className="text-gray-500" />
                        </button>

                        <div className="bg-gradient-to-b from-[#54A9EB]/10 to-transparent p-6 pb-2">
                            <h2 className="text-center text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#54A9EB] to-[#4397d7]">
                                Авторизация
                            </h2>
                        </div>

                        <div className="p-6 pt-2 flex flex-col items-center gap-6">
                            <div className="w-20 h-20 bg-gradient-to-br from-[#54A9EB] to-[#4397d7] rounded-3xl flex items-center justify-center shadow-lg transform rotate-3">
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM16.64 8.8C16.49 10.38 15.86 14.12 15.54 15.84C15.41 16.56 15.14 16.81 14.88 16.83C14.32 16.89 13.89 16.47 13.35 16.11C12.5 15.55 12.02 15.2 11.2 14.66C10.25 14.04 10.86 13.7 11.41 13.13C11.55 12.98 14.05 10.71 14.1 10.51C14.11 10.48 14.11 10.38 14.05 10.33C14 10.28 13.92 10.3 13.86 10.31C13.77 10.34 11.66 11.73 10.61 12.44C10.45 12.55 10.31 12.6 10.18 12.6C10.04 12.6 9.77 12.52 9.56 12.45C9.31 12.37 9.11 12.32 9.13 12.19C9.14 12.12 9.24 12.04 9.43 11.95C10.61 11.44 14.47 9.84 15.4 9.45C16.63 8.94 16.8 8.8 17.07 8.8C17.13 8.8 17.27 8.82 17.36 8.89C17.44 8.95 17.46 9.04 17.46 9.11C17.46 9.18 17.45 9.25 17.43 9.32L16.64 8.8Z" fill="white" />
                                </svg>
                            </div>

                            <p className="text-center text-gray-600 font-medium px-4">
                                Войдите через Telegram, чтобы получить доступ к своим устройствам, избранному и корзине.
                            </p>

                            <div className="w-full px-4 mb-4">
                                <TelegramLoginButton
                                    onAuth={onClose}
                                    className="w-full"
                                />
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
