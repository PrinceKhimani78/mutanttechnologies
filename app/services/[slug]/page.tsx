import { supabase } from '@/lib/supabase';
import ServiceDetailClient from '@/components/ServiceDetailClient';
import { notFound } from 'next/navigation';
import { Service } from '@/lib/types';

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

    return <ServiceDetailClient service={service as Service} />;
}
