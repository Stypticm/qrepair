import { NextResponse } from 'next/server'

export async function GET() {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET
  if (!secret) {
    return NextResponse.json(
      { error: 'Secret not configured' },
      { status: 500 }
    )
  }
  return NextResponse.json({ secret })
}
