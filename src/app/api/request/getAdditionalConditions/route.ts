import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { telegramId } = await request.json();

    if (!telegramId) {
      return NextResponse.json(
        { error: 'TelegramId is required' },
        { status: 400 }
      );
    }

    // Ищем активную заявку пользователя
    const activeRequest = await prisma.skupka.findFirst({
      where: {
        telegramId: telegramId,
        status: 'draft',
      },
      select: {
        additionalConditions: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (activeRequest) {
      return NextResponse.json({
        additionalConditions:
          activeRequest.additionalConditions || null,
      });
    } else {
      console.log('Активная заявка не найдена для telegramId:', telegramId);
      return NextResponse.json({
        additionalConditions: null,
      });
    }
  } catch (error) {
    console.error('Error in getAdditionalConditions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
