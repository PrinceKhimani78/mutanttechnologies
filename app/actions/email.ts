'use server';

import { Resend } from 'resend';

interface EmailPayload {
    name: string;
    email: string;
    subject?: string;
    service?: string;
    message: string;
    type: 'contact' | 'proposal';
}

export async function sendEmail(payload: EmailPayload) {
    const { name, email, subject, service, message, type } = payload;

    const apiKey = process.env.RESEND_API_KEY || process.env.Newemailkey;
    if (!apiKey) {
        console.error('RESEND_API_KEY or Newemailkey is missing from environment variables');
        return { success: false, error: 'Email service configuration missing. Please check RESEND_API_KEY in your dashboard.' };
    }

    const resend = new Resend(apiKey);

    const emailSubject = type === 'proposal'
        ? `New Project Request: ${name} - ${service}`
        : `New Contact Message: ${name} - ${subject || 'No Subject'}`;

    try {
        console.log(`Attempting to send ${type} email from ${email}`);

        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #020617; color: #ffffff; margin: 0; padding: 0; }
                    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
                    .header { text-align: center; margin-bottom: 40px; }
                    .logo { width: 150px; height: auto; }
                    .content { background-color: #0f172a; border-radius: 16px; padding: 32px; border: 1px solid #1e293b; }
                    .title { font-size: 24px; font-weight: bold; color: #ea580c; margin-bottom: 24px; text-align: center; }
                    .field { margin-bottom: 20px; }
                    .label { color: #94a3b8; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }
                    .value { color: #f8fafc; font-size: 16px; line-height: 1.5; }
                    .message-box { background-color: #1e293b; border-radius: 8px; padding: 16px; margin-top: 8px; font-style: italic; }
                    .footer { text-align: center; margin-top: 40px; color: #64748b; font-size: 14px; }
                    .footer a { color: #ea580c; text-decoration: none; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <img src="https://mutanttechnologies.com/logo.png" alt="Mutant Technologies" class="logo">
                    </div>
                    <div class="content">
                        <div class="title">${type === 'proposal' ? 'New Project Proposal' : 'New Contact Inquiry'}</div>
                        
                        <div class="field">
                            <div class="label">From</div>
                            <div class="value"><strong>${name}</strong> (${email})</div>
                        </div>

                        ${service ? `
                        <div class="field">
                            <div class="label">Interested Service</div>
                            <div class="value">${service}</div>
                        </div>
                        ` : ''}

                        ${subject ? `
                        <div class="field">
                            <div class="label">Subject</div>
                            <div class="value">${subject}</div>
                        </div>
                        ` : ''}

                        <div class="field">
                            <div class="label">Message</div>
                            <div class="value message-box">${message.replace(/\n/g, '<br>')}</div>
                        </div>
                    </div>
                    <div class="footer">
                        <p>Sent from <a href="https://mutanttechnologies.com">mutanttechnologies.com</a></p>
                    </div>
                </div>
            </body>
            </html>
        `;

        const { data, error } = await resend.emails.send({
            from: 'Mutant Website <onboarding@resend.dev>',
            to: ['prince@mutanttechnologies.com'],
            replyTo: email,
            subject: emailSubject,
            html: htmlContent,
            text: `
Name: ${name}
Email: ${email}
${service ? `Service: ${service}` : ''}
${subject ? `Subject: ${subject}` : ''}
Type: ${type}

Message:
${message}
            `,
        });

        if (error) {
            console.error('Resend API error:', error);
            return { success: false, error: error.message };
        }

        console.log('Email sent successfully:', data?.id);
        return { success: true, data };
    } catch (err: any) {
        console.error('Unexpected server action error:', err);
        return { success: false, error: err.message || 'An unexpected error occurred while sending the email.' };
    }
}
