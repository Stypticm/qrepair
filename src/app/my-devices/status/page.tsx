'use client';

import { Page } from '@/components/Page';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { getStatusImage } from '@/core/lib/assets';

export default function StatusPage() {
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
            <div className="flex flex-col items-center justify-start w-full h-full p-4">
                <h2 className="text-3xl font-extrabold uppercase text-gray-900 tracking-tight mb-2 text-center">📋 Статус заявки</h2>
                {status && (
                    <div className="grid grid-cols-2 gap-4 items-center">
                        {statuses.map((item, index) => (
                            <div
                                key={item.key}
                                className={`flex flex-col items-center ${status === item.key ? '' : 'blur-[2px]'}`}
                            >
                                <Image
                                    src={getStatusImage(item.image) || `/status/${item.image}.png`}
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