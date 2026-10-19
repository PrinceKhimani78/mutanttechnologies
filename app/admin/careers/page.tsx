'use client';

import { useState, useEffect, Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, Edit, Trash2, Loader2, Users, Briefcase } from 'lucide-react';
import Link from 'next/link';
import { Career } from '@/lib/types';
import { CandidatesManager } from '@/components/admin/CandidatesManager';

function CareersContent() {
    const searchParams = useSearchParams();
    const initialTab = searchParams.get('tab') === 'jobs' ? 'jobs' : 'candidates';
    
    const [activeTab, setActiveTab] = useState<'candidates' | 'jobs'>(initialTab);
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

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 text-foreground pb-20">
            {/* Header */}
            <header className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-b border-gray-200 dark:border-zinc-800 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                        <Link href="/admin/dashboard" className="text-gray-500 hover:text-primary transition-colors shrink-0">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <h1 className="font-oswald text-xl sm:text-2xl font-bold uppercase tracking-tight text-foreground truncate">
                            Careers & Candidates
                        </h1>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                        <Button href="/admin/careers/create" size="sm" className="h-9 text-xs">
                            <Plus className="w-4 h-4 mr-1.5" /> Add Job
                        </Button>
                    </div>
                </div>

                {/* Subheader Navigation Tabs */}
                <div className="border-t border-gray-100 dark:border-zinc-800/80">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 py-2 overflow-x-auto no-scrollbar">
                        <button
                            onClick={() => setActiveTab('candidates')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all shrink-0 ${
                                activeTab === 'candidates'
                                    ? 'bg-primary text-white shadow-xs'
                                    : 'text-gray-500 hover:text-foreground hover:bg-gray-100 dark:hover:bg-zinc-800/60'
                            }`}
                        >
                            <Users className="w-4 h-4" />
                            <span>Candidate Applicants</span>
                        </button>

                        <button
                            onClick={() => setActiveTab('jobs')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all shrink-0 ${
                                activeTab === 'jobs'
                                    ? 'bg-primary text-white shadow-xs'
                                    : 'text-gray-500 hover:text-foreground hover:bg-gray-100 dark:hover:bg-zinc-800/60'
                            }`}
                        >
                            <Briefcase className="w-4 h-4" />
                            <span>Job Postings</span>
                            <span className={`px-1.5 py-0.2 text-[10px] rounded-full font-mono ${
                                activeTab === 'jobs' ? 'bg-white/20 text-white' : 'bg-gray-200 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400'
                            }`}>
                                {careers.length}
                            </span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                {activeTab === 'candidates' ? (
                    <CandidatesManager />
                ) : (
                    <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                                <h2 className="text-xl font-bold font-oswald uppercase">Active Job Postings</h2>
                                <p className="text-xs text-gray-500">Manage positions listed on your live /careers portal</p>
                            </div>
                            <Button href="/admin/careers/create" size="sm" variant="outline">
                                <Plus className="w-4 h-4 mr-1.5" /> Post New Role
                            </Button>
                        </div>

                        {loading ? (
                            <div className="py-20 flex justify-center">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {careers.map((career) => (
                                    <div 
                                        key={career.id} 
                                        className={`bg-white dark:bg-zinc-900 p-5 sm:p-6 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 group transition-colors ${
                                            career.is_active 
                                                ? 'border-gray-200 dark:border-zinc-800 hover:border-primary/30' 
                                                : 'border-dashed border-gray-300 dark:border-zinc-700 opacity-60'
                                        }`}
                                    >
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-lg font-bold">{career.title}</h3>
                                                {!career.is_active && (
                                                    <span className="px-2 py-0.5 text-[10px] bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 rounded-full font-bold">
                                                        INACTIVE
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500 font-mono mt-1">
                                                {career.department} • {career.location} • {career.type}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-2.5 shrink-0 self-start md:self-auto">
                                            <Button onClick={() => handleToggleActive(career.id, career.is_active)} variant="outline" size="sm" className="text-xs h-8">
                                                {career.is_active ? 'Deactivate' : 'Activate'}
                                            </Button>
                                            <Button href={`/admin/careers/edit?id=${career.id}`} variant="outline" size="sm" className="text-xs h-8">
                                                <Edit className="w-3.5 h-3.5 mr-1.5" /> Edit
                                            </Button>
                                            <Button 
                                                onClick={() => handleDelete(career.id)} 
                                                variant="ghost" 
                                                size="sm" 
                                                className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 h-8 w-8 p-0"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}

                                {careers.length === 0 && (
                                    <div className="text-center py-16 bg-white dark:bg-zinc-900 rounded-2xl border border-dashed border-gray-200 dark:border-zinc-800">
                                        <Briefcase className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                                        <p className="text-gray-500 font-medium">No job postings found.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}

export default function CareersList() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        }>
            <CareersContent />
        </Suspense>
    );
}
