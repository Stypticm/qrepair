import { Button } from '@/components/ui/button';
import Link from 'next/link';
import React from 'react';

const MainButtons = ({ path }: { path: string }) => {
  return (
    <div className=''>
      {/* <h2 className="p-1 text-slate-100 text-3xl max-[400px]:text-2xl max-[360px]:text-lg break-words font-bold text-center">
        Ремонт вашего телефона
      </h2> */}
      <Button className="bg-slate-700 w-full py-8 rounded-xl">
        <span className="text-slate-100 text-3xl font-bold">
          <Link href={path}>Начать</Link>
        </span>
      </Button>

    </div>
  );
};

export default MainButtons;
