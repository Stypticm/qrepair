import { Bot } from 'grammy'

export const bot = new Bot(process.env.BOT_TOKEN!)

// Deep linking - обработка start параметров
bot.command('start', async (ctx) => {
  const startParam = ctx.message?.text?.split(' ')[1] || ''

  if (startParam === 'app' || startParam === 'webapp') {
    // Прямое открытие приложения через deep link
    await ctx.reply('🚀 Открываю QoS прямо сейчас!', {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '🚀 Открыть QoS',
              web_app: {
                url: 'https://qrepair-git-dev-stypticms-projects.vercel.app/',
              },
            },
          ],
        ],
      },
    })
  } else {
    // Обычное приветствие с кнопкой открытия
    await ctx.reply(
      '🎉 Добро пожаловать в QoS!\n\n🚀 Нажмите кнопку ниже для открытия приложения:',
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '🚀 Открыть QoS',
                web_app: {
                  url: 'https://qrepair-git-dev-stypticms-projects.vercel.app/',
                },
              },
            ],
          ],
        },
      }
    )
  }
})

// Команда /app - быстрый доступ к приложению
bot.command('app', async (ctx) => {
  await ctx.reply('🚀 Открываю QoS прямо сейчас!', {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: '🚀 Открыть QoS',
            web_app: {
              url: 'https://qrepair-git-dev-stypticms-projects.vercel.app/',
            },
          },
        ],
      ],
    },
  })
})

// Команда /help
bot.command('help', async (ctx) => {
  await ctx.reply(
    '🔍 **Помощь по QoS**\n\n' +
      '📱 **Как это работает:**\n' +
      '1. Откройте приложение\n' +
      '2. Выберите модель телефона\n' +
      '3. Оцените состояние\n' +
      '4. Получите цену\n' +
      '5. Отправьте заявку\n\n' +
      '🚀 **Открыть приложение:** нажмите кнопку ниже',
    {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '🚀 Открыть QoS',
              web_app: {
                url: 'https://qrepair-git-dev-stypticms-projects.vercel.app/',
              },
            },
          ],
        ],
      },
    }
  )
})

// Команда /settings
bot.command('settings', async (ctx) => {
  await ctx.reply(
    '⚙️ **Настройки QoS**\n\n' +
      '🔧 **Доступные опции:**\n' +
      '• Изменить язык\n' +
      '• Настройки уведомлений\n' +
      '• Личный кабинет\n\n' +
      '🚀 **Открыть приложение для настройки:** нажмите кнопку ниже',
    {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '🚀 Открыть QoS',
              web_app: {
                url: 'https://qrepair-git-dev-stypticms-projects.vercel.app/',
              },
            },
          ],
        ],
      },
    }
  )
})

// Обработка callback_query для inline кнопок
bot.on('callback_query', async (ctx) => {
  if (ctx.callbackQuery.data === 'open_app') {
    await ctx.answerCallbackQuery('🚀 Открываю QoS...')
    await ctx.editMessageText(
      '🚀 **QoS открывается...**\n\nНажмите кнопку ниже:',
      {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '🚀 Открыть QoS',
                web_app: {
                  url: 'https://qrepair-git-dev-stypticms-projects.vercel.app/',
                },
              },
            ],
          ],
        },
      }
    )
  }
})

// Обработка ВСЕХ текстовых сообщений - показываем кнопку открытия
bot.on('message:text', async (ctx) => {
  const text = ctx.message.text.toLowerCase()

  // Приветствие
  if (
    text.includes('привет') ||
    text.includes('hello') ||
    text.includes('hi')
  ) {
    await ctx.reply(
      '👋 Привет! Добро пожаловать в QoS!\n\n🚀 Нажмите кнопку ниже для открытия приложения:',
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '🚀 Открыть QoS',
                web_app: {
                  url: 'https://qrepair-git-dev-stypticms-projects.vercel.app/',
                },
              },
            ],
          ],
        },
      }
    )
  }
  // Информация о ценах
  else if (
    text.includes('цена') ||
    text.includes('стоимость') ||
    text.includes('price')
  ) {
    await ctx.reply(
      '💰 **Оценка стоимости в QoS:**\n\n' +
        '📱 **Базовая цена:** от 48,000 ₽\n' +
        '📊 **Факторы влияния:**\n' +
        '• Модель телефона\n' +
        '• Состояние устройства\n' +
        '• Комплектация\n\n' +
        '🚀 **Получить точную оценку:** нажмите кнопку ниже',
      {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '🚀 Открыть QoS',
                web_app: {
                  url: 'https://qrepair-git-dev-stypticms-projects.vercel.app/',
                },
              },
            ],
          ],
        },
      }
    )
  }
  // Помощь
  else if (
    text.includes('помощь') ||
    text.includes('help')
  ) {
    await ctx.reply(
      '🔍 **Помощь по QoS**\n\n' +
        '📱 **Основные команды:**\n' +
        '• /help - Показать помощь\n' +
        '• /settings - Настройки\n' +
        '• /app - Быстро открыть приложение\n\n' +
        '🚀 **Открыть приложение:** нажмите кнопку ниже',
      {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '🚀 Открыть QoS',
                web_app: {
                  url: 'https://qrepair-git-dev-stypticms-projects.vercel.app/',
                },
              },
            ],
          ],
        },
      }
    )
  }
  // Любое другое сообщение - показываем кнопку открытия
  else {
    await ctx.reply(
      '🎯 **QoS - Quality of Service**\n\n🚀 Нажмите кнопку ниже для открытия приложения:',
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '🚀 Открыть QoS',
                web_app: {
                  url: 'https://qrepair-git-dev-stypticms-projects.vercel.app/',
                },
              },
            ],
          ],
        },
      }
    )
  }
})

// Инициализация бота при запуске
export const initializeBot = async () => {
  try {
    // Устанавливаем команды бота (команда /start убрана из списка)
    await bot.api.setMyCommands([
      {
        command: 'app',
        description: '📱 Быстро открыть приложение',
      },
      {
        command: 'help',
        description: '🔍 Помощь по использованию',
      },
      {
        command: 'settings',
        description: '⚙️ Настройки приложения',
      },
    ])

    // Menu Button "Открыть" настраивается через @BotFather
    // /setmenubutton -> Text: "🚀 Открыть", URL: https://qrepair-git-dev-stypticms-projects.vercel.app/
    console.log(
      '✅ Menu Button "Открыть" настраивается через @BotFather'
    )

    // Deep linking ссылки для прямого открытия:
    // https://t.me/your_bot_username?start=app
    // https://t.me/your_bot_username?start=webapp
    console.log(
      '✅ Deep linking настроен: ?start=app или ?start=webapp'
    )

    console.log(
      '✅ Бот QoS успешно инициализирован с deep linking и Menu Button "Открыть"'
    )

    // Запускаем бота
    bot.start()
    console.log('🚀 Бот QoS запущен и готов к работе')
  } catch (error) {
    console.error('❌ Ошибка инициализации бота:', error)
  }
}

// Бот запускается только через API endpoint /api/bot/init
// для предотвращения ошибок на клиенте
