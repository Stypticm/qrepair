'use client'

import type { PropsWithChildren } from 'react'
import { AdaptiveContainer } from '../AdaptiveContainer'
import { useRequestSync } from '@/hooks/useRequestSync'
import { ChatWidget } from '../Desktop/ChatWidget'
import { Header } from '../layout/Header'
import { useSafeArea } from '@/hooks/useSafeArea'
import { usePathname } from 'next/navigation'
import { useTelegramDisableVerticalSwipes } from '@/app/telegram/telegram-web-view/useTelegramDisableVerticalSwipes'

import { NavigationProvider } from '@/app/navigation/NavigationProvider'
import { useKeyboardNavigation } from '@/app/navigation/useKeyboardNavigation'
import { useSwipeNavigation } from '@/app/navigation/useSwipeNavigation'



export function ClientLayoutContent({ children }: PropsWithChildren) {
  useRequestSync()
  useTelegramDisableVerticalSwipes()
  const { isDesktop } = useSafeArea()
  const pathname = usePathname()

  const isAdminPath = pathname?.startsWith('/admin')
  const showGlobalHeader = isDesktop && !isAdminPath

  return (
    // <NavigationProvider>
    //   <NavigationEffects />
    // </NavigationProvider>
    <div id="app-root">
      {showGlobalHeader && <Header />}
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
