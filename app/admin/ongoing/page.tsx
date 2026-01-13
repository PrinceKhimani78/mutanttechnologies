'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function OngoingProjectsAdmin() {
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        const { data, error } = await supabase
            .from('ongoing_projects')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) console.error('Error fetching projects:', error);
        else setProjects(data || []);
        setLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this project?')) return;

        const { error } = await supabase
            .from('ongoing_projects')
            .delete()
            .eq('id', id);

        if (error) {
            alert('Error deleting project');
            console.error(error);
        } else {
            fetchProjects();
        }
    };

    if (loading) return <div className="p-8">Loading projects...</div>;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold font-oswald text-dark-slate dark:text-white uppercase">
                            Ongoing Projects
                        </h1>
                        <p className="text-gray-500">Manage featured ongoing work</p>
                    </div>
                    <Link href="/admin/ongoing/create">
                        <Button className="gap-2">
                            <Plus className="w-4 h-4" /> Add Project
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((p) => (
                        <div key={p.id} className="bg-white dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 shadow-sm overflow-hidden group">
                            {/* Image Preview Area */}
                            <div className={`h-32 ${p.color || 'bg-blue-500'} relative`}>
                                <div className="absolute top-2 right-2 flex gap-1 opacity-100 z-10 p-1 rounded-lg">
                                    <Link href={`/admin/ongoing/edit?id=${p.id}`}>
                                        <Button variant="secondary" size="icon" className="h-8 w-8 bg-white/90 hover:bg-white text-black">
                                            <Pencil className="w-4 h-4" />
                                        </Button>
                                    </Link>
                                    <Button
                                        variant="destructive"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => handleDelete(p.id)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                                <div className="absolute inset-0 flex items-center justify-center text-white/50 font-bold text-2xl uppercase">
                                    {p.title}
                                </div>
                            </div>

                            <div className="p-5">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-xs font-bold text-primary uppercase border border-primary/20 bg-primary/5 px-2 py-1 rounded-full">
                                        {p.category}
                                    </span>
                                    <span className="text-xs text-gray-500">{p.year}</span>
                                </div>

                                <h3 className="text-lg font-bold font-oswald text-dark-slate dark:text-white mb-2">{p.title}</h3>
                                <p className="text-sm text-gray-600 dark:text-zinc-400 line-clamp-2 mb-4">
                                    {p.description}
                                </p>
                            </div>
                        </div>
                    ))}

                    {projects.length === 0 && (
                        <div className="col-span-full py-20 text-center text-gray-400 bg-white dark:bg-zinc-800 rounded-xl border border-dashed border-gray-300 dark:border-zinc-700">
                            No ongoing projects found. Add one to get started.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
