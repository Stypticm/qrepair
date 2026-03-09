import { api } from '@/services/api';
import { MastersProvider } from './MastersProvider';
import { ReactNode } from 'react';

interface Master {
  id: string;
  name: string | null;
  username: string;
}

interface User {
  id: string;
  telegramId: string;
  role: string;
}

// Server Component - загружает только masters
interface MastersDataProps {
  children: ReactNode;
}

export async function MastersData({ children }: MastersDataProps) {
  try {
    const [masters, allUsers] = await Promise.all([
      api.list<Master>('masters'),
      api.list<User>('users'),
    ]);

    const couriers = allUsers
      .filter(u => u.role === 'COURIER')
      .map(u => ({
        id: u.id,
        name: u.telegramId,
        username: u.telegramId,
      }));

    return <MastersProvider masters={masters} couriers={couriers}>{children}</MastersProvider>;
  } catch (error) {
    console.error('Failed to fetch masters/couriers:', error);
    return <MastersProvider masters={[]} couriers={[]}>{children}</MastersProvider>;
  }
}
