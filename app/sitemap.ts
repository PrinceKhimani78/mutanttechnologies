import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';

// Static routes for your application
const staticRoutes = [
    '',
    '/about',
    '/contact',
    '/portfolio',
    '/services',
    '/blog',
];

export const revalidate = 3600; // Revalidate every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.mutanttechnologies.com'; // Fallback URL

    // 1. Generate URLs for static routes
    const staticPages = staticRoutes.map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: route === '' ? 1.0 : 0.8,
    }));

    // 2. Fetch Blog Posts from Supabase
    let blogPages: MetadataRoute.Sitemap = [];
    try {
        const { data: posts } = await supabase
            .from('posts')
            .select('slug, created_at') // Using created_at as we don't have updated_at yet in types, but DB likely has it. Safest to use what we know exists or mapped.
            .eq('is_published', true);

        if (posts) {
            blogPages = posts.map((post) => ({
                url: `${baseUrl}/blog/${post.slug}`,
                lastModified: new Date(post.created_at), // timestamp with time zone
                changeFrequency: 'weekly' as const,
                priority: 0.7,
            }));
        }
    } catch (error) {
        console.error("Error fetching blog posts for sitemap:", error);
    }

    // 3. Fetch Services from Supabase
    let servicePages: MetadataRoute.Sitemap = [];
    try {
        const { data: services } = await supabase
            .from('services')
            .select('slug, created_at');

        if (services) {
            servicePages = services.map((service) => ({
                url: `${baseUrl}/services/${service.slug}`,
                lastModified: new Date(service.created_at),
                changeFrequency: 'monthly' as const,
                priority: 0.9,
            }));
        }
    } catch (error) {
        console.error("Error fetching services for sitemap:", error);
    }

    return [...staticPages, ...blogPages, ...servicePages];
}
