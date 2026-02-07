'use client';

import { useState, useEffect, Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';

import { About } from '@/components/About';
import { Hero } from '@/components/Hero';
import { uploadImage } from '@/lib/uploadImage';

interface PageSection {
    id: string;
    section_key: string;
    content: Record<string, any>;
}

function Preview({ sections }: { sections: PageSection[] }) {
    return (
        <div className="bg-background min-h-full overflow-y-auto">
            {sections.map((section) => {
                const { section_key, content } = section;
                if (section_key === 'hero') {
                    return <Hero key={section.id} {...content} title1={content.title1} title2={content.title2} subtitle={content.subtitle} buttonText={content.button_text} />;
                }
                if (section_key === 'about') {
                    return <About key={section.id} content={content} features={content.features} />;
                }
                // Add more mappings as needed (Services, etc.)
                return (
                    <div key={section.id} className="p-10 border border-dashed text-center text-gray-400">
                        Preview not available for {section_key}
                    </div>
                );
            })}
        </div>
    );
}

function EditContent() {
    const searchParams = useSearchParams();
    const slug = searchParams.get('slug');
    const router = useRouter();

    const [sections, setSections] = useState<PageSection[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState<string | null>(null);

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
            .order('section_key');

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

    const handleImageUpload = async (sectionId: string, fieldKey: string, file: File) => {
        setUploading(`${sectionId}-${fieldKey}`);
        const { url, error } = await uploadImage(file);
        if (error) {
            alert(error);
        } else {
            handleContentChange(sectionId, fieldKey, url);
        }
        setUploading(null);
    };

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
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 text-foreground flex flex-col">
            <header className="bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 sticky top-0 z-20">
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

            <div className="flex-1 flex overflow-hidden">
                {/* Editor Sidebar */}
                <main className="w-1/2 overflow-y-auto border-r border-gray-200 dark:border-zinc-800 p-8 space-y-8 bg-gray-50/50 dark:bg-zinc-950/50">
                    {sections.map((section) => (
                        <div key={section.id} className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm">
                            <h2 className="text-sm font-bold uppercase tracking-widest mb-6 text-primary border-b border-gray-100 dark:border-zinc-800 pb-2">
                                {section.section_key}
                            </h2>

                            <div className="space-y-6">
                                {Object.entries(section.content).map(([key, value]) => {
                                    if (Array.isArray(value)) {
                                        return (
                                            <div key={key} className="space-y-4">
                                                <label className="block text-xs font-bold uppercase text-gray-500">
                                                    {key.replace(/_/g, ' ')}
                                                </label>
                                                <div className="space-y-4 pl-4 border-l-2 border-primary/20">
                                                    {value.map((item: any, idx: number) => (
                                                        <div key={idx} className="bg-gray-50 dark:bg-zinc-950 p-4 rounded-lg relative group">
                                                            <button
                                                                onClick={() => removeItemFromArray(section.id, key, idx)}
                                                                className="absolute top-2 right-2 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                                                            >
                                                                Remove
                                                            </button>
                                                            <div className="grid gap-3">
                                                                {Object.entries(item).map(([k, v]) => (
                                                                    <div key={k}>
                                                                        <label className="text-[10px] uppercase font-bold text-gray-400 mb-1 block">{k}</label>
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
                                                    <Button variant="outline" size="sm" onClick={() => addItemToArray(section.id, key)} className="w-full text-xs h-8 border-dashed">
                                                        + Add Item
                                                    </Button>
                                                </div>
                                            </div>
                                        );
                                    }

                                    const isImageField = key.toLowerCase().includes('image') || key.toLowerCase().includes('icon') || key.toLowerCase().includes('logo');

                                    return (
                                        <div key={key}>
                                            <label className="block text-xs font-bold uppercase text-gray-400 mb-2">
                                                {key.replace(/_/g, ' ')}
                                            </label>

                                            {isImageField ? (
                                                <div className="space-y-3">
                                                    {value && (
                                                        <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200 dark:border-zinc-800">
                                                            <img src={value as string} alt="Preview" className="w-full h-full object-cover" />
                                                        </div>
                                                    )}
                                                    <div className="flex gap-2">
                                                        <input
                                                            className="flex-1 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors font-mono"
                                                            type="text"
                                                            placeholder="Image URL"
                                                            value={value as string}
                                                            onChange={(e) => handleContentChange(section.id, key, e.target.value)}
                                                        />
                                                        <label className="cursor-pointer inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary/90 transition-colors text-sm">
                                                            {uploading === `${section.id}-${key}` ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Upload'}
                                                            <input
                                                                type="file"
                                                                className="hidden"
                                                                accept="image/*"
                                                                onChange={(e) => {
                                                                    const file = e.target.files?.[0];
                                                                    if (file) handleImageUpload(section.id, key, file);
                                                                }}
                                                            />
                                                        </label>
                                                    </div>
                                                </div>
                                            ) : (key.includes('description') || (typeof value === 'string' && value.length > 50)) ? (
                                                <textarea
                                                    className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
                                                    rows={3}
                                                    value={value}
                                                    onChange={(e) => handleContentChange(section.id, key, e.target.value)}
                                                />
                                            ) : (
                                                <input
                                                    className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
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
                </main>

                {/* Preview Window */}
                <aside className="w-1/2 bg-white dark:bg-zinc-900 border-l border-gray-200 dark:border-zinc-800 relative group">
                    <div className="absolute top-4 left-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="bg-primary text-white text-[10px] uppercase font-bold px-2 py-1 rounded">Live Preview</span>
                    </div>
                    <div className="h-full w-full overflow-y-auto scale-[0.6] origin-top-left" style={{ width: '166.66%', height: '166.66%' }}>
                        <Preview sections={sections} />
                    </div>
                </aside>
            </div>
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
