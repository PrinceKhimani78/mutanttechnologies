'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { PublishButton } from '@/components/admin/PublishButton';
import Link from 'next/link';
import { Plus, Edit, Trash2, LogOut, Loader2 } from 'lucide-react';
import { Post } from '@/lib/types';

export default function AdminDashboard() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            router.push('/admin');
            return;
        }

        const { data, error } = await supabase
            .from('posts')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching posts:', error);
        } else {
            setPosts(data || []);
        }
        setLoading(false);
    };

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push('/admin');
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this post?')) return;

        const { error } = await supabase
            .from('posts')
            .delete()
            .eq('id', id);

        if (error) {
            alert('Error deleting post');
        } else {
            setPosts(posts.filter(post => post.id !== id));
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
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 text-foreground">
            {/* Header */}
            <header className="bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 sticky top-0 z-10">
                <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                    <h1 className="font-oswald text-2xl font-bold uppercase">Mutant Admin</h1>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-500">Welcome, Admin</span>
                        <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10">
                            <LogOut className="w-4 h-4 mr-2" /> Sign Out
                        </Button>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="container mx-auto px-6 py-12">
                <div className="flex justify-between items-center mb-10">
                    <h2 className="text-3xl font-bold">Blog Posts</h2>
                    <div className="flex gap-4">
                        <Button href="/admin/portfolio" variant="outline">
                            Manage Portfolio
                        </Button>
                        <Button href="/admin/settings" variant="outline">
                            Settings
                        </Button>
                        <Button href="/admin/pages" variant="outline">
                            Pages
                        </Button>
                        <Button href="/admin/services" variant="outline">
                            Services
                        </Button>
                        <Button href="/admin/testimonials" variant="outline">
                            Testimonials
                        </Button>
                        <Button href="/admin/ongoing" variant="outline">
                            Ongoing
                        </Button>
                        <Button href="/admin/create">
                            <Plus className="w-5 h-5 mr-2" /> Create New Post
                        </Button>
                    </div>
                </div>

                {posts.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 border-dashed">
                        <p className="text-gray-500 mb-4">No posts yet.</p>
                        <Button href="/admin/create" variant="outline">
                            Write your first post
                        </Button>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {posts.map((post) => (
                            <div key={post.id} className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-gray-200 dark:border-zinc-800 flex items-center justify-between group hover:border-primary/30 transition-colors">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-xl font-bold">{post.title}</h3>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-mono border ${post.is_published
                                            ? 'bg-green-500/10 text-green-500 border-green-500/20'
                                            : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                                            }`}>
                                            {post.is_published ? 'Published' : 'Draft'}
                                        </span>
                                    </div>
                                    <p className="text-gray-500 dark:text-zinc-400 text-sm mb-1">{post.excerpt || 'No excerpt'}</p>
                                    <p className="text-xs text-gray-400 font-mono">{new Date(post.created_at).toLocaleDateString()}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button href={`/admin/edit?id=${post.id}`} variant="ghost" size="sm" className="px-2">
                                        <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => handleDelete(post.id)} className="text-gray-400 hover:text-red-500 px-2">
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
