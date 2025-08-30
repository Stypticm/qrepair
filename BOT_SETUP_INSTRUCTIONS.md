# 🚀 Инструкция по настройке бота для Mini App

## 🔍 **Проблема**

При нажатии на кнопку "Open" в чате с ботом, Mini App не открывается в полноэкранном режиме, а остается в половине экрана.

## 🎯 **Решение**

Настроим бота с deep linking для прямого открытия приложения и Menu Button "Открыть".

## 📋 **Пошаговая настройка**

### 1. **Откройте @BotFather в Telegram**

### 2. **Настройте команды бота**
```
/setcommands
```

Добавьте команды:
```
start - Открыть приложение (с deep linking)
app - Быстро открыть приложение
help - Помощь
settings - Настройки
```

### 3. **Настройте Menu Button**
```
/setmenubutton
```

Выберите вашего бота и настройте:
- **Text**: "🚀 Открыть"
- **URL**: `https://qrepair-git-dev-stypticms-projects.vercel.app/`

**Важно:** URL должен быть точно таким же, как в вашем приложении!

### 4. **Start Command с deep linking**
```
/setstarttext
```

Добавьте текст:
```
🎉 Добро пожаловать в QoS!

🚀 Нажмите кнопку ниже для открытия приложения
```

### 5. **Настройте Description**
```
/setdescription
```

Добавьте описание:
```
QoS - Quality of Service. Выкуп смартфонов по выгодным ценам. Оцените свой телефон за 2 минуты!
```

### 6. **Настройте About**
```
/setabouttext
```

Добавьте информацию:
```
QoS - современная платформа для выкупа смартфонов. Быстрая оценка, честные цены, удобный сервис.
```

## 🔧 **Deep Linking для прямого открытия**

### **Ссылки для прямого открытия приложения:**

```
https://t.me/your_bot_username?start=app
https://t.me/your_bot_username?start=webapp
```

### **Как это работает:**

1. **Пользователь переходит по ссылке** `https://t.me/your_bot_username?start=app`
2. **Telegram автоматически открывает бота** с параметром `start=app`
3. **Бот сразу показывает кнопку** "🚀 Открыть QoS"
4. **Приложение открывается** в полноэкранном режиме

### **Использование deep linking:**

- **В рекламе:** `https://t.me/your_bot_username?start=app`
- **На сайте:** `https://t.me/your_bot_username?start=webapp`
- **В социальных сетях:** `https://t.me/your_bot_username?start=app`
- **В email рассылках:** `https://t.me/your_bot_username?start=webapp`

## 🔧 **Автоматическая инициализация бота**

Бот автоматически инициализируется при деплое через cron endpoint:

```typescript
// API endpoint для инициализации
POST /api/bot/init

// Cron endpoint для автоматического запуска
GET /api/cron/bot-init
```

### **Настройка через BotFather (рекомендуется):**

```typescript
// Устанавливаем команды
await bot.api.setMyCommands([
  { command: "start", description: "🚀 Открыть приложение (с deep linking)" },
  { command: "app", description: "📱 Быстро открыть приложение" },
  { command: "help", description: "🔍 Помощь по использованию" },
  { command: "settings", description: "⚙️ Настройки приложения" }
]);
```

### **Настройка Menu Button через @BotFather:**

1. Откройте @BotFather
2. `/setmenubutton`
3. Выберите вашего бота
4. Настройте:
   - **Text**: "🚀 Открыть"
   - **URL**: `https://qrepair-git-dev-stypticms-projects.vercel.app/`

## 📱 **Результат настройки**

После правильной настройки:

✅ **При первом заходе** появится приветствие с кнопкой открытия  
✅ **В чате с ботом** будет кнопка "🚀 Открыть" в меню  
✅ **При любом сообщении** показывается кнопка "🚀 Открыть QoS"  
✅ **Deep linking работает** - `?start=app` сразу открывает приложение  
✅ **Команды** работают с inline кнопками для дополнительных функций  
✅ **Простой интерфейс** - всегда есть кнопка открытия  

