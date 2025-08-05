'use client';

import { Page } from '@/components/Page';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';

export default function StatusPage() {
    const searchParams = useSearchParams();
    const status = searchParams.get('status');

    const statuses = [
        { key: 'on_the_way', image: 'pic_on_the_way', label: 'В пути' },
        { key: 'in_progress', image: 'pic_in_progress', label: 'На проверке' },
        { key: 'accepted', image: 'pic_accepted', label: 'Принята' },
        { key: 'paid', image: 'pic_paid', label: 'Оплачено' },
    ];

    return (
        <Page back={true}>
            <div className="flex flex-col items-center justify-start w-full h-full p-4">
                <h2 className="text-3xl font-extrabold uppercase text-black tracking-tight mb-2 text-center">📋 Статус заявки</h2>
                {status && (
                    <div className="grid grid-cols-2 gap-4 items-center">
                        {statuses.map((item) => (
                            <div
                                key={item.key}
                                className={`flex flex-col items-center border-1 ${status === item.key ? '' : 'blur-[2px]'}`}
                            >
                                <Image
                                    src={`/status/${item.image}.png`}
                                    alt={item.label}
                                    width={200}
                                    height={200}
                                    priority
                                    className="object-cover rounded-lg"
                                />
                                <span className="text-black text-lg font-bold mt-2">{item.label}</span>
                            </div>
                        ))}
                    </div>
                )
                }
            </div>
        </Page>
    );
}