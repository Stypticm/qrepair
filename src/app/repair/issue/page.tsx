'use client'

import { useRouter } from 'next/navigation'
import { useRepairStore } from '@/stores/repairStore'
import { Button } from '@/components/ui/button'
import { ChevronRight, Camera, X, Sparkles, ArrowLeft } from 'lucide-react'
import { useRef } from 'react'

export default function RepairIssuePage() {
    const router = useRouter()
    const {
        issueDescription,
        setIssueDescription,
        issuePhotos,
        addIssuePhoto,
        removeIssuePhoto,
    } = useRepairStore()
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleNext = () => {
        router.push('/repair/estimate')
    }

    const handleBack = () => {
        router.push('/repair/device')
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onloadend = () => {
            if (typeof reader.result === 'string') {
                addIssuePhoto(reader.result)
            }
        }
        reader.readAsDataURL(file)
        e.target.value = ''
    }

    return (
        <div className="space-y-6 pb-6 select-none">
            <div className="space-y-1.5">
                <p className="text-sm text-muted">
                    Опишите подробнее, что произошло, или прикрепите фото. Это поможет мастеру точнее оценить стоимость ремонта.
                </p>
            </div>

            <div className="space-y-5">
                <div>
                    <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">
                        Описание неисправности (необязательно)
                    </label>
                    <textarea
                        value={issueDescription}
                        onChange={(e) => setIssueDescription(e.target.value)}
                        placeholder="Например: Упал на кафель, полосы на экране, перестал заряжаться от шнура..."
                        className="w-full h-36 p-4 bg-surface-elevated border border-border rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-accent text-sm text-foreground placeholder:text-muted/60 shadow-sm leading-relaxed"
                    />
                </div>

                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-muted uppercase tracking-wider">
                            Фотографии поломки
                        </span>
                        <span className="text-xs text-muted">
                            {issuePhotos.length}/3
                        </span>
                    </div>

                    {/* Подсказка о зависимости оценки от качества и количества фото */}
                    <div className="bg-accent/10 border border-accent/25 rounded-2xl p-3.5 flex gap-2.5 items-start">
                        <Sparkles className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                        <p className="text-xs text-foreground/90 leading-relaxed font-medium">
                            Точность предварительной оценки напрямую зависит от количества и качества фото. Сделайте чёткие снимки поломки с разных сторон при хорошем освещении.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        {issuePhotos.map((photo, idx) => (
                            <div
                                key={idx}
                                className="relative w-24 h-24 rounded-2xl overflow-hidden border border-border shadow-sm group"
                            >
                                <img
                                    src={photo}
                                    alt={`Поломка ${idx + 1}`}
                                    className="w-full h-full object-cover"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeIssuePhoto(idx)}
                                    aria-label="Удалить фото"
                                    className="absolute top-1.5 right-1.5 p-1 bg-black/60 hover:bg-black/80 rounded-full text-white backdrop-blur-sm transition-all"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ))}

                        {issuePhotos.length < 3 && (
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="w-24 h-24 flex flex-col items-center justify-center gap-1.5 bg-surface-elevated hover:bg-surface border-2 border-dashed border-border rounded-2xl text-muted hover:text-foreground transition-all cursor-pointer active:scale-95"
                            >
                                <Camera className="w-6 h-6 text-muted" />
                                <span className="text-[10px] font-bold uppercase tracking-wider">
                                    Добавить
                                </span>
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

            {/* Кнопки навигации внизу */}
            <div className="flex gap-2.5 pt-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    className="flex-1 h-14 rounded-2xl font-bold border-2 border-border bg-surface-elevated hover:bg-surface text-foreground transition-all cursor-pointer"
                >
                    <ArrowLeft className="w-5 h-5 mr-1" />
                    Назад
                </Button>
                <Button
                    type="button"
                    onClick={handleNext}
                    className="flex-[2] h-14 rounded-2xl font-black text-base bg-accent hover:bg-accent-hover text-primary-foreground shadow-xl shadow-accent/25 transition-all cursor-pointer"
                >
                    Далее
                    <ChevronRight className="w-5 h-5 ml-1.5" />
                </Button>
            </div>
        </div>
    )
}
