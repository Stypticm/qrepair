import { NextRequest, NextResponse } from 'next/server'
import { api } from '@/services/api'

export async function GET(request: NextRequest) {
  try {
    const telegramId = request.headers.get('x-telegram-id')

    if (!telegramId) {
      return NextResponse.json({ role: null }, { status: 401 })
    }

    // Ищем пользователя по telegramId через Go API
    const users = await api.list<any>('users', { telegramId });
    const user = users[0];

    return NextResponse.json({ role: user?.role || null })
  } catch (error) {
    console.error('Error fetching user role:', error)
    return NextResponse.json({ role: null }, { status: 500 })
  }
}
