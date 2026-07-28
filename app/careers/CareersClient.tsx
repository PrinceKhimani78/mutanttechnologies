'use client';

import { useState } from 'react';
import { Career } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Briefcase, MapPin, Building, Clock, ChevronDown, ChevronUp, Loader2, CheckCircle2, X } from 'lucide-react';

export function CareersClient({ careers }: { careers: Career[] }) {
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [applyingTo, setApplyingTo] = useState<Career | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        coverLetter: ''
    });
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const toggleExpand = (id: string) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const handleApply = (career: Career, e: React.MouseEvent) => {
        e.stopPropagation();
        setApplyingTo(career);
        setSuccess(false);
        setError('');
    };

    const submitApplication = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!resumeFile) {
            setError('Please upload your resume.');
            setLoading(false);
            return;
        }

        try {
            // 1. Upload Resume to Supabase Storage
            const { supabase } = await import("@/lib/supabase");
            const fileExt = resumeFile.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('resumes')
                .upload(filePath, resumeFile);

            if (uploadError) {
                console.error("Upload error details:", uploadError);
                throw new Error('Failed to upload resume. Please make sure the "resumes" storage bucket exists and allows public uploads.');
            }

            const { data: { publicUrl } } = supabase.storage
                .from('resumes')
                .getPublicUrl(filePath);

            // 2. Submit Application
            const res = await fetch('/api/careers/apply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jobId: applyingTo?.id,
                    jobTitle: applyingTo?.title,
                    resumeUrl: publicUrl,
                    ...formData
                })
            });

            const data = await res.json();
            
            if (res.ok && data.success) {
                setSuccess(true);
                setFormData({ name: '', email: '', phone: '', coverLetter: '' });
                setResumeFile(null);
                setTimeout(() => {
                    setApplyingTo(null);
                    setSuccess(false);
                }, 3000);
            } else {
                setError(data.error || 'Something went wrong. Please try again.');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to submit application');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-6 py-20 max-w-5xl">
            <div className="text-center mb-16">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-oswald font-bold uppercase tracking-tight text-foreground mb-6">
                    Join the <span className="text-primary">Mutant</span> Team
                </h1>
                <p className="text-lg md:text-xl text-gray-500 dark:text-zinc-400 max-w-2xl mx-auto">
                    We are always looking for passionate, driven, and talented individuals to help us build the future of digital experiences.
                </p>
            </div>

            <div className="space-y-4">
                {careers.map(career => (
                    <div key={career.id} className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl overflow-hidden hover:border-primary/30 transition-colors">
                        <div 
                            className="p-6 md:p-8 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-6"
                            onClick={() => toggleExpand(career.id)}
                        >
                            <div>
                                <h3 className="text-2xl font-bold font-oswald uppercase mb-3">{career.title}</h3>
                                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-zinc-400">
                                    <div className="flex items-center gap-1"><Building className="w-4 h-4" /> {career.department}</div>
                                    <div className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {career.location}</div>
                                    <div className="flex items-center gap-1"><Clock className="w-4 h-4" /> {career.type}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <Button onClick={(e) => handleApply(career, e)}>Apply Now</Button>
                                <button className="text-gray-400 hover:text-primary transition-colors p-2 bg-gray-50 dark:bg-zinc-950 rounded-full">
                                    {expandedId === career.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {expandedId === career.id && (
                            <div className="px-6 md:px-8 pb-8 pt-2 border-t border-gray-100 dark:border-zinc-800">
                                <div className="prose dark:prose-invert max-w-none">
                                    <h4 className="text-lg font-bold mb-2">Role Overview</h4>
                                    <p className="text-gray-600 dark:text-zinc-300 whitespace-pre-line mb-6">{career.description}</p>
                                    
                                    {career.requirements && career.requirements.length > 0 && (
                                        <>
                                            <h4 className="text-lg font-bold mb-2">Requirements</h4>
                                            <ul className="space-y-2 mb-6">
                                                {career.requirements.map((req, i) => (
                                                    <li key={i} className="flex items-start gap-2 text-gray-600 dark:text-zinc-300">
                                                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                                                        <span>{req}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                ))}

                {careers.length === 0 && (
                    <div className="text-center py-20 bg-gray-50 dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800">
                        <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold mb-2">No open positions</h3>
                        <p className="text-gray-500">We don't have any open roles right now, but check back soon!</p>
                    </div>
                )}
            </div>

            {/* Application Modal */}
            {applyingTo && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-zinc-900 w-full max-w-xl rounded-3xl border border-gray-200 dark:border-zinc-800 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
                        <div className="p-6 md:p-8">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold font-oswald uppercase">Apply for Role</h2>
                                    <p className="text-primary font-medium mt-1">{applyingTo.title}</p>
                                </div>
                                <button onClick={() => setApplyingTo(null)} className="p-2 bg-gray-100 dark:bg-zinc-800 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {success ? (
                                <div className="text-center py-10">
                                    <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle2 className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">Application Submitted!</h3>
                                    <p className="text-gray-500">Thank you for your interest. We will review your application and get back to you shortly.</p>
                                </div>
                            ) : (
                                <form onSubmit={submitApplication} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="col-span-2 md:col-span-1">
                                            <label className="block text-sm font-medium mb-1">Full Name *</label>
                                            <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors" placeholder="John Doe" />
                                        </div>
                                        <div className="col-span-2 md:col-span-1">
                                            <label className="block text-sm font-medium mb-1">Email *</label>
                                            <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors" placeholder="john@example.com" />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-sm font-medium mb-1">Phone Number *</label>
                                            <input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors" placeholder="+91 98765 43210" />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-sm font-medium mb-1">Resume / CV (PDF, DOCX) *</label>
                                            <input required type="file" accept=".pdf,.doc,.docx" onChange={e => setResumeFile(e.target.files ? e.target.files[0] : null)} className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer" />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-sm font-medium mb-1">Cover Letter / Note</label>
                                            <textarea rows={4} value={formData.coverLetter} onChange={e => setFormData({...formData, coverLetter: e.target.value})} className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors" placeholder="Tell us why you are a great fit..." />
                                        </div>
                                    </div>

                                    {error && (
                                        <div className="p-3 bg-red-100 text-red-600 rounded-lg text-sm">
                                            {error}
                                        </div>
                                    )}

                                    <Button type="submit" className="w-full mt-4" size="lg" disabled={loading}>
                                        {loading ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Submitting...</> : 'Submit Application'}
                                    </Button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
