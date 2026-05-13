import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
    const resend = new Resend(process.env.RESEND_API_KEY);
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

            if (visitorError) {
                summary.push({ client: client.company_name, success: false, reason: 'Database error fetching visitors' });
                continue;
            }
            if (!recentVisitors || recentVisitors.length === 0) {
                summary.push({ client: client.company_name, success: false, reason: 'No visitors in last 24h' });
                continue;
            }

            // 3. Get User Email
            const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(client.user_id);
            if (userError || !user?.email) {
                summary.push({ client: client.company_name, success: false, reason: 'User email not found or permission denied' });
                continue;
            }

            // 4. Send Email
            const visitorRows = recentVisitors.map(v => {
                const isHot = v.intent_score > 20;
                return `
                <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px; padding: 20px; margin-bottom: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                        <div style="flex: 1;">
                            <div style="font-size: 18px; font-weight: 800; color: #111827; margin-bottom: 4px; font-family: 'Outfit', sans-serif;">
                                ${v.company_name !== 'Unknown' ? v.company_name : 'Anonymous Visitor'}
                            </div>
                            <div style="font-size: 14px; color: #6b7280; margin-bottom: 12px; display: flex; align-items: center; gap: 4px;">
                                📍 ${v.city}, ${v.country}
                            </div>
                            ${v.email ? `
                            <div style="background: #eff6ff; color: #1d4ed8; padding: 6px 12px; border-radius: 8px; font-size: 13px; font-weight: 600; display: inline-block;">
                                📧 ${v.email}
                            </div>
                            ` : ''}
                        </div>
                        <div style="text-align: right; min-width: 100px;">
                            <div style="background: ${isHot ? 'linear-gradient(135deg, #f97316, #ea580c)' : '#f3f4f6'}; color: ${isHot ? '#ffffff' : '#6b7280'}; padding: 6px 12px; border-radius: 99px; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; display: inline-block; box-shadow: ${isHot ? '0 4px 12px rgba(234, 88, 12, 0.2)' : 'none'};">
                                ${isHot ? '🔥 Hot Lead' : 'Lead'}
                            </div>
                            <div style="font-size: 24px; font-weight: 800; color: #111827; margin-top: 8px;">
                                ${v.intent_score}<span style="font-size: 12px; color: #9ca3af; margin-left: 2px;">pts</span>
                            </div>
                        </div>
                    </div>
                </div>
                `;
            }).join('');

            const { data: emailData, error: emailError } = await resend.emails.send({
                from: 'Mutant Pixel <alerts@mutanttechnologies.com>',
                to: user.email,
                subject: `🔥 Daily Lead Digest: ${client.company_name}`,
                html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;800&display=swap" rel="stylesheet">
                    </head>
                    <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: 'Outfit', -apple-system, sans-serif;">
                        <div style="max-width: 600px; margin: 0 auto; background-color: #f3f4f6; padding: 40px 20px;">
                            <!-- Header -->
                            <div style="background: linear-gradient(135deg, #111827 0%, #1f2937 100%); border-radius: 24px 24px 0 0; padding: 48px 40px; text-align: center; position: relative; overflow: hidden;">
                                <div style="position: absolute; top: -50px; right: -50px; width: 150px; h-eight: 150px; background: #f97316; opacity: 0.1; filter: blur(40px); border-radius: 100%;"></div>
                                <div style="font-size: 12px; font-weight: 800; color: #f97316; text-transform: uppercase; letter-spacing: 3px; margin-bottom: 12px;">Marketing Command Center</div>
                                <h1 style="color: #ffffff; font-size: 32px; font-weight: 800; margin: 0; text-transform: uppercase; letter-spacing: -1px;">Daily Lead Digest</h1>
                                <p style="color: #9ca3af; font-size: 16px; margin-top: 12px; font-weight: 400;">Your top prospects for <strong>${client.company_name}</strong></p>
                            </div>

                            <!-- Content -->
                            <div style="background-color: #ffffff; border-radius: 0 0 24px 24px; padding: 32px 24px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; padding: 0 8px;">
                                    <span style="font-size: 14px; font-weight: 800; color: #374151; text-transform: uppercase; letter-spacing: 1px;">Leads Captured</span>
                                    <span style="font-size: 14px; font-weight: 600; color: #f97316;">Last 24 Hours</span>
                                </div>

                                ${visitorRows}

                                <div style="margin-top: 40px; text-align: center;">
                                    <a href="https://www.mutanttechnologies.com/pixel/dashboard" style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #ffffff; padding: 18px 36px; border-radius: 16px; text-decoration: none; font-weight: 800; font-size: 16px; display: inline-block; box-shadow: 0 10px 15px -3px rgba(234, 88, 12, 0.3); text-transform: uppercase; letter-spacing: 1px;">
                                        Enter Command Center
                                    </a>
                                    <p style="color: #9ca3af; font-size: 12px; margin-top: 24px; font-weight: 500;">
                                        You are receiving this because you use Mutant Pixel Intelligence.
                                    </p>
                                </div>
                            </div>

                            <!-- Footer -->
                            <div style="padding: 32px 0; text-align: center;">
                                <div style="font-size: 14px; font-weight: 800; color: #111827; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 8px;">Mutant Technologies</div>
                                <div style="font-size: 12px; color: #9ca3af; font-weight: 500;">&copy; ${new Date().getFullYear()} All Rights Reserved.</div>
                            </div>
                        </div>
                    </body>
                    </html>
                `
            });

            if (emailError) {
                summary.push({ client: client.company_name, success: false, reason: 'Resend Error: ' + emailError.message });
            } else {
                summary.push({ client: client.company_name, success: true, visitors: recentVisitors.length, email_id: emailData?.id });
            }
        }

        return NextResponse.json({ 
            success: true, 
            message: `Processed ${summary.length} reports.`,
            summary 
        });
    } catch (error: any) {
        console.error('Digest Cron Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
