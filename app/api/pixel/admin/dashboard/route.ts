import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const clientId = searchParams.get('client_id');
        
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

        if (!serviceRoleKey) {
            return NextResponse.json({ error: 'Service role key missing' }, { status: 500 });
        }

        // 1. Verify Authentication
        const authHeader = request.headers.get('Authorization');
        const token = authHeader?.split(' ')[1];
        
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabaseAuth = createClient(supabaseUrl, anonKey);
        const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token);

        if (authError || !user) {
            return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
        }

        // 2. Verify Admin Status
        const adminEmails = ['admin@mutant.tech', 'prince@mutant.tech', 'princekhimani@gmail.com', 'princekhimani186@gmail.com', 'princekhimani78@gmail.com', 'prince@mutanttechnologies.com'];
        if (!user.email || !adminEmails.includes(user.email)) {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

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
