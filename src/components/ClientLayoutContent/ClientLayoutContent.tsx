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
import { ClubNavigation } from '@/components/Home/ClubNavigation'



export function ClientLayoutContent({ children }: PropsWithChildren) {
  useRequestSync()
  useTelegramDisableVerticalSwipes()
  const { isDesktop, isTelegram } = useSafeArea()
  const pathname = usePathname()

  const isAdminPath = pathname?.startsWith('/admin')
  // Hide global header in Telegram Mini App (to show native experience) or on mobile web
  const showGlobalHeader = isDesktop && !isAdminPath && !isTelegram

  return (
    // <NavigationProvider>
    //   <NavigationEffects />
    // </NavigationProvider>
    <div id="app-root" className={!isAdminPath ? 'pb-28' : ''}>
      {showGlobalHeader && <Header />}
      <AdaptiveContainer>{children}</AdaptiveContainer>
      {!isAdminPath && <ClubNavigation />}
      <ChatWidget />
    </div>
  )
}

function NavigationEffects() {
  useKeyboardNavigation()
  useSwipeNavigation()
  return null
}
