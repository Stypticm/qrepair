export async function sendTelegramMessage(
  telegramId: string,
  text: string
) {
  const BOT_TOKEN = process.env.BOT_TOKEN
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: telegramId,
      text,
    }),
  })

  const data = await res.json()
  if (!data.ok) {
    throw new Error(data.description)
  }

  return data
}
