import { Bot } from 'grammy'

// Simple config for bot
const config = {
  getTelegramWebAppUrl: () => {
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL || 'https://qoqos.ru'
    return `${baseUrl}`
  },
}

export const bot = new Bot(process.env.BOT_TOKEN!)

// Deep linking - обработка start параметров
bot.command('start', async (ctx) => {
  const startParam = ctx.message?.text?.split(' ')[1] || ''

  if (startParam === 'app' || startParam === 'webapp') {
    // Прямое открытие приложения через deep link
    await ctx.reply('🚀 Открываю Qoqos прямо сейчас!', {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '🚀 Открыть Qoqos',
              web_app: {
                url:
                  config.getTelegramWebAppUrl() +
                  '?mode=fullscreen',
              },
            },
          ],
        ],
      },
    })
  } else if (startParam.startsWith('auth_')) {
    // Обработка авторизации через PWA
    const uuid = startParam.replace('auth_', '');
    const user = ctx.from;

    if (!user) {
        await ctx.reply('❌ Не удалось получить данные пользователя.');
        return;
    }

    try {
        const { prisma } = await import('@/core/lib/prisma');

        const authRequest = await prisma.authRequest.findUnique({
            where: { id: uuid }
        });

        if (!authRequest) {
            await ctx.reply('❌ Ссылка устарела или недействительна.');
            return;
        }

        if (authRequest.status === 'success') {
             await ctx.reply('✅ Вы уже авторизованы.');
             return;
        }

        // Обновляем запись в БД
        await prisma.authRequest.update({
            where: { id: uuid },
            data: {
                status: 'success',
                telegramId: user.id.toString(),
                telegramUsername: user.username,
                telegramData: user as any
            }
        });

        await ctx.reply('✅ Вы успешно авторизовались! Можете возвращаться в приложение.');

    } catch (error) {
        console.error('Auth error:', error);
        await ctx.reply('❌ Произошла ошибка при авторизации.');
    }

  } else {
    // Обычное приветствие с кнопкой открытия
    await ctx.reply(
      '🎉 Добро пожаловать в Qoqos!\n\n🚀 Нажмите кнопку ниже для открытия приложения:',
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '🚀 Открыть Qoqos',
                web_app: {
                  url:
                    config.getTelegramWebAppUrl() +
                    '?mode=fullscreen',
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
  await ctx.reply('🚀 Открываю Qoqos прямо сейчас!', {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: '🚀 Открыть Qoqos',
            web_app: {
              url:
                config.getTelegramWebAppUrl() +
                '?mode=fullscreen',
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
    '🔍 **Помощь по Qoqos**\n\n' +
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
              text: '🚀 Открыть Qoqos',
              web_app: {
                url:
                  config.getTelegramWebAppUrl() +
                  '?mode=fullscreen',
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
    '⚙️ **Настройки Qoqos**\n\n' +
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
              text: '🚀 Открыть Qoqos',
              web_app: {
                url:
                  config.getTelegramWebAppUrl() +
                  '?mode=fullscreen',
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
    await ctx.answerCallbackQuery('🚀 Открываю Qoqos...')
    await ctx.editMessageText(
      '🚀 **Qoqos открывается...**\n\nНажмите кнопку ниже:',
      {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '🚀 Открыть Qoqos',
                web_app: {
                  url:
                    config.getTelegramWebAppUrl() +
                    '?mode=fullscreen',
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
      '👋 Привет! Добро пожаловать в Qoqos!\n\n🚀 Нажмите кнопку ниже для открытия приложения:',
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '🚀 Открыть Qoqos',
                web_app: {
                  url:
                    config.getTelegramWebAppUrl() +
                    '?mode=fullscreen',
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
      '💰 **Оценка стоимости в Qoqos:**\n\n' +
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
                text: '🚀 Открыть Qoqos',
                web_app: {
                  url:
                    config.getTelegramWebAppUrl() +
                    '?mode=fullscreen',
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
      '🔍 **Помощь по Qoqos**\n\n' +
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
                text: '🚀 Открыть Qoqos',
                web_app: {
                  url: config.getTelegramWebAppUrl(),
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
      '🎯 **Qoqos - Quick, Open, Quality, Optimal, Safe**\n\n🚀 Нажмите кнопку ниже для открытия приложения:',
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '🚀 Открыть Qoqos',
                web_app: {
                  url:
                    config.getTelegramWebAppUrl() +
                    '?mode=fullscreen',
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

    // Menu Button "🚀 Open" настраивается через @BotFather
    // /setmenubutton -> Text: "🚀 Open", URL: config.getTelegramWebAppUrl()

    // Deep linking ссылки для прямого открытия:
    // https://t.me/your_bot_username?start=app
    // https://t.me/your_bot_username?start=webapp

    // Запускаем бота
    bot.start()
  } catch (error) {
    console.error('❌ Ошибка инициализации бота:', error)
  }
}

// Бот запускается только через API endpoint /api/bot/init
// для предотвращения ошибок на клиенте
