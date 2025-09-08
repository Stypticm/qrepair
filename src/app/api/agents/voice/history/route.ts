import { NextRequest, NextResponse } from 'next/server'
import { VoiceAgent } from '@/agents/VoiceAgent'

const voiceAgent = new VoiceAgent()

export async function GET(request: NextRequest) {
  try {
    const history = await voiceAgent.getCommandHistory()

    return NextResponse.json({
      success: true,
      history,
      count: history.length,
    })
  } catch (error) {
    console.error('Ошибка получения истории команд:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Ошибка получения истории команд',
        error:
          error instanceof Error
            ? error.message
            : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
