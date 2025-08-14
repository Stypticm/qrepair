'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useStartForm } from '../StartFormContext/StartFormContext';
import { CheckCircle } from 'lucide-react';

type Props = {
    text?: string
    phoneModel?: string
    phoneImage?: string
    basePrice?: number
    finalPrice?: number
    redirectTo?: string
    onClose?: () => void
}

export const SuccessPopup = ({
    text = '',
    phoneModel = '',
    phoneImage = '',
    basePrice,
    finalPrice,
    redirectTo = '/',
    onClose }:
    Props) => {
    const router = useRouter()

    const handleClick = () => {
        if (onClose) onClose();
        router.push(redirectTo);
    };

    return (
        <div
            onClick={handleClick}
            className="h-[100vh] fixed inset-0 bg-background z-50 flex items-center justify-center cursor-pointer animate-slideUpFull rounded-md"
        >
            <div className="flex flex-col items-center text-center px-4 gap-6">
                <div className="flex flex-col items-center text-center mb-4">
                    <CheckCircle size={48} className="text-green-500 mb-2" />
                    <h2 className="text-xl font-bold text-black">{text}</h2>
                </div>
                {/* <section>
                    <Image
                        src={phoneImage}
                        alt="phone"
                        width={200}
                        height={200}
                        className='rounded-md'
                    />
                </section> */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="bg-gray-100 rounded-lg p-3 text-center">
                        <p className="text-sm text-gray-500">Новый</p>
                        <p className="text-lg font-bold text-black">{basePrice?.toLocaleString()} ₽</p>
                    </div>
                    <div className="bg-green-100 rounded-lg p-3 text-center">
                        <p className="text-sm text-gray-500">Наше предложение</p>
                        <p className="text-lg font-bold text-green-600">{finalPrice?.toLocaleString()} ₽</p>
                    </div>
                </div>

                <div className="text-center mb-4">
                    <p className="text-lg font-semibold text-black">{phoneModel}</p>
                    <p className="text-xl font-bold text-gray-600">
                        Мы готовы предложить за вашу модель отличную цену!
                    </p>
                </div>
                <p className="text-3xl font-bold text-black border-3 !border-slate-700 bg-orange-600 p-2 w-full rounded-md">Связаться с нами</p>
                <p className="fixed bottom-4 text-sm text-gray-500 mt-2">(Нажмите, чтобы вернуться на главную)</p>
            </div>
        </div>
    )
}