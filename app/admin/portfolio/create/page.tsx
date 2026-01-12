'use client';

import { supabase } from "@/lib/supabase";
import { useState } from "react";
import { Loader2, ArrowLeft, Upload } from "lucide-react";
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CreatePortfolio() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        project_url: '',
        image_url: ''
    });

    const handleSave = async () => {
        if (!formData.title || !formData.category) {
            alert("Title and Category are required");
            return;
        }

        setLoading(true);
        const { error } = await supabase.from('portfolio').insert([formData]);

        if (error) {
            console.error('Error creating project:', error);
            alert('Failed to create project');
        } else {
            router.push('/admin/portfolio');
        }
        setLoading(false);
    };

    return (
        <main className="bg-gray-50 dark:bg-zinc-950 min-h-screen text-foreground">
            <div className="pt-24 pb-12 px-6 max-w-3xl mx-auto">
                <Link href="/admin/portfolio" className="inline-flex items-center gap-2 text-gray-500 hover:text-primary mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to List
                </Link>

                <h1 className="text-4xl font-oswald font-bold uppercase mb-8">Add New Project</h1>

                <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-zinc-800 space-y-6">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-bold uppercase text-gray-500 mb-2">Project Title</label>
                        <input
                            type="text"
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:border-primary transition-colors"
                            placeholder="e.g. E-Commerce Redesign"
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
                                placeholder="https://..."
                                value={formData.image_url}
                                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                            />
                        </div>
                        <p className="text-xs text-gray-400 mt-2">Currently manual URL entry. (Full upload requires Bucket config)</p>
                    </div>

                    {/* Project URL */}
                    <div>
                        <label className="block text-sm font-bold uppercase text-gray-500 mb-2">Project Link (Optional)</label>
                        <input
                            type="text"
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:border-primary transition-colors"
                            placeholder="https://client-site.com"
                            value={formData.project_url}
                            onChange={(e) => setFormData({ ...formData, project_url: e.target.value })}
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-bold uppercase text-gray-500 mb-2">Description</label>
                        <textarea
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:border-primary transition-colors h-40 resize-none"
                            placeholder="Describe the project..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="w-full py-4 bg-primary text-white font-bold uppercase tracking-wider rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                        {loading ? 'Saving...' : 'Create Project'}
                    </button>
                </div>
            </div>
        </main>
    );
}
