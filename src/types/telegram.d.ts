interface TelegramWebApp {
  showAlert: (message: string) => void
  openLink: (url: string) => void
  expand: () => void
}

interface Window {
  Telegram: {
    WebApp: TelegramWebApp
  }
}
