'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, Search, Loader2, Globe } from 'lucide-react';
import Link from 'next/link';

interface PageMetadata {
    id: string;
    page_slug: string;
    title: string;
    description: string;
    updated_at: string;
}

export default function SEOList() {
    const [metadata, setMetadata] = useState<PageMetadata[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchMetadata();
    }, []);

    const fetchMetadata = async () => {
        const { data, error } = await supabase
            .from('page_metadata')
            .select('id, page_slug, title, description, updated_at')
            .order('page_slug');

        if (error) {
            console.error('Error fetching SEO metadata:', error);
        } else {
            setMetadata(data || []);
        }
        setLoading(false);
    };

    const filteredMetadata = metadata.filter(m =>
        m.page_slug.toLowerCase().includes(search.toLowerCase()) ||
        (m.title && m.title.toLowerCase().includes(search.toLowerCase()))
    );

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 text-foreground">
            <header className="bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 sticky top-0 z-10">
                <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/dashboard" className="text-gray-500 hover:text-primary transition-colors">
                            <ArrowLeft className="w-6 h-6" />
                        </Link>
                        <h1 className="font-oswald text-2xl font-bold uppercase">SEO Manager</h1>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-6 py-12 max-w-5xl">
                <div className="mb-8 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search by page slug or title..."
                        className="w-full pl-12 pr-4 py-3 bg-white dark:bg-zinc-900 border rounded-xl"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="grid gap-4">
                    {filteredMetadata.map((item) => (
                        <div key={item.id} className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-gray-200 dark:border-zinc-800 flex items-center justify-between group hover:border-primary/30 transition-colors">
                            <div className="flex-1 pr-4">
                                <div className="flex items-center gap-2 mb-1">
                                    <Globe className="w-4 h-4 text-primary" />
                                    <h3 className="font-bold text-lg">{item.page_slug}</h3>
                                </div>
                                <p className="text-sm text-gray-500 mb-2 truncate max-w-2xl">{item.title || 'No Title Set'}</p>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                    Last Updated: {new Date(item.updated_at).toLocaleDateString()}
                                </p>
                            </div>
                            <Button href={`/admin/seo/edit?id=${item.id}`} variant="outline" size="sm">
                                <Edit className="w-4 h-4 mr-2" /> Edit SEO
                            </Button>
                        </div>
                    ))}

                    {filteredMetadata.length === 0 && (
                        <div className="text-center py-20 text-gray-500">
                            No SEO metadata found.
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
