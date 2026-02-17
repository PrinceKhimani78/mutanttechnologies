'use server';

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

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

    const emailSubject = type === 'proposal'
        ? `New Project Request: ${name} - ${service}`
        : `New Contact Message: ${name} - ${subject || 'No Subject'}`;

    try {
        const { data, error } = await resend.emails.send({
            from: 'Mutant Website <onboarding@resend.dev>', // Replace with your verified domain in production
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
            console.error('Resend error:', error);
            return { success: false, error: error.message };
        }

        return { success: true, data };
    } catch (err: any) {
        console.error('Server action error:', err);
        return { success: false, error: err.message || 'Failed to send email' };
    }
}
