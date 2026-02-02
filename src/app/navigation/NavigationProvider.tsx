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

  const hasMoved = useRef(false)
  const stack = useRef<string[]>(['/'])
  const navigating = useRef(false)

  /* sync URL → position */
  useEffect(() => {
    if (!stack.current.includes(pathname)) {
      stack.current = [pathname]
    }

    const pos = routeToPosition(pathname)
    if (pos) setPosition(pos)
  }, [pathname])

  const move = (direction: Direction) => {
    if (navigating.current) return

    const current = stack.current[stack.current.length - 1]
    const nextRoute = getNextRoute(current, direction)
    if (!nextRoute) return

    navigating.current = true

    stack.current.push(nextRoute)

    const nextPos = NAV_POSITIONS[nextRoute]
    if (nextPos) setPosition(nextPos)

    router.push(nextRoute)

    setTimeout(() => {
      navigating.current = false
    }, 300)
  }

  const goBack = () => {
    if (stack.current.length > 1) {
      stack.current.pop()
      const prev = stack.current[stack.current.length - 1]

      if (prev === '/') {
        stack.current = ['/']
      }
      router.push(prev)
    }
    else {
      router.back()
    }
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
