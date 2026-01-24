'use client'

import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import {
  getNextRoute,
  routeToPosition,
  NAV_POSITIONS,
} from './map'

type Direction = 'left' | 'right' | 'up' | 'down'
type Position = { x: number; y: number }

type NavigationContextType = {
  position: Position
  move: (direction: Direction) => void
  goBack: () => void
}

const NavigationContext = createContext<NavigationContextType | null>(null)

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()

  const [position, setPosition] = useState<Position>({ x: 0, y: 0 })
  const navigating = useRef(false)
  const history = useRef<string[]>([])

  /* sync URL → position */
  useEffect(() => {
    const pos = routeToPosition(pathname)
    if (pos) setPosition(pos)
  }, [pathname])

  const move = (direction: Direction) => {
    if (navigating.current) return

    const nextRoute = getNextRoute(pathname, direction)
    if (!nextRoute) return

    navigating.current = true
    history.current.push(pathname)

    const nextPos = NAV_POSITIONS[nextRoute]
    if (nextPos) setPosition(nextPos)

    router.push(nextRoute)

    setTimeout(() => {
      navigating.current = false
    }, 350)
  }

  const goBack = () => {
    const prev = history.current.pop()
    if (prev) router.push(prev)
    else router.back()
  }

  return (
    <NavigationContext.Provider value={{ position, move, goBack }}>
      {children}
    </NavigationContext.Provider>
  )
}

export const useNavigation = () => {
  const ctx = useContext(NavigationContext)
  if (!ctx)
    throw new Error('useNavigation must be used inside NavigationProvider')
  return ctx
}
