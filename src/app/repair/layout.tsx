import { Page } from '@/components/Page'
import { RepairHeader } from '@/components/RepairHeader'

export default function RepairLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
            <RepairHeader />
            <main className="pb-5 px-4 max-w-md mx-auto pt-4 md:pt-24">
                {children}
            </main>
        </div>
    )
}
