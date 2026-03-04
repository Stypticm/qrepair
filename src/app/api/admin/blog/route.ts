import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/core/lib/prisma';
import { checkRole } from '@/core/lib/auth';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const adminTelegramId = searchParams.get('adminId');

        let where: any = { published: true };
        
        if (adminTelegramId) {
            const hasAccess = await checkRole(adminTelegramId, ['ADMIN', 'MANAGER']);
            if (hasAccess) {
                where = {}; // Admin sees everything
            }
        }

        const posts = await prisma.blogPost.findMany({
            where,
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(posts);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { title, content, excerpt, image, category, author, published, adminTelegramId } = body;

        const hasAccess = await checkRole(adminTelegramId, ['ADMIN', 'MANAGER']);
        if (!hasAccess) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const post = await prisma.blogPost.create({
            data: {
                title,
                content,
                excerpt,
                image,
                category: category || 'Новости',
                author: author || null,
                published: published ?? false
            }
        });

        return NextResponse.json(post);
    } catch (error) {
        console.error('[BlogPOST] Error:', error);
        return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, title, content, excerpt, image, category, author, published, adminTelegramId } = body;

        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        const hasAccess = await checkRole(adminTelegramId, ['ADMIN', 'MANAGER']);
        if (!hasAccess) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const post = await prisma.blogPost.update({
            where: { id },
            data: {
                title,
                content,
                excerpt,
                image,
                category,
                author,
                published
            }
        });

        return NextResponse.json(post);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const adminTelegramId = searchParams.get('adminId');

        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        const hasAccess = await checkRole(adminTelegramId, ['ADMIN', 'MANAGER']);
        if (!hasAccess) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        await prisma.blogPost.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
    }
}
