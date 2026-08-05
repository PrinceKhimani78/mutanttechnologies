import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { isGscConfigured, inspectUrl, inspectUrlDeepLink } from '@/lib/googleSearchConsole';

export async function POST(request: Request) {
    const { error } = await requireAdmin(request);
    if (error) return error;

    if (!isGscConfigured()) {
        return NextResponse.json(
            { error: 'not_configured', message: 'Google Search Console credentials are not set up yet.' },
            { status: 501 }
        );
    }

    let url: string | undefined;
    try {
        ({ url } = await request.json());
    } catch {
        return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
    }

    if (!url || typeof url !== 'string') {
        return NextResponse.json({ error: 'missing_url' }, { status: 400 });
    }

    try {
        const result = await inspectUrl(url);
        return NextResponse.json({ result, deepLink: inspectUrlDeepLink(url) });
    } catch (err) {
        console.error('URL inspection failed:', err);
        return NextResponse.json({ error: 'inspection_failed', message: (err as Error).message }, { status: 502 });
    }
}
