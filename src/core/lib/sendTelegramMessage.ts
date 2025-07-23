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
