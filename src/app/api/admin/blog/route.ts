import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/core/lib/requireAuth';
import prisma from '@/core/lib/prisma';

export async function GET(request: NextRequest) {
  // Public: returns only published posts. With auth: returns all.
  const auth = requireAuth(request, ['ADMIN', 'MANAGER']);
  const isAdmin = !(auth instanceof NextResponse);

  try {
    const posts = await prisma.blogPost.findMany({
      where: isAdmin ? {} : { published: true },
      orderBy: { createdAt: 'desc' }
    });
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

    const post = await prisma.blogPost.create({
      data: { title, content, excerpt, image, category: category || 'Новости', author: author || null, published: published ?? false }
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

    const post = await prisma.blogPost.update({
      where: { id },
      data: { title, content, excerpt, image, category, author, published }
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

    await prisma.blogPost.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
  }
}
