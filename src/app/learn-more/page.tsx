import { Page } from '@/components/Page';
import Image from 'next/image';
import React from 'react';
import { getPictureUrl } from '@/core/lib/assets';

const LearnMore = () => {
    return (
        <Page back={true}>
            <div className="min-h-screen min-w-screen bg-gradient-to-b from-white to-gray-50 flex flex-col" style={{ padding: 'env(--safe-area-top, 20px) env(--safe-area-right, 0px) env(--safe-area-bottom, 0px) env(--safe-area-left, 0px)' }}>
                <div className="w-full max-w-md mx-auto text-center space-y-6 px-6 pt-20">
                    <h1 className="text-3xl font-semibold text-gray-900 text-center leading-tight tracking-tight">
                        📦 Как происходит выкуп
                    </h1>
                    <Image
                        src={getPictureUrl('instruction.png') || '/instruction.png'}
                        alt="Инструкция"
                        width={400}
                        height={200}
                        className="w-full h-auto object-contain rounded-2xl shadow-lg"
                    />
                    <div className="text-base text-center text-gray-600 w-full font-medium space-y-2">
                        <p>🔐 Безопасно: договор и выезд с курьером</p>
                        <p>💰 Гарантия честной цены</p>
                        <p>🚀 Быстро: оценка за 3 минуты</p>
                    </div>
                </div>
            </div>
        </Page>
    );
};

export default LearnMore;