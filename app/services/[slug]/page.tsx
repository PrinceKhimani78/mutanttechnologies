import { supabase } from '@/lib/supabase';
import ServiceDetailClient from '@/components/ServiceDetailClient';
import { notFound } from 'next/navigation';
import { Service } from '@/lib/types';
import { Footer } from '@/components/Footer';

export const revalidate = 60; // Revalidate every 60 seconds

// Required for Static Export
export async function generateStaticParams() {
    try {
        const { data: services } = await supabase
            .from('services')
            .select('slug');

        if (services && services.length > 0) {
            return services.map((service) => ({
                slug: service.slug,
            }));
        }
    } catch (error) {
        console.error("Error generating static params for services:", error);
    }

    // Fallback if DB fetch fails (e.g. missing env vars during build)
    const fallbackSlugs = [
        'web-development', 'app-development', 'digital-marketing',
        'graphic-design', 'seo', 'geo', 'brand-identity',
        'cyber-security', 'ai-automations'
    ];

    return fallbackSlugs.map(slug => ({ slug }));
}

import { Metadata } from 'next';

// ... existing generateStaticParams ...

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;

    const { data: service } = await supabase
        .from('services')
        .select('*')
        .eq('slug', slug)
        .single();

    if (!service) {
        return {
            title: 'Service Not Found',
        };
    }

    return {
        title: `${service.title} | Services | Mutant Technologies`,
        description: service.short_description || service.description,
        openGraph: {
            title: service.title,
            description: service.short_description || service.description,
            type: 'website',
            images: [], // Add service image if available
        },
    };
}

export default async function ServiceDetail({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    const { data: service } = await supabase
        .from('services')
        .select('*')
        .eq('slug', slug)
        .single();

    if (!service) {
        notFound();
    }

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: service.title,
        description: service.short_description || service.description,
        provider: {
            '@type': 'Organization',
            name: 'Mutant Technologies',
            url: 'https://www.mutanttechnologies.com'
        },
        url: `https://www.mutanttechnologies.com/services/${service.slug}`,
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <ServiceDetailClient service={service as Service} />
            <Footer />
        </>
    );
}
