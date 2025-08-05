'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

type Props = {
    text?: string;
    phoneModel?: string;
    phoneImage?: string;
    redirectTo?: string;
    onClose?: () => void
}

export const SuccessPopup = ({
    text = '',
    phoneModel = '',
    phoneImage = '',
    redirectTo = '/',
    onClose
}: Props) => {

    const router = useRouter()

    const handleClick = () => {
        if (onClose) onClose();
        router.push(redirectTo);
    };

    return (
        <div
            onClick={handleClick}
            className="fixed inset-0 bg-background z-50 flex items-center justify-center cursor-pointer animate-slideUpFull rounded-md"
        >
            <div className="flex flex-col items-center text-center px-4 gap-6">
                <section className='flex flex-row items-center'>
                    <p className="text-6xl">✅</p>
                    <span className="text-3xl font-bold text-black">{text}</span>
                </section>
                <section>
                    <Image
                        src={phoneImage}
                        alt="phone"
                        width={400}
                        height={400}
                        className='rounded-md'
                    />
                </section>
                <section className='flex flex-row items-center gap-4 text-2xl font-bold text-black border-3 !border-slate-700 bg-amber-500 p-2 w-full rounded-md'>
                    <span>{phoneModel}</span>
                    <span>~ 65000 ₽</span>
                </section>
                <p className="text-3xl font-bold text-black border-3 !border-slate-700 bg-orange-600 p-2 w-full rounded-md">Связаться с нами</p>
                <p className="fixed bottom-4 text-sm text-gray-500 mt-2">(Нажмите, чтобы вернуться на главную)</p>
            </div>
        </div>
    )
}