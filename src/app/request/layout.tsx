import ClientLayout from '@/components/ClientLayout/ClientLayout';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <ClientLayout>{children}</ClientLayout>;
}
