'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
    Plus,
    Edit,
    Trash2,
    LogOut,
    Loader2,
    Layout,
    FileText,
    Briefcase,
    MessageSquare,
    Settings,
    ExternalLink,
    Rocket
} from 'lucide-react';
import { Post } from '@/lib/types';
import { PublishButton } from '@/components/admin/PublishButton';

export default function AdminDashboard() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/admin');
                return;
            }
            fetchPosts();
        };
        checkSession();
    }, []);

    const fetchPosts = async () => {
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

    const managementCards = [
        { title: 'Services', icon: Layout, link: '/admin/services', desc: 'Manage service pages and features', color: 'text-blue-500' },
        { title: 'Portfolio', icon: Briefcase, link: '/admin/portfolio', desc: 'Case studies and project showcases', color: 'text-purple-500' },
        { title: 'Testimonials', icon: MessageSquare, link: '/admin/testimonials', desc: 'Client feedback and reviews', color: 'text-orange-500' },
        { title: 'Page SEO', icon: Rocket, link: '/admin/seo', desc: 'Meta titles, descriptions & social', color: 'text-green-500' },
        { title: 'Site Settings', icon: Settings, link: '/admin/settings', desc: 'Global configurations and contact info', color: 'text-zinc-500' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 text-foreground pb-20">
            {/* Header */}
            <header className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-gray-200 dark:border-zinc-800 sticky top-0 z-[60]">
                <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <h1 className="font-oswald text-2xl font-bold uppercase tracking-tighter text-primary">Mutant Admin</h1>
                        <span className="hidden sm:inline px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest rounded-full border border-primary/20">Control Center</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-gray-400 hover:text-red-500 transition-colors">
                            <LogOut className="w-4 h-4 mr-2" /> Sign Out
                        </Button>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-6 py-12 max-w-6xl">
                {/* Manager Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                    {managementCards.map((card, i) => (
                        <Link
                            key={i}
                            href={card.link}
                            className="group bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-100 dark:border-zinc-800 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all"
                        >
                            <div className={`${card.color} bg-current/10 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                <card.icon className="w-6 h-6" />
                            </div>
                            <h3 className="font-bold text-lg mb-1">{card.title}</h3>
                            <p className="text-xs text-gray-500 dark:text-zinc-400">{card.desc}</p>
                        </Link>
                    ))}
                </div>

                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Left: Blog Posts Manager */}
                    <div className="flex-1">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                <FileText className="w-6 h-6 text-primary" /> Blog Posts
                            </h2>
                            <Button href="/admin/create" size="sm" className="text-xs uppercase tracking-widest font-bold">
                                <Plus className="w-4 h-4 mr-2" /> New Post
                            </Button>
                        </div>

                        {posts.length === 0 ? (
                            <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-2xl border-2 border-dashed border-gray-200 dark:border-zinc-800">
                                <p className="text-gray-500 font-medium">No blog posts found.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {posts.map((post) => (
                                    <div key={post.id} className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-100 dark:border-zinc-800 flex items-center justify-between group hover:border-primary/30 transition-all">
                                        <div className="flex-1 min-w-0 pr-4">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-bold truncate text-sm sm:text-base">{post.title}</h3>
                                                {!post.is_published && (
                                                    <span className="px-1.5 py-0.5 bg-yellow-500/10 text-yellow-500 text-[8px] font-bold uppercase rounded border border-yellow-500/20">Draft</span>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-400 font-medium">{new Date(post.created_at).toLocaleDateString()}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button href={`/admin/edit?id=${post.id}`} variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-primary/10 hover:text-primary">
                                                <Edit className="w-3.5 h-3.5" />
                                            </Button>
                                            <Button variant="ghost" size="sm" onClick={() => handleDelete(post.id)} className="h-8 w-8 p-0 rounded-full hover:bg-red-500/10 hover:text-red-500 text-gray-300">
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="lg:w-80 space-y-6">
                        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm">
                            <h3 className="font-bold text-sm mb-4 uppercase tracking-wider text-gray-500">Site Deployment</h3>
                            <PublishButton />
                        </div>

                        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm">
                            <h3 className="font-bold text-sm mb-4 uppercase tracking-wider text-gray-500">Quick Links</h3>
                            <div className="space-y-2">
                                <a href="/" target="_blank" className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800 text-xs text-gray-500 transition-colors">
                                    View Live Website <ExternalLink className="w-3 h-3" />
                                </a>
                                <Link href="/admin/settings" className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800 text-xs text-gray-500 transition-colors">
                                    Site Settings <Settings className="w-3 h-3" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

