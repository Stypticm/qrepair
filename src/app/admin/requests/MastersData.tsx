import { prisma } from '@/core/lib/prisma';
import { MastersProvider } from './MastersProvider';
import { ReactNode } from 'react';

// Server Component - загружает только masters
interface MastersDataProps {
  children: ReactNode;
}

export async function MastersData({ children }: MastersDataProps) {
  const [masters, couriers] = await Promise.all([
    prisma.master.findMany({
      select: {
        id: true,
        name: true,
        username: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.findMany({
      where: { role: 'COURIER' },
      select: {
        id: true,
        telegramId: true, // we use telegramId as name if name is missing
      },
    }).then(users => users.map(u => ({
      id: u.id,
      name: u.telegramId,
      username: u.telegramId,
    })))
  ]);

  return <MastersProvider masters={masters} couriers={couriers}>{children}</MastersProvider>;
}
