'use client';

import { supabase } from "@/lib/supabase";
import { useEffect, useState, Suspense } from "react";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

function EditPortfolioContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get('id');

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        project_url: '',
        image_url: ''
    });

    useEffect(() => {
        const fetchProject = async () => {
            if (!id) return;
            const { data, error } = await supabase.from('portfolio').select('*').eq('id', id).single();
            if (error) {
                alert("Project not found");
                router.push('/admin/portfolio');
            } else {
                setFormData(data);
            }
            setLoading(false);
        };
        fetchProject();
    }, [id, router]);

    const handleSave = async () => {
        if (!formData.title || !formData.category) {
            alert("Title and Category are required");
            return;
        }

        setSaving(true);
        const { error } = await supabase.from('portfolio').update(formData).eq('id', id);

        if (error) {
            console.error('Error updating project:', error);
            alert('Failed to update project');
        } else {
            router.push('/admin/portfolio');
        }
        setSaving(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <main className="bg-gray-50 dark:bg-zinc-950 min-h-screen text-foreground">
            <div className="pt-24 pb-12 px-6 max-w-3xl mx-auto">
                <Link href="/admin/portfolio" className="inline-flex items-center gap-2 text-gray-500 hover:text-primary mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to List
                </Link>

                <h1 className="text-4xl font-oswald font-bold uppercase mb-8">Edit Project</h1>

                <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-zinc-800 space-y-6">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-bold uppercase text-gray-500 mb-2">Project Title</label>
                        <input
                            type="text"
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:border-primary transition-colors"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-bold uppercase text-gray-500 mb-2">Category</label>
                        <select
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:border-primary transition-colors"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        >
                            <option value="">Select Category</option>
                            <option value="Web Development">Web Development</option>
                            <option value="Mobile App">Mobile App</option>
                            <option value="Design">Design</option>
                            <option value="Consulting">Consulting</option>
                        </select>
                    </div>

                    {/* Image URL */}
                    <div>
                        <label className="block text-sm font-bold uppercase text-gray-500 mb-2">Image URL</label>
                        <div className="flex gap-4">
                            <input
                                type="text"
                                className="flex-1 px-4 py-3 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:border-primary transition-colors"
                                value={formData.image_url}
                                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Project URL */}
                    <div>
                        <label className="block text-sm font-bold uppercase text-gray-500 mb-2">Project Link (Optional)</label>
                        <input
                            type="text"
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:border-primary transition-colors"
                            value={formData.project_url || ''}
                            onChange={(e) => setFormData({ ...formData, project_url: e.target.value })}
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-bold uppercase text-gray-500 mb-2">Description</label>
                        <textarea
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:border-primary transition-colors h-40 resize-none"
                            value={formData.description || ''}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full py-4 bg-primary text-white font-bold uppercase tracking-wider rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {saving && <Loader2 className="w-5 h-5 animate-spin" />}
                        {saving ? 'Saving...' : 'Update Project'}
                    </button>
                </div>
            </div>
        </main>
    );
}

export default function EditPortfolio() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        }>
            <EditPortfolioContent />
        </Suspense>
    );
}
