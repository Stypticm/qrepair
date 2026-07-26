'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useRepairStore } from '@/stores/repairStore'
import { Button } from '@/components/ui/button'
import { ChevronRight, Camera, X } from 'lucide-react'
import { useRef } from 'react'

export default function RepairIssuePage() {
    const router = useRouter()
    const { issueDescription, setIssueDescription, issuePhotos, addIssuePhoto, removeIssuePhoto } = useRepairStore()
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleNext = () => {
        router.push('/repair/estimate')
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onloadend = () => {
            addIssuePhoto(reader.result as string)
        }
        reader.readAsDataURL(file)
    }

    return (
        <div className="space-y-6 flex flex-col min-h-[calc(100vh-140px)]">
            <div className="space-y-2 mb-4">
                <p className="text-sm text-muted">Дополнительная информация поможет нам дать точную оценку стоимости (необязательно)</p>
            </div>

            <div className="flex-1 space-y-6">
                <textarea
                    value={issueDescription}
                    onChange={(e) => setIssueDescription(e.target.value)}
                    placeholder="Например: Упал на асфальт, экран перестал реагировать на касания в правом верхнем углу..."
                    className="w-full h-32 p-4 bg-input border border-border rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-accent text-sm text-foreground placeholder:text-muted shadow-sm"
                />

                <div className="space-y-3">
                    <p className="text-sm font-semibold text-foreground">Фотографии поломки</p>
                    <div className="flex flex-wrap gap-3">
                        {issuePhotos.map((photo, idx) => (
                            <div key={idx} className="relative w-24 h-24 rounded-2xl overflow-hidden border border-border shadow-sm">
                                <img src={photo} alt={`Поломка ${idx + 1}`} className="w-full h-full object-cover" />
                                <button
                                    onClick={() => removeIssuePhoto(idx)}
                                    className="absolute top-1 right-1 p-1 bg-black/50 hover:bg-black/70 rounded-full text-white backdrop-blur-sm"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        ))}

                        {issuePhotos.length < 3 && (
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="w-24 h-24 flex flex-col items-center justify-center gap-2 bg-surface hover:bg-input border border-dashed border-border rounded-2xl text-muted transition-colors"
                            >
                                <Camera className="w-6 h-6" />
                                <span className="text-[10px] font-medium uppercase">Добавить</span>
                            </button>
                        )}
                    </div>
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                    />
                </div>
            </div>

            <div className="fixed bottom-6 left-0 right-0 px-4 max-w-md mx-auto z-10">
                <Button
                    onClick={handleNext}
                    className="w-full h-14 rounded-2xl font-bold text-base bg-accent hover:bg-accent-hover text-primary-foreground shadow-xl shadow-accent/20"
                >
                    Далее
                    <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
            </div>
        </div>
    )
}
