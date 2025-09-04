import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Проверяем все важные переменные окружения
    const envCheck = {
      BOT_TOKEN: {
        exists: !!process.env.BOT_TOKEN,
        length: process.env.BOT_TOKEN?.length || 0,
        preview: process.env.BOT_TOKEN
          ? `${process.env.BOT_TOKEN.substring(0, 10)}...`
          : 'NOT SET',
      },
      NEXT_PUBLIC_BASE_URL: {
        exists: !!process.env.NEXT_PUBLIC_BASE_URL,
        value:
          process.env.NEXT_PUBLIC_BASE_URL || 'NOT SET',
      },
      NEXT_PUBLIC_SUPABASE_URL: {
        exists: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        value:
          process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT SET',
      },
      NEXT_PUBLIC_SUPABASE_ANON_KEY: {
        exists: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        length:
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
            ?.length || 0,
      },
      DATABASE_URL: {
        exists: !!process.env.DATABASE_URL,
        hasSupabase:
          process.env.DATABASE_URL?.includes('supabase') ||
          false,
      },
      NODE_ENV: process.env.NODE_ENV || 'NOT SET',
    }

    return NextResponse.json({
      success: true,
      environment: envCheck,
      message: 'Environment variables check',
    })
  } catch (error) {
    console.error('Error checking environment:', error)
    return NextResponse.json(
      {
        error: 'Failed to check environment',
        details:
          error instanceof Error
            ? error.message
            : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
