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

        const { data, error } = await resend.emails.send({
            from: 'Mutant Website <onboarding@resend.dev>',
            to: ['prince@mutanttechnologies.com'],
            replyTo: email,
            subject: emailSubject,
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
