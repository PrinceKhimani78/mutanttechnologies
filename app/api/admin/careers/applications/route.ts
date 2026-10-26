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
                    notes: '',
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

// Helper to read persistent candidate metadata from site_settings (ensures persistence across refresh/logout)
async function getCandidateStatusStore(supabase: any): Promise<Record<string, { status?: string; notes?: string; updated_at?: string }>> {
    try {
        const { data, error } = await supabase
            .from('site_settings')
            .select('value')
            .eq('key', 'career_applicants_status_store')
            .maybeSingle();

        if (data?.value) {
            return typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
        }
    } catch (err) {
        console.warn('Error reading career_applicants_status_store from site_settings:', err);
    }
    return {};
}

// Helper to save persistent candidate metadata to site_settings
async function saveCandidateStatusStore(supabase: any, store: Record<string, any>) {
    try {
        await supabase.from('site_settings').upsert({
            key: 'career_applicants_status_store',
            value: JSON.stringify(store),
            label: 'Career Applicants Status Store',
            description: 'Persistent status and notes for career applicants across refreshes and logins'
        }, { onConflict: 'key' });
    } catch (err) {
        console.error('Error saving career_applicants_status_store to site_settings:', err);
    }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const forceSync = searchParams.get('sync') === 'true';

        const supabase = getAdminSupabase();
        const statusStore = await getCandidateStatusStore(supabase);
        
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
                        const savedMeta = statusStore[app.id] || (app.email ? statusStore[app.email.toLowerCase()] : null);
                        const initialStatus = savedMeta?.status || 'new';
                        const initialNotes = savedMeta?.notes || null;

                        const { data: inserted } = await supabase
                            .from('career_applications')
                            .insert([{
                                job_title: app.job_title,
                                name: app.name,
                                email: app.email,
                                phone: app.phone || null,
                                resume_url: app.resume_url,
                                cover_letter: app.cover_letter || null,
                                status: initialStatus,
                                notes: initialNotes,
                                created_at: app.created_at
                            }])
                            .select()
                            .single();

                        if (inserted) {
                            dbApplications.push(inserted);
                        }
                    }
                }

                // Apply any newer statusStore entries
                for (const app of dbApplications) {
                    const savedMeta = statusStore[app.id] || (app.email ? statusStore[app.email.toLowerCase()] : null);
                    if (savedMeta) {
                        if (savedMeta.status) app.status = savedMeta.status;
                        if (savedMeta.notes) app.notes = savedMeta.notes;
                    }
                }

                // Sort newest first
                dbApplications.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                return NextResponse.json({ success: true, applications: dbApplications, syncedCount: resendApps.length });
            }

            // If table doesn't exist yet, merge with statusStore and return the parsed applications
            if (!tableExists) {
                for (const app of resendApps) {
                    const savedMeta = statusStore[app.id] || (app.email ? statusStore[app.email.toLowerCase()] : null);
                    if (savedMeta) {
                        if (savedMeta.status) app.status = savedMeta.status;
                        if (savedMeta.notes) app.notes = savedMeta.notes;
                    }
                }

                resendApps.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                return NextResponse.json({ 
                    success: true, 
                    applications: resendApps, 
                    notice: 'Persistence active via site_settings store. Optional: run migrations/create_career_applications.sql in Supabase for dedicated table.' 
                });
            }
        }

        // Apply statusStore entries to dbApplications as well
        for (const app of dbApplications) {
            const savedMeta = statusStore[app.id] || (app.email ? statusStore[app.email.toLowerCase()] : null);
            if (savedMeta) {
                if (savedMeta.status) app.status = savedMeta.status;
                if (savedMeta.notes) app.notes = savedMeta.notes;
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
        const { id, email, status, notes } = body;

        if (!id && !email) {
            return NextResponse.json({ success: false, error: 'Application ID or email is required' }, { status: 400 });
        }

        const supabase = getAdminSupabase();

        // 1. Always persist in site_settings status store for reliable cross-session persistence
        const statusStore = await getCandidateStatusStore(supabase);
        const existingEntry = (id && statusStore[id]) || (email && statusStore[email.toLowerCase()]) || {};
        
        const updatedEntry = {
            ...existingEntry,
            ...(status ? { status } : {}),
            ...(notes !== undefined ? { notes } : {}),
            updated_at: new Date().toISOString()
        };

        if (id) statusStore[id] = updatedEntry;
        if (email) statusStore[email.toLowerCase()] = updatedEntry;

        await saveCandidateStatusStore(supabase, statusStore);

        // 2. Also try updating career_applications table if it exists
        const updatePayload: any = {};
        if (status) updatePayload.status = status;
        if (notes !== undefined) updatePayload.notes = notes;

        let dbUpdated: any = null;
        try {
            const query = supabase.from('career_applications').update(updatePayload);
            if (id) query.eq('id', id);
            else if (email) query.eq('email', email);

            const { data } = await query.select().maybeSingle();
            if (data) dbUpdated = data;
        } catch (tableErr) {
            // Table might not exist yet; safe to ignore because site_settings store succeeded
        }

        return NextResponse.json({ 
            success: true, 
            application: dbUpdated || { id, email, ...updatedEntry } 
        });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message || 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const email = searchParams.get('email');

        if (!id && !email) {
            return NextResponse.json({ success: false, error: 'Application ID or email is required' }, { status: 400 });
        }

        const supabase = getAdminSupabase();

        // Remove from site_settings status store
        const statusStore = await getCandidateStatusStore(supabase);
        if (id && statusStore[id]) delete statusStore[id];
        if (email && statusStore[email.toLowerCase()]) delete statusStore[email.toLowerCase()];
        await saveCandidateStatusStore(supabase, statusStore);

        // Delete from table if table exists
        try {
            const query = supabase.from('career_applications').delete();
            if (id) query.eq('id', id);
            else if (email) query.eq('email', email);
            await query;
        } catch (tableErr) {
            // Ignore if table doesn't exist
        }

        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message || 'Internal server error' }, { status: 500 });
    }
}
