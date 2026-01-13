'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface OngoingProjectFormProps {
    initialData?: any;
}

export default function OngoingProjectForm({ initialData }: OngoingProjectFormProps) {
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        title: initialData?.title || '',
        category: initialData?.category || '',
        description: initialData?.description || '',
        year: initialData?.year || new Date().getFullYear().toString(),
        color: initialData?.color || 'bg-blue-500',
        image_url: initialData?.image_url || '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            if (initialData?.id) {
                // Update
                const { error } = await supabase
                    .from('ongoing_projects')
                    .update(formData)
                    .eq('id', initialData.id);
                if (error) throw error;
            } else {
                // Create
                const { error } = await supabase
                    .from('ongoing_projects')
                    .insert([formData]);
                if (error) throw error;
            }
            router.push('/admin/ongoing');
            router.refresh();
        } catch (error) {
            console.error('Error saving project:', error);
            alert('Error saving project');
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 bg-white dark:bg-zinc-800 p-8 rounded-xl border border-gray-200 dark:border-zinc-700 shadow-sm max-w-2xl">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1">Project Title *</label>
                    <input
                        type="text"
                        name="title"
                        required
                        value={formData.title}
                        onChange={handleChange}
                        className="w-full p-3 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Category *</label>
                    <input
                        type="text"
                        name="category"
                        required
                        value={formData.category}
                        onChange={handleChange}
                        className="w-full p-3 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                        placeholder="e.g. AI, Web App"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Year</label>
                    <input
                        type="text"
                        name="year"
                        value={formData.year}
                        onChange={handleChange}
                        className="w-full p-3 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                    />
                </div>

                <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1">Background Color Class (Tailwind)</label>
                    <select
                        name="color"
                        value={formData.color}
                        onChange={handleChange}
                        className="w-full p-3 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                    >
                        <option value="bg-blue-500">Blue</option>
                        <option value="bg-cyan-500">Cyan</option>
                        <option value="bg-violet-500">Violet</option>
                        <option value="bg-red-500">Red</option>
                        <option value="bg-orange-500">Orange</option>
                        <option value="bg-emerald-500">Emerald</option>
                        <option value="bg-zinc-900">Black/Zinc</option>
                    </select>
                </div>

                <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1">Description *</label>
                    <textarea
                        name="description"
                        required
                        rows={4}
                        value={formData.description}
                        onChange={handleChange}
                        className="w-full p-3 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none resize-none"
                    />
                </div>
            </div>

            <div className="flex gap-4 pt-4 border-t border-gray-100 dark:border-zinc-700">
                <Link href="/admin/ongoing">
                    <Button type="button" variant="outline">
                        Cancel
                    </Button>
                </Link>
                <Button type="submit" disabled={saving} className="min-w-[120px]">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    {initialData ? 'Update' : 'Create'}
                </Button>
            </div>
        </form>
    );
}
