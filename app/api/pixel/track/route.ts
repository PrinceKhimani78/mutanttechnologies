import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// We must handle CORS properly so any client domain can send tracking data
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
    return NextResponse.json({}, { 
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        } 
    });
}

export async function POST(request: Request) {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    try {
        const payload = await request.json();
        const { 
            client_id, 
            anonymous_id, 
            url, 
            referrer, 
            user_agent,
            event_type = 'pageview',
            email,
            metadata = {}
        } = payload;

        if (!client_id || !anonymous_id) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400, headers: corsHeaders });
        }

        // 1. Connect to Supabase
        const supabaseUrl = 'https://kvwvhytbatyfkcppwace.supabase.co';
        const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2d3ZoeXRiYXR5ZmtjcHB3YWNlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODAyMDg2MCwiZXhwIjoyMDgzNTk2ODYwfQ.5F1DRADaBBsX9OgsbInxvbFymjSQ7niJzHqDD6cKn08';
        const supabase = createClient(supabaseUrl, serviceRoleKey);

        // 2. IP and Location
        const forwardedFor = request.headers.get('x-forwarded-for');
        let ip = forwardedFor ? forwardedFor.split(',')[0] : request.headers.get('x-real-ip') || 'Unknown';
        if (ip === '::1' || ip === '127.0.0.1') ip = '8.8.8.8';

        let company_name = 'Unknown', city = 'Unknown', country = 'Unknown';
        if (ip !== 'Unknown') {
            try {
                const ipResponse = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,city,org`);
                const ipData = await ipResponse.json();
                if (ipData.status === 'success') {
                    company_name = ipData.org || 'Unknown';
                    city = ipData.city || 'Unknown';
                    country = ipData.country || 'Unknown';
                }
            } catch (e) {}
        }

        // 4. Calculate Intent Score Boost
        let scoreBoost = 0;
        if (event_type === 'pageview') scoreBoost = 1;
        if (event_type === 'click') scoreBoost = 5;
        if (event_type === 'identity') scoreBoost = 50;

        // 5. Use Stored Procedure for Atomic Tracking
        const { data: config, error: rpcError } = await supabase.rpc('track_visitor_event_v2', {
            p_client_id: client_id,
            p_anonymous_id: anonymous_id,
            p_ip_address: ip,
            p_company_name: company_name,
            p_city: city,
            p_country: country,
            p_email: email || null,
            p_url: url,
            p_referrer: referrer || '',
            p_user_agent: user_agent,
            p_event_type: event_type,
            p_metadata: metadata || {},
            p_score_boost: scoreBoost,
            p_utm_source: payload.utm_source || null,
            p_utm_medium: payload.utm_medium || null,
            p_utm_campaign: payload.utm_campaign || null,
            p_utm_term: payload.utm_term || null,
            p_utm_content: payload.utm_content || null
        });

        if (rpcError) {
            console.error("Tracking RPC Error:", rpcError);
            throw new Error(rpcError.message);
        }

        return NextResponse.json({ 
            success: true,
            config: config || {}
        }, { headers: corsHeaders });
    } catch (error: any) {
        console.error("Pixel Track Error:", error);
        return NextResponse.json({ 
            success: false, 
            error: error.message || 'Internal Server Error'
        }, { 
            status: 500,
            headers: { 'Access-Control-Allow-Origin': '*' }
        });
    }
}
