import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
    try {
        const payload = await request.json();
        const { company_name, website_url, email, password } = payload;

        if (!company_name || !website_url || !email || !password) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!serviceRoleKey) {
            return NextResponse.json({ 
                error: 'SUPABASE_SERVICE_ROLE_KEY is not set in your .env.local. You need this key to programmatically create user accounts.' 
            }, { status: 500 });
        }

        const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });

        // 1. Create the user in auth.users
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email: email,
            password: password,
            email_confirm: true // Auto confirm so they don't need to click a link
        });

        if (authError || !authData.user) {
            return NextResponse.json({ error: authError?.message || 'Failed to create auth user' }, { status: 400 });
        }

        // 2. Create the pixel_clients record
        const { data: clientData, error: clientError } = await supabaseAdmin
            .from('pixel_clients')
            .insert({
                user_id: authData.user.id,
                company_name,
                website_url,
                installation_status: 'pending'
            })
            .select()
            .single();

        if (clientError) {
            // Rollback auth user creation if client record fails
            await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
            return NextResponse.json({ error: 'Failed to create client record: ' + clientError.message }, { status: 400 });
        }

        return NextResponse.json({ success: true, client: clientData });
    } catch (error: any) {
        console.error("Create Client Error:", error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
