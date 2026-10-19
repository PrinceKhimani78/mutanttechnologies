import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

function getAdminSupabase() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    return createClient(supabaseUrl, serviceRoleKey);
}

// Helper to fetch and parse candidate applications from Resend emails
async function fetchResendApplications() {
    try {
        const apiKey = process.env.RESEND_API_KEY || process.env.Newemailkey;
        if (!apiKey) return [];

        const resend = new Resend(apiKey);
        const list = await resend.emails.list({ limit: 100 });
        const careerEmails = (list?.data?.data || []).filter(e => e.subject && e.subject.includes('New Application for'));

        const parsed = [];
        for (const item of careerEmails) {
            try {
                const detail = await resend.emails.get(item.id);
                const emailData = detail?.data;
                if (!emailData) continue;

                const text = emailData.text || '';
                const html = emailData.html || '';

                const subjectMatch = item.subject.match(/New Application for (.+) from (.+)/);
                const jobTitle = subjectMatch ? subjectMatch[1].trim() : 'General Application';
                const name = subjectMatch ? subjectMatch[2].trim() : 'Candidate';

                const phoneMatch = text.match(/Phone:\s*([^\n\r]+)/) || html.match(/<div class="label">Phone<\/div>\s*<div class="value">([^<]+)<\/div>/);
                const phone = phoneMatch ? phoneMatch[1].trim() : '';

                const resumeMatch = text.match(/Resume:\s*([^\n\r]+)/) || html.match(/href="([^"]+supabase[^"]+)"/);
                const resumeUrl = resumeMatch ? resumeMatch[1].trim() : '';

                let coverLetter = '';
                const coverMatch = text.match(/Cover Letter:\s*([\s\S]*)$/);
                if (coverMatch) {
                    coverLetter = coverMatch[1].trim();
                    if (coverLetter === 'None') coverLetter = '';
                } else {
                    const htmlCoverMatch = html.match(/<div class="label">Cover Letter \/ Additional Note<\/div>\s*<div class="value message-box">([\s\S]*?)<\/div>/);
                    if (htmlCoverMatch) {
                        coverLetter = htmlCoverMatch[1].replace(/<br\s*\/?>/gi, '\n').trim();
                    }
                }

                parsed.push({
                    id: item.id,
                    name,
                    email: (item.reply_to && item.reply_to[0]) || (emailData.reply_to && emailData.reply_to[0]) || '',
                    phone,
                    job_title: jobTitle,
                    resume_url: resumeUrl,
                    cover_letter: coverLetter,
                    status: 'new',
                    created_at: item.created_at || emailData.created_at,
                    source: 'resend'
                });
            } catch (err) {
                console.error('Error parsing single email:', item.id, err);
            }
        }
        return parsed;
    } catch (err) {
        console.error('Error fetching Resend emails:', err);
        return [];
    }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const forceSync = searchParams.get('sync') === 'true';

        const supabase = getAdminSupabase();
        
        // 1. Try querying Supabase career_applications table
        let dbApplications: any[] = [];
        let tableExists = true;

        const { data, error } = await supabase
            .from('career_applications')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.warn('career_applications table query warning:', error.message);
            tableExists = false;
        } else if (data) {
            dbApplications = data;
        }

        // 2. If DB table is empty, or table doesn't exist, or forceSync is requested:
        if (!tableExists || dbApplications.length === 0 || forceSync) {
            const resendApps = await fetchResendApplications();

            if (tableExists && resendApps.length > 0) {
                // Sync any missing candidates from Resend into Supabase table
                for (const app of resendApps) {
                    const exists = dbApplications.some(
                        dbApp => dbApp.email.toLowerCase() === app.email.toLowerCase() &&
                                 (dbApp.resume_url === app.resume_url || dbApp.job_title === app.job_title)
                    );

                    if (!exists) {
                        const { data: inserted } = await supabase
                            .from('career_applications')
                            .insert([{
                                job_title: app.job_title,
                                name: app.name,
                                email: app.email,
                                phone: app.phone || null,
                                resume_url: app.resume_url,
                                cover_letter: app.cover_letter || null,
                                status: 'new',
                                created_at: app.created_at
                            }])
                            .select()
                            .single();

                        if (inserted) {
                            dbApplications.push(inserted);
                        }
                    }
                }

                // Sort newest first
                dbApplications.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                return NextResponse.json({ success: true, applications: dbApplications, syncedCount: resendApps.length });
            }

            // If table doesn't exist yet, return the parsed Resend applications directly!
            if (!tableExists) {
                resendApps.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                return NextResponse.json({ 
                    success: true, 
                    applications: resendApps, 
                    notice: 'Using direct email records. Run migrations/create_career_applications.sql in Supabase to enable status & notes persistence.' 
                });
            }
        }

        return NextResponse.json({ success: true, applications: dbApplications });

    } catch (err: any) {
        console.error('Failed to get candidate applications:', err);
        return NextResponse.json({ success: false, error: err.message || 'Internal server error' }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const body = await request.json();
        const { id, status, notes } = body;

        if (!id) {
            return NextResponse.json({ success: false, error: 'Application ID is required' }, { status: 400 });
        }

        const supabase = getAdminSupabase();
        const updatePayload: any = {};
        if (status) updatePayload.status = status;
        if (notes !== undefined) updatePayload.notes = notes;

        const { data, error } = await supabase
            .from('career_applications')
            .update(updatePayload)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, application: data });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message || 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ success: false, error: 'Application ID is required' }, { status: 400 });
        }

        const supabase = getAdminSupabase();
        const { error } = await supabase
            .from('career_applications')
            .delete()
            .eq('id', id);

        if (error) {
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message || 'Internal server error' }, { status: 500 });
    }
}
