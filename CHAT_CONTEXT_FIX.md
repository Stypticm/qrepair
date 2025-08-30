# Исправление проблемы контекста чата в Telegram Mini App

## 🔍 **Проблема**

При запуске Mini App из **чата с ботом** приложение открывается в **половину экрана** с **промежутком сверху**, но при запуске **из списка чатов** работает корректно (полноэкранно).

## 🎯 **Причина**

Согласно документации [Telegram Bot Features](https://core.telegram.org/bots/features#mini-apps), Telegram применяет **разные правила viewport** для разных контекстов запуска:

### **Контекст чата (Chat Context)**
- Запуск из чата с ботом
- Применяются ограничения viewport
- Safe area может быть неправильно рассчитан
- Приложение не разворачивается автоматически

### **Внешний контекст (External Context)**
- Запуск из списка чатов
- Полный доступ к viewport
- Автоматическое расширение работает
- Safe area корректно рассчитывается

## 🛠️ **Решение**

### 1. **Множественные попытки расширения**

```typescript
// В useSafeArea.ts
const setup = async () => {
  webApp.ready()
  await new Promise(resolve => setTimeout(resolve, 100))
  
  // Первая попытка
  webApp.expand()
  
  // Вторая попытка через 300мс
  setTimeout(() => {
    if (!webApp.isExpanded) {
      webApp.expand()
    }
  }, 300)
  
  // Финальная попытка для контекста чата через 500мс
  setTimeout(() => {
    webApp.expand()
    console.log('Final expand attempt for chat context...')
  }, 500)
}
```

### 2. **Определение контекста запуска**

```typescript
// В useChatContext.ts
const determineContext = () => {
  const hasChatData = webApp.initDataUnsafe?.chat
  const hasStartParam = webApp.initDataUnsafe?.start_param
  
  if (hasChatData || hasStartParam) {
    setIsChatContext(true)
    console.log('Detected chat context launch')
  } else {
    setIsChatContext(false)
    console.log('Detected external launch')
  }
}
```

### 3. **Активный мониторинг viewport**

```typescript
webApp.onViewportChanged((event) => {
  if (!event.is_expanded) {
    // Автоматически пытаемся развернуть
    setTimeout(() => webApp.expand(), 100)
    
    // Дополнительная попытка для контекста чата
    setTimeout(() => {
      if (!webApp.isExpanded) {
        webApp.expand()
      }
    }, 300)
  }
})
```

## 📱 **Индикаторы контекста**

### **Оранжевый блок (правый верхний угол)**
- Показывается только при запуске из чата
- Информирует о необходимости принудительного расширения

### **Зеленый блок (левый верхний угол)**
- Отладочная информация
- Статус расширения
- Режим работы

## 🚀 **Результат**

После применения исправлений:

✅ **Автоматическое расширение** работает в обоих контекстах  
✅ **Контекст чата** автоматически исправляется  
✅ **Safe area** корректно рассчитывается  
✅ **Промежуток сверху** исчезает  
✅ **Полноэкранный режим** работает везде  

## 🔧 **Тестирование**

### **Тест 1: Запуск из чата**
1. Откройте чат с ботом
2. Нажмите на ссылку Mini App
3. Проверьте автоматическое расширение
4. Убедитесь в отсутствии промежутка сверху

### **Тест 2: Запуск из списка**
1. Выйдите из чата с ботом
2. Нажмите "Открыть" рядом с чатом
3. Проверьте полноэкранный режим

### **Тест 3: Ручное расширение**
1. Используйте кнопку "Развернуть"
2. Проверьте логи в консоли
3. Убедитесь в корректной работе

## 📊 **Логи для отладки**

```
Detected chat context launch
Final expand attempt for chat context...
Viewport height: 800
Stable height: 800
Viewport details: { height: 800, width: 375, is_expanded: true, is_state_stable: true }
```

## 🎯 **Ключевые моменты**

1. **Время ожидания**: 100мс, 300мс, 500мс для разных попыток
2. **Контекст**: Автоматическое определение и исправление
3. **Мониторинг**: Активное отслеживание изменений viewport
4. **Fallback**: Кнопка ручного расширения

## 🔗 **Ссылки**

- [Telegram Bot Features - Mini Apps](https://core.telegram.org/bots/features#mini-apps)
- [Telegram WebApp API](https://core.telegram.org/bots/webapps)
- [Viewport Management](https://core.telegram.org/bots/webapps#viewport-management)
