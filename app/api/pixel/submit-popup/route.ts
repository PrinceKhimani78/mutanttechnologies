import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// Handle CORS properly
export async function OPTIONS() {
    return NextResponse.json({}, { 
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        } 
    });
}

export async function POST(request: Request) {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    try {
        const payload = await request.json();
        const { client_id, url, name, email, phone, website } = payload;

        if (!name || !email) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400, headers: corsHeaders });
        }

        const resend = new Resend(process.env.RESEND_API_KEY);

        // Send email notification to you
        await resend.emails.send({
            from: 'Mutant Pixel <onboarding@resend.dev>', // You should verify a domain in Resend to change this
            to: 'prince@mutanttechnologies.com', // Replace with the email where you want to receive leads
            subject: `New Lead from Smart Popup on ${new URL(url).hostname}`,
            html: `
                <h2>New Popup Lead</h2>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
                <p><strong>Website:</strong> ${website || 'N/A'}</p>
                <hr />
                <p><em>Submitted from: ${url}</em></p>
                <p><em>Client ID: ${client_id}</em></p>
            `
        });

        return NextResponse.json({ success: true }, { status: 200, headers: corsHeaders });

    } catch (error) {
        console.error("Pixel Submit Error:", error);
        return NextResponse.json(
            { error: 'Internal Server Error' }, 
            { status: 500, headers: corsHeaders }
        );
    }
}
