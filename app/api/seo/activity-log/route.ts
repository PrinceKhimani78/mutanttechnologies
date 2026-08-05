import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { getRecentIndexingEvents } from '@/lib/indexingLog';

export async function GET(request: Request) {
    const { error } = await requireAdmin(request);
    if (error) return error;

    const events = await getRecentIndexingEvents(50);
    return NextResponse.json({ events });
}
