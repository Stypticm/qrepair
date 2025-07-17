'use client';

import React from 'react';
import Link from 'next/link';
import { List } from '@telegram-apps/telegram-ui';

const Header = () => {
    return (
        <section className="p-2 flex items-center justify-start">
            <article className="p-2 bg-slate-700 border border-slate-700 rounded-md">
                <Link href="/">
                    <span className="text-6xl text-slate-100 font-extrabold">
                        Q
                    </span>
                </Link>
            </article>
        </section>
    );
};

export default Header;
