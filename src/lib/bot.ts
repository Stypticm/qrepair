import { Bot } from 'grammy'

export const bot = new Bot(process.env.BOT_TOKEN!)

// Команда /start
bot.command('start', async (ctx) => {
  // Используем startParameter вместо startPayload
  const startParam = ctx.message?.text?.split(' ')[1] || ''

  if (startParam === 'app') {
    // Прямой переход в приложение
    await ctx.reply('🚀 Открываю QoS...', {
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
    // Обычное приветствие с кнопкой для прямого открытия
    await ctx.reply(
      '🎉 Добро пожаловать в QoS!\n\nМы предлагаем выкуп ваших смартфонов по выгодным ценам.\n\n🚀 Нажмите кнопку ниже для начала работы',
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '🚀 Открыть приложение',
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
      '🚀 **Начать:** /start\n' +
      '⚙️ **Настройки:** /settings',
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
      '🚀 **Открыть приложение для настройки**',
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

// Обработка текстовых сообщений
bot.on('message:text', async (ctx) => {
  const text = ctx.message.text.toLowerCase()

  if (
    text.includes('привет') ||
    text.includes('hello') ||
    text.includes('hi')
  ) {
    await ctx.reply(
      '👋 Привет! Добро пожаловать в QoS!\n\n🚀 Нажмите кнопку ниже для начала работы:',
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
  } else if (
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
        '🚀 **Получить точную оценку:**',
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
  } else if (
    text.includes('помощь') ||
    text.includes('help')
  ) {
    await ctx.reply(
      '🔍 **Помощь по QoS**\n\n' +
        '📱 **Основные команды:**\n' +
        '• /start - Начать работу\n' +
        '• /help - Показать помощь\n' +
        '• /settings - Настройки\n\n' +
        '🚀 **Открыть приложение:**',
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

// Инициализация бота при запуске
export const initializeBot = async () => {
  try {
    // Устанавливаем команды бота
    await bot.api.setMyCommands([
      {
        command: 'start',
        description: '🚀 Начать работу с QoS',
      },
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

    // НЕ устанавливаем Menu Button - приложение будет открываться только через inline кнопки
    // Это позволит избежать проблем с menu button и обеспечит прямое открытие приложения

    console.log(
      '✅ Бот QoS успешно инициализирован (без Menu Button)'
    )
  } catch (error) {
    console.error('❌ Ошибка инициализации бота:', error)
  }
}

// Запуск бота
if (process.env.NODE_ENV === 'production') {
  bot.start()
  console.log('🚀 Бот QoS запущен в production режиме')
}
