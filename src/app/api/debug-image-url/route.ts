import { NextRequest, NextResponse } from 'next/server'
import { getServerImageUrl } from '@/core/lib/assets'

export async function GET(request: NextRequest) {
  try {
    const imageUrl = getServerImageUrl('submit.jpg')

    console.log('=== IMAGE URL DEBUG ===')
    console.log(
      'NEXT_PUBLIC_USE_SUPABASE_IMAGES:',
      process.env.NEXT_PUBLIC_USE_SUPABASE_IMAGES
    )
    console.log(
      'NEXT_PUBLIC_BASE_URL:',
      process.env.NEXT_PUBLIC_BASE_URL
    )
    console.log(
      'NEXT_PUBLIC_SUPABASE_URL:',
      process.env.NEXT_PUBLIC_SUPABASE_URL
    )
    console.log('Generated imageUrl:', imageUrl)
    console.log('========================')

    return NextResponse.json({
      success: true,
      imageUrl,
      env: {
        NEXT_PUBLIC_USE_SUPABASE_IMAGES:
          process.env.NEXT_PUBLIC_USE_SUPABASE_IMAGES,
        NEXT_PUBLIC_BASE_URL:
          process.env.NEXT_PUBLIC_BASE_URL,
        NEXT_PUBLIC_SUPABASE_URL:
          process.env.NEXT_PUBLIC_SUPABASE_URL,
      },
    })
  } catch (error) {
    console.error('Error in debug-image-url:', error)
    return NextResponse.json(
      {
        error: 'Failed to get image URL',
        details:
          error instanceof Error
            ? error.message
            : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
