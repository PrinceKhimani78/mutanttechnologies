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

        // 1. Get the IP Address
        const forwardedFor = request.headers.get('x-forwarded-for');
        let ip = forwardedFor ? forwardedFor.split(',')[0] : request.headers.get('x-real-ip') || 'Unknown';
        
        // Handle local dev IPs
        if (ip === '::1' || ip === '127.0.0.1') {
            ip = '8.8.8.8'; // Mock Google IP for local testing
        }

        // 2. Fetch Company Name using Free IP-API
        let company_name = 'Unknown';
        let city = 'Unknown';
        let country = 'Unknown';

        if (ip !== 'Unknown') {
            try {
                // Using http because ip-api free tier is http only
                const ipResponse = await fetch(`http://ip-api.com/json/${ip}?fields=status,message,country,city,org`);
                const ipData = await ipResponse.json();
                
                if (ipData.status === 'success') {
                    company_name = ipData.org || 'Unknown';
                    city = ipData.city || 'Unknown';
                    country = ipData.country || 'Unknown';
                }
            } catch (error) {
                console.error("IP Lookup failed:", error);
            }
        }

        // 3. Connect to Supabase
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
        const supabase = createClient(supabaseUrl, supabaseKey);

        // 4. Check if visitor exists
        const { data: existingVisitor } = await supabase
            .from('pixel_visitors')
            .select('id, email')
            .eq('client_id', client_id)
            .eq('anonymous_id', anonymous_id)
            .single();

        let visitorId = null;

        if (existingVisitor) {
            visitorId = existingVisitor.id;
            
            // Prepare update data
            const updateData: any = { 
                last_visited_at: new Date().toISOString(),
                ip_address: ip,
                company_name,
                city,
                country
            };
            
            // Only update email if we don't have it yet, or if a new one is provided
            if (email) updateData.email = email;
            
            await supabase
                .from('pixel_visitors')
                .update(updateData)
                .eq('id', visitorId);
        } else {
            // Create new visitor
            const insertData: any = {
                client_id,
                anonymous_id,
                ip_address: ip,
                company_name,
                city,
                country
            };
            if (email) insertData.email = email;

            const { data: newVisitor, error: visitorError } = await supabase
                .from('pixel_visitors')
                .insert(insertData)
                .select('id')
                .single();
                
            if (visitorError) {
                console.error("Error creating visitor:", visitorError);
            } else if (newVisitor) {
                visitorId = newVisitor.id;
            }
        }

        // 5. Insert the Event
        if (visitorId) {
            await supabase
                .from('pixel_events')
                .insert({
                    client_id,
                    visitor_id: visitorId,
                    url,
                    referrer,
                    user_agent,
                    event_type,
                    metadata
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
