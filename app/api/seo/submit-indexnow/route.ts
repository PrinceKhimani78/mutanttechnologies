import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { isIndexNowConfigured, submitToIndexNow } from '@/lib/indexNow';
import { logIndexingEvent } from '@/lib/indexingLog';

export async function POST(request: Request) {
    const { user, error } = await requireAdmin(request);
    if (error) return error;

    if (!isIndexNowConfigured()) {
        return NextResponse.json({ error: 'not_configured', message: 'IndexNow is not configured.' }, { status: 501 });
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
        const result = await submitToIndexNow([url]);
        await logIndexingEvent({
            action: 'indexnow_submit',
            url,
            status: result.ok ? 'success' : 'error',
            message: result.message,
            triggeredBy: user?.email,
        });
        if (!result.ok) {
            return NextResponse.json({ error: 'submission_failed', message: result.message }, { status: 502 });
        }
        return NextResponse.json({ success: true, message: result.message });
    } catch (err) {
        console.error('IndexNow submission failed:', err);
        const message = (err as Error).message;
        await logIndexingEvent({ action: 'indexnow_submit', url, status: 'error', message, triggeredBy: user?.email });
        return NextResponse.json({ error: 'submission_failed', message }, { status: 502 });
    }
}
