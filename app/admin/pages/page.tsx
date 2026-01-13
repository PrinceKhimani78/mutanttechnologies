'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, Loader2 } from 'lucide-react';
import Link from 'next/link';

// Helper to get readable names for slugs
const PAGE_NAMES: Record<string, string> = {
    'home': 'Home Page',
    'about': 'About Us',
    'contact': 'Contact Page',
    'services': 'Services Page'
};

export default function AdminPagesList() {
    const [pages, setPages] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetchPages();
    }, []);

    const fetchPages = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            router.push('/admin');
            return;
        }

        // Get distinct page slugs
        const { data, error } = await supabase
            .from('page_sections')
            .select('page_slug');

        if (error) {
            console.error('Error fetching pages:', error);
        } else {
            // Unify duplicates
            const slugs = Array.from(new Set(data?.map(item => item.page_slug) || []));
            setPages(slugs);
        }
        setLoading(false);
    };


    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 text-foreground">
            {/* Header */}
            <header className="bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 sticky top-0 z-10">
                <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/dashboard" className="text-gray-500 hover:text-primary transition-colors">
                            <ArrowLeft className="w-6 h-6" />
                        </Link>
                        <h1 className="font-oswald text-2xl font-bold uppercase">Page Content</h1>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="container mx-auto px-6 py-12 max-w-4xl">
                <div className="grid gap-4">
                    {pages.map((slug) => (
                        <div key={slug} className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-gray-200 dark:border-zinc-800 flex items-center justify-between group hover:border-primary/30 transition-colors">
                            <div>
                                <h3 className="text-xl font-bold">{PAGE_NAMES[slug] || slug}</h3>
                                <p className="text-sm text-gray-500 font-mono">/{slug === 'home' ? '' : slug}</p>
                            </div>
                            <Button href={`/admin/pages/edit?slug=${slug}`} variant="outline">
                                <Edit className="w-4 h-4 mr-2" /> Edit Content
                            </Button>
                        </div>
                    ))}

                    {pages.length === 0 && (
                        <div className="text-center py-10 text-gray-500">
                            No editable pages found. Run the seed script to add initial content.
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
