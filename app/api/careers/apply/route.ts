import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { jobId, jobTitle, name, email, phone, resumeUrl, coverLetter } = body;

        if (!name || !email || !resumeUrl || !jobTitle) {
            return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
        }

        const apiKey = process.env.RESEND_API_KEY || process.env.Newemailkey;
        if (!apiKey) {
            console.error('RESEND_API_KEY is missing');
            return NextResponse.json({ success: false, error: 'Server configuration error' }, { status: 500 });
        }

        const resend = new Resend(apiKey);

        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #0f172a; margin: 0; padding: 0; }
                    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
                    .content { background-color: #ffffff; border-radius: 12px; padding: 32px; border: 1px solid #e2e8f0; }
                    .title { font-size: 24px; font-weight: bold; color: #ea580c; margin-bottom: 24px; }
                    .field { margin-bottom: 20px; }
                    .label { color: #64748b; font-size: 12px; text-transform: uppercase; font-weight: 600; letter-spacing: 0.05em; margin-bottom: 4px; }
                    .value { color: #0f172a; font-size: 16px; line-height: 1.5; }
                    .message-box { background-color: #f1f5f9; border-radius: 8px; padding: 16px; margin-top: 8px; }
                    .footer { text-align: center; margin-top: 40px; color: #94a3b8; font-size: 14px; }
                    .btn { display: inline-block; background-color: #ea580c; color: white; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-weight: bold; margin-top: 8px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="content">
                        <div class="title">New Job Application: ${jobTitle}</div>
                        
                        <div class="field">
                            <div class="label">Candidate Name</div>
                            <div class="value">${name}</div>
                        </div>

                        <div class="field">
                            <div class="label">Email</div>
                            <div class="value"><a href="mailto:${email}">${email}</a></div>
                        </div>

                        ${phone ? `
                        <div class="field">
                            <div class="label">Phone</div>
                            <div class="value">${phone}</div>
                        </div>
                        ` : ''}

                        <div class="field">
                            <div class="label">Resume / Portfolio Link</div>
                            <div class="value">
                                <a href="${resumeUrl}" class="btn" target="_blank">View Resume</a>
                                <br><br>
                                <small>${resumeUrl}</small>
                            </div>
                        </div>

                        ${coverLetter ? `
                        <div class="field">
                            <div class="label">Cover Letter / Additional Note</div>
                            <div class="value message-box">${coverLetter.replace(/\n/g, '<br>')}</div>
                        </div>
                        ` : ''}
                    </div>
                    <div class="footer">
                        <p>Sent from Mutant Technologies Careers Portal</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        const { data, error } = await resend.emails.send({
            from: 'Mutant Careers <onboarding@resend.dev>',
            to: ['prince@mutanttechnologies.com'],
            replyTo: email,
            subject: `New Application for ${jobTitle} from ${name}`,
            html: htmlContent,
            text: `New Application for ${jobTitle} from ${name}.\nEmail: ${email}\nResume: ${resumeUrl}\n\nCover Letter:\n${coverLetter || 'None'}`,
        });

        if (error) {
            console.error('Resend error:', error);
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, data });

    } catch (e: any) {
        console.error('Apply error:', e);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
