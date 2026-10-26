import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

function getAdminSupabase() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    return createClient(supabaseUrl, serviceRoleKey);
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { 
            applicationId, 
            type, // 'rejection' | 'shortlist'
            candidateName, 
            candidateEmail, 
            jobTitle,
            customSubject,
            customMessage
        } = body;

        if (!candidateEmail || !type || !jobTitle) {
            return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
        }

        const apiKey = process.env.RESEND_API_KEY || process.env.Newemailkey;
        if (!apiKey) {
            return NextResponse.json({ success: false, error: 'Email service configuration error' }, { status: 500 });
        }

        const resend = new Resend(apiKey);
        const firstName = (candidateName || 'Candidate').split(' ')[0];

        let subject = customSubject;
        let htmlBodyContent = '';
        let plainText = '';

        if (type === 'rejection') {
            subject = subject || `Update regarding your application for ${jobTitle} at Mutant Technologies`;
            const messageParagraphs = customMessage 
                ? customMessage.split('\n\n') 
                : [
                    `Thank you very much for taking the time to apply for the <strong>${jobTitle}</strong> position at Mutant Technologies, and for your interest in joining our team.`,
                    `We received a high volume of applications from talented individuals. While your background and skills are impressive, after thorough consideration, we have decided to move forward with candidates whose experience more closely matches our immediate project needs for this specific role.`,
                    `This was a difficult decision, as we were genuinely impressed with your qualifications. We will gladly keep your resume on file, and should another suitable opportunity arise that aligns with your skillset, we would love to get in touch.`,
                    `We sincerely appreciate your interest in Mutant Technologies and wish you the very best in your career pursuits.`
                ];

            htmlBodyContent = `
                <div style="font-size: 15px; line-height: 1.6; color: #334155;">
                    <p style="margin-bottom: 16px;">Dear <strong>${firstName}</strong>,</p>
                    ${messageParagraphs.map((p: string) => `<p style="margin-bottom: 16px;">${p.replace(/\n/g, '<br>')}</p>`).join('')}
                    <p style="margin-top: 24px; margin-bottom: 4px;">Warm regards,</p>
                    <p style="margin: 0; font-weight: bold; color: #0f172a;">The Hiring Team</p>
                    <p style="margin: 0; color: #ea580c; font-weight: 600;">Mutant Technologies</p>
                    <p style="margin-top: 4px; font-size: 13px; color: #64748b;"><a href="https://mutanttechnologies.com" style="color: #ea580c; text-decoration: none;">mutanttechnologies.com</a></p>
                </div>
            `;

            plainText = `Dear ${firstName},\n\n` + 
                (customMessage || `Thank you for applying for the ${jobTitle} position at Mutant Technologies.\n\nWhile your background is impressive, we have decided to move forward with other candidates whose experience more closely aligns with our immediate needs.\n\nWe will keep your resume on file for future opportunities. We wish you the very best in your career pursuits.`) + 
                `\n\nWarm regards,\nThe Hiring Team\nMutant Technologies\nhttps://mutanttechnologies.com`;

        } else if (type === 'shortlist') {
            subject = subject || `Great news! You have been shortlisted for ${jobTitle} at Mutant Technologies`;
            const messageParagraphs = customMessage 
                ? customMessage.split('\n\n') 
                : [
                    `Thank you for applying for the <strong>${jobTitle}</strong> role at Mutant Technologies!`,
                    `We are pleased to let you know that our recruitment and technical team has reviewed your application and resume, and we have <strong>shortlisted you</strong> for the next round of our hiring process!`,
                    `We were very impressed by your qualifications and project background, and our team is enthusiastic to speak with you further.`,
                    `<strong>What's next?</strong><br>A member of our hiring team will reach out to you shortly via phone or email to schedule an introductory conversation and discuss the next steps.`,
                    `In the meantime, feel free to explore our recent work, client stories, and agency culture at <a href="https://mutanttechnologies.com" style="color: #ea580c; text-decoration: none;">mutanttechnologies.com</a>.`
                ];

            htmlBodyContent = `
                <div style="font-size: 15px; line-height: 1.6; color: #334155;">
                    <p style="margin-bottom: 16px;">Dear <strong>${firstName}</strong>,</p>
                    ${messageParagraphs.map((p: string) => `<p style="margin-bottom: 16px;">${p.replace(/\n/g, '<br>')}</p>`).join('')}
                    <p style="margin-top: 24px; margin-bottom: 4px;">Congratulations again, and we look forward to speaking soon!</p>
                    <p style="margin-top: 16px; margin-bottom: 4px;">Best regards,</p>
                    <p style="margin: 0; font-weight: bold; color: #0f172a;">The Hiring Team</p>
                    <p style="margin: 0; color: #ea580c; font-weight: 600;">Mutant Technologies</p>
                    <p style="margin-top: 4px; font-size: 13px; color: #64748b;"><a href="https://mutanttechnologies.com" style="color: #ea580c; text-decoration: none;">mutanttechnologies.com</a></p>
                </div>
            `;

            plainText = `Dear ${firstName},\n\n` + 
                (customMessage || `Great news! You have been shortlisted for the ${jobTitle} position at Mutant Technologies.\n\nOur team was impressed by your application and we would love to connect with you. A member of our recruitment team will be reaching out to you shortly to schedule an introductory interview.`) + 
                `\n\nBest regards,\nThe Hiring Team\nMutant Technologies\nhttps://mutanttechnologies.com`;
        }

        const bannerTitle = type === 'shortlist' ? 'Application Shortlisted' : 'Application Update';
        const bannerColor = type === 'shortlist' ? '#10b981' : '#64748b';

        const fullHtml = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #0f172a; margin: 0; padding: 0; }
                    .wrapper { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
                    .card { background-color: #ffffff; border-radius: 16px; padding: 36px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
                    .brand { font-size: 20px; font-weight: 800; color: #ea580c; letter-spacing: -0.5px; text-transform: uppercase; margin-bottom: 24px; }
                    .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 20px; background-color: ${bannerColor}15; color: ${bannerColor}; border: 1px solid ${bannerColor}30; }
                    .footer { text-align: center; margin-top: 32px; color: #94a3b8; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="wrapper">
                    <div class="card">
                        <div class="brand">Mutant Technologies</div>
                        <div class="badge">${bannerTitle}</div>
                        <h2 style="font-size: 20px; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 20px;">${jobTitle}</h2>
                        ${htmlBodyContent}
                    </div>
                    <div class="footer">
                        <p>© ${new Date().getFullYear()} Mutant Technologies. All rights reserved.</p>
                        <p>You received this email because you submitted a job application to Mutant Technologies Careers.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        // Send email via Resend
        const { data: emailData, error: emailError } = await resend.emails.send({
            from: 'Prince Khimani <prince@mutanttechnologies.com>',
            to: [candidateEmail],
            replyTo: 'prince@mutanttechnologies.com',
            subject: subject,
            html: fullHtml,
            text: plainText
        });

        if (emailError) {
            console.error('Failed to send candidate notification email:', emailError);
            return NextResponse.json({ success: false, error: emailError.message }, { status: 500 });
        }

        // Update status in Supabase if applicationId or candidateEmail is provided
        const newStatus = type === 'shortlist' ? 'shortlisted' : 'rejected';
        const supabase = getAdminSupabase();

        // 1. Always update site_settings status store for reliable persistence
        try {
            const { data } = await supabase.from('site_settings').select('value').eq('key', 'career_applicants_status_store').maybeSingle();
            let store: Record<string, any> = {};
            if (data?.value) {
                store = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
            }
            const existingEntry = (applicationId && store[applicationId]) || (candidateEmail && store[candidateEmail.toLowerCase()]) || {};
            const updatedEntry = {
                ...existingEntry,
                status: newStatus,
                updated_at: new Date().toISOString()
            };
            if (applicationId) store[applicationId] = updatedEntry;
            if (candidateEmail) store[candidateEmail.toLowerCase()] = updatedEntry;
            await supabase.from('site_settings').upsert({
                key: 'career_applicants_status_store',
                value: JSON.stringify(store),
                label: 'Career Applicants Status Store',
                description: 'Persistent status and notes for career applicants across refreshes and logins'
            }, { onConflict: 'key' });
        } catch (e) {
            console.error('Failed to update site_settings status store on notify:', e);
        }

        // 2. Also update career_applications table if it exists
        if (applicationId) {
            try {
                await supabase
                    .from('career_applications')
                    .update({ status: newStatus })
                    .eq('id', applicationId);
            } catch (e) {
                // Ignore if table does not exist yet
            }
        }

        return NextResponse.json({ 
            success: true, 
            emailId: emailData?.id,
            status: type === 'shortlist' ? 'shortlisted' : 'rejected' 
        });

    } catch (err: any) {
        console.error('Notify candidate error:', err);
        return NextResponse.json({ success: false, error: err.message || 'Internal server error' }, { status: 500 });
    }
}
