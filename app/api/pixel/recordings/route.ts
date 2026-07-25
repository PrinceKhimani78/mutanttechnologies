import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const visitor_id = searchParams.get('visitor_id');
        
        if (!visitor_id) {
            return NextResponse.json({ success: false, error: 'Missing visitor_id' }, { status: 400 });
        }

        // Verify authentication
        const headersList = await headers();
        const authorization = headersList.get('authorization');
        
        if (!authorization) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
        const supabase = createClient(supabaseUrl, serviceRoleKey);

        const token = authorization.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);
        
        if (authError || !user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        // Get the visitor to find their anonymous_id
        const { data: visitor } = await supabase
            .from('pixel_visitors')
            .select('anonymous_id, client_id')
            .eq('id', visitor_id)
            .single();

        if (!visitor) {
            return NextResponse.json({ success: false, error: 'Visitor not found' }, { status: 404 });
        }

        // Fetch all recording blocks for this user
        const { data: recordings, error } = await supabase
            .from('pixel_session_recordings')
            .select('*')
            .eq('anonymous_id', visitor.anonymous_id)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching recordings:', error);
            return NextResponse.json({ success: false, error: 'Failed to fetch recordings' }, { status: 500 });
        }

        // Combine the events arrays from all recording rows
        // rrweb expects a flat array of events
        let allEvents: any[] = [];
        if (recordings && recordings.length > 0) {
            recordings.forEach((recording) => {
                if (recording.events && Array.isArray(recording.events)) {
                    allEvents = [...allEvents, ...recording.events];
                }
            });
        }

        return NextResponse.json({ 
            success: true, 
            events: allEvents,
            total_sessions: recordings?.length || 0
        });
        
    } catch (error) {
        console.error('Recordings API Error:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
