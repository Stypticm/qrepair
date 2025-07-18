'use client';

import { Progress } from '@/components/ui/progress';
import { repairSteps } from '@/core/lib/constants';
import { usePathname } from 'next/navigation';
import React from 'react';

const ProgressBar = () => {
  const pathName = usePathname();
  const index = repairSteps.findIndex((value) => pathName.startsWith(value.path));
  const percent = ((index + 1) / repairSteps.length) * 100;

  return (
    <section className="w-full p-2">
      <Progress value={percent} className="bg-slate-200 [&>div]:bg-green-700" />
    </section>
  );
};

export default ProgressBar;
