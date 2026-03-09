import { NextRequest, NextResponse } from 'next/server';
import { api } from '@/services/api';

interface BlogPost {
    id: string;
    title: string;
    content: string;
    excerpt: string | null;
    image: string | null;
    category: string;
    author: string | null;
    published: boolean;
    createdAt: string;
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (id) {
            const post = await api.get<BlogPost>('blog-posts', id);
            if (!post || (!post.published && !searchParams.get('admin'))) {
                return NextResponse.json({ error: 'Post not found' }, { status: 404 });
            }
            return NextResponse.json(post);
        }

        const posts = await api.list<BlogPost>('blog-posts');
        // Фильтруем опубликованные, если не админ-запрос
        const isAdmin = searchParams.get('admin') === 'true';
        const filteredPosts = posts
            .filter(post => isAdmin || post.published)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        return NextResponse.json(filteredPosts);
    } catch (error) {
        console.error('Failed to fetch blog posts:', error);
        return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
    }
}
