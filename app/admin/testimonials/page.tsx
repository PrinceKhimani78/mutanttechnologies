'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, Star, Quote } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function TestimonialsAdmin() {
    const [testimonials, setTestimonials] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetchTestimonials();
    }, []);

    const fetchTestimonials = async () => {
        const { data, error } = await supabase
            .from('testimonials')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) console.error('Error fetching testimonials:', error);
        else setTestimonials(data || []);
        setLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this testimonial?')) return;

        const { error } = await supabase
            .from('testimonials')
            .delete()
            .eq('id', id);

        if (error) {
            alert('Error deleting testimonial');
            console.error(error);
        } else {
            fetchTestimonials();
        }
    };

    if (loading) return <div className="p-8">Loading testimonials...</div>;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold font-oswald text-dark-slate dark:text-white uppercase">
                            Testimonials
                        </h1>
                        <p className="text-gray-500">Manage client reviews and feedback</p>
                    </div>
                    <Link href="/admin/testimonials/create">
                        <Button className="gap-2">
                            <Plus className="w-4 h-4" /> Add Testimonial
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {testimonials.map((t) => (
                        <div key={t.id} className="bg-white dark:bg-zinc-800 p-6 rounded-xl border border-gray-200 dark:border-zinc-700 shadow-sm relative group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex gap-1">
                                    {[...Array(t.rating || 5)].map((_, i) => (
                                        <Star key={i} className="w-4 h-4 fill-orange-500 text-orange-500" />
                                    ))}
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Link href={`/admin/testimonials/edit?id=${t.id}`}>
                                        <Button variant="outline" size="icon" className="h-8 w-8">
                                            <Pencil className="w-4 h-4" />
                                        </Button>
                                    </Link>
                                    <Button
                                        variant="destructive"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => handleDelete(t.id)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>

                            <p className="text-gray-600 dark:text-zinc-300 italic mb-6 line-clamp-3">
                                "{t.quote}"
                            </p>

                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                    <Quote className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-dark-slate dark:text-white">{t.author}</h4>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider">{t.role}</p>
                                </div>
                            </div>
                        </div>
                    ))}

                    {testimonials.length === 0 && (
                        <div className="col-span-full py-20 text-center text-gray-400 bg-white dark:bg-zinc-800 rounded-xl border border-dashed border-gray-300 dark:border-zinc-700">
                            No testimonials found. Add one to get started.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
