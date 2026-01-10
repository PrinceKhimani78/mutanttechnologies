import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import { Loader2 } from "lucide-react";
import Link from 'next/link';
import { ArrowLeft } from "lucide-react";


export const dynamicParams = false;



export async function generateStaticParams() {
    try {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        console.log("Debug - Supabase URL:", url ? `${url.substring(0, 10)}...` : "UNDEFINED");
        console.log("Debug - Supabase Key present:", !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

        const { data: posts, error } = await supabase.from('posts').select('slug');


        if (error) {
            console.error("Supabase Error in generateStaticParams:", JSON.stringify(error, null, 2));
        }

        if (!posts || posts.length === 0) {
            console.warn("No posts found or DB error. Generating fallback 'welcome' page.");
            return [{ slug: 'welcome' }];
        }

        console.log(`Successfully generated params for ${posts.length} posts.`);
        return posts.map((post) => ({
            slug: post.slug,
        }));
    } catch (error) {
        console.error("Unexpected error in generateStaticParams:", error);
        return [{ slug: 'welcome' }];
    }
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    const { data: post, error } = await supabase
        .from('posts')
        .select('*')
        .eq('slug', slug)
        .single();

    if (error || !post) {
        if (!post) {
            return (
                <main className="min-h-screen bg-background flex flex-col items-center justify-center text-center px-4">
                    <h1 className="text-4xl font-oswald font-bold mb-4">Post Not Found</h1>
                    <p className="text-gray-500 mb-8">The article you are looking for does not exist.</p>
                    <Link href="/blog" className="px-6 py-3 bg-primary text-white rounded-full font-bold uppercase tracking-wider text-sm hover:bg-orange-600 transition-colors">
                        Back to Blog
                    </Link>
                </main>
            );
        }
    }

    return (
        <main className="bg-background min-h-screen text-foreground transition-colors duration-300">
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
                        <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover" />
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
            </div>

            <Footer />
        </main>
    );
}
