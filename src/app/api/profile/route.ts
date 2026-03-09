import { NextResponse } from 'next/server'
import { api } from '@/services/api'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const telegramId = searchParams.get('telegramId')

  if (!telegramId) {
    return NextResponse.json(
      { error: 'Missing telegramId' },
      { status: 400 }
    )
  }

  try {
    // Получаем заявки через Go API
    const applications = await api.list<any>('skupkas', { telegramId });

    return NextResponse.json(applications)
  } catch (error: any) {
    console.error('Error fetching application:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
