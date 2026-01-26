'use client'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowUp } from 'lucide-react'

const fade = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
}

export function SwipeHint() {
    return (
        <motion.div
            className="flex items-center justify-center"
            initial="hidden"
            animate="visible"
            variants={fade}
            transition={{ duration: 0.2 }}
        >
            <div className="relative w-64 h-64 text-slate-900 text-xs select-none">
                {/* Центр */}
                <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{
                        duration: 1.8,
                        repeat: Infinity,
                        repeatType: 'mirror',
                        ease: 'easeInOut',
                    }}
                >
                    <div className="w-3.5 h-3.5 bg-slate-900 rounded-full" />
                </motion.div>

                <Direction
                    label="FAQ"
                    style="top"
                    delay={0}
                >
                    <ArrowUp />
                </Direction>

                <Direction
                    label="Лента"
                    style="bottom"
                    delay={0}
                >
                    <ArrowUp className="rotate-180" />
                </Direction>

                <Direction
                    label="Ремонт"
                    style="left"
                    delay={0}
                >
                    <ArrowLeft />
                </Direction>

                <Direction
                    label="Оценка"
                    style="right"
                    delay={0}
                >
                    <ArrowLeft className="rotate-180" />
                </Direction>

            </div>
        </motion.div>
    )
}

function Direction({
    label,
    children,
    style,
    delay,
}: {
    label: string
    children: React.ReactNode
    style: 'top' | 'bottom' | 'left' | 'right'
    delay: number
}) {
    const pos = {
        top: 'top-0 left-1/2 -translate-x-1/2 flex-col',
        bottom: 'bottom-0 left-1/2 -translate-x-1/2 flex-col',
        left: 'left-0 top-1/2 -translate-y-1/2 flex-row',
        right: 'right-0 top-1/2 -translate-y-1/2 flex-row-reverse',
    }[style]

    const motionAxis =
        style === 'top'
            ? { y: [-4, 0, -4] }
            : style === 'bottom'
                ? { y: [4, 0, 4] }
                : style === 'left'
                    ? { x: [-4, 0, -4] }
                    : { x: [4, 0, 4] }

    return (
        <motion.div
            className={`absolute flex items-center gap-1 ${pos}`}
            initial={{ opacity: 0 }}
            animate={{
                opacity: 1,
                ...motionAxis,
            }}
            transition={{
                delay,
                duration: 1.5,
                repeat: 2,
                repeatType: 'mirror',
                ease: 'easeInOut',
            }}
        >
            {children}
            <span className="text-[20px] text-slate-950">{label}</span>
        </motion.div>
    )
}
