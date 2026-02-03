import { DesktopHeader } from '@/components/Desktop/DesktopHeader';

export default function RepairPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      <DesktopHeader />
      <main className="pt-24 px-6 max-w-7xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-4">Ремонт техники</h1>
        <p className="text-lg text-gray-500 mb-8">
          Сервис по ремонту скоро откроется.
        </p>
      </main>
    </div>
  );
}
