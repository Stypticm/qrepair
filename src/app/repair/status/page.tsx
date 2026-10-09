'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Clock, ArrowRight, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function RepairStatusLookupPage() {
    const router = useRouter()
    const [searchId, setSearchId] = useState('')
    const [lastId, setLastId] = useState<string | null>(null)

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('last_repair_request_id')
            if (saved) {
                setLastId(saved)
            }
        }
    }, [])

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        const cleanId = searchId.trim().replace(/^#/, '')
        if (cleanId) {
            router.push(`/repair/status/${cleanId}`)
        }
    }

    return (
        <div
            className="space-y-6 pb-40 w-full overflow-y-auto overscroll-y-contain"
            style={{ paddingTop: 'max(36px, calc(env(safe-area-inset-top) + 16px))' }}
        >
            {/* Заголовок */}
            <div className="text-center space-y-1">
                <h1 className="text-2xl font-black tracking-tight text-foreground">
                    Проверка статуса
                </h1>
                <p className="text-xs text-muted">
                    Введите номер вашей заявки на ремонт
                </p>
            </div>

            {/* Карточка последней заявки, если есть */}
            {lastId && (
                <div className="bg-surface-elevated p-5 rounded-3xl border border-accent/40 shadow-md space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-muted flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-accent" />
                            Недавняя заявка
                        </span>
                        <span className="text-xs font-mono font-black text-accent-deep dark:text-accent">
                            #{lastId.slice(-6).toUpperCase()}
                        </span>
                    </div>
                    <p className="text-xs text-foreground/80">
                        Вы можете перейти к отслеживанию текущего статуса вашего ремонта
                    </p>
                    <Button
                        onClick={() => router.push(`/repair/status/${lastId}`)}
                        className="w-full h-12 rounded-xl font-bold bg-accent hover:bg-accent-hover text-primary-foreground flex items-center justify-center gap-2 cursor-pointer shadow-md"
                    >
                        Открыть статус заявки
                        <ArrowRight className="w-4 h-4" />
                    </Button>
                </div>
            )}

            {/* Форма поиска */}
            <form onSubmit={handleSearch} className="bg-surface-elevated p-5 rounded-3xl border border-border shadow-sm space-y-4">
                <div>
                    <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">
                        Номер заявки или ID
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Например, e2b4a1 или полный ID"
                            value={searchId}
                            onChange={(e) => setSearchId(e.target.value)}
                            className="w-full h-13 pl-4 pr-11 rounded-2xl bg-surface border border-border focus:outline-none focus:ring-2 focus:ring-accent text-sm text-foreground placeholder:text-muted/60"
                        />
                        <Search className="w-5 h-5 text-muted absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                </div>

                <Button
                    type="submit"
                    disabled={!searchId.trim()}
                    className="w-full h-13 rounded-2xl font-black text-base bg-accent hover:bg-accent-hover text-primary-foreground shadow-xl shadow-accent/25 transition-all disabled:opacity-40 cursor-pointer"
                >
                    Найти заявку
                </Button>
            </form>

            {/* Навигация */}
            <div className="pt-2">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/')}
                    className="w-full h-13 rounded-2xl font-bold border-2 border-border bg-surface-elevated hover:bg-surface text-foreground transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    На главную
                </Button>
            </div>
        </div>
    )
}
