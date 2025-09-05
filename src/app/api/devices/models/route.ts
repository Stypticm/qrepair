import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/core/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const models = await prisma.device.findMany({
      select: {
        model: true,
      },
      distinct: ['model'],
    })

    // Сортируем модели: сначала X, затем числовые по возрастанию
    const sortedModels = models
      .map((item: { model: string }) => item.model)
      .sort((a: string, b: string) => {
        // X должен быть первым
        if (a === 'X') return -1
        if (b === 'X') return 1
        
        // Извлекаем числовые значения
        const aNum = parseInt(a)
        const bNum = parseInt(b)
        
        // Если оба числовые, сортируем по возрастанию
        if (!isNaN(aNum) && !isNaN(bNum)) {
          return aNum - bNum
        }
        
        // Если один числовой, а другой нет, числовой идет первым
        if (!isNaN(aNum) && isNaN(bNum)) return -1
        if (isNaN(aNum) && !isNaN(bNum)) return 1
        
        // Если оба не числовые, сортируем по алфавиту
        return a.localeCompare(b)
      })

    return NextResponse.json({
      success: true,
      models: sortedModels,
    })
  } catch (error) {
    console.error('Error fetching device models:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch models' },
      { status: 500 }
    )
  }
}
