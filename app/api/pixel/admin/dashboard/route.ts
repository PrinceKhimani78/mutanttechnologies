import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const clientId = searchParams.get('client_id');
        
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!serviceRoleKey) {
            return NextResponse.json({ error: 'Service role key missing' }, { status: 500 });
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
