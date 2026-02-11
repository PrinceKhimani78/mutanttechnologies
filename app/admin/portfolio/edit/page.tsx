'use client';

import { supabase } from "@/lib/supabase";
import { useEffect, useState, Suspense } from "react";
import { Loader2, ArrowLeft, Image as ImageIcon } from "lucide-react";
import { uploadImage } from "@/lib/uploadImage";
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { triggerDeploy } from "@/lib/deploy";

function EditPortfolioContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get('id');

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [categories, setCategories] = useState<string[]>([]);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        project_url: '',
        image_url: ''
    });

    useEffect(() => {
        const fetchProjectAndCategories = async () => {
            if (!id) return;

            // Fetch project data
            const { data: projectData, error: projectError } = await supabase.from('portfolio').select('*').eq('id', id).single();
            if (projectError) {
                alert("Project not found");
                router.push('/admin/portfolio');
                return;
            }
            setFormData(projectData);

            // Fetch categories
            const { data: servicesData, error: servicesError } = await supabase.from('services').select('title');
            if (servicesError) {
                console.error("Error fetching services:", servicesError);
            } else {
                const serviceTitles = servicesData.map(s => s.title);
                const customCategories = ["GHL", "SMM", "SEO"];
                const allCategories = Array.from(new Set([...serviceTitles, ...customCategories])).sort();
                setCategories(allCategories);
            }

            setLoading(false);
        };
        fetchProjectAndCategories();
    }, [id, router]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        setUploading(true);
        const file = e.target.files[0];

        const { url, error } = await uploadImage(file, 'images');

        if (error) {
            alert(`Error uploading image: ${error}`);
        } else {
            setFormData({ ...formData, image_url: url });
        }
        setUploading(false);
    };

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
            // Trigger auto-deployment
            await triggerDeploy();
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
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm font-bold uppercase text-gray-500 mb-2">Project Image</label>

                        {formData.image_url ? (
                            <div className="relative aspect-video rounded-lg overflow-hidden mb-4 border border-gray-200 dark:border-zinc-800">
                                <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                                <button
                                    onClick={() => setFormData({ ...formData, image_url: '' })}
                                    className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full hover:bg-red-600 transition-colors text-sm"
                                >
                                    Remove
                                </button>
                            </div>
                        ) : (
                            <div className="border-2 border-dashed border-gray-200 dark:border-zinc-800 rounded-lg p-8 flex flex-col items-center justify-center text-gray-400 mb-4 hover:border-primary/50 transition-colors relative cursor-pointer">
                                <ImageIcon className="w-8 h-8 mb-2" />
                                <span className="text-xs">Click to upload image</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    disabled={uploading}
                                />
                            </div>
                        )}

                        {uploading && <p className="text-xs text-center text-primary animate-pulse mb-4">Uploading...</p>}

                        <input
                            type="text"
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:border-primary transition-colors text-sm"
                            placeholder="Or enter image URL..."
                            value={formData.image_url}
                            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                        />
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