## 🎨 **Как это работает**

### **Deep Linking с командой /start**
```typescript
bot.command('start', async (ctx) => {
  const startParam = ctx.message?.text?.split(' ')[1] || ''
  
  if (startParam === 'app' || startParam === 'webapp') {
    // Прямое открытие приложения через deep link
    await ctx.reply('🚀 Открываю QoS прямо сейчас!', {
      reply_markup: {
        inline_keyboard: [[
          {
            text: "🚀 Открыть QoS",
            web_app: { url: "https://qrepair-git-dev-stypticms-projects.vercel.app/" }
          }
        ]]
      }
    })
  } else {
    // Обычное приветствие с кнопкой открытия
    await ctx.reply('🎉 Добро пожаловать в QoS!', {
      reply_markup: {
        inline_keyboard: [[
          {
            text: "🚀 Открыть QoS",
            web_app: { url: "https://qrepair-git-dev-stypticms-projects.vercel.app/" }
          }
        ]]
      }
    })
  }
})
```

### **Обработка всех сообщений**
```typescript
// При любом сообщении показываем кнопку открытия
bot.on('message:text', async (ctx) => {
  // ... обработка разных типов сообщений ...
  
  // Любое другое сообщение - показываем кнопку открытия
  await ctx.reply('🎯 QoS - Quality of Service\n\n🚀 Нажмите кнопку ниже:', {
    reply_markup: {
      inline_keyboard: [[
        {
          text: "🚀 Открыть QoS",
          web_app: { url: "https://qrepair-git-dev-stypticms-projects.vercel.app/" }
        }
      ]]
    }
  })
})
```

### **Menu Button "Открыть"**
```typescript
// В @BotFather настраиваем:
// /setmenubutton -> Text: "🚀 Открыть", URL: https://qrepair-git-dev-stypticms-projects.vercel.app/
```

## ✅ **Что нужно делать**

1. **Настройте Menu Button** через @BotFather
2. **Настройте команды** через @BotFather
3. **Используйте deep linking** для прямого открытия
4. **Тестируйте** все способы открытия приложения

## 🚫 **Что НЕ нужно делать**

1. **НЕ убирайте Menu Button** - он нужен для быстрого доступа
2. **НЕ забывайте про deep linking** - это основной способ привлечения
3. **НЕ используйте сложные команды** - только простые функции

## 🔗 **Полезные ссылки**

- [BotFather Commands](https://core.telegram.org/bots/features#commands)
- [Menu Button](https://core.telegram.org/bots/features#menu-button)
- [Deep Linking](https://core.telegram.org/bots/features#deep-linking)
- [Web App Integration](https://core.telegram.org/bots/webapps)

## ⚠️ **Важные моменты**

1. **URL должен быть HTTPS** - Telegram требует безопасное соединение
2. **Домен должен быть подтвержден** в BotFather
3. **Приложение должно быть готово** к работе в Telegram WebApp
4. **Тестируйте** deep linking ссылки
5. **Deep linking работает** только с подтвержденными ботами

## 🎯 **Преимущества этого подхода**

✅ **Deep linking** - прямое открытие приложения по ссылке  
✅ **Menu Button "Открыть"** - быстрый доступ к приложению  
✅ **При любом сообщении** показывается кнопка открытия  
✅ **Лучший UX** - всегда есть способ открыть приложение  
✅ **Множество способов доступа** - через меню, команды, deep linking  

## 🚀 **Deep Linking ссылки для вашего бота:**

Замените `your_bot_username` на реальное имя вашего бота:

```
https://t.me/your_bot_username?start=app
https://t.me/your_bot_username?start=webapp
```

После правильной настройки бота, Mini App будет работать корректно в полноэкранном режиме при любом способе открытия! 🚀
