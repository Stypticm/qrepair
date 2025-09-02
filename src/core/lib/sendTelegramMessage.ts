export async function sendTelegramMessage(
  telegramId: string,
  text: string,
  options: {
    parse_mode?: 'Markdown' | 'HTML'
    reply_markup?: object
  } = {}
) {
  const BOT_TOKEN = process.env.BOT_TOKEN
  if (!BOT_TOKEN) {
    throw new Error('BOT_TOKEN is not defined')
  }

  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: telegramId,
      text,
      ...options,
    }),
  })

  const data = await res.json()
  if (!data.ok) {
    throw new Error(data.description)
  }

  return data
}

export async function editTelegramReplyMarkup(
  chatId: string,
  messageId: number,
  replyMarkup: object | null
) {
  const BOT_TOKEN = process.env.BOT_TOKEN
  if (!BOT_TOKEN) {
    throw new Error('BOT_TOKEN is not defined')
  }
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/editMessageReplyMarkup`
  const body: any = {
    chat_id: chatId,
    message_id: messageId,
  }
  if (replyMarkup) {
    body.reply_markup = replyMarkup
  } else {
    body.reply_markup = { inline_keyboard: [] }
  }
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json()
  if (!data.ok) {
    throw new Error(data.description)
  }
  return data
}

export async function sendTelegramPhoto(
  telegramId: string,
  photo: string, // URL или file_id
  caption?: string,
  options: {
    parse_mode?: 'Markdown' | 'HTML'
    reply_markup?: object
  } = {}
) {
  const BOT_TOKEN = process.env.BOT_TOKEN
  if (!BOT_TOKEN) {
    throw new Error('BOT_TOKEN is not defined')
  }

  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: telegramId,
      photo,
      caption,
      ...options,
    }),
  })

  const data = await res.json()
  if (!data.ok) {
    throw new Error(data.description)
  }

  return data
}

export async function answerCallbackQuery(
  callbackQueryId: string,
  text?: string
) {
  const BOT_TOKEN = process.env.BOT_TOKEN
  if (!BOT_TOKEN) {
    throw new Error('BOT_TOKEN is not defined')
  }
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/answerCallbackQuery`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(
      text
        ? { callback_query_id: callbackQueryId, text }
        : { callback_query_id: callbackQueryId }
    ),
  })
  const data = await res.json()
  if (!data.ok) {
    throw new Error(data.description)
  }
  return data
}
