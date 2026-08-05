import { createClient } from '@supabase/supabase-js';

// Server-only. Writes/reads use the service role key directly since this
// table has RLS on with no policies (see migrations/add_indexing_log.sql) -
// it's never touched from the browser client.
function getServiceClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceRoleKey) return null;
    return createClient(supabaseUrl, serviceRoleKey);
}

export type IndexingAction = 'sitemap_submit' | 'inspect' | 'indexnow_submit';

export async function logIndexingEvent(entry: {
    action: IndexingAction;
    url?: string;
    status: 'success' | 'error';
    message?: string;
    triggeredBy?: string | null;
}): Promise<void> {
    try {
        const client = getServiceClient();
        if (!client) return; // table migration may not be applied yet - never block the caller

        await client.from('indexing_log').insert([{
            action: entry.action,
            url: entry.url || null,
            status: entry.status,
            message: entry.message || null,
            triggered_by: entry.triggeredBy || null,
        }]);
    } catch (err) {
        // Logging must never break the actual action it's logging.
        console.warn('indexing_log write failed (table may not exist yet - run migrations/add_indexing_log.sql):', err);
    }
}

export async function getRecentIndexingEvents(limit = 50) {
    const client = getServiceClient();
    if (!client) return [];

    const { data, error } = await client
        .from('indexing_log')
        .select('id, action, url, status, message, triggered_by, created_at')
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.warn('indexing_log read failed (table may not exist yet):', error.message);
        return [];
    }
    return data || [];
}
