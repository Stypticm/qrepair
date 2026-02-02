'use client'

import { useEffect } from 'react'
import { useNavigation } from './NavigationProvider'

export function useSwipeNavigation() {
  const { move } = useNavigation()

  useEffect(() => {
    let sx = 0
    let sy = 0

    const start = (e: TouchEvent) => {
      sx = e.touches[0].clientX
      sy = e.touches[0].clientY
    }

    const end = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - sx
      const dy = e.changedTouches[0].clientY - sy

      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 50) move('left')
        if (dx < -50) move('right')
      } else {
        if (dy > 50) move('up')
        if (dy < -50) move('down')
      }
    }

    window.addEventListener('touchstart', start)
    window.addEventListener('touchend', end)
    return () => {
      window.removeEventListener('touchstart', start)
      window.removeEventListener('touchend', end)
    }
  }, [])
}
