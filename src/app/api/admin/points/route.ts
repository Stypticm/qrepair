import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const adminTelegramId = searchParams.get('adminTelegramId')
    
    if (!adminTelegramId) {
      return NextResponse.json({ error: 'Admin Telegram ID is required' }, { status: 400 })
    }
    
    // Проверяем, что пользователь является админом
    const admin = await prisma.master.findUnique({
      where: { telegramId: adminTelegramId }
    })
    
    if (!admin || admin.telegramId !== '1') { // Только главный админ
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }
    
    // Получаем все точки
    const points = await prisma.point.findMany({
      orderBy: { id: 'asc' }
    })
    
    return NextResponse.json({ points })
  } catch (error) {
    console.error('Error fetching points:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}