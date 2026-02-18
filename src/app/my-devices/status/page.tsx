'use client';

import { Page } from '@/components/Page';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { getPictureUrl } from '@/core/lib/assets';

function StatusContent() {
    const searchParams = useSearchParams();
    const status = searchParams.get('status');

    const statuses = [
        { key: 'accepted', image: 'pic_accepted', label: 'Принята' },
        { key: 'in_progress', image: 'pic_in_progress', label: 'На проверке' },
        { key: 'on_the_way', image: 'pic_on_the_way', label: 'В пути' },
        { key: 'paid', image: 'pic_paid', label: 'Оплачено' },
    ];

    return (
        <Page back={true}>
            <div className="min-h-screen min-w-screen flex flex-col" style={{ padding: 'env(--safe-area-top, 0px) env(--safe-area-right, 0px) env(--safe-area-bottom, 0px) env(--safe-area-left, 0px)' }}>
                <h1 className="text-2xl font-extrabold uppercase text-black text-center leading-tight px-2">
                    📋 Статус<br />заявки
                </h1>
                {status && (
                    <div className="grid grid-cols-2 gap-2 items-center p-2">
                        {statuses.map((item, index) => (
                            <div
                                key={item.key}
                                className={`flex flex-col items-center ${status === item.key ? '' : 'blur-[2px]'}`}
                            >
                                <Image
                                    src={getPictureUrl(`${item.image as string}.png`) || `/status/${item.image}.png`}
                                    alt={item.label}
                                    width={200}
                                    height={200}
                                    priority
                                    className="object-cover rounded-lg"
                                />
                                <section className='flex flex-row justify-center gap-2'>
                                    <span className={`text-lg font-bold mt-2 border-3 rounded-full w-8 h-8 flex items-center justify-center ${status === item.key ? 'bg-gray-900 text-white' : 'text-gray-900 border-gray-900'}`}>
                                        {index + 1}
                                    </span>
                                    <span className="text-gray-900 text-lg font-bold mt-2 flex items-center justify-center">{item.label}</span>
                                </section>
                            </div>
                        ))}
                    </div>
                )
                }
            </div>
        </Page>
    );
}

export default function StatusPage() {
    return (
        <Suspense fallback={<div className="min-h-screen" />}>
            <StatusContent />
        </Suspense>
    );
}