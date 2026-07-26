'use client';

import { getPictureUrl } from '@/core/lib/assets';

export const LoadingState = () => {
    return (
        <div className="fixed inset-0 z-[20000] flex flex-col items-center justify-center p-6 bg-gradient-to-b from-background to-surface">
            <img
                src={getPictureUrl('animation_running.gif') || '/animation_running.gif'}
                alt="Загрузка"
                className="w-32 h-32 object-contain"
            />
            <p className="text-muted mt-6 font-medium animate-pulse text-lg">Загрузка...</p>
        </div>
    );
};
