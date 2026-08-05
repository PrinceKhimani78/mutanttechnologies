import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { isGscConfigured, submitSitemap } from '@/lib/googleSearchConsole';

const SITE_URL = 'https://www.mutanttechnologies.com';

export async function POST(request: Request) {
    const { error } = await requireAdmin(request);
    if (error) return error;

    if (!isGscConfigured()) {
        return NextResponse.json(
            { error: 'not_configured', message: 'Google Search Console credentials are not set up yet.' },
            { status: 501 }
        );
    }

    try {
        await submitSitemap(`${SITE_URL}/sitemap.xml`);
        return NextResponse.json({ success: true, submittedAt: new Date().toISOString() });
    } catch (err) {
        console.error('Sitemap submission failed:', err);
        return NextResponse.json({ error: 'submission_failed', message: (err as Error).message }, { status: 502 });
    }
}
