import { supabase } from './supabase';
import { Metadata } from 'next';

export async function getMetadata(slug: string, defaults: Metadata = {}): Promise<Metadata> {
    try {
        const { data, error } = await supabase
            .from('page_metadata')
            .select('*')
            .eq('page_slug', slug)
            .single();

        if (error || !data) {
            return {
                title: defaults.title || 'Mutant Technologies - Shine Bright Online',
                description: defaults.description || 'We blend creativity and technology to boost your digital presence.',
                ...defaults
            };
        }

        const siteName = 'Mutant Technologies';
        const pageTitle = data.title || defaults.title;
        // Clean up title: if pageTitle already contains siteName, don't append it in a way that repeats
        const fullTitle = pageTitle.includes(siteName) ? pageTitle : `${pageTitle} | ${siteName}`;

        const metadata: Metadata = {
            title: fullTitle,
            description: data.description || defaults.description,
            alternates: {
                canonical: data.canonical_url || `https://www.mutanttechnologies.com${slug === '/' ? '' : slug}`,
            },
            openGraph: {
                title: data.og_title || pageTitle,
                description: data.og_description || data.description || defaults.description,
                url: `https://www.mutanttechnologies.com${slug === '/' ? '' : slug}`,
                images: data.og_image ? [{ url: data.og_image }] : (defaults.openGraph?.images || []),
                type: 'website',
                siteName: siteName,
            },
            twitter: {
                card: (data.twitter_card as any) || 'summary_large_image',
                title: data.og_title || pageTitle,
                description: data.og_description || data.description || defaults.description,
                images: data.twitter_image ? [data.twitter_image] : (defaults.twitter?.images || []),
            },
            robots: data.robots || 'index, follow',
        };

        return metadata;
    } catch (e) {
        console.error('Error fetching dynamic metadata:', e);
        return defaults;
    }
}
