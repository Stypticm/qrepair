'use client';

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { QRCodeSVG as QRCode } from 'qrcode.react';

interface QRModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const QRModal = ({ isOpen, onClose }: QRModalProps) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-sm p-8 bg-white rounded-3xl aria-describedby={undefined}">
                <DialogTitle className="sr-only">Сканируйте QR-код для оценки</DialogTitle>
                <div className="text-center font-sans">
                    <div className="bg-white p-2 rounded-xl mb-4 mx-auto flex items-center justify-center">
                        <QRCode
                            value={`https://t.me/${process.env.NEXT_PUBLIC_BOT_USERNAME || 'qoqos_bot'}/app?startapp=fullscreen`}
                            size={200}
                            level="M"
                            bgColor="#ffffff"
                            fgColor="#000000"
                            includeMargin={false}
                        />
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-gray-900">Оценить устройство</h3>
                    <p className="text-gray-500 text-sm">
                        Наведите камеру смартфона, чтобы начать оценку вашего устройства в Telegram
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
};
