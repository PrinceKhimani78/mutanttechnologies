import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const clientId = searchParams.get('client_id');
        
        // Hardcoded keys as requested to bypass environment variable issues on live
        const supabaseUrl = 'https://kvwvhytbatyfkcppwace.supabase.co';
        const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2d3ZoeXRiYXR5ZmtjcHB3YWNlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODAyMDg2MCwiZXhwIjoyMDgzNTk2ODYwfQ.5F1DRADaBBsX9OgsbInxvbFymjSQ7niJzHqDD6cKn08';
        const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2d3ZoeXRiYXR5ZmtjcHB3YWNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwMjA4NjAsImV4cCI6MjA4MzU5Njg2MH0._cyx79QgRKSyH0aYyqmQBXBuSHW2JeItIxWJmCbLEN4';

        // 1. Verify Authentication
        const authHeader = request.headers.get('Authorization');
        const token = authHeader?.split(' ')[1];
        
        if (!token) {
            return NextResponse.json({ error: 'No token provided' }, { status: 401 });
        }

        // Use service role key to get user to be extra sure we bypass any RLS on the auth check itself
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

        const supabaseAdmin = supabaseAuth; // Already initialized with service role key

        // 1. Fetch total clients and client list
        const { count: clientsCount } = await supabaseAdmin
            .from('pixel_clients')
            .select('*', { count: 'exact', head: true });

        const { count: verifiedClients } = await supabaseAdmin
            .from('pixel_clients')
            .select('*', { count: 'exact', head: true })
            .eq('installation_status', 'verified');

        const { data: clientsData } = await supabaseAdmin
            .from('pixel_clients')
            .select('id, company_name')
            .order('company_name');

        // 2. Fetch visitors & traffic
        let visitorsQuery = supabaseAdmin.from('pixel_visitors').select('*', { count: 'exact', head: true });
        let trafficQuery = supabaseAdmin.from('pixel_visitors').select(`
            id,
            company_name,
            city,
            country,
            last_visited_at,
            pixel_clients ( company_name )
        `).order('last_visited_at', { ascending: false }).limit(20);

        if (clientId && clientId !== 'all') {
            visitorsQuery = visitorsQuery.eq('client_id', clientId);
            trafficQuery = trafficQuery.eq('client_id', clientId);
        }

        const { count: visitorsCount } = await visitorsQuery;
        const { data: trafficData } = await trafficQuery;

        return NextResponse.json({
            success: true,
            stats: {
                totalClients: clientsCount || 0,
                activeClients: verifiedClients || 0,
                totalVisitors: visitorsCount || 0
            },
            clients: clientsData || [],
            recentTraffic: trafficData || []
        });

    } catch (error: any) {
        console.error("Admin Dashboard Data Error:", error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
