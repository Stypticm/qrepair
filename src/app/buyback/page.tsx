import { BuybackWizard } from '@/components/Buyback/BuybackWizard';

export default function BuybackPage() {
    return (
        <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
            <main className="pb-5 px-4 max-w-md mx-auto md:pt-24" style={{ paddingTop: 'max(72px, calc(env(safe-area-inset-top) + 40px))' }}>
                <BuybackWizard />
            </main>
        </div>
    );
}
