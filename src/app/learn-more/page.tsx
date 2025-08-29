import { Page } from '@/components/Page';
import Image from 'next/image';
import React from 'react';
import { getPictureUrl } from '@/core/lib/assets';

const LearnMore = () => {
    return (
        <Page back={true}>
            <div className="min-h-screen min-w-screen bg-[#f9ecb8] flex flex-col" style={{ padding: 'env(--safe-area-top, 0px) env(--safe-area-right, 0px) env(--safe-area-bottom, 0px) env(--safe-area-left, 0px)' }}>
                <h1 className="text-2xl font-extrabold uppercase text-black text-center leading-tight px-2">
                    📦 как<br />происходит<br />выкуп
                </h1>
                <Image
                    src={getPictureUrl('instruction.png') || '/instruction.png'}
                    alt="Инструкция"
                    width={400}
                    height={200}
                    className="w-full h-auto object-contain mb-4"
                />
                <div className="mt-6 text-lg text-center text-slate-700 w-full font-semibold">
                    <p>🔐 Безопасно: договор и выезд с курьером</p>
                </div>
            </div>
        </Page>
    );
};

export default LearnMore;