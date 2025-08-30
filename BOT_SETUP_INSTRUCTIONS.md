# 🚀 Инструкция по настройке бота для Mini App

## 🔍 **Проблема**

При нажатии на кнопку "Open" в чате с ботом, Mini App не открывается в полноэкранном режиме, а остается в половине экрана.

## 🎯 **Решение**

Настроим бота с большими кнопками START и Menu Button "Open" для прямого открытия приложения.

## 📋 **Пошаговая настройка**

### 1. **Откройте @BotFather в Telegram**

### 2. **Настройте команды бота**
```
/setcommands
```

Добавьте команды:
```
start - Начать работу с ботом
app - Быстро открыть приложение
help - Помощь
settings - Настройки
```

### 3. **Настройте Menu Button**
```
/setmenubutton
```

Выберите вашего бота и настройте:
- **Text**: "🚀 Open"
- **URL**: `https://qrepair-git-dev-stypticms-projects.vercel.app/`

**Важно:** URL должен быть точно таким же, как в вашем приложении!

### 4. **Настройте Start Command**
```
/setstarttext
```

Добавьте текст:
```
🎉 Добро пожаловать в QoS!

Мы предлагаем выкуп ваших смартфонов по выгодным ценам.

🚀 Нажмите кнопку ниже для начала работы
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
  { command: "start", description: "🚀 Начать работу с QoS" },
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
   - **Text**: "🚀 Open"
   - **URL**: `https://qrepair-git-dev-stypticms-projects.vercel.app/`

## 📱 **Результат настройки**

После правильной настройки:

✅ **При первом заходе** появится большая кнопка START  
✅ **В чате с ботом** будет кнопка "🚀 Open" в меню  
✅ **При нажатии на START** появится большая кнопка "🚀 Открыть QoS"  
✅ **При нажатии на Open** приложение откроется сразу в полноэкранном режиме  
✅ **Все команды** будут работать с inline кнопками  

## 🎨 **Как это работает**

### **Start Command с большой кнопкой**
```typescript
bot.command('start', async (ctx) => {
  await ctx.reply('🎉 Добро пожаловать в QoS!', {
    reply_markup: {
      keyboard: [[{
        text: "🚀 Открыть QoS",
        web_app: { url: "https://qrepair-git-dev-stypticms-projects.vercel.app/" }
      }]],
      resize_keyboard: true,
      one_time_keyboard: false
    }
  });
});
```

### **Menu Button "Open"**
```typescript
// В @BotFather или через API
{
  text: "🚀 Open",
  type: "web_app",
  web_app: { url: "https://qrepair-git-dev-stypticms-projects.vercel.app/" }
}
```

## ✅ **Что нужно делать**

1. **Настройте Menu Button** через @BotFather
2. **Настройте команды** через @BotFather
3. **Тестируйте** открытие через кнопку "Open"
4. **Проверяйте** работу команды /start с большой кнопкой

## 🚫 **Что НЕ нужно делать**

1. **НЕ убирайте Menu Button** - он нужен для быстрого доступа
2. **НЕ используйте только inline кнопки** - большие кнопки лучше для UX
3. **НЕ забывайте про resize_keyboard** - для адаптивности

## 🔗 **Полезные ссылки**

- [BotFather Commands](https://core.telegram.org/bots/features#commands)
- [Menu Button](https://core.telegram.org/bots/features#menu-button)
- [Keyboard Buttons](https://core.telegram.org/bots/features#keyboards)
- [Web App Integration](https://core.telegram.org/bots/webapps)

## ⚠️ **Важные моменты**

1. **URL должен быть HTTPS** - Telegram требует безопасное соединение
2. **Домен должен быть подтвержден** в BotFather
3. **Приложение должно быть готово** к работе в Telegram WebApp
4. **Тестируйте** открытие через Menu Button и команды
5. **Большие кнопки** лучше для мобильных устройств

## 🎯 **Преимущества этого подхода**

✅ **Большая кнопка START** - как в обычных ботах  
✅ **Menu Button "Open"** - быстрый доступ к приложению  
✅ **Прямое открытие** - приложение открывается сразу при клике  
✅ **Лучший UX** - привычный интерфейс для пользователей  
✅ **Два способа доступа** - через меню и через команды  

После правильной настройки бота, Mini App будет работать корректно в полноэкранном режиме при клике на кнопку "Open" в меню! 🚀
