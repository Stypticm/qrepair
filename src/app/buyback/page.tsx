import { DesktopHeader } from '@/components/Desktop/DesktopHeader';
import { QRModal } from '@/components/Desktop/QRModal';

export default function BuybackPage() {
    return (
        <div className="min-h-screen bg-white text-gray-900 font-sans">
            <DesktopHeader />
            <main className="pt-24 px-6 max-w-7xl mx-auto text-center">
                <h1 className="text-4xl font-bold mb-4">Скупка техники</h1>
                <p className="text-lg text-gray-500 mb-8">
                    Оцените свое устройство онлайн или вызовите мастера.
                </p>
                {/* For now we can reuse the Desktop Home content or just a prompt */}
            </main>
        </div>
    );
}
