import { services } from '@/lib/data';
import ServiceDetailClient from '@/components/ServiceDetailClient';

// Required for Static Export
export function generateStaticParams() {
    return services.map((service) => ({
        slug: service.slug,
    }));
}

export default async function ServiceDetail({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    return <ServiceDetailClient slug={slug} />;
}
