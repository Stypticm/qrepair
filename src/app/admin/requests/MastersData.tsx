import { prisma } from '@/core/lib/prisma';
import { MastersProvider } from './MastersProvider';
import { ReactNode } from 'react';

// Server Component - загружает только masters
interface MastersDataProps {
  children: ReactNode;
}

export async function MastersData({ children }: MastersDataProps) {
  const masters = await prisma.master.findMany({
    select: {
      id: true,
      name: true,
      username: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return <MastersProvider masters={masters}>{children}</MastersProvider>;
}
