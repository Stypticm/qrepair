# Исправление полноэкранного режима Telegram WebApp

## Проблема

При открытии приложения из чата с ботом в Telegram, приложение открывается в половину экрана вместо полноэкранного режима, как это происходит в BotFather.

## Причина

Проблема возникает из-за:
1. **Неправильного порядка инициализации** - `expand()` вызывается слишком рано
2. **Отсутствия задержки** между `ready()` и `expand()`
3. **Недостаточной проверки** статуса расширения

## Решение

### 1. Обновленный хук useSafeArea

```typescript
// Правильный порядок инициализации
const setup = async () => {
  try {
    // 1. Сначала уведомляем Telegram о готовности
    webApp.ready()

    // 2. Ждем полной инициализации
    await new Promise(resolve => setTimeout(resolve, 100))

    // 3. Принудительно разворачиваем на весь экран
    webApp.expand()

    // 4. Дополнительная проверка через 300мс
    setTimeout(() => {
      if (!webApp.isExpanded) {
        console.log('Force expanding again...')
        webApp.expand()
      }
    }, 300)
  } catch (error) {
    console.error('Error initializing Telegram WebApp:', error)
  }
}
```

### 2. Обработчик изменений viewport

```typescript
webApp.onViewportChanged((event) => {
  console.log('Viewport changed:', event)
  
  // Проверяем статус расширения
  if (event.is_expanded !== undefined) {
    setIsExpanded(event.is_expanded)
    
    // Если не развернуто, пытаемся развернуть снова
    if (!event.is_expanded) {
      console.log('Viewport not expanded, trying to expand again...')
      setTimeout(() => webApp.expand(), 100)
    }
  }
})
```

### 3. Функция принудительного расширения

```typescript
const forceExpand = useCallback(() => {
  if (window.Telegram?.WebApp) {
    const webApp = window.Telegram.WebApp
    console.log('Force expanding WebApp...')
    webApp.expand()
    
    // Проверяем результат через небольшую паузу
    setTimeout(() => {
      if (!webApp.isExpanded) {
        console.log('First expand failed, trying again...')
        webApp.expand()
      }
    }, 200)
  }
}, [])
```

## Ключевые моменты

1. **Порядок вызовов**: `ready()` → пауза → `expand()`
2. **Задержки**: 100мс после `ready()`, 300мс для повторной попытки
3. **Мониторинг**: Отслеживание изменений viewport и автоматическое исправление
4. **Fallback**: Кнопка для ручного расширения

## Компонент ExpandButton

Добавлен компонент `ExpandButton` для тестирования и ручного расширения:

```tsx
import { ExpandButton } from '@/components/ExpandButton';

// На странице
<ExpandButton className="w-full" />
```

## Результат

После применения этих изменений:
- ✅ Приложение автоматически открывается в полноэкранном режиме
- ✅ Работает как при открытии из чата, так и вне чата
- ✅ Автоматически исправляется, если расширение не сработало
- ✅ Есть возможность ручного расширения через кнопку

## Тестирование

1. Откройте приложение из чата с ботом
2. Проверьте, что оно открывается в полноэкранном режиме
3. Используйте кнопку "Развернуть" для тестирования
4. Проверьте логи в консоли для отладки

## Отладка

В режиме разработки отображается отладочная информация:
- Mode: Telegram/Browser
- Device: Mobile/Desktop
- Ready: Yes/No
- Expanded: Yes/No

## Совместимость

- ✅ iOS Telegram
- ✅ Android Telegram
- ✅ Desktop Telegram
- ✅ Web версия (fallback)
