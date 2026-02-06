'use client';

import { AdaptiveContainer } from '@/components/AdaptiveContainer/AdaptiveContainer';

interface LoadingStateProps {
    imageUrl: string;
}

export const LoadingState = ({ imageUrl }: LoadingStateProps) => {
    return (
        <AdaptiveContainer>
            <div className="w-full h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-white to-gray-50">
                <img
                    src={imageUrl || '/animation_running.gif'}
                    alt="Загрузка"
                    width={64}
                    height={64}
                    className="object-contain rounded-2xl"
                />
                <p className="text-gray-600 mt-4 font-medium animate-pulse">Инициализация...</p>
            </div>
        </AdaptiveContainer>
    );
};
