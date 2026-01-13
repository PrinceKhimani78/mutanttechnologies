'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import ServiceForm from '../form';
import { Service } from '@/lib/types';

function EditServiceContent() {
    const searchParams = useSearchParams();
    const id = searchParams.get('id');
    const router = useRouter();
    const [service, setService] = useState<Service | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) fetchService(id);
    }, [id]);

    const fetchService = async (serviceId: string) => {
        const { data, error } = await supabase
            .from('services')
            .select('*')
            .eq('id', serviceId)
            .single();

        if (error) {
            console.error('Error fetching service:', error);
            router.push('/admin/services');
        } else {
            setService(data as Service);
        }
        setLoading(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!service) return <div>Service not found</div>;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 text-foreground">
            {/* Header */}
            <header className="bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 sticky top-0 z-10">
                <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/services" className="text-gray-500 hover:text-primary transition-colors">
                            <ArrowLeft className="w-6 h-6" />
                        </Link>
                        <h1 className="font-oswald text-2xl font-bold uppercase">Edit Service</h1>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="container mx-auto px-6 py-12">
                <ServiceForm initialData={service} isEditing={true} />
            </main>
        </div>
    );
}

export default function EditServicePage() {
    return (
        <Suspense fallback={<div className="p-10 text-center">Loading editor...</div>}>
            <EditServiceContent />
        </Suspense>
    );
}
