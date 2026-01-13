'use client';

import OngoingProjectForm from '../form';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CreateOngoingProjectPage() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 p-8">
            <div className="max-w-4xl mx-auto">
                <Link href="/admin/ongoing" className="inline-block mb-6">
                    <Button variant="ghost" className="gap-2 pl-0 hover:pl-0 hover:bg-transparent text-gray-500 hover:text-primary">
                        <ArrowLeft className="w-4 h-4" /> Back to List
                    </Button>
                </Link>

                <h1 className="text-3xl font-bold font-oswald text-dark-slate dark:text-white uppercase mb-8">
                    Add <span className="text-primary">Ongoing Project</span>
                </h1>

                <OngoingProjectForm />
            </div>
        </div>
    );
}
