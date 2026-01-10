'use client';

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import Link from 'next/link';
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { Post } from "@/lib/types";
import { Loader2 } from "lucide-react";

export default function Blog() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            const { data, error } = await supabase
                .from('posts')
                .select('*')
                .eq('is_published', true)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching public posts:', error);
            } else {
                setPosts(data || []);
            }
            setLoading(false);
        };
        fetchPosts();
    }, []);

    return (
        <main className="bg-background min-h-screen text-foreground transition-colors duration-300">
            <Navbar />
            <div className="pt-40 pb-20 px-6 w-full max-w-[2400px] mx-auto">
                {/* Header Section */}
                <div className="text-center mb-24">
                    <h1 className="text-6xl md:text-8xl font-oswald font-bold uppercase mb-6 tracking-tight text-foreground">
                        Our <span className="font-serif italic text-primary font-light">Blogs</span>
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-zinc-400 max-w-2xl mx-auto font-light">
                        Insights and updates from the world of digital innovation.
                    </p>
                </div>

                {/* Blog Grid */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-10 h-10 text-primary animate-spin" />
                    </div>
                ) : posts.length === 0 ? (
                    <div className="text-center py-20 text-gray-500">
                        No articles published yet. Check back soon!
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-x-8 gap-y-16 mx-auto">
                        {posts.map((post) => (
                            <Link href={`/blog/${post.slug}`} key={post.id} className="group cursor-pointer block">
                                {/* Image Container */}
                                <div className="aspect-[4/3] bg-gray-100 dark:bg-zinc-900 rounded-2xl overflow-hidden mb-6 relative border border-gray-200 dark:border-zinc-800">
                                    <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 mix-blend-overlay"></div>
                                    {post.cover_image ? (
                                        <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                    ) : (
                                        <div className="w-full h-full bg-gray-200 dark:bg-zinc-800 flex items-center justify-center text-gray-400 dark:text-zinc-700 font-mono text-xs">
                                            [No Image]
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 text-sm font-medium">
                                        <span className="text-primary uppercase tracking-wider text-xs">{post.category || 'General'}</span>
                                        <span className="w-1 h-1 bg-gray-300 dark:bg-zinc-700 rounded-full"></span>
                                        <span className="text-gray-500 dark:text-zinc-500">{new Date(post.created_at).toLocaleDateString()}</span>
                                    </div>

                                    <h3 className="text-2xl md:text-3xl font-oswald font-bold leading-tight text-foreground group-hover:text-primary transition-colors">
                                        {post.title}
                                    </h3>

                                    <p className="text-gray-600 dark:text-zinc-400 leading-relaxed text-sm md:text-base line-clamp-3">
                                        {post.excerpt}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
            <Footer />
        </main>
    );
}
