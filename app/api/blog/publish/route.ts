import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { marked } from 'marked';

function getAdminSupabase() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    return createClient(supabaseUrl, serviceRoleKey);
}

function verifyAuth(request: Request): boolean {
    const secretKey = process.env.MUTANT_BLOG_API_KEY || process.env.BLOG_API_KEY;
    if (!secretKey) return true;

    const { searchParams } = new URL(request.url);
    const queryKey = searchParams.get('key') || searchParams.get('token') || searchParams.get('api_key');
    if (queryKey === secretKey) return true;

    const authHeader = request.headers.get('Authorization') || request.headers.get('authorization') || '';
    if (authHeader.startsWith('Bearer ') && authHeader.slice(7).trim() === secretKey) return true;

    const xApiKey = request.headers.get('x-api-key') || '';
    if (xApiKey === secretKey) return true;

    return false;
}

function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

function generateExcerpt(content: string, length = 160): string {
    const plain = content
        .replace(/<[^>]*>/g, '')
        .replace(/[#*`_~\[\]]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    if (plain.length <= length) return plain;
    return plain.slice(0, length).trim() + '...';
}

export async function POST(request: Request) {
    if (!verifyAuth(request)) {
        return NextResponse.json({ success: false, error: 'Unauthorized: Invalid or missing API key' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { title, content, slug, excerpt, category, cover_image, is_published } = body;

        if (!title || !content) {
            return NextResponse.json({ success: false, error: 'Both title and content are required' }, { status: 400 });
        }

        // Parse markdown to HTML if needed
        const hasHtml = /<[a-z][\s\S]*>/i.test(content);
        const htmlContent = hasHtml ? content : await marked.parse(content);

        let postSlug = slugify(slug || title);
        if (!postSlug) postSlug = `post-${Date.now()}`;

        const postExcerpt = excerpt || generateExcerpt(content);
        const defaultCover = 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop';
        const finalCover = cover_image || defaultCover;

        const supabase = getAdminSupabase();

        // Check for slug collision
        const { data: existing } = await supabase
            .from('posts')
            .select('id, slug')
            .eq('slug', postSlug)
            .maybeSingle();

        if (existing) {
            postSlug = `${postSlug}-${Date.now().toString().slice(-4)}`;
        }

        const postData = {
            title: title.trim(),
            slug: postSlug,
            excerpt: postExcerpt,
            content: htmlContent,
            category: (category || 'Technology').trim(),
            cover_image: finalCover,
            is_published: is_published !== false,
            author_id: 'a0dbf7e8-d53e-495b-b4a6-8a73b41fa819',
            updated_at: new Date().toISOString()
        };

        const { data: inserted, error: insertError } = await supabase
            .from('posts')
            .insert([postData])
            .select()
            .single();

        if (insertError) {
            return NextResponse.json({ success: false, error: insertError.message }, { status: 500 });
        }

        try {
            revalidatePath('/blog');
            revalidatePath(`/blog/${postSlug}`);
        } catch (e) {}

        return NextResponse.json({
            success: true,
            post: inserted,
            url: `https://www.mutanttechnologies.com/blog/${postSlug}`
        });

    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message || 'Internal server error' }, { status: 500 });
    }
}

export async function GET(request: Request) {
    if (!verifyAuth(request)) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getAdminSupabase();
    const { data: posts, error } = await supabase
        .from('posts')
        .select('id, title, slug, category, is_published, created_at')
        .order('created_at', { ascending: false })
        .limit(20);

    if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, posts });
}
