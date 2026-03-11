import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/core/lib/requireAuth';
import { api } from '@/services/api';

export async function GET(request: NextRequest) {
  // Public: returns only published posts. With auth: returns all.
  const auth = requireAuth(request, ['ADMIN', 'MANAGER']);
  const isAdmin = !(auth instanceof NextResponse);

  try {
    const telegramId = request.headers.get('x-telegram-id');
    const authHeader = request.headers.get('authorization');
    const headers: Record<string, string> = {};
    if (telegramId) headers['x-telegram-id'] = telegramId;
    if (authHeader) headers['authorization'] = authHeader;

    const posts = await api.list<any>('blog-posts', isAdmin ? {} : { published: 'true' }, headers);
    return NextResponse.json(posts);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = requireAuth(request, ['ADMIN', 'MANAGER']);
  if (auth instanceof NextResponse) return auth;

  try {
    const telegramId = request.headers.get('x-telegram-id');
    const authHeader = request.headers.get('authorization');
    const headers: Record<string, string> = {};
    if (telegramId) headers['x-telegram-id'] = telegramId;
    if (authHeader) headers['authorization'] = authHeader;

    const { title, content, excerpt, image, category, author, published } = await request.json();

    const post = await api.create<any>('blog-posts', {
      title,
      content,
      excerpt,
      image,
      category: category || 'Новости',
      author: author || null,
      published: published ?? false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }, headers);
    return NextResponse.json(post);
  } catch (error) {
    console.error('[BlogPOST] Error:', error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const auth = requireAuth(request, ['ADMIN', 'MANAGER']);
  if (auth instanceof NextResponse) return auth;

  try {
    const telegramId = request.headers.get('x-telegram-id');
    const authHeader = request.headers.get('authorization');
    const headers: Record<string, string> = {};
    if (telegramId) headers['x-telegram-id'] = telegramId;
    if (authHeader) headers['authorization'] = authHeader;

    // Пробуем получить ID из URL path или query параметра
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const idFromPath = pathParts[pathParts.length - 1];
    const idFromQuery = url.searchParams.get('id');
    
    const id = idFromPath !== 'blog' ? idFromPath : idFromQuery;
    
    if (!id || id === 'blog') {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    const { title, content, excerpt, image, category, author, published } = await request.json();

    const post = await api.update<any>('blog-posts', id, {
      id, // Передаём ID явно для Go API
      title,
      content,
      excerpt,
      image,
      category,
      author,
      published,
      updatedAt: new Date().toISOString()
    }, headers);
    return NextResponse.json(post);
  } catch (error) {
    console.error('[BlogPUT] Error:', error);
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const auth = requireAuth(request, ['ADMIN', 'MANAGER']);
  if (auth instanceof NextResponse) return auth;

  try {
    const telegramId = request.headers.get('x-telegram-id');
    const authHeader = request.headers.get('authorization');
    const headers: Record<string, string> = {};
    if (telegramId) headers['x-telegram-id'] = telegramId;
    if (authHeader) headers['authorization'] = authHeader;

    const { id, title, content, excerpt, image, category, author, published } = await request.json();
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    const post = await api.patch<any>('blog-posts', id, {
      title,
      content,
      excerpt,
      image,
      category,
      author,
      published,
      updatedAt: new Date().toISOString()
    }, headers);
    return NextResponse.json(post);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const auth = requireAuth(request, ['ADMIN', 'MANAGER']);
  if (auth instanceof NextResponse) return auth;

  try {
    const telegramIdHeader = request.headers.get('x-telegram-id');
    const authHeader = request.headers.get('authorization');
    const headers: Record<string, string> = {};
    if (telegramIdHeader) headers['x-telegram-id'] = telegramIdHeader;
    if (authHeader) headers['authorization'] = authHeader;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    await api.delete('blog-posts', id, headers);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
  }
}
