import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

export async function GET(request: Request) {
    // Security: Only allow verified cron services (e.g. Vercel Cron) to trigger this
    // You must add CRON_SECRET to your .env
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    // Initialize Resend inside the handler so it doesn't break Next.js build
    if (!process.env.RESEND_API_KEY) {
        console.error('RESEND_API_KEY is missing');
        return NextResponse.json({ error: 'RESEND_API_KEY is not configured.' }, { status: 500 });
    }
    const resend = new Resend(process.env.RESEND_API_KEY);

    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!serviceRoleKey) {
            return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY is required to fetch client emails.' }, { status: 500 });
        }

        const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

        // 1. Get all verified clients
        const { data: clients } = await supabaseAdmin
            .from('pixel_clients')
            .select(`
                id,
                company_name,
                user_id
            `)
            .eq('installation_status', 'verified');

        if (!clients || clients.length === 0) {
            return NextResponse.json({ success: true, message: 'No verified clients found' });
        }

        // Calculate 24 hours ago
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString();

        let emailsSent = 0;

        // 2. Loop through each client and send their digest
        for (const client of clients) {
            // Fetch user's email from Auth service
            const { data: user } = await supabaseAdmin.auth.admin.getUserById(client.user_id);
            const clientEmail = user?.user?.email;

            if (!clientEmail) continue;

            // Fetch top visitors from the last 24 hours
            const { data: visitors } = await supabaseAdmin
                .from('pixel_visitors')
                .select('*')
                .eq('client_id', client.id)
                .gte('last_visited_at', yesterdayStr)
                .order('last_visited_at', { ascending: false })
                .limit(5);

            if (visitors && visitors.length > 0) {
                // Construct the email HTML
                let html = `<h2 style="color: #111;">Daily Traffic Digest for ${client.company_name}</h2>`;
                html += `<p style="color: #444; font-size: 16px;">Here are the top companies that visited your website yesterday:</p>`;
                
                html += `<div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px;">`;
                visitors.forEach(v => {
                    const isReturnVisitor = v.first_visited_at !== v.last_visited_at;
                    const returnTag = isReturnVisitor ? `<span style="color: #16a34a; font-size: 12px; font-weight: bold;">(Return Visitor)</span>` : '';
                    html += `<div style="padding: 10px 0; border-bottom: 1px solid #eee;">
                                <strong style="font-size: 18px; color: #000;">${v.company_name}</strong> 
                                <span style="color: #666;">- ${v.city !== 'Unknown' ? v.city : ''} ${v.country !== 'Unknown' ? v.country : ''}</span> 
                                ${returnTag}
                             </div>`;
                });
                html += `</div>`;
                
                html += `<p style="margin-top: 20px;"><a href="https://mutanttechnologies.com/pixel" style="background-color: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold;">View Full Dashboard</a></p>`;

                await resend.emails.send({
                    from: 'Mutant Pixel <noreply@mutanttechnologies.com>',
                    to: clientEmail,
                    subject: `🔥 Daily Lead Digest: ${visitors.length} new companies visited your site`,
                    html: html
                });
                emailsSent++;
            }
        }

        return NextResponse.json({ success: true, emailsSent });
    } catch (error) {
        console.error("Cron Error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
