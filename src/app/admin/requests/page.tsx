import { Suspense } from 'react';
import { Page } from '@/components/Page';
import { AdminRequestsClient } from './AdminRequestsClient';
import { RequestsData } from './RequestsData';
import { MastersData } from './MastersData';
import { RequestsSkeleton } from './RequestsSkeleton';

// Server Component - используем Suspense для streaming
export default function AdminRequestsPage() {
  return (
    <Page back={true}>
      <AdminRequestsClient>
        {/* Загружаем masters в фоне - они нужны для выбора в RequestsListClient */}
        <Suspense fallback={<RequestsSkeleton />}>
          <MastersData>
            {/* Загружаем requests - основной контент */}
            <Suspense fallback={<RequestsSkeleton />}>
              <RequestsData />
            </Suspense>
          </MastersData>
        </Suspense>
      </AdminRequestsClient>
    </Page>
  );
}
