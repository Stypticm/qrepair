import { BuybackWizard } from '@/components/Buyback/BuybackWizard';

export default function BuybackPage() {
    return (
        <div className="min-h-screen bg-[#f5f5f7] pt-5 pb-20">
            <div className="container mx-auto px-4">
                <div className="max-w-xl mx-auto bg-white rounded-[40px] shadow-xl shadow-black/5 p-8 md:p-12">
                    <BuybackWizard />
                </div>
            </div>
        </div>
    );
}
