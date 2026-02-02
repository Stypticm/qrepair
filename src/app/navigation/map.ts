export type Position = {
  x: number
  y: number
}

/**
 * Позиции страниц в пространстве
 * Используется для анимаций / layout
 */
export const NAV_POSITIONS: Record<string, Position> = {
  '/': { x: 0, y: 0 },

  '/repair': { x: -1, y: 0 },
  '/request/device-info': { x: 1, y: 0 },

  '/faq': { x: 0, y: -1 },
  '/feed': { x: 0, y: 1 },
}

/**
 * Навигационный граф
 * Используется для ЛОГИКИ переходов
 */
export const NAV_GRAPH: Record<
  string,
  Partial<Record<'left' | 'right' | 'up' | 'down', string>>
> = {
  '/': {
    left: '/repair',
    right: '/request/device-info',
    up: '/faq',
    down: '/feed',
  },

  '/repair': {
    right: '/',
  },

  '/request/device-info': {
    left: '/',
  },

  '/faq': {
    down: '/',
  },

  '/feed': {
    up: '/',
  },
}

export function routeToPosition(
  route: string,
): Position | null {
  return NAV_POSITIONS[route] ?? null
}

export function getNextRoute(
  currentRoute: string,
  direction: 'left' | 'right' | 'up' | 'down',
): string | null {
  return NAV_GRAPH[currentRoute]?.[direction] ?? null
}
