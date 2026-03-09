import { api } from '@/services/api';
import { PointsProvider } from './PointsProvider';
import { ReactNode } from 'react';

interface Point {
  id: number;
  address: string;
  workingHours: string;
  name: string;
}

// Server Component - загружает только points
interface PointsDataProps {
  children: ReactNode;
}

export async function PointsData({ children }: PointsDataProps) {
  try {
    const points = await api.list<Point>('points');
    const sortedPoints = [...points].sort((a, b) => a.id - b.id);
    return <PointsProvider points={sortedPoints}>{children}</PointsProvider>;
  } catch (error) {
    console.error('Failed to fetch points:', error);
    return <PointsProvider points={[]}>{children}</PointsProvider>;
  }
}
