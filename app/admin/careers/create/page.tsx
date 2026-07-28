'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Plus, X, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function CreateCareer() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        department: '',
        location: '',
        type: 'Full-time',
        description: '',
        is_active: true
    });
    const [requirements, setRequirements] = useState<string[]>(['']);

    const handleRequirementChange = (index: number, value: string) => {
        const newReqs = [...requirements];
        newReqs[index] = value;
        setRequirements(newReqs);
    };

    const addRequirement = () => setRequirements([...requirements, '']);
    
    const removeRequirement = (index: number) => {
        const newReqs = [...requirements];
        newReqs.splice(index, 1);
        setRequirements(newReqs);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const cleanRequirements = requirements.filter(r => r.trim() !== '');

        const { error } = await supabase.from('careers').insert([{
            ...formData,
            requirements: cleanRequirements
        }]);

        if (error) {
            console.error('Error creating job:', JSON.stringify(error, null, 2));
            alert(`Error creating job posting: ${error.message || 'Unknown error'}`);
            setLoading(false);
        } else {
            router.push('/admin/careers');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 text-foreground pb-20">
            <header className="bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 sticky top-0 z-10">
                <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/careers" className="text-gray-500 hover:text-primary transition-colors">
                            <ArrowLeft className="w-6 h-6" />
                        </Link>
                        <h1 className="font-oswald text-2xl font-bold uppercase">Create Job Posting</h1>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-6 py-12 max-w-3xl">
                <form onSubmit={handleSubmit} className="space-y-8 bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-gray-200 dark:border-zinc-800">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium mb-2">Job Title</label>
                            <input
                                type="text"
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({...formData, title: e.target.value})}
                                className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors"
                                placeholder="e.g. Senior Frontend Developer"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Department</label>
                            <input
                                type="text"
                                required
                                value={formData.department}
                                onChange={(e) => setFormData({...formData, department: e.target.value})}
                                className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors"
                                placeholder="e.g. Engineering"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Location</label>
                            <input
                                type="text"
                                required
                                value={formData.location}
                                onChange={(e) => setFormData({...formData, location: e.target.value})}
                                className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors"
                                placeholder="e.g. Remote, Worldwide"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Employment Type</label>
                            <select
                                required
                                value={formData.type}
                                onChange={(e) => setFormData({...formData, type: e.target.value})}
                                className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors"
                            >
                                <option value="Full-time">Full-time</option>
                                <option value="Part-time">Part-time</option>
                                <option value="Contract">Contract</option>
                                <option value="Freelance">Freelance</option>
                                <option value="Internship">Internship</option>
                            </select>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium mb-2">Status</label>
                            <select
                                required
                                value={formData.is_active ? 'true' : 'false'}
                                onChange={(e) => setFormData({...formData, is_active: e.target.value === 'true'})}
                                className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors"
                            >
                                <option value="true">Active (Visible)</option>
                                <option value="false">Inactive (Hidden)</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Job Description</label>
                        <textarea
                            required
                            rows={6}
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors"
                            placeholder="Describe the role and responsibilities..."
                        />
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <label className="block text-sm font-medium">Requirements</label>
                            <Button type="button" onClick={addRequirement} variant="outline" size="sm">
                                <Plus className="w-4 h-4 mr-2" /> Add Requirement
                            </Button>
                        </div>
                        <div className="space-y-3">
                            {requirements.map((req, idx) => (
                                <div key={idx} className="flex gap-2">
                                    <input
                                        type="text"
                                        value={req}
                                        onChange={(e) => handleRequirementChange(idx, e.target.value)}
                                        className="flex-1 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-2 focus:outline-none focus:border-primary transition-colors"
                                        placeholder="e.g. 5+ years of React experience"
                                    />
                                    <Button type="button" onClick={() => removeRequirement(idx)} variant="outline" className="px-3 border-red-200 text-red-500 hover:bg-red-50 dark:border-red-900/30 dark:hover:bg-red-900/10">
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100 dark:border-zinc-800">
                        <Button type="submit" className="w-full" size="lg" disabled={loading}>
                            {loading ? (
                                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
                            ) : (
                                <><Save className="w-4 h-4 mr-2" /> Publish Job Posting</>
                            )}
                        </Button>
                    </div>
                </form>
            </main>
        </div>
    );
}
