import { NextRequest, NextResponse } from 'next/server'
import { getServerImageUrl } from '@/core/lib/assets'

export async function GET(request: NextRequest) {
  try {
    const imageUrl = getServerImageUrl('submit.jpg')

    console.log('Testing image URL access:', imageUrl)

    // Проверяем доступность URL
    const response = await fetch(imageUrl, {
      method: 'HEAD',
    })

    console.log(
      'Image URL response status:',
      response.status
    )
    console.log(
      'Image URL response headers:',
      Object.fromEntries(response.headers.entries())
    )

    return NextResponse.json({
      success: true,
      imageUrl,
      accessible: response.ok,
      status: response.status,
      headers: Object.fromEntries(
        response.headers.entries()
      ),
    })
  } catch (error) {
    console.error('Error testing image access:', error)
    return NextResponse.json(
      {
        error: 'Failed to test image access',
        details:
          error instanceof Error
            ? error.message
            : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
