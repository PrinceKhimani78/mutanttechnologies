import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const visitorId = searchParams.get('visitor_id');

    if (!visitorId) {
        return NextResponse.json({ error: 'visitor_id is required' }, { status: 400 });
    }

    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
        const supabase = createClient(supabaseUrl, serviceRoleKey);

        const { data: events, error } = await supabase
            .from('pixel_events')
            .select('*')
            .eq('visitor_id', visitorId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json({ success: true, events });
    } catch (error) {
        console.error("Fetch Events Error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
