'use client'

import { useEffect } from 'react'
import { useNavigation } from './NavigationProvider'

export function useKeyboardNavigation() {
  const { move, goBack } = useNavigation()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          move('left')
          break
        case 'ArrowRight':
          move('right')
          break
        case 'ArrowUp':
          move('up')
          break
        case 'ArrowDown':
          move('down')
          break
        case 'Backspace':
          goBack()
          break
      }
    }

    window.addEventListener('keydown', onKey)
    return () =>
      window.removeEventListener('keydown', onKey)
  }, [])
}
