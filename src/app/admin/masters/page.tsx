import { Suspense } from 'react';
import { Page } from '@/components/Page';
import { AdminMastersClient } from './AdminMastersClient';
import { MastersData } from './MastersData';
import { PointsData } from './PointsData';
import { MastersSkeleton } from './MastersSkeleton';

// Server Component - используем Suspense для streaming
export default function AdminMastersPage() {
  return (
    <Page back={true}>
      <AdminMastersClient>
        {/* Загружаем points в фоне - они нужны для выбора в MastersListClient */}
        <Suspense fallback={<MastersSkeleton />}>
          <PointsData>
            {/* Загружаем masters - основной контент */}
            <Suspense fallback={<MastersSkeleton />}>
              <MastersData />
            </Suspense>
          </PointsData>
        </Suspense>
      </AdminMastersClient>
    </Page>
  );
}
