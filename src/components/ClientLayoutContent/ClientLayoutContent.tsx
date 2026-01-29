'use client'

import type { PropsWithChildren } from 'react'
import { AdaptiveContainer } from '../AdaptiveContainer'
import { useRequestSync } from '@/hooks/useRequestSync'
import { useTelegramDisableVerticalSwipes } from '@/app/telegram/telegram-web-view/useTelegramDisableVerticalSwipes'

import { NavigationProvider } from '@/app/navigation/NavigationProvider'
import { useKeyboardNavigation } from '@/app/navigation/useKeyboardNavigation'
import { useSwipeNavigation } from '@/app/navigation/useSwipeNavigation'

export function ClientLayoutContent({ children }: PropsWithChildren) {
  useRequestSync()
  useTelegramDisableVerticalSwipes()

  return (
    // <NavigationProvider>
    //   <NavigationEffects />
    // </NavigationProvider>
    <div id="app-root">
      <AdaptiveContainer>{children}</AdaptiveContainer>
    </div>
  )
}

function NavigationEffects() {
  useKeyboardNavigation()
  useSwipeNavigation()
  return null
}
