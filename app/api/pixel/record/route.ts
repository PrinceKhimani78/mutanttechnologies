import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Handle CORS properly
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
        const { client_id, anonymous_id, url, events } = payload;

        if (!client_id || !anonymous_id || !events || !Array.isArray(events)) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400, headers: corsHeaders });
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
        
        if (!supabaseUrl || !serviceRoleKey) {
            return NextResponse.json({ error: 'Database config missing' }, { status: 500, headers: corsHeaders });
        }

        const supabase = createClient(supabaseUrl, serviceRoleKey);

        // Store the recording segment
        const { error } = await supabase
            .from('pixel_session_recordings')
            .insert({
                client_id,
                anonymous_id,
                url,
                events // This will be stored as JSONB
            });

        if (error) {
            console.error("Recording Insert Error:", error);
            throw new Error(error.message);
        }

        return NextResponse.json({ success: true }, { status: 200, headers: corsHeaders });

    } catch (error) {
        console.error("Pixel Record Route Error:", error);
        return NextResponse.json(
            { error: 'Internal Server Error' }, 
            { status: 500, headers: corsHeaders }
        );
    }
}
