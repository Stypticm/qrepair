'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useStartForm } from '../StartFormContext/StartFormContext';
import { CheckCircle } from 'lucide-react';

type Props = {
    text?: string;
    phoneModel?: string;
    phoneImage?: string;
    redirectTo?: string;
    priceNewPhone?: number;
    onClose?: () => void
}

export const SuccessPopup = ({
    text = '',
    phoneModel = '',
    phoneImage = '',
    redirectTo = '/',
    priceNewPhone = 0,
    onClose
}: Props) => {
    const { price } = useStartForm();
    const router = useRouter()

    const handleClick = () => {
        if (onClose) onClose();
        router.push(redirectTo);
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md relative">

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                    ✕
                </button>

                <div className="flex flex-col items-center text-center mb-4">
                    <CheckCircle size={48} className="text-green-500 mb-2" />
                    <h2 className="text-xl font-bold">{text}</h2>
                </div>

                <div className="flex justify-center mb-4">
                    <img
                        src={phoneImage}
                        alt={phoneModel}
                        className="max-h-48 object-contain rounded-lg"
                    />
                </div>

                {/* Сравнение цен */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="bg-gray-100 rounded-lg p-3 text-center">
                        <p className="text-sm text-gray-500">Новый</p>
                        <p className="text-lg font-bold">{priceNewPhone.toLocaleString()} ₽</p>
                    </div>
                    <div className="bg-green-100 rounded-lg p-3 text-center">
                        <p className="text-sm text-gray-500">Наше предложение</p>
                        <p className="text-lg font-bold text-green-600">{price} ₽</p>
                    </div>
                </div>

                {/* Модель телефона */}
                <div className="text-center mb-4">
                    <p className="text-lg font-semibold">{phoneModel}</p>
                    <p className="text-sm text-gray-600">
                        Мы готовы предложить за вашу модель отличную цену!
                    </p>
                </div>

                {/* Кнопка */}
                <a
                    href={redirectTo}
                    className="block bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-xl text-center transition"
                >
                    Связаться с нами
                </a>
            </div>
        </div>
    )
}