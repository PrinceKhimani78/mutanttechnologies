import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// We must handle CORS properly so any client domain can send tracking data
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS(request: Request) {
    const origin = request.headers.get('origin') || '*';
    return NextResponse.json({}, { 
        headers: {
            'Access-Control-Allow-Origin': origin,
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Allow-Credentials': 'true',
        } 
    });
}

export async function POST(request: Request) {
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

        const { data: client } = await supabase
            .from('pixel_clients')
            .select('website_url')
            .eq('id', client_id)
            .single();

        if (!client) {
            return NextResponse.json({ error: 'Invalid client ID' }, { status: 400, headers: corsHeaders });
        }

        // Domain Strictness Check
        const requestOrigin = request.headers.get('origin') || '';
        const requestReferer = request.headers.get('referer') || '';
        const isLocal = requestOrigin.includes('localhost') || requestOrigin.includes('127.0.0.1') || requestReferer.includes('localhost');
        const clientDomain = client.website_url.replace(/^https?:\/\//, '').replace(/\/$/, '');

        // Only block if we have a valid domain to check against AND we are not on localhost
        if (!isLocal && clientDomain) {
            // More permissive check: if either matches, we allow it. 
            // If both are missing, we log it but allow for now to prevent tracking loss due to browser privacy settings.
            const originMatch = requestOrigin && requestOrigin.includes(clientDomain);
            const refererMatch = requestReferer && requestReferer.includes(clientDomain);
            
            if ((requestOrigin || requestReferer) && !originMatch && !refererMatch) {
                console.warn(`Blocked unauthorized tracking attempt for ${clientDomain} from Origin: ${requestOrigin}, Referer: ${requestReferer}`);
                return NextResponse.json({ error: 'Unauthorized Origin' }, { status: 403, headers: corsHeaders });
            }
        }

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

        // 3. Extract UTMs
        const { utm_source, utm_medium, utm_campaign, utm_term, utm_content } = payload;

        // 4. Intent Scoring Logic
        let scoreBoost = 0;
        if (event_type === 'pageview') scoreBoost = 1;
        if (event_type === 'click') scoreBoost = 5;
        if (event_type === 'identity') scoreBoost = 50;

        // 5. Handle Visitor Logic
        const { data: existingVisitor } = await supabase
            .from('pixel_visitors')
            .select('id, intent_score, first_utm_source')
            .eq('client_id', client_id)
            .eq('anonymous_id', anonymous_id)
            .single();

        let visitorId = null;

        if (existingVisitor) {
            visitorId = existingVisitor.id;
            const updateData: any = { 
                last_visited_at: new Date().toISOString(),
                intent_score: (existingVisitor.intent_score || 0) + scoreBoost,
                last_utm_source: utm_source || undefined,
                ip_address: ip,
                company_name, city, country
            };
            if (email) updateData.email = email;
            if (!existingVisitor.first_utm_source && utm_source) updateData.first_utm_source = utm_source;
            
            await supabase.from('pixel_visitors').update(updateData).eq('id', visitorId);
        } else {
            const insertData: any = {
                client_id, anonymous_id, ip_address: ip, company_name, city, country,
                intent_score: scoreBoost,
                first_utm_source: utm_source || undefined,
                last_utm_source: utm_source || undefined
            };
            if (email) insertData.email = email;
            const { data: newV } = await supabase.from('pixel_visitors').insert(insertData).select('id').single();
            if (newV) visitorId = newV.id;
        }

        // 6. Insert Event with UTMs
        if (visitorId) {
            await supabase
                .from('pixel_events')
                .insert({
                    client_id, visitor_id: visitorId, url, referrer, user_agent, event_type, metadata,
                    utm_source, utm_medium, utm_campaign, utm_term, utm_content
                });
        }

        const origin = request.headers.get('origin') || '*';
        const dynamicCorsHeaders = {
            'Access-Control-Allow-Origin': origin,
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Allow-Credentials': 'true',
        };

        return NextResponse.json({ success: true }, { headers: dynamicCorsHeaders });
    } catch (error) {
        console.error("Pixel Track Error:", error);
        const origin = request.headers.get('origin') || '*';
        return NextResponse.json({ error: 'Internal Server Error' }, { 
            status: 500, 
            headers: {
                'Access-Control-Allow-Origin': origin,
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                'Access-Control-Allow-Credentials': 'true',
            } 
        });
    }
}
