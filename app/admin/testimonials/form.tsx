'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface TestimonialFormProps {
    initialData?: any;
}

export default function TestimonialForm({ initialData }: TestimonialFormProps) {
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        quote: initialData?.quote || '',
        author: initialData?.author || '',
        role: initialData?.role || '',
        rating: initialData?.rating || 5,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
                    .from('testimonials')
                    .update(formData)
                    .eq('id', initialData.id);
                if (error) throw error;
            } else {
                // Create
                const { error } = await supabase
                    .from('testimonials')
                    .insert([formData]);
                if (error) throw error;
            }
            router.push('/admin/testimonials');
            router.refresh();
        } catch (error) {
            console.error('Error saving testimonial:', error);
            alert('Error saving testimonial');
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 bg-white dark:bg-zinc-800 p-8 rounded-xl border border-gray-200 dark:border-zinc-700 shadow-sm max-w-2xl">

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Author Name *</label>
                    <input
                        type="text"
                        name="author"
                        required
                        value={formData.author}
                        onChange={handleChange}
                        className="w-full p-3 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                        placeholder="e.g. John Doe"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Role / Company *</label>
                    <input
                        type="text"
                        name="role"
                        required
                        value={formData.role}
                        onChange={handleChange}
                        className="w-full p-3 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                        placeholder="e.g. CEO, TechCorp"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Rating (1-5)</label>
                    <input
                        type="number"
                        name="rating"
                        min="1"
                        max="5"
                        value={formData.rating}
                        onChange={handleChange}
                        className="w-full p-3 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Quote *</label>
                    <textarea
                        name="quote"
                        required
                        rows={4}
                        value={formData.quote}
                        onChange={handleChange}
                        className="w-full p-3 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none resize-none"
                        placeholder="Enter the testimonial text..."
                    />
                </div>
            </div>

            <div className="flex gap-4 pt-4 border-t border-gray-100 dark:border-zinc-700">
                <Link href="/admin/testimonials">
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
