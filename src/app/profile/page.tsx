'use client'

import { useStartForm } from '@/components/StartFormContext/StartFormContext';
import { RepairRequest } from '@/core/lib/interfaces';
import { useEffect, useState } from 'react';

const ProfilePage = () => {
    const { telegramId, username } = useStartForm();
    const [application, setApplication] = useState<RepairRequest[]>([])
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
            <img
                alt="Telegram sticker"
                src="https://xelene.me/telegram.gif"
                style={{ display: 'block', width: '144px', height: '144px' }}
            />
            <section>
                <h2>Статус ваших заявок: </h2>
                {
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
                }
            </section>
        </section>
    )
}

export default ProfilePage