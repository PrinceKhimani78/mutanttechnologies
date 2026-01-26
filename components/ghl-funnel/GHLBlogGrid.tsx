'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from "@/lib/supabase";
import { Post } from "@/lib/types";
import { ArrowUpRight } from 'lucide-react';

export default function GHLBlogGrid() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchGHLPosts() {
            // Fetch posts that might be relevant to GHL, Automation, or Agency
            // Using 'ilike' for partial match on categories or titles if tags aren't clear
            const { data, error } = await supabase
                .from('posts')
                .select('*')
                .eq('is_published', true)
                // We filter for categories that contain 'automation', 'ghl', 'agency', 'tech'
                // Since Supabase simple filters are limited, we'll fetch recent and filter in JS if needed
                // or rely on a specific category if it exists.
                // For now, let's fetch all and filter client side to ensure 'relevance'
                .order('created_at', { ascending: false })
                .limit(10);

            if (data) {
                // Simple client-side filter to find relevant keywords in category, title or excerpt
                // This simulates a "smart" feed for GHL content
                const relevantPosts = data.filter(post => {
                    const searchStr = `${post.title} ${post.description} ${post.category || ''}`.toLowerCase();
                    return searchStr.includes('automation') ||
                        searchStr.includes('ghl') ||
                        searchStr.includes('crm') ||
                        searchStr.includes('agency') ||
                        searchStr.includes('system');
                });
                setPosts(relevantPosts.slice(0, 3)); // Show top 3
            }
            setLoading(false);
        }

        fetchGHLPosts();
    }, []);

    if (loading || posts.length === 0) return null;

    return (
        <section className="py-24 px-4 bg-zinc-950/50">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <h2 className="text-3xl font-bold mb-2">Automation Insights</h2>
                        <p className="text-gray-400">Latest strategies for scaling your agency.</p>
                    </div>
                    <Link href="/blog" className="text-[#704df4] hover:text-white flex items-center gap-1 transition-colors">
                        View all articles <ArrowUpRight size={16} />
                    </Link>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {posts.map((post) => (
                        <Link key={post.id} href={`/blog/${post.slug}`} className="group block bg-black border border-white/10 rounded-2xl overflow-hidden hover:border-[#704df4]/50 transition-all duration-300 hover:-translate-y-1">
                            <div className="aspect-video relative overflow-hidden">
                                {post.cover_image ? (
                                    <Image
                                        src={post.cover_image}
                                        alt={post.title}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-zinc-900 flex items-center justify-center text-zinc-700">No Image</div>
                                )}
                                <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium border border-white/10 text-white">
                                    {post.category || 'Insight'}
                                </div>
                            </div>
                            <div className="p-6">
                                <h3 className="text-xl font-bold mb-3 group-hover:text-[#a38cff] transition-colors line-clamp-2">
                                    {post.title}
                                </h3>
                                <p className="text-gray-500 text-sm line-clamp-3 mb-4">
                                    {post.excerpt || post.description}
                                </p>
                                <div className="text-[#704df4] text-sm font-medium flex items-center gap-2">
                                    Read Article <ArrowUpRight size={14} />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
