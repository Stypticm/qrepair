'use client'

import React, { useState, useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface HorizontalScrollCarouselProps {
    children: React.ReactNode[]
    itemWidth?: string // например '85vw' или '300px'
    gap?: number // gap между карточками в px
    showArrows?: boolean
    showIndicators?: boolean
}

export function HorizontalScrollCarousel({
    children,
    itemWidth = '85vw',
    gap = 16,
    showArrows = true,
    showIndicators = true
}: HorizontalScrollCarouselProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null)
    const [currentIndex, setCurrentIndex] = useState(0)
    const [canScrollLeft, setCanScrollLeft] = useState(false)
    const [canScrollRight, setCanScrollRight] = useState(true)

    const totalItems = children.length

    // Обновление состояния стрелок при скролле
    const updateScrollButtons = () => {
        if (!scrollContainerRef.current) return

        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
        setCanScrollLeft(scrollLeft > 10)
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)

        // Вычисляем текущий индекс на основе позиции скролла
        const itemWidthPx = scrollContainerRef.current.querySelector('.carousel-item')?.clientWidth || 0
        const newIndex = Math.round(scrollLeft / (itemWidthPx + gap))
        setCurrentIndex(Math.min(newIndex, totalItems - 1))
    }

    useEffect(() => {
        const container = scrollContainerRef.current
        if (!container) return

        updateScrollButtons()
        container.addEventListener('scroll', updateScrollButtons)
        window.addEventListener('resize', updateScrollButtons)

        return () => {
            container.removeEventListener('scroll', updateScrollButtons)
            window.removeEventListener('resize', updateScrollButtons)
        }
    }, [children.length])

    const scrollToIndex = (index: number) => {
        if (!scrollContainerRef.current) return

        const container = scrollContainerRef.current
        const itemWidthPx = container.querySelector('.carousel-item')?.clientWidth || 0
        const scrollPosition = index * (itemWidthPx + gap)

        container.scrollTo({
            left: scrollPosition,
            behavior: 'smooth'
        })
    }

    const scrollLeft = () => {
        const newIndex = Math.max(0, currentIndex - 1)
        scrollToIndex(newIndex)
    }

    const scrollRight = () => {
        const newIndex = Math.min(totalItems - 1, currentIndex + 1)
        scrollToIndex(newIndex)
    }

    return (
        <div className="relative w-full">
            {/* Контейнер со скроллом */}
            <div
                ref={scrollContainerRef}
                className="overflow-x-auto scrollbar-hide snap-x snap-mandatory"
                style={{
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                    WebkitOverflowScrolling: 'touch'
                }}
            >
                <div
                    className="flex"
                    style={{ gap: `${gap}px` }}
                >
                    {children.map((child, index) => (
                        <div
                            key={index}
                            className="carousel-item snap-start flex-shrink-0"
                            style={{ width: itemWidth }}
                        >
                            {child}
                        </div>
                    ))}
                </div>
            </div>

            {/* Стрелки навигации */}
            {showArrows && (
                <>
                    {/* Левая стрелка */}
                    <AnimatePresence>
                        {canScrollLeft && (
                            <motion.button
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                onClick={scrollLeft}
                                className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:bg-white transition-all duration-200 active:scale-95"
                                aria-label="Предыдущий"
                            >
                                <ChevronLeft className="w-6 h-6 text-gray-800" />
                            </motion.button>
                        )}
                    </AnimatePresence>

                    {/* Правая стрелка */}
                    <AnimatePresence>
                        {canScrollRight && (
                            <motion.button
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                onClick={scrollRight}
                                className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:bg-white transition-all duration-200 active:scale-95"
                                aria-label="Следующий"
                            >
                                <ChevronRight className="w-6 h-6 text-gray-800" />
                            </motion.button>
                        )}
                    </AnimatePresence>
                </>
            )}

            {/* Индикаторы (точки) */}
            {showIndicators && totalItems > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                    {Array.from({ length: totalItems }).map((_, index) => (
                        <button
                            key={index}
                            onClick={() => scrollToIndex(index)}
                            className={`transition-all duration-300 rounded-full ${index === currentIndex
                                    ? 'w-8 h-2 bg-blue-500'
                                    : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'
                                }`}
                            aria-label={`Перейти к слайду ${index + 1}`}
                        />
                    ))}
                </div>
            )}

            <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
        </div>
    )
}
