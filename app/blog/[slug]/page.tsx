import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Newsletter } from "@/components/Newsletter";
import { LikeButton } from "@/components/blog/LikeButton";
import { CommentSection } from "@/components/blog/CommentSection";

import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from "lucide-react";
import { Post } from "@/lib/types";
import { notFound } from 'next/navigation';
import { Metadata } from "next";

// Helper for safe client creation during build
async function getSupabase() {
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.warn('Missing Supabase credentials. Returning null client.');
        return null;
    }
    return createClient(supabaseUrl, supabaseKey);
}

/**
 * Generates static paths for all published blog posts at build time.
 * This ensures high performance and SEO for the blog.
 */
export async function generateStaticParams() {
    try {
        const supabase = await getSupabase();
        if (supabase) {
            const { data: posts } = await supabase
                .from('posts')
                .select('slug')
                .eq('is_published', true);

            if (posts && posts.length > 0) {
                return posts.map((post) => ({
                    slug: post.slug,
                }));
            }
        }
    } catch (error) {
        console.error("Error generating static params:", error);
    }

    return [];
}

/**
 * Generates dynamic SEO metadata for each blog post.
 * Fetches the post title, excerpt, and cover image.
 */
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const supabase = await getSupabase();

    if (!supabase) return { title: 'Post Not Found' };

    const { data: post } = await supabase
        .from('posts')
        .select('*')
        .eq('slug', slug)
        .single();

    if (!post) {
        return {
            title: 'Post Not Found',
        };
    }

    return {
        title: `${post.title} | Mutant Technologies`,
        description: post.excerpt || `Read ${post.title} on Mutant Technologies blog.`,
        openGraph: {
            title: post.title,
            description: post.excerpt,
            type: 'article',
            publishedTime: post.created_at,
            authors: ['Mutant Technologies'],
            images: post.cover_image ? [post.cover_image] : [],
        },
    };
}

/**
 * BlogPost Page Component (Server Component)
 * 
 * Renders a single blog post with full SEO schema (Article, Breadcrumbs).
 * Uses 'generateStaticParams' to pre-render pages during build (SSG).
 */
export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const supabase = await getSupabase();

    if (!supabase) {
        notFound();
    }

    const { data: post } = await supabase
        .from('posts')
        .select('*')
        .eq('slug', slug)
        .single();

    if (!post) {
        notFound();
    }

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: post.title,
        description: post.excerpt,
        image: post.cover_image,
        datePublished: post.created_at,
        dateModified: post.updated_at || post.created_at,
        author: {
            '@type': 'Organization',
            name: 'Mutant Technologies',
        },
        publisher: {
            '@type': 'Organization',
            name: 'Mutant Technologies',
            logo: {
                '@type': 'ImageObject',
                url: 'https://www.mutanttechnologies.com/logo.png',
            },
        },
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `https://www.mutanttechnologies.com/blog/${post.slug}`,
        },
    };

    const breadcrumbLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: 'https://www.mutanttechnologies.com',
            },
            {
                '@type': 'ListItem',
                position: 2,
                name: 'Blog',
                item: 'https://www.mutanttechnologies.com/blog',
            },
            {
                '@type': 'ListItem',
                position: 3,
                name: post.title,
                item: `https://www.mutanttechnologies.com/blog/${post.slug}`,
            },
        ],
    };

    return (
        <main className="bg-background min-h-screen text-foreground transition-colors duration-300">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
            />
            <Navbar />

            {/* Hero / Header */}
            <div className="pt-32 pb-16 px-6 w-full max-w-4xl mx-auto">
                <Link href="/blog" className="inline-flex items-center gap-2 text-gray-500 hover:text-primary transition-colors mb-8 text-sm font-mono uppercase tracking-widest">
                    <ArrowLeft className="w-4 h-4" /> Back to Blog
                </Link>

                <div className="flex items-center gap-4 mb-6">
                    <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider rounded-full border border-primary/20">
                        {post.category || 'General'}
                    </span>
                    <span className="text-gray-400 text-sm font-mono">
                        {new Date(post.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                </div>

                <h1 className="text-4xl md:text-6xl font-oswald font-bold uppercase leading-tight mb-8">
                    {post.title}
                </h1>

                {post.excerpt && (
                    <p className="text-xl md:text-2xl font-light text-gray-400 leading-relaxed border-l-4 border-primary pl-6 mb-12 italic">
                        {post.excerpt}
                    </p>
                )}

                {post.cover_image && (
                    <div className="rounded-2xl overflow-hidden mb-12 border border-gray-200 dark:border-zinc-800 shadow-2xl relative aspect-video">
                        <Image
                            src={post.cover_image}
                            alt={post.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
                            priority
                        />
                    </div>
                )}

                {/* Content Body */}
                <article
                    className="prose prose-lg dark:prose-invert max-w-none 
                    prose-headings:font-oswald prose-headings:uppercase prose-headings:font-bold
                    prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                    prose-img:rounded-xl prose-img:shadow-lg
                    prose-blockquote:border-l-primary prose-blockquote:bg-gray-50 dark:prose-blockquote:bg-zinc-900 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:not-italic prose-blockquote:rounded-r-lg"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                />

                <div className="mt-12 flex items-center justify-between border-t border-gray-200 dark:border-zinc-800 pt-8">
                    <p className="font-oswald uppercase text-gray-500 tracking-wider text-sm">Did you enjoy this article?</p>
                    <LikeButton slug={post.slug} />
                </div>

                <div className="mt-8">
                    <Newsletter />
                </div>

                <CommentSection slug={post.slug} />
            </div>

            <Footer />
        </main>
    );
}
