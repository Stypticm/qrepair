'use client'

import { Button } from '@/components/ui/button'
import { ArrowDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Page } from '@/components/Page';

export default function FAQPage() {
    const router = useRouter()

    return (
        <Page back={true}>
            <div className="min-h-screen bg-gray-50">
                <div className="bg-white border-b border-gray-200 px-4 py-6 pt-16 text-center">
                    <h1 className="text-2xl font-semibold text-gray-900 mb-2">FAQ</h1>
                    <p className="text-gray-600 text-sm">Раздел в разработке</p>

                </div>
                <div className='flex justify-center items-center fixed bottom-5 right-1/2 left-1/2'>
                    {/* Подвал */}
                    <Button
                        variant="ghost"
                        size="lg"
                        onClick={() => router.back()}
                        className="p-4 hover:bg-gray-100 rounded-full bg-gray-400"
                    >
                        <ArrowDown className="w-10 h-10" />
                    </Button>
                </div>
            </div>
        </Page>
    )
}