# Safe Area и Fullscreen режим для Telegram WebApp

Этот проект настроен для корректного отображения в Telegram WebApp с учетом safe area отступов и fullscreen режима.

## Что реализовано

### 1. Автоматическая настройка Fullscreen режима
- Приложение автоматически расширяется на весь экран при загрузке
- Используется `Telegram.WebApp.expand()` вместо `fullsize`
- Приложение уведомляет Telegram о готовности через `Telegram.WebApp.ready()`

### 2. Safe Area отступы
- Автоматическое определение отступов для вырезов экрана (notch, dynamic island)
- Поддержка `safeAreaInsets` и `safeArea` свойств
- CSS переменные для использования в стилях
- Поддержка `env()` функций для iOS Safari

### 3. Компоненты и хуки

#### useSafeArea хук
```tsx
import { useSafeArea } from '@/hooks/useSafeArea';

function MyComponent() {
  const { safeAreaInsets, isReady, cssVars } = useSafeArea();
  
  return (
    <div style={cssVars}>
      {/* Контент с учетом safe area */}
    </div>
  );
}
```

#### SafeAreaWrapper компонент
```tsx
import { SafeAreaWrapper } from '@/components/SafeAreaWrapper';

function MyComponent() {
  return (
    <SafeAreaWrapper padding="top">
      {/* Контент с отступом сверху */}
    </SafeAreaWrapper>
  );
}
```

### 4. CSS классы
```css
.safe-area-top     /* Отступ сверху */
.safe-area-bottom  /* Отступ снизу */
.safe-area-left    /* Отступ слева */
.safe-area-right   /* Отступ справа */
.safe-area-all     /* Отступы со всех сторон */
.fullscreen        /* Полноэкранный режим */
.fullscreen-safe   /* Полноэкранный режим с учетом safe area */
```

## Как это работает

### 1. Инициализация
При загрузке приложения:
1. Вызывается `Telegram.WebApp.ready()` для уведомления о готовности
2. Вызывается `Telegram.WebApp.expand()` для расширения на весь экран
3. Получаются safe area отступы
4. Устанавливаются CSS переменные

### 2. Обработка изменений
- Слушаются события `viewport_changed` для обновления safe area
- CSS переменные автоматически обновляются при изменениях
- Компоненты перерендериваются с новыми значениями

### 3. CSS переменные
```css
:root {
  --safe-area-top: 0px;
  --safe-area-right: 0px;
  --safe-area-bottom: 0px;
  --safe-area-left: 0px;
}
```

## Использование в компонентах

### Простое применение
```tsx
function MyComponent() {
  const { safeAreaInsets } = useSafeArea();
  
  return (
    <div style={{ paddingTop: safeAreaInsets.top }}>
      Контент
    </div>
  );
}
```

### С использованием CSS переменных
```css
.my-component {
  padding-top: var(--safe-area-top);
  padding-bottom: var(--safe-area-bottom);
}
```

### С использованием SafeAreaWrapper
```tsx
function MyComponent() {
  return (
    <SafeAreaWrapper padding="top">
      <h1>Заголовок</h1>
      <p>Контент с отступом сверху</p>
    </SafeAreaWrapper>
  );
}
```

## Поддержка платформ

- **iOS**: Полная поддержка через `env()` функции и `safeAreaInsets`
- **Android**: Поддержка через `safeArea` свойство
- **Desktop**: Fallback значения (0px)
- **Telegram for macOS**: Специальная обработка через mock

## Отладка

Для отладки safe area значений можно использовать:
```tsx
const { safeAreaInsets } = useSafeArea();
console.log('Safe Area Insets:', safeAreaInsets);
```

## Важные моменты

1. **viewport-fit=cover**: Мета-тег viewport должен содержать `viewport-fit=cover`
2. **CSS переменные**: Используйте CSS переменные для динамических отступов
3. **Обработка изменений**: Safe area может измениться при повороте экрана
4. **Fallback**: Всегда предоставляйте fallback значения для старых браузеров

## Примеры

### Полноэкранная страница
```tsx
function FullscreenPage() {
  return (
    <div className="fullscreen-safe">
      <SafeAreaWrapper padding="all">
        <h1>Полноэкранная страница</h1>
        <p>С учетом всех safe area отступов</p>
      </SafeAreaWrapper>
    </div>
  );
}
```

### Страница с отступом только сверху
```tsx
function HeaderPage() {
  return (
    <SafeAreaWrapper padding="top">
      <header>Заголовок</header>
      <main>Основной контент</main>
    </SafeAreaWrapper>
  );
}
```
