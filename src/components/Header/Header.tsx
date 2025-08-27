'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '../ui/button';
import { useStartForm } from '../StartFormContext/StartFormContext';
import Image from 'next/image';
import { getPictureUrl } from '@/core/lib/assets';
import { SafeAreaWrapper } from '../SafeAreaWrapper';
import { useSafeArea } from '@/hooks/useSafeArea';

const Header = () => {
    const { telegramId, username, userPhotoUrl } = useStartForm();
    const { safeAreaInsets, isReady } = useSafeArea();

    // Отладочная информация
    useEffect(() => {
        console.log('Header - Safe Area Insets:', safeAreaInsets);
        console.log('Header - Is Ready:', isReady);
        
        if (window.Telegram?.WebApp) {
            const webApp = window.Telegram.WebApp;
            console.log('Header - Platform:', webApp.platform);
            console.log('Header - Safe Area Insets:', webApp.safeAreaInsets);
            console.log('Header - Safe Area:', webApp.safeArea);
            console.log('Header - Viewport Height:', webApp.viewportHeight);
            console.log('Header - Is Expanded:', webApp.isExpanded);
        }
    }, [safeAreaInsets, isReady]);

    return (
        <SafeAreaWrapper padding="top">
            <section className="p-2 flex items-center justify-between">
                {/* Отладочная информация */}
                {process.env.NODE_ENV === 'development' && (
                    <div className="absolute top-0 left-0 bg-red-500 text-white text-xs p-1 z-50">
                        Top: {safeAreaInsets.top}px | Ready: {isReady ? 'Y' : 'N'}
                    </div>
                )}
                
                <article className="p-2 bg-slate-700 border border-slate-700 rounded-md">
                    <Link href="/">
                        <span className="text-6xl text-slate-100 font-extrabold">
                            Q
                        </span>
                    </Link>
                </article>
                <section className='border border-slate-700 rounded-md'>
                    <Link href="/profile" className='flex items-center justify-center'>
                        <section className="flex flex-col items-center">
                            <Link href="/profile">
                                <span className="text-2xl font-bold text-slate-100">
                                    {username}
                                </span>
                            </Link>
                            <p className="text-2xl font-bold text-slate-100">
                                ID:
                                <span className="text-xl font-bold text-slate-100 p-2">
                                    {telegramId}
                                </span>
                            </p>
                        </section>
                        {
                            userPhotoUrl ? (
                                <Image
                                    src={userPhotoUrl}
                                    className="w-12 h-12 rounded-full"
                                    alt="User photo"
                                    width={48}
                                    height={48}
                                />
                            ) : (
                                <Image
                                    src={getPictureUrl('banan.gif') || '/banan.gif'}
                                    alt="Banan"
                                    width={400}
                                    height={300}
                                    className="w-16 h-16 rounded-full"
                                />
                            )
                        }
                    </Link>
                </section>
            </section>
        </SafeAreaWrapper>
    );
};

export default Header;
