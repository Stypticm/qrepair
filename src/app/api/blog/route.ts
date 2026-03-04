import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/core/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (id) {
            const post = await prisma.blogPost.findUnique({
                where: { id }
            });
            if (!post || (!post.published && !searchParams.get('admin'))) {
                return NextResponse.json({ error: 'Post not found' }, { status: 404 });
            }
            return NextResponse.json(post);
        }

        const posts = await prisma.blogPost.findMany({
            where: { published: true },
            orderBy: { createdAt: 'desc' }
        });
        
        return NextResponse.json(posts);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
    }
}
