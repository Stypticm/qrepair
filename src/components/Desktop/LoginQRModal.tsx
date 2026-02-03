'use client';

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { TelegramQRLogin } from '@/components/TelegramQRLogin';

interface LoginQRModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const LoginQRModal = ({ isOpen, onClose }: LoginQRModalProps) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-sm p-0 bg-white rounded-3xl overflow-hidden aria-describedby={undefined}">
                <DialogTitle className="sr-only">Вход в Telegram через QR-код</DialogTitle>
                <TelegramQRLogin onSuccess={onClose} />
            </DialogContent>
        </Dialog>
    );
};
