import { prisma } from '@/core/lib/prisma';
import { RequestsList } from './RequestsList';

// Server Component - загружает только requests
export async function RequestsData() {
  const requests = await prisma.skupka.findMany({
    include: {
      assignedMaster: {
        select: {
          id: true,
          name: true,
          username: true,
        },
      },
      assignedCourier: {
        select: {
          id: true,
          telegramId: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return <RequestsList requests={requests} />;
}
