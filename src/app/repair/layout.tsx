import { RepairHeader } from '@/components/RepairHeader'

export default function RepairLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="w-full flex-1 flex flex-col bg-background text-foreground transition-colors duration-300">
            <RepairHeader />
            <div className="pb-36 px-4 max-w-md mx-auto pt-1 w-full flex-1">
                {children}
            </div>
        </div>
    )
}
