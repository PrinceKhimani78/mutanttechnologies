import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
    try {
        // Hardcoded keys as requested
        const supabaseUrl = 'https://kvwvhytbatyfkcppwace.supabase.co';
        const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2d3ZoeXRiYXR5ZmtjcHB3YWNlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODAyMDg2MCwiZXhwIjoyMDgzNTk2ODYwfQ.5F1DRADaBBsX9OgsbInxvbFymjSQ7niJzHqDD6cKn08';
        const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2d3ZoeXRiYXR5ZmtjcHB3YWNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwMjA4NjAsImV4cCI6MjA4MzU5Njg2MH0._cyx79QgRKSyH0aYyqmQBXBuSHW2JeItIxWJmCbLEN4';

        // 1. Verify Authentication
        const authHeader = request.headers.get('Authorization');
        const token = authHeader?.split(' ')[1];
        
        if (!token) {
            return NextResponse.json({ error: 'No token provided' }, { status: 401 });
        }

        const supabaseAuth = createClient(supabaseUrl, serviceRoleKey);
        const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token);

        if (authError || !user) {
            return NextResponse.json({ error: 'Auth failed', details: authError?.message }, { status: 401 });
        }

        // 2. Verify Admin Status
        const adminEmails = ['admin@mutant.tech', 'prince@mutant.tech', 'princekhimani@gmail.com', 'princekhimani186@gmail.com', 'princekhimani78@gmail.com', 'prince@mutanttechnologies.com'];
        if (!user.email || !adminEmails.includes(user.email)) {
            return NextResponse.json({ error: 'Forbidden', email: user.email }, { status: 403 });
        }

        const supabaseAdmin = supabaseAuth;

        const { data } = await supabaseAdmin
            .from('pixel_clients')
            .select('*')
            .order('created_at', { ascending: false });

        return NextResponse.json({ success: true, clients: data || [] });
    } catch (error: any) {
        console.error("Admin Clients Error:", error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
