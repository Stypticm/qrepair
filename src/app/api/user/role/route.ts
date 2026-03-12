import { NextRequest, NextResponse } from 'next/server'
import { api } from '@/services/api'

export async function GET(request: NextRequest) {
  try {
    const telegramId = request.headers.get('x-telegram-id')
    const authHeader = request.headers.get('authorization')

    if (!telegramId) {
      return NextResponse.json({ role: null }, { status: 401 })
    }

    const headers: Record<string, string> = {
      'x-telegram-id': telegramId
    };
    if (authHeader) headers['authorization'] = authHeader;

    // Ищем пользователя по telegramId через Go API
    const users = await api.list<any>('users', { telegramId }, headers);
    const user = users[0];

    return NextResponse.json({ role: user?.role || null })
  } catch (error) {
    console.error('Error fetching user role:', error)
    return NextResponse.json({ role: null }, { status: 500 })
  }
}
