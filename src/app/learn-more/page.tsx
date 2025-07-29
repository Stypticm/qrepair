import { Page } from '@/components/Page';
import Image from 'next/image';
import React from 'react';

const LearnMore = () => {
    return (
        <Page back={true}>
            <div className="flex flex-col items-center justify-start w-screen h-screen p-4">
                <h2 className="text-2xl font-extrabold uppercase text-black tracking-tight mb-2 text-center">📦 как происходит выкуп</h2>
                <Image
                    src="/instruction.jpg"
                    alt="Инструкция"
                    width={400}
                    height={200}
                    className="w-full h-auto object-contain mb-4"
                />
                <div className="mt-6 text-lg text-slate-700 w-full font-semibold">
                    <p>🔐 Безопасно: договор и выезд с курьером</p>
                </div>
            </div>
        </Page>
    );
};

export default LearnMore;