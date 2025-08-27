# Telegram.WebApp - Полный справочник функций

## 🚀 Основные функции

### Инициализация и управление
```typescript
// Уведомить Telegram о готовности приложения
webApp.ready()

// Расширить приложение на весь экран
webApp.expand()

// Закрыть приложение
webApp.close()

// Проверить версию Telegram
webApp.isVersionAtLeast('6.1')
```

### Информация о приложении
```typescript
// Платформа (ios, android, macos, web)
webApp.platform

// Версия Telegram
webApp.version

// Язык пользователя
webApp.initDataUnsafe.user?.language_code

// ID пользователя
webApp.initDataUnsafe.user?.id

// Имя пользователя
webApp.initDataUnsafe.user?.first_name
```

## 📱 Safe Area и Viewport

### Safe Area Insets
```typescript
// Новый API (рекомендуется)
webApp.safeAreaInsets.top      // Отступ сверху (notch, dynamic island)
webApp.safeAreaInsets.right    // Отступ справа
webApp.safeAreaInsets.bottom   // Отступ снизу (home indicator)
webApp.safeAreaInsets.left     // Отступ слева

// Старый API (для совместимости)
webApp.safeArea.top
webApp.safeArea.right
webApp.safeArea.bottom
webApp.safeArea.left
```

### Viewport
```typescript
// Размеры viewport
webApp.viewportHeight          // Высота viewport
webApp.viewportStableHeight    // Стабильная высота viewport
webApp.isExpanded             // Расширено ли приложение

// События изменения viewport
webApp.onViewportChanged((event) => {
  console.log('Height:', event.height)
  console.log('Width:', event.width)
  console.log('Is expanded:', event.is_expanded)
  console.log('Is state stable:', event.is_state_stable)
})
```

## 🎨 Тема и внешний вид

### Theme Params
```typescript
// Цвета темы
webApp.themeParams.bg_color           // Цвет фона
webApp.themeParams.text_color         // Цвет текста
webApp.themeParams.hint_color         // Цвет подсказок
webApp.themeParams.link_color         // Цвет ссылок
webApp.themeParams.button_color       // Цвет кнопок
webApp.themeParams.button_text_color  // Цвет текста кнопок
webApp.themeParams.secondary_bg_color // Вторичный цвет фона

// Схема цветов
webApp.colorScheme  // 'light' | 'dark'

// События изменения темы
webApp.onThemeChanged((event) => {
  console.log('Theme changed:', event.theme_params)
})
```

### Цвета приложения
```typescript
// Установить цвета
webApp.headerColor = '#FF0000'      // Цвет заголовка
webApp.backgroundColor = '#00FF00'   // Цвет фона

// Получить текущие цвета
console.log('Header color:', webApp.headerColor)
console.log('Background color:', webApp.backgroundColor)
```

## 🔘 Кнопки и элементы управления

### Main Button (главная кнопка)
```typescript
// Свойства
webApp.MainButton.text = 'Отправить'
webApp.MainButton.color = '#FF0000'
webApp.MainButton.textColor = '#FFFFFF'
webApp.MainButton.isVisible = true
webApp.MainButton.isActive = true
webApp.MainButton.isProgressVisible = false

// Методы
webApp.MainButton.setText('Новый текст')
webApp.MainButton.show()
webApp.MainButton.hide()
webApp.MainButton.enable()
webApp.MainButton.disable()
webApp.MainButton.showProgress()
webApp.MainButton.hideProgress()

// Обработчик клика
webApp.MainButton.onClick(() => {
  console.log('Main button clicked!')
})
```

### Back Button (кнопка назад)
```typescript
// Свойства
webApp.BackButton.isVisible = true

// Методы
webApp.BackButton.show()
webApp.BackButton.hide()

// Обработчик клика
webApp.BackButton.onClick(() => {
  console.log('Back button clicked!')
  // Можно использовать для навигации
  window.history.back()
})
```

## 📱 Haptic Feedback (тактильная обратная связь)

