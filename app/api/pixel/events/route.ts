import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const visitorId = searchParams.get('visitor_id');
    const authHeader = request.headers.get('Authorization');

    if (!visitorId) {
        return NextResponse.json({ error: 'visitor_id is required' }, { status: 400 });
    }

    if (!authHeader) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
        const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
        
        // Initialize Supabase with the user's JWT token so Row Level Security (RLS) applies
        const supabase = createClient(supabaseUrl, anonKey, {
            global: { headers: { Authorization: authHeader } }
        });

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
