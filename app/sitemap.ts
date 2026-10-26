import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';

// Baseline fallback date for static pages when no database update timestamp exists.
// Keeps lastmod stable so Google Search Console only detects changes when content actually changes.
const STABLE_BASELINE_DATE = new Date('2026-02-06T09:41:31.000Z');

export const revalidate = 3600; // Revalidate every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.mutanttechnologies.com';

    // Fetch all content modification dates in parallel
    const [postsRes, servicesRes, metaRes, portfolioRes, careersRes] = await Promise.all([
        supabase
            .from('posts')
            .select('slug, created_at, updated_at')
            .eq('is_published', true),
        supabase
            .from('services')
            .select('slug, created_at'),
        supabase
            .from('page_metadata')
            .select('page_slug, created_at, updated_at'),
        supabase
            .from('portfolio')
            .select('created_at')
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle(),
        supabase
            .from('careers')
            .select('created_at')
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle(),
    ]);

    // Build lookup map from page_metadata for custom updated_at timestamps
    const metaMap = new Map<string, Date>();
    (metaRes.data || []).forEach((row: any) => {
        const rawDate = row.updated_at || row.created_at;
        if (rawDate) {
            const dateObj = new Date(rawDate);
            metaMap.set(row.page_slug, dateObj);
            metaMap.set(`/${row.page_slug}`, dateObj);
        }
    });

    const latestPostDate = (postsRes.data || []).reduce<Date | null>((latest, p: any) => {
        const d = new Date(p.updated_at || p.created_at);
        return !latest || d > latest ? d : latest;
    }, null);

    const latestServiceDate = (servicesRes.data || []).reduce<Date | null>((latest, s: any) => {
        const d = new Date(s.created_at);
        return !latest || d > latest ? d : latest;
    }, null);

    const latestPortfolioDate = portfolioRes.data?.created_at
        ? new Date(portfolioRes.data.created_at)
        : null;

    const latestCareersDate = careersRes.data?.created_at
        ? new Date(careersRes.data.created_at)
        : null;

    // 1. Static Core Routes with real change timestamps
    const staticRouteConfigs = [
        {
            route: '',
            priority: 1.0,
            changeFrequency: 'weekly' as const,
            lastModified: metaMap.get('home') || metaMap.get('/') || STABLE_BASELINE_DATE,
        },
        {
            route: '/about',
            priority: 0.8,
            changeFrequency: 'monthly' as const,
            lastModified: metaMap.get('about') || metaMap.get('/about') || STABLE_BASELINE_DATE,
        },
        {
            route: '/contact',
            priority: 0.8,
            changeFrequency: 'monthly' as const,
            lastModified: metaMap.get('contact') || metaMap.get('/contact') || STABLE_BASELINE_DATE,
        },
        {
            route: '/services',
            priority: 0.9,
            changeFrequency: 'weekly' as const,
            lastModified: metaMap.get('services') || metaMap.get('/services') || latestServiceDate || STABLE_BASELINE_DATE,
        },
        {
            route: '/portfolio',
            priority: 0.85,
            changeFrequency: 'weekly' as const,
            lastModified: latestPortfolioDate || metaMap.get('portfolio') || STABLE_BASELINE_DATE,
        },
        {
            route: '/blog',
            priority: 0.8,
            changeFrequency: 'daily' as const,
            lastModified: latestPostDate || metaMap.get('blog') || STABLE_BASELINE_DATE,
        },
        {
            route: '/careers',
            priority: 0.7,
            changeFrequency: 'monthly' as const,
            lastModified: latestCareersDate || metaMap.get('careers') || STABLE_BASELINE_DATE,
        },
    ];

    const staticPages: MetadataRoute.Sitemap = staticRouteConfigs.map((config) => ({
        url: `${baseUrl}${config.route}`,
        lastModified: config.lastModified,
        changeFrequency: config.changeFrequency,
        priority: config.priority,
    }));

    // 2. Blog Posts with individual real modification dates
    const blogPages: MetadataRoute.Sitemap = (postsRes.data || []).map((post: any) => ({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: new Date(post.updated_at || post.created_at),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }));

    // 3. Service Detail Pages with actual service modification dates
    const servicePages: MetadataRoute.Sitemap = (servicesRes.data || []).map((service: any) => {
        const metaDate = metaMap.get(`/services/${service.slug}`) || metaMap.get(`services/${service.slug}`);
        return {
            url: `${baseUrl}/services/${service.slug}`,
            lastModified: metaDate || new Date(service.created_at),
            changeFrequency: 'monthly' as const,
            priority: 0.9,
        };
    });

    // 4. Builder.io CMS pages (if configured)
    let builderPages: MetadataRoute.Sitemap = [];
    try {
        const knownPaths = new Set([
            ...staticPages.map((p) => p.url),
            ...blogPages.map((p) => p.url),
            ...servicePages.map((p) => p.url),
        ]);

        const builderApiKey = process.env.NEXT_PUBLIC_BUILDER_API_KEY;
        if (builderApiKey) {
            const { builder } = await import('@builder.io/sdk');
            builder.init(builderApiKey);

            const pages = await builder.getAll('page', {
                options: { noTargeting: true },
                apiKey: builderApiKey,
            });

            builderPages = (pages || [])
                .map((page: any) => ({
                    url: page?.data?.url ? `${baseUrl}${page.data.url}` : null,
                    lastModified: page?.lastModified ? new Date(page.lastModified) : STABLE_BASELINE_DATE,
                }))
                .filter((item): item is { url: string; lastModified: Date } => !!item.url && !knownPaths.has(item.url))
                .map((item) => ({
                    url: item.url,
                    lastModified: item.lastModified,
                    changeFrequency: 'weekly' as const,
                    priority: 0.6,
                }));
        }
    } catch (error) {
        console.error('Error fetching Builder.io pages for sitemap:', error);
    }

    return [...staticPages, ...blogPages, ...servicePages, ...builderPages];
}