```typescript
// Ударные эффекты
webApp.HapticFeedback.impactOccurred('light')    // Легкий
webApp.HapticFeedback.impactOccurred('medium')   // Средний
webApp.HapticFeedback.impactOccurred('heavy')    // Сильный
webApp.HapticFeedback.impactOccurred('rigid')    // Жесткий
webApp.HapticFeedback.impactOccurred('soft')     // Мягкий

// Уведомления
webApp.HapticFeedback.notificationOccurred('error')   // Ошибка
webApp.HapticFeedback.notificationOccurred('success') // Успех
webApp.HapticFeedback.notificationOccurred('warning') // Предупреждение

// Изменение выбора
webApp.HapticFeedback.selectionChanged()
```

## 🔗 Навигация и ссылки

```typescript
// Открыть ссылку в Telegram
webApp.openTelegramLink('https://t.me/username')

// Открыть внешнюю ссылку
webApp.openLink('https://example.com')

// Переключиться на inline режим
webApp.switchInlineQuery('поиск', ['users', 'chats'])
```

## 💰 Платежи и счета

```typescript
// Открыть счет для оплаты
webApp.openInvoice('https://example.com/invoice', (status) => {
  if (status === 'paid') {
    console.log('Оплачено!')
  } else if (status === 'cancelled') {
    console.log('Отменено')
  } else if (status === 'failed') {
    console.log('Ошибка')
  } else if (status === 'pending') {
    console.log('В ожидании')
  }
})
```

## 📋 Всплывающие окна и уведомления

### Popup (всплывающее окно)
```typescript
webApp.showPopup({
  title: 'Заголовок',
  message: 'Сообщение для пользователя',
  buttons: [
    { id: 'ok', type: 'ok', text: 'OK' },
    { id: 'cancel', type: 'cancel', text: 'Отмена' },
    { id: 'destructive', type: 'destructive', text: 'Удалить' }
  ]
}, (buttonId) => {
  console.log('Button clicked:', buttonId)
})
```

### Alert (предупреждение)
```typescript
webApp.showAlert('Важное сообщение!', () => {
  console.log('Alert closed')
})
```

### Confirm (подтверждение)
```typescript
webApp.showConfirm('Вы уверены?', (confirmed) => {
  if (confirmed) {
    console.log('Пользователь подтвердил')
  } else {
    console.log('Пользователь отменил')
  }
})
```

## 📱 Специальные функции

### QR код
```typescript
// Показать сканер QR кода
webApp.showScanQrPopup({
  text: 'Отсканируйте QR код'
}, (data) => {
  console.log('QR data:', data)
})

// Закрыть сканер
webApp.closeScanQrPopup()
```

### Буфер обмена
```typescript
// Читать текст из буфера обмена
webApp.readTextFromClipboard((data) => {
  if (data) {
    console.log('Clipboard text:', data)
  } else {
    console.log('Clipboard is empty')
  }
})
```

### Запрос разрешений
```typescript
// Запрос разрешения на запись
webApp.requestWriteAccess((access) => {
  if (access) {
    console.log('Write access granted')
  } else {
    console.log('Write access denied')
  }
})

// Запрос контакта
webApp.requestContact((contact) => {
  if (contact) {
    console.log('Phone:', contact.phone_number)
    console.log('Name:', contact.first_name)
    console.log('User ID:', contact.user_id)
  } else {
    console.log('Contact request cancelled')
  }
})
```

## 📤 Отправка данных

```typescript
// Отправить данные в Telegram
webApp.sendData('{"action": "button_click", "id": "123"}')

// Вызвать кастомный метод
webApp.invokeCustomMethod('customAction', { param: 'value' })

// Асинхронный вызов кастомного метода
webApp.invokeCustomMethodAsync('customAction', { param: 'value' })
  .then(result => console.log('Result:', result))
  .catch(error => console.error('Error:', error))
```

## 🎯 События и обработчики

### Основные события
```typescript
// Обработка всех событий
webApp.onEvent('viewport_changed', (event) => {
  console.log('Viewport changed:', event)
})

webApp.onEvent('theme_changed', (event) => {
  console.log('Theme changed:', event)
})

webApp.onEvent('main_button_pressed', () => {
  console.log('Main button pressed')
})

webApp.onEvent('back_button_pressed', () => {
  console.log('Back button pressed')
})

webApp.onEvent('settings_button_pressed', () => {
  console.log('Settings button pressed')
})
```

