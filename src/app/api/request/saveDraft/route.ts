import { NextRequest, NextResponse } from 'next/server'
import { RequestManager } from '@/core/lib/requestManager'

export async function POST(req: NextRequest) {
  try {
    const {
      telegramId,
      username,
      requestId,
      currentStep,
      // Новые / актуальные поля
      modelname,
      imei,
      sn,
      price,
      priceRange,
      deviceData,
      aiAnalysis,
      chatHistory,
      aiModelUsed,
      analysisConfidence,
      courier,
      photoUrls,
      videoUrls,
      deviceConditions,
      additionalConditions,
    } = await req.json()

    if (!telegramId) {
      return NextResponse.json(
        { error: 'Telegram ID is required' },
        { status: 400 }
      )
    }

    // Используем RequestManager для единой логики
    const request =
      await RequestManager.updateActiveRequest(telegramId, {
        username: username || 'Unknown',
        currentStep: currentStep || 'evaluation-mode',
        modelname,
        imei,
        sn,
        price,
        priceRange,
        deviceData,
        aiAnalysis,
        chatHistory,
        aiModelUsed,
        analysisConfidence,
        courier,
        photoUrls,
        videoUrls,
        deviceConditions,
        additionalConditions,
      })

    return NextResponse.json({
      success: true,
      requestId: request.id,
      currentStep: request.currentStep,
    })
  } catch (error) {
    console.error('Ошибка при сохранении черновика:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const telegramId = searchParams.get('telegramId')
    const requestId = searchParams.get('requestId')

    if (!telegramId && !requestId) {
      return NextResponse.json(
        { error: 'Telegram ID or Request ID is required' },
        { status: 400 }
      )
    }

    let draft

    if (requestId) {
      draft = await RequestManager.getRequestById(requestId)
    } else {
      draft =
        await RequestManager.getActiveRequestByTelegramId(
          telegramId!
        )
    }

    if (!draft) {
      return NextResponse.json(
        { error: 'Draft not found' },
        { status: 404 }
      )
    }

    // Новая схема уже хранит поля в корректных типах
    return NextResponse.json({
      success: true,
      draft,
    })
  } catch (error) {
    console.error('Ошибка при получении черновика:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
