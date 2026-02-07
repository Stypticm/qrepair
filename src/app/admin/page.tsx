'use client';

import { Page } from '@/components/Page';
import { AdminPageClient } from './AdminPageClient';
import { DesktopAdminPage } from './DesktopAdminPage';
import { useSafeArea } from '@/hooks/useSafeArea';

// Server Component - проверка доступа на клиенте
export default function AdminPage() {
  const { isDesktop } = useSafeArea();

  // If we're on desktop, we use the wide, premium layout.
  // Otherwise, we use the compact TWA/Mobile layout.
  if (isDesktop) {
    return <DesktopAdminPage />;
  }

  return (
    <Page back={true}>
      <AdminPageClient />
    </Page>
  );
}
