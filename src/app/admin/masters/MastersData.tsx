import { api } from '@/services/api';
import { MastersListClient } from './MastersListClient';

interface Master {
  id: string;
  telegramId: string;
  username: string;
  name: string | null;
  isActive: boolean;
  pointId: number | null;
  createdAt: string;
}

interface Point {
  id: number;
  address: string;
  workingHours: string;
  name: string;
}

// Server Component - загружает только masters
export async function MastersData() {
  try {
    const [masters, points] = await Promise.all([
      api.list<Master>('masters'),
      api.list<Point>('points'),
    ]);

    // Join point data manually
    const mastersWithPoints = masters.map(master => ({
      ...master,
      point: master.pointId ? points.find(p => p.id === master.pointId) : null,
    }));

    // Sort by createdAt desc
    const sortedMasters = mastersWithPoints.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return <MastersListClient masters={sortedMasters as any} />;
  } catch (error) {
    console.error('Failed to fetch masters data:', error);
    return <MastersListClient masters={[]} />;
  }
}
