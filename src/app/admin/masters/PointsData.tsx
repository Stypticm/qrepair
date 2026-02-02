import { prisma } from '@/core/lib/prisma';
import { PointsProvider } from './PointsProvider';
import { ReactNode } from 'react';

// Server Component - загружает только points
interface PointsDataProps {
  children: ReactNode;
}

export async function PointsData({ children }: PointsDataProps) {
  const points = await prisma.point.findMany({
    orderBy: { id: 'asc' },
  });

  return <PointsProvider points={points}>{children}</PointsProvider>;
}
