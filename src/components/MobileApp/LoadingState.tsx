'use client';

import { getPictureUrl } from '@/core/lib/assets';

export const LoadingState = () => {
    return (
        <div className="fixed inset-0 z-[20000] flex flex-col items-center justify-center p-6 bg-gradient-to-b from-white to-gray-50">
            <img
                src={getPictureUrl('animation_running.gif') || '/animation_running.gif'}
                alt="Загрузка"
                width={64}
                height={64}
                className="object-contain"
            />
            <p className="text-gray-600 mt-4 font-medium animate-pulse">Инициализация...</p>
        </div>
    );
};
