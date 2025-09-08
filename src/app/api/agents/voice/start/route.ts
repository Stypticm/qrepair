import { NextRequest, NextResponse } from 'next/server'
import { VoiceAgent } from '@/agents/VoiceAgent'

const voiceAgent = new VoiceAgent()

export async function POST(request: NextRequest) {
  try {
    const started = await voiceAgent.startListening()

    if (started) {
      return NextResponse.json({
        success: true,
        message: 'Голосовой агент запущен',
        isListening: voiceAgent.isAgentListening(),
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          message: 'Не удалось запустить голосовой агент',
          error: 'Browser not supported or already running',
        },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error(
      'Ошибка запуска голосового агента:',
      error
    )
    return NextResponse.json(
      {
        success: false,
        message: 'Ошибка запуска голосового агента',
        error:
          error instanceof Error
            ? error.message
            : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
