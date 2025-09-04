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
    console.error('Telegram API error:', data)
    throw new Error(
      data.description || 'Unknown Telegram API error'
    )
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

  const requestBody = {
    chat_id: telegramId,
    photo,
    caption,
    ...options,
  }

  console.log('Sending photo to Telegram:', {
    url,
    telegramId,
    photo,
    caption: caption?.substring(0, 100) + '...',
  })

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  })

  const data = await res.json()
  if (!data.ok) {
    console.error('Telegram API error:', data)
    console.error('Request URL:', url)
    console.error(
      'Request body:',
      JSON.stringify(requestBody, null, 2)
    )
    throw new Error(
      data.description || 'Unknown Telegram API error'
    )
  }

  return data
}

// Новая функция для отправки локального файла
export async function sendTelegramPhotoFile(
  telegramId: string,
  filePath: string, // Путь к локальному файлу
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

  console.log('Sending local photo file to Telegram:', {
    url,
    telegramId,
    filePath,
    caption: caption?.substring(0, 100) + '...',
  })

  // Создаем FormData для отправки файла
  const formData = new FormData()
  formData.append('chat_id', telegramId)
  formData.append(
    'photo',
    new Blob([
      await fetch(filePath).then((r) => r.arrayBuffer()),
    ]),
    'submit.png'
  )
  if (caption) {
    formData.append('caption', caption)
  }
  if (options.parse_mode) {
    formData.append('parse_mode', options.parse_mode)
  }

  const res = await fetch(url, {
    method: 'POST',
    body: formData,
  })

  const data = await res.json()
  if (!data.ok) {
    console.error('Telegram API error (file):', data)
    console.error('Request URL:', url)
    console.error('File path:', filePath)
    throw new Error(
      data.description || 'Unknown Telegram API error'
    )
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
