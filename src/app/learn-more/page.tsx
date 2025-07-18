import { Page } from '@/components/Page';
import Image from 'next/image';
import React from 'react';

const LearnMore = () => {
    return (
        <Page back={true}>
            <div className='h-screen flex justify-center items-center'>
                <Image
                    src="/photo_2025-07-03_19-31-18.jpg"
                    alt="Full Image"
                    priority
                    width={400}
                    height={400}
                    className="object-cover"
                />
            </div>
        </Page>
    );
};

export default LearnMore;