'use client';

import { Suspense } from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import ServiceForm from '../form';

export default function CreateServicePage() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 text-foreground">
            {/* Header */}
            <header className="bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 sticky top-0 z-10">
                <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/services" className="text-gray-500 hover:text-primary transition-colors">
                            <ArrowLeft className="w-6 h-6" />
                        </Link>
                        <h1 className="font-oswald text-2xl font-bold uppercase">Create New Service</h1>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="container mx-auto px-6 py-12">
                <ServiceForm />
            </main>
        </div>
    );
}
