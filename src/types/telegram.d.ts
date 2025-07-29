interface TelegramWebApp {
  showAlert: (message: string) => void
  openLink: (url: string) => void
  // Добавь другие методы tma.js, если нужны
}

interface Window {
  Telegram: {
    WebApp: TelegramWebApp
  }
}
