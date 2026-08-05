'use client';

import { supabase } from '@/lib/supabase';

/**
 * Fire-and-forget: tells Google to recrawl the sitemap after publishing new
 * content. Never throws - if Google Search Console isn't configured yet, or
 * the request fails, the actual save the caller just did is unaffected.
 */
export async function notifySitemapUpdate(): Promise<void> {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        await fetch('/api/seo/submit-sitemap', {
            method: 'POST',
            headers: { Authorization: `Bearer ${session.access_token}` },
        });
    } catch (err) {
        console.warn('Sitemap resubmission skipped:', err);
    }
}
