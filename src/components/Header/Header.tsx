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
    const { safeAreaInsets, isReady, isTelegram } = useSafeArea();

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
        <SafeAreaWrapper padding="top" className="bg-background border-b border-border">
            <section className="container mx-auto px-4 py-3 flex items-center justify-between">
                {/* Дополнительный отступ сверху для Telegram */}
                {isTelegram && (
                    <div 
                        className="absolute top-0 left-0 w-full bg-transparent" 
                        style={{ 
                            height: `${Math.max(safeAreaInsets.top, 20)}px`,
                            minHeight: '20px'
                        }}
                    />
                )}
                
                <div className="flex items-center space-x-2">
                    <Image
                        src="/vercel.svg"
                        alt="Logo"
                        width={24}
                        height={24}
                        className="w-6 h-6"
                    />
                    <span className="font-bold text-lg">QRepair</span>
                </div>
                
                <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">{username || 'User'}</span>
                    {userPhotoUrl && (
                        <Image
                            src={userPhotoUrl}
                            alt="User"
                            width={32}
                            height={32}
                            className="w-8 h-8 rounded-full"
                        />
                    )}
                </div>
            </section>
        </SafeAreaWrapper>
    );
};

export default Header;
