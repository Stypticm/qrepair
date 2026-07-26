import { BuybackWizard } from '@/components/Buyback/BuybackWizard';

export default function BuybackPage() {
    return (
        <div className="min-h-screen bg-background text-foreground pt-5 pb-20 transition-colors duration-300">
            <div className="container mx-auto px-4">
                <div className="max-w-xl mx-auto bg-surface-elevated rounded-[40px] border border-border shadow-xl shadow-black/5 p-8 md:p-12">
                    <BuybackWizard />
                </div>
            </div>
        </div>
    );
}
