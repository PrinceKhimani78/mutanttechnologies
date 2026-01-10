'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import RichTextEditor from '@/components/admin/RichTextEditor';
import { ArrowLeft, Save, Upload, Loader2, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import { v4 as uuidv4 } from 'uuid';

export default function CreatePost() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Form State
    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [excerpt, setExcerpt] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('');
    const [coverImage, setCoverImage] = useState('');
    const [isPublished, setIsPublished] = useState(false);

    useEffect(() => {
        // Auto-generate slug from title
        const generateSlug = (text: string) => {
            return text
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)+/g, '');
        };
        setSlug(generateSlug(title));
    }, [title]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) {
            return;
        }
        setUploading(true);
        const file = e.target.files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const filePath = `${fileName}`;

        try {
            const { error: uploadError } = await supabase.storage
                .from('blog-images')
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            const { data: { publicUrl } } = supabase.storage
                .from('blog-images')
                .getPublicUrl(filePath);

            setCoverImage(publicUrl);
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Error uploading image');
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async () => {
        if (!title || !slug || !content) {
            alert('Please fill in Title, Slug, and Content');
            return;
        }
        setLoading(true);


        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                alert('You must be logged in to create a post');
                return;
            }

            const { error } = await supabase
                .from('posts')
                .insert([
                    {
                        title,
                        slug,
                        excerpt,
                        content,
                        category,
                        cover_image: coverImage,
                        is_published: isPublished,
                        author_id: user.id,
                    },
                ]);

            if (error) throw error;
            router.push('/admin/dashboard');
        } catch (error: any) {
            console.error('Error creating post:', error);
            alert('Error creating post: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 text-foreground pb-20">
            {/* Header */}
            <header className="bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 sticky top-0 z-10">
                <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button href="/admin/dashboard" variant="ghost" size="sm" className="px-2">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <h1 className="font-oswald text-xl font-bold uppercase">Create New Post</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={isPublished}
                                onChange={(e) => setIsPublished(e.target.checked)}
                                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <span className="text-sm font-medium">Publish Immediately</span>
                        </label>
                        <Button onClick={handleSave} disabled={loading}>
                            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            <Save className="w-4 h-4 mr-2" /> Save Post
                        </Button>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-6 py-8 max-w-5xl">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="space-y-4">
                            <div>
                                <input
                                    type="text"
                                    placeholder="Post Title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full text-4xl font-oswald font-bold bg-transparent border-none focus:ring-0 placeholder:text-gray-300 dark:placeholder:text-zinc-700 px-0"
                                />
                            </div>
                            <RichTextEditor content={content} onChange={setContent} />
                        </div>
                    </div>

                    {/* Sidebar Settings */}
                    <div className="space-y-6">
                        {/* URL Slug */}
                        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-gray-200 dark:border-zinc-800">
                            <label className="block text-xs font-bold uppercase text-gray-400 mb-2">URL Slug</label>
                            <input
                                type="text"
                                value={slug}
                                onChange={(e) => setSlug(e.target.value)}
                                className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm font-mono"
                            />
                        </div>

                        {/* Excerpt */}
                        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-gray-200 dark:border-zinc-800">
                            <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Excerpt</label>
                            <textarea
                                value={excerpt}
                                onChange={(e) => setExcerpt(e.target.value)}
                                rows={4}
                                className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm"
                                placeholder="Short summary for preview cards..."
                            />
                        </div>

                        {/* Category */}
                        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-gray-200 dark:border-zinc-800">
                            <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Category</label>
                            <input
                                type="text"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm"
                                placeholder="e.g. Technology, Design"
                            />
                        </div>

                        {/* Cover Image */}
                        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-gray-200 dark:border-zinc-800">
                            <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Cover Image</label>

                            {coverImage ? (
                                <div className="relative aspect-video rounded-lg overflow-hidden mb-4 border border-gray-200 dark:border-zinc-800">
                                    <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
                                    <button
                                        onClick={() => setCoverImage('')}
                                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                                    >
                                        <Upload className="w-4 h-4 rotate-45" /> {/* Use X icon ideally, reusing Upload for now */}
                                    </button>
                                </div>
                            ) : (
                                <div className="border-2 border-dashed border-gray-200 dark:border-zinc-800 rounded-lg p-8 flex flex-col items-center justify-center text-gray-400 mb-4 hover:border-primary/50 transition-colors relative cursor-pointer">
                                    <ImageIcon className="w-8 h-8 mb-2" />
                                    <span className="text-xs">Upload Cover Image</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        disabled={uploading}
                                    />
                                </div>
                            )}

                            {uploading && <p className="text-xs text-center text-primary animate-pulse">Uploading...</p>}

                            <input
                                type="text"
                                value={coverImage}
                                onChange={(e) => setCoverImage(e.target.value)}
                                className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs"
                                placeholder="Or enter image URL..."
                            />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
