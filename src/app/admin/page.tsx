import { Page } from '@/components/Page';
import { AdminPageClient } from './AdminPageClient';

// Server Component - проверка доступа на клиенте
export default function AdminPage() {
  return (
    <Page back={true}>
      <AdminPageClient />
    </Page>
  );
}
