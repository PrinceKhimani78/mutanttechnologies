'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Save, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Service } from '@/lib/types';

interface ServiceFormProps {
    initialData?: Service;
    isEditing?: boolean;
}

export default function ServiceForm({ initialData, isEditing = false }: ServiceFormProps) {
    const router = useRouter();
    const [saving, setSaving] = useState(false);

    // Default stats
    const [formData, setFormData] = useState<Partial<Service>>(initialData || {
        title: '',
        slug: '',
        short_description: '',
        description: '',
        icon: 'Monitor',
        color: 'bg-blue-500',
        bg_gradient: 'from-blue-500 to-cyan-500',
        content: '',
        features: [],
        tools: [],
        process: [],
        benefits: []
    });

    // Helper to handle simple field changes
    const handleChange = (key: keyof Service, value: any) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    // Helper for JSON array fields (simple string arrays like features, tools)
    const handleArrayChange = (key: 'features' | 'tools', value: string) => {
        // Simple comma-separated input for now
        const array = value.split(',').map(s => s.trim()).filter(Boolean);
        handleChange(key, array);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            if (isEditing && initialData?.id) {
                const { error } = await supabase
                    .from('services')
                    .update(formData)
                    .eq('id', initialData.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('services')
                    .insert([formData]);
                if (error) throw error;
            }
            router.push('/admin/services');
            router.refresh();
        } catch (error) {
            console.error('Error saving service:', error);
            alert('Failed to save service');
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto pb-20">
            <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm space-y-6">
                <h2 className="text-xl font-bold border-b pb-4 mb-4">Basic Information</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold mb-2">Title</label>
                        <input
                            required
                            className="w-full p-3 border rounded-lg bg-transparent"
                            value={formData.title}
                            onChange={(e) => handleChange('title', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-2">Slug</label>
                        <input
                            required
                            className="w-full p-3 border rounded-lg bg-transparent"
                            value={formData.slug}
                            onChange={(e) => handleChange('slug', e.target.value)}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold mb-2">Short Description</label>
                    <textarea
                        className="w-full p-3 border rounded-lg bg-transparent"
                        rows={2}
                        value={formData.short_description}
                        onChange={(e) => handleChange('short_description', e.target.value)}
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold mb-2">Icon Name (Lucide)</label>
                    <input
                        className="w-full p-3 border rounded-lg bg-transparent"
                        value={formData.icon}
                        onChange={(e) => handleChange('icon', e.target.value)}
                        placeholder="e.g. Activity, Monitor, Code"
                    />
                </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm space-y-6">
                <h2 className="text-xl font-bold border-b pb-4 mb-4">Content & Lists</h2>

                <div>
                    <label className="block text-sm font-bold mb-2">Features (Comma separated)</label>
                    <textarea
                        className="w-full p-3 border rounded-lg bg-transparent"
                        rows={3}
                        defaultValue={formData.features?.join(', ')}
                        onChange={(e) => handleArrayChange('features', e.target.value)}
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold mb-2">Tools (Comma separated)</label>
                    <textarea
                        className="w-full p-3 border rounded-lg bg-transparent"
                        rows={3}
                        defaultValue={formData.tools?.join(', ')}
                        onChange={(e) => handleArrayChange('tools', e.target.value)}
                    />
                </div>
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-zinc-900 border-t flex justify-end gap-4 container mx-auto z-20">
                <Button variant="outline" type="button" onClick={() => router.back()}>Cancel</Button>
                <Button type="submit" disabled={saving}>
                    {saving ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                    {isEditing ? 'Update Service' : 'Create Service'}
                </Button>
            </div>
        </form>
    );
}
