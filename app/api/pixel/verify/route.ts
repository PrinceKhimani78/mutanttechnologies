import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
    try {
        const payload = await request.json();
        const { client_id } = payload;

        if (!client_id) {
            return NextResponse.json({ error: 'Missing client_id' }, { status: 400 });
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
        const supabase = createClient(supabaseUrl, supabaseKey);

        // 1. Get the client's website URL
        const { data: client, error } = await supabase
            .from('pixel_clients')
            .select('website_url')
            .eq('id', client_id)
            .single();

        if (error || !client || !client.website_url) {
            return NextResponse.json({ error: 'Client or website URL not found' }, { status: 404 });
        }

        let urlToFetch = client.website_url;
        if (!urlToFetch.startsWith('http')) {
            urlToFetch = `https://${urlToFetch}`;
        }

        // TEMPORARY: For local testing, force the verifier to check localhost
        if (process.env.NODE_ENV === 'development') {
            urlToFetch = 'http://localhost:3000';
        }

        // 2. Fetch the HTML
        let htmlText = '';
        try {
            const res = await fetch(urlToFetch, { headers: { 'User-Agent': 'Mutant-Pixel-Verifier/1.0' } });
            htmlText = await res.text();
        } catch (fetchError) {
            return NextResponse.json({ error: `Could not fetch website: ${urlToFetch}` }, { status: 400 });
        }

        // 3. Look for the script and the correct client ID
        const hasScript = htmlText.includes('mutant-pixel.js');
        const hasClientId = htmlText.includes(client_id);

        if (hasScript && hasClientId) {
            // 4. Verification successful, update status
            await supabase
                .from('pixel_clients')
                .update({ installation_status: 'verified' })
                .eq('id', client_id);

            return NextResponse.json({ success: true, message: 'Installation verified!' });
        } else {
            return NextResponse.json({ success: false, error: 'Could not find the script or correct client ID on the homepage.' }, { status: 400 });
        }

    } catch (error) {
        console.error("Pixel Verification Error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
