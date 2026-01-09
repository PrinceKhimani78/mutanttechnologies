'use client';

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import Link from 'next/link';

import { blogs } from "@/lib/data";

export default function Blog() {
    return (
        <main className="bg-black min-h-screen text-white">
            <Navbar />
            <div className="pt-40 pb-20 px-6 container mx-auto">
                {/* Header Section */}
                <div className="text-center mb-24">
                    <h1 className="text-6xl md:text-8xl font-oswald font-bold uppercase mb-6 tracking-tight">
                        Our <span className="font-serif italic text-blue-500 font-light lowercase">blogs</span>
                    </h1>
                    <p className="text-xl text-zinc-400 max-w-2xl mx-auto font-light">
                        Insights and updates from the world of digital innovation.
                    </p>
                </div>

                {/* Blog Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16 max-w-7xl mx-auto">
                    {blogs.map((blog, idx) => (
                        <Link href={`/blog/${blog.slug}`} key={idx} className="group cursor-pointer block">
                            {/* Image Container */}
                            <div className="aspect-[4/3] bg-zinc-900 rounded-2xl overflow-hidden mb-6 relative">
                                <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 mix-blend-overlay"></div>
                                {/* Placeholder for actual blog image */}
                                <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-zinc-700 font-mono text-xs">
                                    [Blog Image: {blog.title}]
                                </div>
                            </div>

                            {/* Content */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-sm font-medium">
                                    <span className="text-blue-500 uppercase tracking-wider text-xs">{blog.category}</span>
                                    <span className="w-1 h-1 bg-zinc-700 rounded-full"></span>
                                    <span className="text-zinc-500">{blog.date}</span>
                                </div>

                                <h3 className="text-2xl md:text-3xl font-oswald font-bold leading-tight group-hover:text-blue-500 transition-colors">
                                    {blog.title}
                                </h3>

                                <p className="text-zinc-400 leading-relaxed text-sm md:text-base line-clamp-3">
                                    {blog.excerpt}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
            <Footer />
        </main>
    );
}
