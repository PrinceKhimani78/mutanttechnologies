import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
    try {
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

        const { data } = await supabaseAdmin
            .from('pixel_clients')
            .select('*')
            .order('created_at', { ascending: false });

        return NextResponse.json({ success: true, clients: data || [] });
    } catch (error: any) {
        console.error("Admin Clients Error:", error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
