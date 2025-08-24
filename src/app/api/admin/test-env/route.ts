import { NextResponse } from 'next/server'

export async function GET() {
  const envVars = {
    BOT_TOKEN: process.env.BOT_TOKEN ? 'EXISTS' : 'MISSING',
    NEXT_PUBLIC_SUPABASE_URL: process.env
      .NEXT_PUBLIC_SUPABASE_URL
      ? 'EXISTS'
      : 'MISSING',
    SUPABASE_SERVICE_ROLE_KEY: process.env
      .SUPABASE_SERVICE_ROLE_KEY
      ? 'EXISTS'
      : 'MISSING',
    NODE_ENV: process.env.NODE_ENV || 'NOT_SET',
  }

  return NextResponse.json({
    success: true,
    environment: envVars,
    timestamp: new Date().toISOString(),
  })
}
