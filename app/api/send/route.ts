import { Resend } from 'resend';
import { NextRequest, NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
    try {
        const { name, email, service, message, type } = await req.json();

        const subject = type === 'proposal'
            ? `New Project Proposal from ${name}`
            : `New Contact Message from ${name}`;

        const htmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e5e5; border-radius: 8px;">
        <h2 style="color: #333;">${subject}</h2>
        <div style="margin-bottom: 20px;">
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          ${service ? `<p><strong>Service Interest:</strong> ${service}</p>` : ''}
        </div>
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 4px;">
          <h3 style="margin-top: 0; font-size: 16px;">Message:</h3>
          <p style="white-space: pre-wrap; color: #555;">${message}</p>
        </div>
        <div style="margin-top: 20px; font-size: 12px; color: #999;">
          Sent from Mutant Technologies Website
        </div>
      </div>
    `;

        const data = await resend.emails.send({
            from: 'Mutant Website <onboarding@resend.dev>', // Use default until user verifies domain
            to: ['prince@mutanttechnologies.com'],
            subject: subject,
            html: htmlContent,
            replyTo: email
        });

        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error }, { status: 500 });
    }
}
