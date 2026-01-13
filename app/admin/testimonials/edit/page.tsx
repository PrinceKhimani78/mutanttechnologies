'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import TestimonialForm from '../form';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

function EditTestimonialContent() {
    const searchParams = useSearchParams();
    const id = searchParams.get('id');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            const fetchTestimonial = async () => {
                const { data, error } = await supabase
                    .from('testimonials')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (data) setData(data);
                setLoading(false);
            };
            fetchTestimonial();
        }
    }, [id]);

    if (loading) return <div className="p-8 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
    if (!data) return <div className="p-8">Testimonial not found</div>;

    return (
        <div className="max-w-4xl mx-auto">
            <Link href="/admin/testimonials" className="inline-block mb-6">
                <Button variant="ghost" className="gap-2 pl-0 hover:pl-0 hover:bg-transparent text-gray-500 hover:text-primary">
                    <ArrowLeft className="w-4 h-4" /> Back to Testimonials
                </Button>
            </Link>

            <h1 className="text-3xl font-bold font-oswald text-dark-slate dark:text-white uppercase mb-8">
                Edit <span className="text-primary">Testimonial</span>
            </h1>

            <TestimonialForm initialData={data} />
        </div>
    );
}

export default function EditTestimonialPage() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 p-8">
            <Suspense fallback={<div>Loading...</div>}>
                <EditTestimonialContent />
            </Suspense>
        </div>
    );
}
