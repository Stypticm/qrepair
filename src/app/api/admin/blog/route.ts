import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/core/lib/requireAuth';
import { api } from '@/services/api';

export async function GET(request: NextRequest) {
  // Public: returns only published posts. With auth: returns all.
  const auth = requireAuth(request, ['ADMIN', 'MANAGER']);
  const isAdmin = !(auth instanceof NextResponse);

  try {
    const posts = await api.list<any>('blog-posts', isAdmin ? {} : { published: 'true' });
    return NextResponse.json(posts);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = requireAuth(request, ['ADMIN', 'MANAGER']);
  if (auth instanceof NextResponse) return auth;

  try {
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
    });
    return NextResponse.json(post);
  } catch (error) {
    console.error('[BlogPOST] Error:', error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const auth = requireAuth(request, ['ADMIN', 'MANAGER']);
  if (auth instanceof NextResponse) return auth;

  try {
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
    });
    return NextResponse.json(post);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const auth = requireAuth(request, ['ADMIN', 'MANAGER']);
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    await api.delete('blog-posts', id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
  }
}
