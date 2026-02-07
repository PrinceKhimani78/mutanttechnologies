'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Loader2, Globe, Share2, Twitter, Search } from 'lucide-react';
import Link from 'next/link';

function SEOEditContent() {
    const searchParams = useSearchParams();
    const id = searchParams.get('id');
    const router = useRouter();
    const [loading, setLoading] = useState(id ? true : false);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState<any>(id ? null : {
        page_slug: '',
        title: '',
        description: '',
        canonical_url: '',
        og_title: '',
        og_description: '',
        og_image: '',
        twitter_card: 'summary_large_image',
        twitter_image: '',
        robots: 'index, follow'
    });

    useEffect(() => {
        if (id) {
            fetchMetadata();
        }
    }, [id]);

    const fetchMetadata = async () => {
        const { data, error } = await supabase
            .from('page_metadata')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error fetching metadata:', error);
            router.push('/admin/seo');
        } else {
            setFormData(data);
        }
        setLoading(false);
    };

    const handleChange = (key: string, value: any) => {
        setFormData((prev: any) => ({ ...prev, [key]: value }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.page_slug) {
            alert('Page Slug is required');
            return;
        }
        setSaving(true);

        try {
            if (id) {
                const { error } = await supabase
                    .from('page_metadata')
                    .update(formData)
                    .eq('id', id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('page_metadata')
                    .insert([formData]);
                if (error) throw error;
            }
            router.push('/admin/seo');
            router.refresh();
        } catch (error) {
            console.error('Error saving metadata:', error);
            alert('Failed to save metadata');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 text-foreground pb-20">
            <header className="bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 sticky top-0 z-10">
                <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/seo" className="text-gray-500 hover:text-primary transition-colors">
                            <ArrowLeft className="w-6 h-6" />
                        </Link>
                        <h1 className="font-oswald text-2xl font-bold uppercase">Edit SEO: {formData?.page_slug}</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button onClick={handleSave} disabled={saving}>
                            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                            Save Metadata
                        </Button>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-6 py-12 max-w-4xl">
                <form onSubmit={handleSave} className="space-y-8">
                    {/* Basic SEO */}
                    <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm space-y-6">
                        <h2 className="text-lg font-bold flex items-center gap-2 border-b pb-4 mb-4">
                            <Search className="w-5 h-5 text-primary" /> Basic Search Meta
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Page Slug (e.g. /about or /services/web-design)</label>
                                <input
                                    className="w-full p-3 bg-gray-50 dark:bg-zinc-950 border rounded-xl font-mono text-sm"
                                    value={formData.page_slug || ''}
                                    onChange={(e) => handleChange('page_slug', e.target.value)}
                                    placeholder="/your-page-path"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Meta Title</label>
                                <input
                                    className="w-full p-3 bg-gray-50 dark:bg-zinc-950 border rounded-xl"
                                    value={formData.title || ''}
                                    onChange={(e) => handleChange('title', e.target.value)}
                                    placeholder="Enter page title..."
                                />
                                <p className="text-[10px] text-gray-400 mt-1">Recommended: 50-60 characters</p>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Meta Description</label>
                                <textarea
                                    className="w-full p-3 bg-gray-50 dark:bg-zinc-950 border rounded-xl"
                                    rows={3}
                                    value={formData.description || ''}
                                    onChange={(e) => handleChange('description', e.target.value)}
                                    placeholder="Enter meta description..."
                                />
                                <p className="text-[10px] text-gray-400 mt-1">Recommended: 150-160 characters</p>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Canonical URL</label>
                                <input
                                    className="w-full p-3 bg-gray-50 dark:bg-zinc-950 border rounded-xl"
                                    value={formData.canonical_url || ''}
                                    onChange={(e) => handleChange('canonical_url', e.target.value)}
                                    placeholder="https://mutanttechnologies.com/..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Social / OpenGraph */}
                    <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm space-y-6">
                        <h2 className="text-lg font-bold flex items-center gap-2 border-b pb-4 mb-4">
                            <Share2 className="w-5 h-5 text-blue-500" /> Facebook / OpenGraph
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">OG Title</label>
                                <input
                                    className="w-full p-3 bg-gray-50 dark:bg-zinc-950 border rounded-xl"
                                    value={formData.og_title || ''}
                                    onChange={(e) => handleChange('og_title', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">OG Description</label>
                                <textarea
                                    className="w-full p-3 bg-gray-50 dark:bg-zinc-950 border rounded-xl"
                                    rows={2}
                                    value={formData.og_description || ''}
                                    onChange={(e) => handleChange('og_description', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">OG Image URL</label>
                                <input
                                    className="w-full p-3 bg-gray-50 dark:bg-zinc-950 border rounded-xl"
                                    value={formData.og_image || ''}
                                    onChange={(e) => handleChange('og_image', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Twitter */}
                    <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm space-y-6">
                        <h2 className="text-lg font-bold flex items-center gap-2 border-b pb-4 mb-4">
                            <Twitter className="w-5 h-5 text-sky-500" /> Twitter Card
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Twitter Card Type</label>
                                <select
                                    className="w-full p-3 bg-gray-50 dark:bg-zinc-950 border rounded-xl"
                                    value={formData.twitter_card || 'summary_large_image'}
                                    onChange={(e) => handleChange('twitter_card', e.target.value)}
                                >
                                    <option value="summary">Summary</option>
                                    <option value="summary_large_image">Summary Large Image</option>
                                    <option value="app">App</option>
                                    <option value="player">Player</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Twitter Image URL</label>
                                <input
                                    className="w-full p-3 bg-gray-50 dark:bg-zinc-950 border rounded-xl"
                                    value={formData.twitter_image || ''}
                                    onChange={(e) => handleChange('twitter_image', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Advanced */}
                    <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm space-y-6">
                        <h2 className="text-md font-bold text-gray-400 uppercase tracking-widest border-b pb-4 mb-4">Advanced</h2>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Robots Tag</label>
                            <input
                                className="w-full p-3 bg-gray-50 dark:bg-zinc-950 border rounded-xl"
                                value={formData.robots || 'index, follow'}
                                onChange={(e) => handleChange('robots', e.target.value)}
                            />
                        </div>
                    </div>
                </form>
            </main>
        </div>
    );
}

export default function SEOEditPage() {
    return (
        <Suspense fallback={<div>Loading editor...</div>}>
            <SEOEditContent />
        </Suspense>
    );
}
