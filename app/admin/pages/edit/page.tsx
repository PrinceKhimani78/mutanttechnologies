'use client';

import { useState, useEffect, Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface PageSection {
    id: string;
    section_key: string;
    content: Record<string, any>; // Changed from string to any to support arrays
}

function EditContent() {
    const searchParams = useSearchParams();
    const slug = searchParams.get('slug');
    const router = useRouter();

    const [sections, setSections] = useState<PageSection[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (slug) fetchSections(slug);
    }, [slug]);

    const fetchSections = async (pageSlug: string) => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            router.push('/admin');
            return;
        }

        const { data, error } = await supabase
            .from('page_sections')
            .select('*')
            .eq('page_slug', pageSlug)
            .order('section_key'); // Consistent ordering

        if (error) {
            console.error('Error fetching page sections:', error);
        } else {
            setSections(data || []);
        }
        setLoading(false);
    };

    const handleContentChange = (sectionId: string, fieldKey: string, newValue: any) => {
        setSections(sections.map(section => {
            if (section.id === sectionId) {
                return {
                    ...section,
                    content: {
                        ...section.content,
                        [fieldKey]: newValue
                    }
                };
            }
            return section;
        }));
    };

    // Helper to update specific item in an array
    const handleArrayItemChange = (sectionId: string, arrayKey: string, index: number, itemKey: string, newValue: string) => {
        setSections(sections.map(section => {
            if (section.id === sectionId) {
                const currentArray = [...(section.content[arrayKey] as any[])];
                currentArray[index] = { ...currentArray[index], [itemKey]: newValue };
                return {
                    ...section,
                    content: {
                        ...section.content,
                        [arrayKey]: currentArray
                    }
                };
            }
            return section;
        }));
    };

    const addItemToArray = (sectionId: string, arrayKey: string) => {
        setSections(sections.map(section => {
            if (section.id === sectionId) {
                const currentArray = [...(section.content[arrayKey] as any[])];
                // Clone structure of first item or empty object
                const template = currentArray.length > 0 ? Object.keys(currentArray[0]).reduce((acc, key) => ({ ...acc, [key]: '' }), {}) : { title: '', desc: '' };

                return {
                    ...section,
                    content: {
                        ...section.content,
                        [arrayKey]: [...currentArray, template]
                    }
                };
            }
            return section;
        }));
    };

    const removeItemFromArray = (sectionId: string, arrayKey: string, index: number) => {
        if (!confirm('Remove this item?')) return;
        setSections(sections.map(section => {
            if (section.id === sectionId) {
                const currentArray = [...(section.content[arrayKey] as any[])];
                currentArray.splice(index, 1);
                return {
                    ...section,
                    content: {
                        ...section.content,
                        [arrayKey]: currentArray
                    }
                };
            }
            return section;
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        const updates = sections.map(section =>
            supabase
                .from('page_sections')
                .update({ content: section.content })
                .eq('id', section.id)
        );

        await Promise.all(updates);
        setSaving(false);
        alert('Page updated successfully!');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!slug) return <div className="p-10">Invalid page.</div>;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 text-foreground">
            <header className="bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 sticky top-0 z-10">
                <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/pages" className="text-gray-500 hover:text-primary transition-colors">
                            <ArrowLeft className="w-6 h-6" />
                        </Link>
                        <h1 className="font-oswald text-2xl font-bold uppercase">Editing: {slug}</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button onClick={handleSave} disabled={saving}>
                            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                            Save Changes
                        </Button>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-6 py-12 max-w-4xl">
                <div className="space-y-8">
                    {sections.map((section) => (
                        <div key={section.id} className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm">
                            <h2 className="text-lg font-bold uppercase tracking-wider mb-6 text-primary border-b border-gray-100 dark:border-zinc-800 pb-2">
                                Section: {section.section_key}
                            </h2>

                            <div className="space-y-6">
                                {Object.entries(section.content).map(([key, value]) => {
                                    // Handle Array (Repeater)
                                    if (Array.isArray(value)) {
                                        return (
                                            <div key={key} className="space-y-4">
                                                <label className="block text-sm font-bold uppercase text-gray-500 mb-2">
                                                    {key.replace(/_/g, ' ')} (List)
                                                </label>
                                                <div className="space-y-4 pl-4 border-l-2 border-gray-100 dark:border-zinc-800">
                                                    {value.map((item: any, idx: number) => (
                                                        <div key={idx} className="bg-gray-50 dark:bg-zinc-950 p-4 rounded-lg relative group">
                                                            <button
                                                                onClick={() => removeItemFromArray(section.id, key, idx)}
                                                                className="absolute top-2 right-2 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                                            >
                                                                Remove
                                                            </button>
                                                            <div className="grid gap-3">
                                                                {Object.entries(item).map(([k, v]) => (
                                                                    <div key={k}>
                                                                        <label className="text-xs uppercase font-bold text-gray-400 mb-1 block">{k}</label>
                                                                        <input
                                                                            className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary"
                                                                            type="text"
                                                                            value={v as string}
                                                                            onChange={(e) => handleArrayItemChange(section.id, key, idx, k, e.target.value)}
                                                                        />
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                    <Button variant="outline" size="sm" onClick={() => addItemToArray(section.id, key)} className="w-full dashed-border">
                                                        + Add Item
                                                    </Button>
                                                </div>
                                            </div>
                                        );
                                    }

                                    // Handle String
                                    return (
                                        <div key={key}>
                                            <label className="block text-sm font-bold uppercase text-gray-500 mb-2">
                                                {key.replace(/_/g, ' ')}
                                            </label>

                                            {(key.includes('description') || (typeof value === 'string' && value.length > 50)) ? (
                                                <textarea
                                                    className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors"
                                                    rows={4}
                                                    value={value}
                                                    onChange={(e) => handleContentChange(section.id, key, e.target.value)}
                                                />
                                            ) : (
                                                <input
                                                    className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors"
                                                    type="text"
                                                    value={value}
                                                    onChange={(e) => handleContentChange(section.id, key, e.target.value)}
                                                />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}

export default function AdminPageEditor() {
    return (
        <Suspense fallback={<div className="p-10 text-center">Loading editor...</div>}>
            <EditContent />
        </Suspense>
    );
}
