import { prisma } from '@/core/lib/prisma';
import { MastersListClient } from './MastersListClient';

// Server Component - загружает только masters
export async function MastersData() {
  const masters = await prisma.master.findMany({
    include: {
      point: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return <MastersListClient masters={masters} />;
}
