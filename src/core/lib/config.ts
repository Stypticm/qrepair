export const config = {
  // URL для Telegram Web App
  webAppUrl:
    process.env.NEXT_PUBLIC_WEBAPP_URL ||
    'https://qrepair-git-dev-stypticms-projects.vercel.app',

  // Версия приложения для обхода кэширования
  appVersion:
    process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',

  // Получить автоматическую версию с увеличением на 1
  getAutoVersion: () => {
    const baseVersion = config.appVersion
    const parts = baseVersion.split('.')
    const lastPart = parseInt(parts[parts.length - 1]) || 0
    parts[parts.length - 1] = (lastPart + 1).toString()
    return parts.join('.')
  },

  // Получить URL с версией для обхода кэширования
  getWebAppUrlWithVersion: () => {
    const baseUrl = config.webAppUrl
    const version = config.getAutoVersion()
    const timestamp = Date.now() // Добавляем timestamp для гарантии уникальности
    return `${baseUrl}${
      baseUrl.includes('?') ? '&' : '?'
    }v=${version}&t=${timestamp}`
  },

  // Получить настройки Web App для принудительного full screen
  getWebAppConfig: () => ({
    url: config.getWebAppUrlWithVersion(),
    is_visible: true,
  }),

  // Получить URL с параметрами для Telegram WebApp
  getTelegramWebAppUrl: () => {
    const baseUrl = config.getWebAppUrlWithVersion()
    return `${baseUrl}&mode=fullscreen&no_cache=1`
  },
}
