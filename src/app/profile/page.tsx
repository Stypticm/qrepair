'use client'

import { useStartForm } from '@/components/StartFormContext/StartFormContext';
import { SkupkaRequest } from '@/core/lib/interfaces';
import { useEffect, useState } from 'react';
import Image from 'next/image';

const ProfilePage = () => {
    const { telegramId, username } = useStartForm();
    const [application, setApplication] = useState<SkupkaRequest[]>([])
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const getApplication = async () => {
            if (!telegramId) {
                setError('Telegram ID не указан');
                return;
            }

            try {
                const res = await fetch(`/api/profile?telegramId=${telegramId}`);
                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.error || 'Ошибка при загрузке заявки');
                }
                const data = await res.json();
                setApplication(data);
            } catch (err) {
                console.error('Error fetching application:', err);
                setError('Не удалось загрузить заявку');
            }
        };

        if (telegramId) getApplication();
    }, [telegramId])

    if (error) return <div className="text-center mt-10 text-red-500">{error}</div>;
    if (!application) return <div className="text-center mt-10">Загрузка...</div>;

    return (
        <section>
            <h1>Profile</h1>
            <p>Telegram ID: {telegramId}</p>
            <p>Username: {username}</p>
            <Image
                src="/banan.gif"
                alt="Banan"
                width={400}
                height={300}
                className="w-16 h-16 rounded-full"
            />
            <section>
                <h2>Статус ваших заявок: </h2>
                {/* {
                    application.map((item) => (
                        <section key={item.id} className='flex flex-col'>
                            <h3>{item.id}</h3>
                            <p>{
                                item.brandname && item.modelname ? `${item.brandname} ${item.modelname}` : item.brandModelText
                            }</p>
                            <p>{
                                item.status
                            }</p>
                        </section>
                    ))
                } */}
            </section>
        </section>
    )
}

export default ProfilePage