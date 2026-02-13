'use client';

import { getPictureUrl } from '@/core/lib/assets';

export const LoadingState = () => {
    return (
        <div className="fixed inset-0 z-[20000] flex flex-col items-center justify-center p-6 bg-gradient-to-b from-white to-gray-50">
            <img
                src={getPictureUrl('coconut-dancing.gif') || '/coconut-dancing.gif'}
                alt="Загрузка"
                className="w-24 h-24 object-contain"
            />
            <p className="text-gray-600 mt-4 font-medium animate-pulse">Инициализация...</p>
        </div>
    );
};
