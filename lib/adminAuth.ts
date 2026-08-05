import { createClient } from '@supabase/supabase-js';

// Shared with the admin allowlists in app/api/pixel/admin/* - kept as one
// source of truth for new server-only routes instead of copy-pasting again.
export const ADMIN_EMAILS = [
    'admin@mutant.tech',
    'prince@mutant.tech',
    'princekhimani@gmail.com',
    'princekhimani186@gmail.com',
    'princekhimani78@gmail.com',
    'prince@mutanttechnologies.com',
];

/**
 * Verifies the Supabase session token on an incoming admin API request and
 * checks the user's email against the admin allowlist.
 * Returns the authenticated user, or a Response to return immediately (401/403).
 */
export async function requireAdmin(request: Request) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
        return { user: null, error: Response.json({ error: 'Server misconfigured' }, { status: 500 }) };
    }

    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.split(' ')[1];
    if (!token) {
        return { user: null, error: Response.json({ error: 'No token provided' }, { status: 401 }) };
    }

    const supabaseAuth = createClient(supabaseUrl, serviceRoleKey);
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token);

    if (authError || !user) {
        return { user: null, error: Response.json({ error: 'Auth failed' }, { status: 401 }) };
    }

    if (!user.email || !ADMIN_EMAILS.includes(user.email)) {
        return { user: null, error: Response.json({ error: 'Forbidden' }, { status: 403 }) };
    }

    return { user, error: null };
}
