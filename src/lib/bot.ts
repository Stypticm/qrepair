import { Bot } from 'grammy';
import { api } from '@/services/api';
import { generatePassword, hashPassword } from '@/lib/auth/password';

// Используем заглушку для токена во время сборки, чтобы Bot не выбрасывал ошибку
const token = process.env.BOT_TOKEN || '000000000:AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
export const bot = new Bot(token);

// Middleware: Проверка пароля
bot.use(async (ctx, next) => {
  if (!ctx.from?.id) return next();

  const telegramId = ctx.from.id.toString();
  
  // Получаем или создаем запись доступа через Go API
  const accessList = await api.list<any>('bot-accesses', { telegramId });
  let access = accessList[0];

  if (!access) {
    access = await api.create<any>('bot-accesses', { 
      id: `ba_${telegramId}`,
      telegramId,
      isAuthenticated: false,
      attempts: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  // Проверка сессии (24 часа)
  if (access.isAuthenticated) {
    const oneDay = 24 * 60 * 60 * 1000;
    const updatedAt = new Date(access.updatedAt).getTime();
    if (Date.now() - updatedAt > oneDay) {
      access = await api.patch<any>('bot-accesses', access.id, {
        isAuthenticated: false,
        updatedAt: new Date().toISOString()
      });
    } else {
      return next();
    }
  }

  // Проверка блокировки
  if (access.blockedUntil && new Date(access.blockedUntil) > new Date()) {
    const blockedUntil = new Date(access.blockedUntil).getTime();
    const minutesLeft = Math.ceil((blockedUntil - Date.now()) / 60000);
    await ctx.reply(`⛔ Вы временно заблокированы. Попробуйте через ${minutesLeft} мин.`);
    return;
  }

  // Обработка ввода пароля (любое текстовое сообщение)
  if (ctx.message?.text) {
    const text = ctx.message.text.trim();

    // Если введена команда (например /start), не считаем это попыткой ввода пароля
    if (text.startsWith('/')) {
       await ctx.reply('🔒 Бот защищен. Введите пароль доступа:');
       return;
    }
    
    if (text === process.env.BOT_PASSWORD) {
      await api.patch<any>('bot-accesses', access.id, {
        isAuthenticated: true,
        attempts: 0,
        blockedUntil: null,
        updatedAt: new Date().toISOString()
      });
      await ctx.reply('✅ Доступ разрешен! С возвращением.\n\nИспользуйте /start для меню.');
      return;
    } else {
      const newAttempts = (access.attempts || 0) + 1;
      let blockedUntil = null;
      
      if (newAttempts >= 3) {
        blockedUntil = new Date(Date.now() + 30 * 60000).toISOString(); // Блокировка на 30 минут
      }

      await api.patch<any>('bot-accesses', access.id, {
        attempts: newAttempts,
        blockedUntil,
        updatedAt: new Date().toISOString()
      });

      if (blockedUntil) {
         await ctx.reply('⛔ Слишком много неверных попыток. Вы заблокированы на 30 минут.');
      } else {
         await ctx.reply(`❌ Неверный пароль. Попытка ${newAttempts}/3.`);
      }
      return;
    }
  }

  // Если это не текст пароля, и мы не авторизованы -> просим пароль
  await ctx.reply('🔒 Бот защищен. Введите пароль доступа:');
});

// Команда /start
bot.command('start', async (ctx) => {
  await ctx.reply(
    '🤖 Бот для управления учетными записями Qoqos\n\n' +
      'Отправьте Telegram ID (для сотрудников) или Логин (для клиентов) чтобы управлять аккаунтом.'
  );
});

// Обработка текстовых сообщений (Telegram ID)
bot.on('message:text', async (ctx) => {
  const text = ctx.message.text.trim();

  // Игнорируем команды
  if (text.startsWith('/')) return;

  if (text.length < 3) {
    return ctx.reply('❌ Логин должен быть длиннее 2 символов');
  }

  const telegramId = text;

  try {
    // Ищем пользователя через Go API
    const userList = await api.list<any>('users', { telegramId });
    const user = userList[0];

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
      });
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
      );
    }
  } catch (error) {
    console.error('[BOT] Error processing telegram ID:', error);
    return ctx.reply('❌ Произошла ошибка. Попробуйте позже.');
  }
});

// Обработка callback кнопок
bot.on('callback_query', async (ctx) => {
  const data = ctx.callbackQuery.data;

  if (!data) return;

  try {
    // Создание нового пользователя
    if (data.startsWith('create:')) {
      const [_, telegramId, role] = data.split(':');
      const password = generatePassword();
      const passwordHash = await hashPassword(password);

      await api.create<any>('users', {
        id: `u_${telegramId}`,
        telegramId,
        passwordHash,
        role: role,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      await ctx.answerCallbackQuery('✅ Аккаунт создан!');
      await ctx.editMessageText(
        `✅ Аккаунт успешно создан!\n\n` +
          `📱 Логин/ID: ${telegramId}\n` +
          `🔑 Пароль: ${password}\n` +
          `👤 Роль: ${role}\n\n` +
          `⚠️ Сохраните эти данные! Пароль больше не будет показан.`
      );
    }

    // Сброс пароля
    else if (data.startsWith('reset:')) {
      const telegramId = data.split(':')[1];
      const password = generatePassword();
      const passwordHash = await hashPassword(password);

      const userList = await api.list<any>('users', { telegramId });
      const user = userList[0];

      if (user) {
        await api.patch<any>('users', user.id, {
          passwordHash,
          updatedAt: new Date().toISOString(),
        });

        await ctx.answerCallbackQuery('✅ Пароль изменен!');
        await ctx.editMessageText(
          `✅ Пароль успешно изменен!\n\n` +
            `📱 Логин: ${telegramId}\n` +
            `🔑 Новый пароль: ${password}\n\n` +
            `⚠️ Сохраните новый пароль!`
        );
      }
    }

    // Смена роли
    else if (data.startsWith('role:')) {
      const telegramId = data.split(':')[1];

      await ctx.answerCallbackQuery();
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
      });
    }

    // Применение новой роли
    else if (data.startsWith('changerole:')) {
      const [_, telegramId, newRole] = data.split(':');

      const userList = await api.list<any>('users', { telegramId });
      const user = userList[0];

      if (user) {
        await api.patch<any>('users', user.id, {
          role: newRole,
          updatedAt: new Date().toISOString(),
        });

        await ctx.answerCallbackQuery('✅ Роль изменена!');
        await ctx.editMessageText(
          `✅ Роль успешно изменена!\n\n` +
            `📱 Telegram ID: ${telegramId}\n` +
            `👤 Новая роль: ${newRole}`
        );
      }
    }
  } catch (error) {
    console.error('[BOT] Callback error:', error);
    await ctx.answerCallbackQuery('❌ Ошибка');
    await ctx.reply('❌ Произошла ошибка. Попробуйте позже.');
  }
});

// Инициализация бота
export const initializeBot = async () => {
  try {
    await bot.api.setMyCommands([
      {
        command: 'start',
        description: '♻️ Перезапустить бота',
      },
    ]);

    console.log('✅ Бот инициализирован');
  } catch (error) {
    console.error('❌ Ошибка инициализации бота:', error);
  }
};
