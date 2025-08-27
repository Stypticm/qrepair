interface TelegramWebApp {
  showAlert: (message: string) => void
  openLink: (url: string) => void
  expand: () => void
  ready: () => void
  close: () => void
  MainButton: {
    text: string
    color: string
    textColor: string
    isVisible: boolean
    isActive: boolean
    isProgressVisible: boolean
    setText: (text: string) => void
    onClick: (callback: () => void) => void
    show: () => void
    hide: () => void
    enable: () => void
    disable: () => void
    showProgress: (leaveActive?: boolean) => void
    hideProgress: () => void
  }
  BackButton: {
    isVisible: boolean
    onClick: (callback: () => void) => void
    show: () => void
    hide: () => void
  }
  HapticFeedback: {
    impactOccurred: (
      style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'
    ) => void
    notificationOccurred: (
      type: 'error' | 'success' | 'warning'
    ) => void
    selectionChanged: () => void
  }
  themeParams: {
    bg_color?: string
    text_color?: string
    hint_color?: string
    link_color?: string
    button_color?: string
    button_text_color?: string
    secondary_bg_color?: string
  }
  colorScheme: 'light' | 'dark'
  isExpanded: boolean
  viewportHeight: number
  viewportStableHeight: number
  safeArea: {
    top: number
    right: number
    bottom: number
    left: number
  }
  safeAreaInsets: {
    top: number
    right: number
    bottom: number
    left: number
  }
  initData: string
  initDataUnsafe: {
    query_id?: string
    user?: {
      id: number
      first_name: string
      last_name?: string
      username?: string
      language_code?: string
      is_premium?: boolean
      allows_write_to_pm?: boolean
    }
    receiver?: {
      id: number
      first_name: string
      last_name?: string
      username?: string
      language_code?: string
    }
    chat?: {
      id: number
      type: string
      title?: string
      username?: string
      photo_url?: string
    }
    chat_type?: string
    chat_instance?: string
    start_param?: string
    can_send_after?: number
    auth_date: number
    hash: string
  }
  platform: string
  isVersionAtLeast: (version: string) => boolean
  headerColor: string
  backgroundColor: string
  isClosingConfirmationEnabled: boolean
  enableClosingConfirmation: () => void
  disableClosingConfirmation: () => void
  onEvent: (
    eventType: string,
    eventHandler: Function
  ) => void
  offEvent: (
    eventType: string,
    eventHandler: Function
  ) => void
  sendData: (data: string) => void
  switchInlineQuery: (
    query: string,
    choose_chat_types?: string[]
  ) => void
  openTelegramLink: (url: string) => void
  openInvoice: (
    url: string,
    callback?: (status: string) => void
  ) => void
  showPopup: (
    params: {
      title?: string
      message: string
      buttons?: Array<{
        id?: string
        type?:
          | 'default'
          | 'ok'
          | 'close'
          | 'cancel'
          | 'destructive'
        text: string
      }>
    },
    callback?: (buttonId: string) => void
  ) => void
  showAlert: (
    message: string,
    callback?: () => void
  ) => void
  showConfirm: (
    message: string,
    callback?: (confirmed: boolean) => void
  ) => void
  showScanQrPopup: (
    params: {
      text?: string
    },
    callback?: (data: string) => void
  ) => void
  closeScanQrPopup: () => void
  readTextFromClipboard: (
    callback?: (data: string | null) => void
  ) => void
  requestWriteAccess: (
    callback?: (access: boolean) => void
  ) => void
  requestContact: (
    callback?: (
      contact: {
        phone_number: string
        first_name: string
        last_name?: string
        user_id?: number
      } | null
    ) => void
  ) => void
  invokeCustomMethod: (method: string, params?: any) => void
  invokeCustomMethodAsync: (
    method: string,
    params?: any
  ) => Promise<any>
  isIframe: boolean
  isClosingConfirmationEnabled: boolean
  enableClosingConfirmation: () => void
  disableClosingConfirmation: () => void
  onCloseRequested: (callback: () => void) => void
  offCloseRequested: (callback: () => void) => void
  onViewportChanged: (
    callback: (event: {
      height: number
      width: number
      is_expanded: boolean
      is_state_stable: boolean
    }) => void
  ) => void
  offViewportChanged: (callback: Function) => void
  onThemeChanged: (
    callback: (event: {
      theme_params: {
        bg_color?: string
        text_color?: string
        hint_color?: string
        link_color?: string
        button_color?: string
        button_text_color?: string
        secondary_bg_color?: string
      }
    }) => void
  ) => void
  offThemeChanged: (callback: Function) => void
  onMainButtonClicked: (callback: () => void) => void
  offMainButtonClicked: (callback: Function) => void
  onBackButtonClicked: (callback: () => void) => void
  offBackButtonClicked: (callback: Function) => void
  onSettingsButtonClicked: (callback: () => void) => void
  offSettingsButtonClicked: (callback: Function) => void
  onInvoiceClosed: (
    callback: (event: {
      url: string
      status: string
    }) => void
  ) => void
  offInvoiceClosed: (callback: Function) => void
  onPopupClosed: (
    callback: (event: { button_id?: string }) => void
  ) => void
  offPopupClosed: (callback: Function) => void
  onQrTextReceived: (
    callback: (event: { data: string }) => void
  ) => void
  offQrTextReceived: (callback: Function) => void
  onClipboardTextReceived: (
    callback: (event: { data: string | null }) => void
  ) => void
  offClipboardTextReceived: (callback: Function) => void
  onWriteAccessRequested: (
    callback: (event: {
      status: 'allowed' | 'denied'
    }) => void
  ) => void
  offWriteAccessRequested: (callback: Function) => void
  onContactRequested: (
    callback: (event: {
      status: 'sent' | 'cancelled'
      user_id?: number
    }) => void
  ) => void
  offContactRequested: (callback: Function) => void
  onCustomMethodInvoked: (
    callback: (event: {
      method: string
      params?: any
      result?: any
    }) => void
  ) => void
  offCustomMethodInvoked: (callback: Function) => void
}

interface Window {
  Telegram: {
    WebApp: TelegramWebApp
  }
}
