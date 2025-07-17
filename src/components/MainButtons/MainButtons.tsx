import { Button } from '@/components/ui/button';
import Link from 'next/link';
import React from 'react';

const MainButtons = () => {
  return (
    <section className="m-5">
      <h2 className="p-1 text-slate-700 text-3xl max-[400px]:text-2xl max-[360px]:text-lg break-words font-bold text-center">
        Ремонт вашего телефона
      </h2>
      <section>
        <Button className="bg-slate-700 w-full py-8 rounded-xl">
          <span className="text-slate-100 text-3xl font-bold">
            <Link href="/repair/choose">Начать</Link>
          </span>
        </Button>
      </section>
    </section>
  );
};

export default MainButtons;
