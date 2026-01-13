'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Service } from '@/lib/types';

export default function ServicesList() {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        const { data, error } = await supabase
            .from('services')
            .select('*')
            .order('id');

        if (error) {
            console.error('Error fetching services:', error);
        } else {
            setServices((data || []) as Service[]);
        }
        setLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this service?')) return;

        const { error } = await supabase.from('services').delete().eq('id', id);
        if (error) {
            alert('Error deleting service');
        } else {
            fetchServices();
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
            {/* Header */}
            <header className="bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 sticky top-0 z-10">
                <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/dashboard" className="text-gray-500 hover:text-primary transition-colors">
                            <ArrowLeft className="w-6 h-6" />
                        </Link>
                        <h1 className="font-oswald text-2xl font-bold uppercase">Services Manager</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button href="/admin/services/create">
                            <Plus className="w-4 h-4 mr-2" /> Add Service
                        </Button>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="container mx-auto px-6 py-12 max-w-5xl">
                <div className="grid gap-4">
                    {services.map((service) => (
                        <div key={service.id} className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-gray-200 dark:border-zinc-800 flex items-center justify-between group hover:border-primary/30 transition-colors">
                            <div>
                                <h3 className="text-xl font-bold">{service.title}</h3>
                                <p className="text-sm text-gray-500 font-mono">/{service.slug}</p>
                            </div>
                            <div className="flex gap-3">
                                <Button href={`/admin/services/edit?id=${service.id}`} variant="outline" size="sm">
                                    <Edit className="w-4 h-4 mr-2" /> Edit
                                </Button>
                                <Button onClick={() => handleDelete(service.id)} variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10">
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    ))}

                    {services.length === 0 && (
                        <div className="text-center py-10 text-gray-500">
                            No services found. Add your first service!
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
