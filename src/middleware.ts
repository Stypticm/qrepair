import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Получаем telegramId из cookies или headers
  const telegramId =
    request.cookies.get('telegramId')?.value ||
    request.headers.get('x-telegram-id') ||
    null

  // Добавляем telegramId в headers для Server Components
  const requestHeaders = new Headers(request.headers)
  if (telegramId) {
    requestHeaders.set('x-telegram-id', telegramId)
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
