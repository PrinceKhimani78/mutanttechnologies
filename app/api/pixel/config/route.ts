import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('client_id');

    if (!clientId) {
        return NextResponse.json({ error: 'client_id is required' }, { status: 400 });
    }

    try {
        // Use hardcoded keys for public config fetch
        const supabaseUrl = 'https://kvwvhytbatyfkcppwace.supabase.co';
        const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2d3ZoeXRiYXR5ZmtjcHB3YWNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwMjA4NjAsImV4cCI6MjA4MzU5Njg2MH0._cyx79QgRKSyH0aYyqmQBXBuSHW2JeItIxWJmCbLEN4';
        
        const supabase = createClient(supabaseUrl, anonKey);

        const { data, error } = await supabase
            .from('pixel_clients')
            .select('ga_id, meta_id, google_ads_id, tiktok_id')
            .eq('id', clientId)
            .single();

        if (error || !data) {
            return NextResponse.json({ success: false, error: 'Client not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            ga_id: data.ga_id,
            meta_id: data.meta_id,
            google_ads_id: data.google_ads_id,
            tiktok_id: data.tiktok_id
        });
    } catch (error) {
        console.error("Config Fetch Error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
