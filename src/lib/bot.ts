import { Bot } from 'grammy'
import { prisma } from '@/core/lib/prisma'
import { generatePassword, hashPassword } from '@/lib/auth/password'

export const bot = new Bot(process.env.BOT_TOKEN!)

// Middleware: Проверка пароля
bot.use(async (ctx, next) => {
  if (!ctx.from?.id) return next()

  const telegramId = ctx.from.id.toString()
  
  // Получаем или создаем запись доступа
  let access = await prisma.botAccess.findUnique({ where: { telegramId } })
  if (!access) {
    access = await prisma.botAccess.create({ data: { telegramId } })
  }

  // Проверка сессии (24 часа)
  if (access.isAuthenticated) {
    const oneDay = 24 * 60 * 60 * 1000
    if (Date.now() - access.updatedAt.getTime() > oneDay) {
      access = await prisma.botAccess.update({
        where: { telegramId },
        data: { isAuthenticated: false }
      })
    } else {
      return next()
    }
  }

  // Проверка блокировки
  if (access.blockedUntil && access.blockedUntil > new Date()) {
    const minutesLeft = Math.ceil((access.blockedUntil.getTime() - Date.now()) / 60000)
    await ctx.reply(`⛔ Вы временно заблокированы. Попробуйте через ${minutesLeft} мин.`)
    return
  }

  // Обработка ввода пароля (любое текстовое сообщение)
  if (ctx.message?.text) {
    const text = ctx.message.text.trim()

    // Если введена команда (например /start), не считаем это попыткой ввода пароля
    if (text.startsWith('/')) {
       await ctx.reply('🔒 Бот защищен. Введите пароль доступа:')
       return
    }
    
    if (text === 'GolyanovoRomaMisha') {
      await prisma.botAccess.update({
        where: { telegramId },
        data: { isAuthenticated: true, attempts: 0, blockedUntil: null }
      })
      await ctx.reply('✅ Доступ разрешен! С возвращением.\n\nИспользуйте /start для меню.')
      return
    } else {
      const newAttempts = access.attempts + 1
      let blockedUntil = null
      
      if (newAttempts >= 3) {
        blockedUntil = new Date(Date.now() + 30 * 60000) // Блокировка на 30 минут
      }

      await prisma.botAccess.update({
        where: { telegramId },
        data: { attempts: newAttempts, blockedUntil }
      })

      if (blockedUntil) {
         await ctx.reply('⛔ Слишком много неверных попыток. Вы заблокированы на 30 минут.')
      } else {
         await ctx.reply(`❌ Неверный пароль. Попытка ${newAttempts}/3.`)
      }
      return
    }
  }

  // Если это не текст пароля, и мы не авторизованы -> просим пароль
  await ctx.reply('🔒 Бот защищен. Введите пароль доступа:')
})

// Команда /start
bot.command('start', async (ctx) => {
  await ctx.reply(
    '🤖 Бот для управления учетными записями Qoqos\n\n' +
      'Отправьте Telegram ID (для сотрудников) или Логин (для клиентов) чтобы управлять аккаунтом.'
  )
})

// Обработка текстовых сообщений (Telegram ID)
bot.on('message:text', async (ctx) => {
  const text = ctx.message.text.trim()

  // Игнорируем команды
  if (text.startsWith('/')) return

  // Проверяем, что это не команда (на всякий случай, хотя выше есть проверка)
  // Разрешаем любые строки (цифры для сотрудников, буквы для клиентов)
  if (text.length < 3) {
    return ctx.reply('❌ Логин должен быть длиннее 2 символов')
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
          `📱 Логин/ID: ${telegramId}\n` +
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
