import { Bot } from 'grammy'
import { prisma } from '@/core/lib/prisma'
import { generatePassword, hashPassword } from '@/lib/auth/password'

export const bot = new Bot(process.env.BOT_TOKEN!)

// Обработка текстовых сообщений (Telegram ID)
bot.on('message:text', async (ctx) => {
  const text = ctx.message.text.trim()

  // Игнорируем команды
  if (text.startsWith('/')) return

  // Проверяем, что это похоже на Telegram ID (только цифры)
  if (!/^\d+$/.test(text)) {
    return ctx.reply('❌ Введите корректный Telegram ID (только цифры)')
  }

  const telegramId = text

  try {
    // Ищем пользователя
    const user = await prisma.user.findUnique({
      where: { telegramId },
    })

    if (!user) {
      // Новый пользователь - предлагаем выбрать роль
      return ctx.reply('👤 Пользователь не найден. Выберите роль:', {
        reply_markup: {
          inline_keyboard: [
            [
              { text: '👑 Admin', callback_data: `create:${telegramId}:ADMIN` },
              { text: '🔧 Master', callback_data: `create:${telegramId}:MASTER` },
            ],
            [
              { text: '📊 Manager', callback_data: `create:${telegramId}:MANAGER` },
              { text: '👤 User', callback_data: `create:${telegramId}:USER` },
            ],
          ],
        },
      })
    } else {
      // Существующий пользователь - предлагаем действия
      return ctx.reply(
        `✅ Найден аккаунт:\n` +
          `📱 Telegram ID: ${user.telegramId}\n` +
          `👤 Роль: ${user.role}\n\n` +
          `Что сделать?`,
        {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: '🔑 Сменить пароль',
                  callback_data: `reset:${telegramId}`,
                },
              ],
              [
                {
                  text: '🔄 Сменить роль',
                  callback_data: `role:${telegramId}`,
                },
              ],
            ],
          },
        }
      )
    }
  } catch (error) {
    console.error('[BOT] Error processing telegram ID:', error)
    return ctx.reply('❌ Произошла ошибка. Попробуйте позже.')
  }
})

// Обработка callback кнопок
bot.on('callback_query', async (ctx) => {
  const data = ctx.callbackQuery.data

  if (!data) return

  try {
    // Создание нового пользователя
    if (data.startsWith('create:')) {
      const [_, telegramId, role] = data.split(':')
      const password = generatePassword()
      const passwordHash = await hashPassword(password)

      await prisma.user.create({
        data: {
          telegramId,
          passwordHash,
          role: role as any,
        },
      })

      await ctx.answerCallbackQuery('✅ Аккаунт создан!')
      await ctx.editMessageText(
        `✅ Аккаунт успешно создан!\n\n` +
          `📱 Логин: ${telegramId}\n` +
          `🔑 Пароль: ${password}\n` +
          `👤 Роль: ${role}\n\n` +
          `⚠️ Сохраните эти данные! Пароль больше не будет показан.`
      )
    }

    // Сброс пароля
    else if (data.startsWith('reset:')) {
      const telegramId = data.split(':')[1]
      const password = generatePassword()
      const passwordHash = await hashPassword(password)

      await prisma.user.update({
        where: { telegramId },
        data: { passwordHash },
      })

      await ctx.answerCallbackQuery('✅ Пароль изменен!')
      await ctx.editMessageText(
        `✅ Пароль успешно изменен!\n\n` +
          `📱 Логин: ${telegramId}\n` +
          `🔑 Новый пароль: ${password}\n\n` +
          `⚠️ Сохраните новый пароль!`
      )
    }

    // Смена роли
    else if (data.startsWith('role:')) {
      const telegramId = data.split(':')[1]

      await ctx.answerCallbackQuery()
      await ctx.editMessageText('🔄 Выберите новую роль:', {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '👑 Admin',
                callback_data: `changerole:${telegramId}:ADMIN`,
              },
              {
                text: '🔧 Master',
                callback_data: `changerole:${telegramId}:MASTER`,
              },
            ],
            [
              {
                text: '📊 Manager',
                callback_data: `changerole:${telegramId}:MANAGER`,
              },
              {
                text: '👤 User',
                callback_data: `changerole:${telegramId}:USER`,
              },
            ],
          ],
        },
      })
    }

    // Применение новой роли
    else if (data.startsWith('changerole:')) {
      const [_, telegramId, newRole] = data.split(':')

      await prisma.user.update({
        where: { telegramId },
        data: { role: newRole as any },
      })

      await ctx.answerCallbackQuery('✅ Роль изменена!')
      await ctx.editMessageText(
        `✅ Роль успешно изменена!\n\n` +
          `📱 Telegram ID: ${telegramId}\n` +
          `👤 Новая роль: ${newRole}`
      )
    }
  } catch (error) {
    console.error('[BOT] Callback error:', error)
    await ctx.answerCallbackQuery('❌ Ошибка')
    await ctx.reply('❌ Произошла ошибка. Попробуйте позже.')
  }
})

// Команда /start
bot.command('start', async (ctx) => {
  await ctx.reply(
    '🤖 Бот для управления учетными записями Qoqos\n\n' +
      'Отправьте Telegram ID пользователя для создания или управления аккаунтом.'
  )
})

// Инициализация бота
export const initializeBot = async () => {
  try {
    await bot.api.setMyCommands([
      {
        command: 'start',
        description: '♻️ Перезапустить бота',
      },
    ])

    console.log('✅ Бот инициализирован')
  } catch (error) {
    console.error('❌ Ошибка инициализации бота:', error)
  }
}
