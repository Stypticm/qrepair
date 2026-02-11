import { Bot } from 'grammy'

// Simple config for bot
const config = {
  getTelegramWebAppUrl: () => {
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL || 'https://qrepair.vercel.app'
    return `${baseUrl}`
  },
}

export const bot = new Bot(process.env.BOT_TOKEN!)

// Deep linking - обработка start параметров
bot.command('start', async (ctx) => {
  const startParam = ctx.message?.text?.split(' ')[1] || ''

  if (startParam.startsWith('auth_')) {
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
    // Обычное приветствие - для админов/пользователей, кто просто зашел в бота
    await ctx.reply(
      '� Привет! Это бот для авторизации в приложении Qoqos.\n\nЕсли вы здесь для входа, пожалуйста, используйте кнопку "Войти через Telegram" в самом приложении.',
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '🚀 Открыть приложение',
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
})

// Инициализация бота при запуске
export const initializeBot = async () => {
  try {
    // Убираем лишние команды, оставляем только start (она системная)
    await bot.api.deleteMyCommands();
    
    // Можно установить одну команду для порядка
    await bot.api.setMyCommands([
      {
        command: 'start',
        description: '♻️ Перезапустить бота',
      }
    ])

    console.log('✅ Бот инициализирован: команды обновлены');
  } catch (error) {
    console.error('❌ Ошибка инициализации бота:', error)
  }
}
