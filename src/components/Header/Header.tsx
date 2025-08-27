'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '../ui/button';
import { useStartForm } from '../StartFormContext/StartFormContext';
import Image from 'next/image';
import { getPictureUrl } from '@/core/lib/assets';
import { SafeAreaWrapper } from '../SafeAreaWrapper';

const Header = () => {
    const { telegramId, username, userPhotoUrl } = useStartForm();

    return (
        <SafeAreaWrapper padding="top">
            <section className="p-2 flex items-center justify-between">
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