### Специализированные обработчики
```typescript
// Закрытие приложения
webApp.onCloseRequested(() => {
  console.log('App close requested')
})

// Закрытие счета
webApp.onInvoiceClosed((event) => {
  console.log('Invoice closed:', event.url, event.status)
})

// Закрытие popup
webApp.onPopupClosed((event) => {
  console.log('Popup closed, button:', event.button_id)
})

// Получение QR кода
webApp.onQrTextReceived((event) => {
  console.log('QR text received:', event.data)
})

// Получение текста из буфера обмена
webApp.onClipboardTextReceived((event) => {
  console.log('Clipboard text:', event.data)
})

// Запрос разрешения на запись
webApp.onWriteAccessRequested((event) => {
  console.log('Write access status:', event.status)
})

// Запрос контакта
webApp.onContactRequested((event) => {
  console.log('Contact request status:', event.status)
  if (event.user_id) {
    console.log('User ID:', event.user_id)
  }
})

// Кастомные методы
webApp.onCustomMethodInvoked((event) => {
  console.log('Custom method:', event.method)
  console.log('Params:', event.params)
  console.log('Result:', event.result)
})
```

## 🛡️ Безопасность и разрешения

```typescript
// Проверить, является ли iframe
webApp.isIframe

// Подтверждение закрытия
webApp.isClosingConfirmationEnabled
webApp.enableClosingConfirmation()
webApp.disableClosingConfirmation()
```

## 📊 Полезные примеры использования

### Адаптивный дизайн
```typescript
function useAdaptiveLayout() {
  const [isExpanded, setIsExpanded] = useState(false)
  
  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const webApp = window.Telegram.WebApp
      
      // Слушаем изменения viewport
      webApp.onViewportChanged((event) => {
        setIsExpanded(event.is_expanded)
      })
      
      // Устанавливаем начальное состояние
      setIsExpanded(webApp.isExpanded)
    }
  }, [])
  
  return { isExpanded }
}
```

### Автоматическая тема
```typescript
function useAutoTheme() {
  const [isDark, setIsDark] = useState(false)
  
  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const webApp = window.Telegram.WebApp
      
      // Устанавливаем начальную тему
      setIsDark(webApp.colorScheme === 'dark')
      
      // Слушаем изменения темы
      webApp.onThemeChanged((event) => {
        const theme = event.theme_params
        setIsDark(theme.bg_color === '#000000')
      })
    }
  }, [])
  
  return { isDark }
}
```

### Safe Area хук
```typescript
function useSafeAreaInsets() {
  const [insets, setInsets] = useState({ top: 0, right: 0, bottom: 0, left: 0 })
  
  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const webApp = window.Telegram.WebApp
      
      const updateInsets = () => {
        if (webApp.safeAreaInsets) {
          setInsets(webApp.safeAreaInsets)
        } else if (webApp.safeArea) {
          setInsets(webApp.safeArea)
        }
      }
      
      // Устанавливаем начальные значения
      updateInsets()
      
      // Слушаем изменения
      webApp.onViewportChanged(updateInsets)
    }
  }, [])
  
  return insets
}
```

## 🚨 Важные моменты

1. **Всегда вызывайте `webApp.ready()`** перед использованием других функций
2. **Используйте `webApp.expand()`** для fullscreen режима
3. **Обрабатывайте ошибки** при вызове методов
4. **Проверяйте доступность** методов перед использованием
5. **Используйте правильные обработчики событий** для ваших нужд
6. **Учитывайте платформу** при разработке (iOS, Android, Desktop)

## 📱 Поддержка платформ

- **iOS**: Полная поддержка всех функций
- **Android**: Полная поддержка всех функций  
- **Desktop**: Ограниченная поддержка (без haptic feedback)
- **macOS**: Специальная обработка через mock
- **Web**: Fallback для тестирования
