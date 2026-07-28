'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Career } from '@/lib/types';

export default function CareersList() {
    const [careers, setCareers] = useState<Career[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetchCareers();
    }, []);

    const fetchCareers = async () => {
        const { data, error } = await supabase
            .from('careers')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching careers:', error);
        } else {
            setCareers((data || []) as Career[]);
        }
        setLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this job posting?')) return;

        const { error } = await supabase.from('careers').delete().eq('id', id);
        if (error) {
            alert('Error deleting job posting');
        } else {
            fetchCareers();
        }
    };

    const handleToggleActive = async (id: string, currentStatus: boolean) => {
        const { error } = await supabase.from('careers').update({ is_active: !currentStatus }).eq('id', id);
        if (error) {
            alert('Error updating status');
        } else {
            fetchCareers();
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
            <header className="bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 sticky top-0 z-10">
                <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/dashboard" className="text-gray-500 hover:text-primary transition-colors">
                            <ArrowLeft className="w-6 h-6" />
                        </Link>
                        <h1 className="font-oswald text-2xl font-bold uppercase">Careers Manager</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button href="/admin/careers/create">
                            <Plus className="w-4 h-4 mr-2" /> Add Job
                        </Button>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-6 py-12 max-w-5xl">
                <div className="grid gap-4">
                    {careers.map((career) => (
                        <div key={career.id} className={`bg-white dark:bg-zinc-900 p-6 rounded-xl border flex items-center justify-between group transition-colors ${career.is_active ? 'border-gray-200 dark:border-zinc-800 hover:border-primary/30' : 'border-dashed border-gray-300 dark:border-zinc-700 opacity-60'}`}>
                            <div>
                                <div className="flex items-center gap-3">
                                    <h3 className="text-xl font-bold">{career.title}</h3>
                                    {!career.is_active && <span className="px-2 py-0.5 text-xs bg-red-100 text-red-600 rounded-full font-bold">INACTIVE</span>}
                                </div>
                                <p className="text-sm text-gray-500 font-mono mt-1">{career.department} • {career.location} • {career.type}</p>
                            </div>
                            <div className="flex gap-3">
                                <Button onClick={() => handleToggleActive(career.id, career.is_active)} variant="outline" size="sm">
                                    {career.is_active ? 'Deactivate' : 'Activate'}
                                </Button>
                                <Button href={`/admin/careers/edit?id=${career.id}`} variant="outline" size="sm">
                                    <Edit className="w-4 h-4 mr-2" /> Edit
                                </Button>
                                <Button onClick={() => handleDelete(career.id)} variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10">
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    ))}

                    {careers.length === 0 && (
                        <div className="text-center py-10 text-gray-500">
                            No job postings found. Add your first job opening!
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
