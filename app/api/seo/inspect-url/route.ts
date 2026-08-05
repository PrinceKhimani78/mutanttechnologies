import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { isGscConfigured, inspectUrl } from '@/lib/googleSearchConsole';
import { logIndexingEvent } from '@/lib/indexingLog';

export async function POST(request: Request) {
    const { user, error } = await requireAdmin(request);
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
        await logIndexingEvent({
            action: 'inspect',
            url,
            status: 'success',
            message: result.coverageState || result.verdict,
            triggeredBy: user?.email,
        });
        return NextResponse.json({ result, deepLink: result.inspectionResultLink });
    } catch (err) {
        console.error('URL inspection failed:', err);
        const message = (err as Error).message;
        await logIndexingEvent({ action: 'inspect', url, status: 'error', message, triggeredBy: user?.email });
        return NextResponse.json({ error: 'inspection_failed', message }, { status: 502 });
    }
}
