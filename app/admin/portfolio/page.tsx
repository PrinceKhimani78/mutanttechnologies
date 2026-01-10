'use client';

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { PortfolioProject } from "@/lib/types";
import { Loader2, Plus, PenSquare, Trash2 } from "lucide-react";
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function PortfolioAdminList() {
    const [projects, setProjects] = useState<PortfolioProject[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const checkAuthAndFetch = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/admin');
                return;
            }

            const { data, error } = await supabase
                .from('portfolio')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching projects:', error);
            } else {
                setProjects(data || []);
            }
            setLoading(false);
        };
        checkAuthAndFetch();
    }, [router]);

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this project?')) return;

        const { error } = await supabase.from('portfolio').delete().eq('id', id);
        if (error) {
            alert('Error deleting project');
        } else {
            setProjects(projects.filter(p => p.id !== id));
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
        <main className="bg-gray-50 dark:bg-zinc-950 min-h-screen text-foreground">
            <div className="pt-24 pb-12 px-6 max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-oswald font-bold uppercase">Portfolio Manager</h1>
                        <p className="text-gray-500">Manage your showcase projects</p>
                    </div>
                    <div className="flex gap-4">
                        <Link href="/admin/dashboard" className="px-4 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
                            Back to Dashboard
                        </Link>
                        <Link href="/admin/portfolio/create" className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg font-bold hover:bg-orange-600 transition-colors">
                            <Plus className="w-4 h-4" /> Add Project
                        </Link>
                    </div>
                </div>

                <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 dark:bg-zinc-950 border-b border-gray-200 dark:border-zinc-800">
                                <tr>
                                    <th className="px-6 py-4 font-bold uppercase text-xs tracking-wider text-gray-500">Project</th>
                                    <th className="px-6 py-4 font-bold uppercase text-xs tracking-wider text-gray-500">Category</th>
                                    <th className="px-6 py-4 font-bold uppercase text-xs tracking-wider text-gray-500">Date</th>
                                    <th className="px-6 py-4 font-bold uppercase text-xs tracking-wider text-gray-500 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                                {projects.map((project) => (
                                    <tr key={project.id} className="hover:bg-gray-50 dark:hover:bg-zinc-900/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-lg font-oswald">{project.title}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase">
                                                {project.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 dark:text-zinc-500 text-sm">
                                            {new Date(project.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link href={`/admin/portfolio/edit?id=${project.id}`} className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                                                    <PenSquare className="w-4 h-4" />
                                                </Link>
                                                <button onClick={() => handleDelete(project.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {projects.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-gray-400 italic">
                                            No projects found. Create your first one!
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </main>
    );
}
