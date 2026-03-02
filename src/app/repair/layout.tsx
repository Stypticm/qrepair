import { Page } from '@/components/Page'
import { RepairHeader } from '@/components/RepairHeader'

export default function RepairLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <Page back={true}>
            <div className="min-h-screen bg-[#f5f5f7]">
                <RepairHeader />
                <main className="pb-24 px-4 max-w-md mx-auto pt-4 md:pt-6">
                    {children}
                </main>
            </div>
        </Page>
    )
}
