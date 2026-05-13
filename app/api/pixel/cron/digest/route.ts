import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
    // Security check for cron (can use a secret header)
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // 1. Fetch all clients who have verified installation
        const { data: clients, error: clientError } = await supabase
            .from('pixel_clients')
            .select('id, company_name, user_id')
            .eq('installation_status', 'verified');

        if (clientError) throw clientError;

        const summary = [];

        for (const client of clients) {
            // 2. Fetch visitors from last 24 hours
            const yesterday = new Date();
            yesterday.setHours(yesterday.getHours() - 24);

            const { data: recentVisitors, error: visitorError } = await supabase
                .from('pixel_visitors')
                .select('*')
                .eq('client_id', client.id)
                .gte('last_visited_at', yesterday.toISOString())
                .order('intent_score', { ascending: false })
                .limit(5);

            if (visitorError) continue;
            if (!recentVisitors || recentVisitors.length === 0) continue;

            // 3. Get User Email
            const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(client.user_id);
            if (userError || !user?.email) continue;

            // 4. Send Email
            const visitorRows = recentVisitors.map(v => `
                <div style="padding: 15px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <div style="font-weight: bold; color: #111;">${v.company_name !== 'Unknown' ? v.company_name : 'Anonymous Visitor'}</div>
                        <div style="font-size: 12px; color: #666;">${v.city}, ${v.country} • ${v.email || 'No email captured'}</div>
                    </div>
                    <div style="background: #ffedd5; color: #ea580c; padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: bold;">
                        ${v.intent_score} Intent
                    </div>
                </div>
            `).join('');

            await resend.emails.send({
                from: 'Mutant Pixel <alerts@mutanttechnologies.com>',
                to: user.email,
                subject: `🔥 Daily Lead Digest: ${client.company_name}`,
                html: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 12px; overflow: hidden;">
                        <div style="background: #111; color: white; padding: 30px; text-align: center;">
                            <h1 style="margin: 0; font-size: 24px; text-transform: uppercase;">Daily Lead Digest</h1>
                            <p style="margin: 5px 0 0; opacity: 0.7;">Your top prospects from the last 24 hours</p>
                        </div>
                        <div style="padding: 20px;">
                            <h2 style="font-size: 16px; color: #666; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 15px;">Hot Leads Today</h2>
                            ${visitorRows}
                            <div style="margin-top: 30px; text-align: center;">
                                <a href="https://www.mutanttechnologies.com/pixel/dashboard" style="background: #ea580c; color: white; padding: 12px 25px; border-radius: 30px; text-decoration: none; font-weight: bold; font-size: 14px;">View Full Dashboard</a>
                            </div>
                        </div>
                        <div style="background: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #999;">
                            &copy; ${new Date().getFullYear()} Mutant Technologies. All rights reserved.
                        </div>
                    </div>
                `
            });

            summary.push({ client: client.company_name, visitors: recentVisitors.length });
        }

        return NextResponse.json({ success: true, summary });
    } catch (error: any) {
        console.error('Digest Cron Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
