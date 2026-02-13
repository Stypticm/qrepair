'use client'

import type { PropsWithChildren } from 'react'
import { AdaptiveContainer } from '../AdaptiveContainer'
import { useRequestSync } from '@/hooks/useRequestSync'
import { ChatWidget } from '../Desktop/ChatWidget'
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
    <div id="app-root" className="flex flex-col h-full min-h-dvh">
      <AdaptiveContainer>{children}</AdaptiveContainer>
      <ChatWidget />
    </div>
  )
}

function NavigationEffects() {
  useKeyboardNavigation()
  useSwipeNavigation()
  return null
}
