import { Metadata } from 'next';
import { Suspense } from 'react';
import ClinicFunnelsClient from '@/components/ClinicFunnelsClient';

// Outreach-only landing page: kept strictly out of search engines and sitemaps
export const metadata: Metadata = {
    title: 'Promo Funnels for Clinics, Live in 48 Hours',
    description: 'We build the landing page, booking form, text and email follow-up, and A2P 10DLC registration for clinics, medspas, and aesthetic practices. Live in 48 hours.',
    robots: {
        index: false,
        follow: false,
        nocache: true,
        googleBot: {
            index: false,
            follow: false,
            noimageindex: true,
        },
    },
};

interface PageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

function ClinicFunnelsLoading() {
    return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center text-white">
            <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );
}

export default async function ClinicFunnelsPage({ searchParams }: PageProps) {
    const sp = await searchParams;
    const initialSegment = typeof sp.s === 'string' ? sp.s : '';
    const initialClinic = typeof sp.c === 'string' ? sp.c : '';

    return (
        <Suspense fallback={<ClinicFunnelsLoading />}>
            <ClinicFunnelsClient
                initialSegment={initialSegment}
                initialClinic={initialClinic}
            />
        </Suspense>
    );
}

