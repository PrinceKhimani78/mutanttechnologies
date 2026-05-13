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
        const supabaseUrl = 'https://kvwvhytbatyfkcppwace.supabase.co';
        const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2d3ZoeXRiYXR5ZmtjcHB3YWNlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODAyMDg2MCwiZXhwIjoyMDgzNTk2ODYwfQ.5F1DRADaBBsX9OgsbInxvbFymjSQ7niJzHqDD6cKn08';
        
        // 1. Verify User
        const token = authHeader.split(' ')[1];
        const supabaseAuth = createClient(supabaseUrl, serviceRoleKey);
        const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token);

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Check if user is Admin
        const adminEmails = ['admin@mutant.tech', 'prince@mutant.tech', 'princekhimani@gmail.com', 'princekhimani186@gmail.com', 'princekhimani78@gmail.com', 'prince@mutanttechnologies.com'];
        const isAdmin = user.email && adminEmails.includes(user.email);

        let supabaseToUse;
        if (isAdmin) {
            // Admin uses service role to see everything
            supabaseToUse = supabaseAuth;
        } else {
            // Regular client uses their own JWT (enforces RLS)
            supabaseToUse = createClient(supabaseUrl, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2d3ZoeXRiYXR5ZmtjcHB3YWNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwMjA4NjAsImV4cCI6MjA4MzU5Njg2MH0._cyx79QgRKSyH0aYyqmQBXBuSHW2JeItIxWJmCbLEN4', {
                global: { headers: { Authorization: authHeader } }
            });
        }

        const { data: events, error } = await supabaseToUse
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
