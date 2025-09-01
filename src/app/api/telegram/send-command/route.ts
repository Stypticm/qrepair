import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { telegramId, command, message } =
      await req.json()

    if (!telegramId || !command) {
      return NextResponse.json(
        { error: 'Missing telegramId or command' },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error sending command:', error)
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}
