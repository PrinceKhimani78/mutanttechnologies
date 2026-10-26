import { supabase } from './supabase';
import { Metadata } from 'next';

export async function getMetadata(slug: string, defaults: Metadata = {}): Promise<Metadata> {
    try {
        const normalizedSlug = slug.startsWith('/') ? slug : `/${slug}`;
        const cleanSlug = slug.startsWith('/') ? slug.slice(1) : slug;
        const baseUrl = 'https://www.mutanttechnologies.com';
        const pageUrl = `${baseUrl}${normalizedSlug === '/' ? '' : normalizedSlug}`;

        const { data, error } = await supabase
            .from('page_metadata')
            .select('*')
            .or(`page_slug.eq."${slug}",page_slug.eq."${normalizedSlug}",page_slug.eq."${cleanSlug}"`)
            .limit(1)
            .maybeSingle();

        const siteName = 'Mutant Technologies';

        const cleanSiteTitle = (raw: string | null | undefined): { fullTitle: string; pureTitle: string } => {
            if (!raw) {
                return { fullTitle: 'Mutant Technologies - Shine Bright Online', pureTitle: siteName };
            }
            let pure = raw.trim();
            // Remove repeated "| Mutant Technologies" or "- Mutant Technologies" suffixes
            const pattern = new RegExp(`(\\s*[|\\-]\\s*${siteName})+$`, 'i');
            while (pattern.test(pure)) {
                pure = pure.replace(pattern, '').trim();
            }
            if (!pure || pure.toLowerCase() === siteName.toLowerCase()) {
                return { fullTitle: 'Mutant Technologies - Shine Bright Online', pureTitle: siteName };
            }
            // If the title already mentions siteName anywhere (e.g. "About Us - Mutant Technologies | Digital Innovation Experts"), don't append it again
            if (pure.toLowerCase().includes(siteName.toLowerCase())) {
                return {
                    fullTitle: pure,
                    pureTitle: pure,
                };
            }
            return {
                fullTitle: `${pure} | ${siteName}`,
                pureTitle: pure,
            };
        };

        const rawDefaultTitle = typeof defaults.title === 'string' 
            ? defaults.title 
            : (defaults.title as any)?.absolute || (defaults.title as any)?.default || '';

        if (error || !data) {
            const { fullTitle, pureTitle } = cleanSiteTitle(rawDefaultTitle);
            return {
                ...defaults,
                title: { absolute: fullTitle },
                description: defaults.description || 'We blend creativity and technology to boost your digital presence.',
                keywords: defaults.keywords,
                alternates: {
                    canonical: pageUrl,
                    ...defaults.alternates
                },
                openGraph: {
                    title: pureTitle || fullTitle,
                    url: pageUrl,
                    ...defaults.openGraph
                }
            };
        }

        const rawTitle = data.title || rawDefaultTitle;
        const { fullTitle, pureTitle } = cleanSiteTitle(rawTitle);

        const metadata: Metadata = {
            title: { absolute: fullTitle },
            description: data.description || defaults.description,
            keywords: data.keywords || defaults.keywords,
            alternates: {
                canonical: data.canonical_url || pageUrl,
            },
            openGraph: {
                title: data.og_title || pureTitle || fullTitle,
                description: data.og_description || data.description || defaults.description,
                url: pageUrl,
                images: data.og_image ? [{ url: data.og_image }] : (defaults.openGraph?.images || []),
                type: 'website',
                siteName: siteName,
            },
            twitter: {
                card: (data.twitter_card as any) || 'summary_large_image',
                title: data.og_title || pureTitle || fullTitle,
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
