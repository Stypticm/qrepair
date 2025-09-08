import { NextRequest, NextResponse } from 'next/server'
import { VoiceAgent } from '@/agents/VoiceAgent'

const voiceAgent = new VoiceAgent()

export async function POST(request: NextRequest) {
  try {
    voiceAgent.stopListening()

    return NextResponse.json({
      success: true,
      message: 'Голосовой агент остановлен',
      isListening: voiceAgent.isAgentListening(),
    })
  } catch (error) {
    console.error(
      'Ошибка остановки голосового агента:',
      error
    )
    return NextResponse.json(
      {
        success: false,
        message: 'Ошибка остановки голосового агента',
        error:
          error instanceof Error
            ? error.message
            : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
