import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const path = (await params).path.join('/');
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 
                 process.env.NEXT_PUBLIC_N8N_URL || 
                 'https://sirena-eriophyllous-melisa.ngrok-free.dev';
  const targetUrl = `${apiUrl}/static/${path}`;

  try {
    const res = await fetch(targetUrl, {
      headers: {
        'ngrok-skip-browser-warning': 'true',
      },
    });

    if (!res.ok) {
      return new NextResponse('Not Found', { status: 404 });
    }

    const blob = await res.blob();
    const headers = new Headers();
    headers.set('Content-Type', res.headers.get('Content-Type') || 'image/jpeg');
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');

    return new NextResponse(blob, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('Error proxying static file:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
