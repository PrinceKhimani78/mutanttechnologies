'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import {
    ArrowLeft, Loader2, Search, RefreshCw, ExternalLink,
    CheckCircle2, XCircle, AlertTriangle, HelpCircle,
} from 'lucide-react';
import Link from 'next/link';

const SITE_URL = 'https://www.mutanttechnologies.com';

// Kept in sync with the static routes in app/sitemap.ts - these don't come
// from a database table, so they never show up without listing them here.
const STATIC_PAGES: { label: string; path: string }[] = [
    { label: 'Home', path: '' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' },
    { label: 'Portfolio', path: '/portfolio' },
    { label: 'Services (index)', path: '/services' },
    { label: 'Blog (index)', path: '/blog' },
];

interface ContentRow {
    id: string;
    label: string;
    url: string;
    kind: 'static' | 'post' | 'service';
}

interface InspectionResult {
    verdict: string;
    coverageState?: string;
    lastCrawlTime?: string;
}

type StatusMap = Record<string, { loading: boolean; result?: InspectionResult; deepLink?: string; error?: string }>;

async function authedFetch(path: string, body?: object) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not logged in');

    const res = await fetch(path, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || json.error || 'Request failed');
    return json;
}

function VerdictBadge({ verdict, coverageState }: { verdict: string; coverageState?: string }) {
    const map: Record<string, { icon: React.ReactNode; className: string; label: string }> = {
        PASS: { icon: <CheckCircle2 className="w-4 h-4" />, className: 'text-green-600 bg-green-500/10 border-green-500/20', label: coverageState || 'Indexed' },
        NEUTRAL: { icon: <AlertTriangle className="w-4 h-4" />, className: 'text-amber-600 bg-amber-500/10 border-amber-500/20', label: coverageState || 'Not indexed' },
        FAIL: { icon: <XCircle className="w-4 h-4" />, className: 'text-red-600 bg-red-500/10 border-red-500/20', label: coverageState || 'Failed' },
    };
    const entry = map[verdict] || { icon: <HelpCircle className="w-4 h-4" />, className: 'text-gray-500 bg-gray-500/10 border-gray-500/20', label: coverageState || verdict };

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold ${entry.className}`}>
            {entry.icon} {entry.label}
        </span>
    );
}

export default function IndexingDashboard() {
    const [loading, setLoading] = useState(true);
    const [configured, setConfigured] = useState<boolean | null>(null);
    const [rows, setRows] = useState<ContentRow[]>([]);
    const [status, setStatus] = useState<StatusMap>({});
    const [manualUrl, setManualUrl] = useState('');
    const [manualStatus, setManualStatus] = useState<{ loading: boolean; result?: InspectionResult; deepLink?: string; error?: string }>({ loading: false });
    const [sitemapState, setSitemapState] = useState<{ loading: boolean; message?: string; error?: string }>({ loading: false });

    useEffect(() => {
        (async () => {
            const [{ data: posts }, { data: services }] = await Promise.all([
                supabase.from('posts').select('id, slug, title').eq('is_published', true).order('created_at', { ascending: false }).limit(10),
                supabase.from('services').select('id, slug, title').order('id'),
            ]);

            const staticRows: ContentRow[] = STATIC_PAGES.map((p) => ({ id: `static-${p.path || 'home'}`, label: p.label, url: `${SITE_URL}${p.path}`, kind: 'static' }));
            const postRows: ContentRow[] = (posts || []).map((p) => ({ id: `post-${p.id}`, label: p.title, url: `${SITE_URL}/blog/${p.slug}`, kind: 'post' }));
            const serviceRows: ContentRow[] = (services || []).map((s) => ({ id: `service-${s.id}`, label: s.title, url: `${SITE_URL}/services/${s.slug}`, kind: 'service' }));

            setRows([...staticRows, ...postRows, ...serviceRows]);
            setLoading(false);
        })();
    }, []);

    const checkUrl = useCallback(async (id: string, url: string) => {
        setStatus((s) => ({ ...s, [id]: { loading: true } }));
        try {
            const json = await authedFetch('/api/seo/inspect-url', { url });
            setStatus((s) => ({ ...s, [id]: { loading: false, result: json.result, deepLink: json.deepLink } }));
            setConfigured(true);
        } catch (err) {
            const message = (err as Error).message;
            if (message.includes('not_configured') || message.includes('not set up')) setConfigured(false);
            setStatus((s) => ({ ...s, [id]: { loading: false, error: message } }));
        }
    }, []);

    const checkManualUrl = async () => {
        if (!manualUrl) return;
        setManualStatus({ loading: true });
        try {
            const json = await authedFetch('/api/seo/inspect-url', { url: manualUrl });
            setManualStatus({ loading: false, result: json.result, deepLink: json.deepLink });
            setConfigured(true);
        } catch (err) {
            const message = (err as Error).message;
            if (message.includes('not_configured') || message.includes('not set up')) setConfigured(false);
            setManualStatus({ loading: false, error: message });
        }
    };

    const resubmitSitemap = async () => {
        setSitemapState({ loading: true });
        try {
            await authedFetch('/api/seo/submit-sitemap');
            setSitemapState({ loading: false, message: 'Sitemap resubmitted to Google just now.' });
            setConfigured(true);
        } catch (err) {
            const message = (err as Error).message;
            if (message.includes('not_configured') || message.includes('not set up')) setConfigured(false);
            setSitemapState({ loading: false, error: message });
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 text-foreground">
            <header className="bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 sticky top-0 z-10">
                <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/seo" className="text-gray-500 hover:text-primary transition-colors">
                            <ArrowLeft className="w-6 h-6" />
                        </Link>
                        <h1 className="font-oswald text-2xl font-bold uppercase">Google Indexing</h1>
                    </div>
                    <Button size="sm" onClick={resubmitSitemap} disabled={sitemapState.loading}>
                        {sitemapState.loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                        Resubmit Sitemap
                    </Button>
                </div>
            </header>

            <main className="container mx-auto px-6 py-12 max-w-5xl space-y-8">
                {configured === false && (
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-6 text-sm">
                        <p className="font-bold text-amber-600 mb-1">Not connected to Google Search Console yet</p>
                        <p className="text-gray-600 dark:text-gray-400">
                            Add a Google Cloud service account and grant it access to the property, then set
                            <code className="mx-1 px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10">GOOGLE_SERVICE_ACCOUNT_EMAIL</code>,
                            <code className="mx-1 px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10">GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY</code> and
                            <code className="mx-1 px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10">GOOGLE_SEARCH_CONSOLE_SITE_URL</code>
                            in your environment. See <code className="px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10">docs/google-search-console-setup.md</code> for the step-by-step.
                        </p>
                    </div>
                )}

                {sitemapState.message && (
                    <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-sm text-green-700 dark:text-green-400 font-medium">
                        {sitemapState.message}
                    </div>
                )}
                {sitemapState.error && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-sm text-red-600 dark:text-red-400 font-medium">
                        {sitemapState.error}
                    </div>
                )}

                {/* Manual URL checker */}
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-gray-200 dark:border-zinc-800">
                    <h2 className="font-bold text-lg mb-4">Check any URL</h2>
                    <div className="flex gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="https://www.mutanttechnologies.com/blog/your-post"
                                className="w-full pl-12 pr-4 py-3 bg-white dark:bg-zinc-900 border rounded-xl"
                                value={manualUrl}
                                onChange={(e) => setManualUrl(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && checkManualUrl()}
                            />
                        </div>
                        <Button variant="outline" onClick={checkManualUrl} disabled={manualStatus.loading}>
                            {manualStatus.loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Check'}
                        </Button>
                    </div>
                    {manualStatus.result && (
                        <div className="mt-4 flex items-center gap-3 flex-wrap">
                            <VerdictBadge verdict={manualStatus.result.verdict} coverageState={manualStatus.result.coverageState} />
                            {manualStatus.result.lastCrawlTime && (
                                <span className="text-xs text-gray-500">Last crawled {new Date(manualStatus.result.lastCrawlTime).toLocaleString()}</span>
                            )}
                            {manualStatus.deepLink && (
                                <a href={manualStatus.deepLink} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-primary inline-flex items-center gap-1 hover:underline">
                                    Inspect in Search Console <ExternalLink className="w-3 h-3" />
                                </a>
                            )}
                        </div>
                    )}
                    {manualStatus.error && <p className="mt-3 text-sm text-red-600">{manualStatus.error}</p>}
                </div>

                {/* Recent content */}
                <div>
                    <h2 className="font-bold text-lg mb-4">Pages, posts &amp; services</h2>
                    <div className="grid gap-3">
                        {rows.map((row) => {
                            const s = status[row.id];
                            return (
                                <div key={row.id} className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-gray-200 dark:border-zinc-800 flex items-center justify-between gap-4 flex-wrap">
                                    <div className="min-w-0">
                                        <p className="font-bold truncate">{row.label}</p>
                                        <p className="text-xs text-gray-500 truncate">{row.url}</p>
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0">
                                        {s?.result && <VerdictBadge verdict={s.result.verdict} coverageState={s.result.coverageState} />}
                                        {s?.error && <span className="text-xs text-red-600">{s.error}</span>}
                                        {s?.deepLink && (
                                            <a href={s.deepLink} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-primary inline-flex items-center gap-1 hover:underline">
                                                Inspect <ExternalLink className="w-3 h-3" />
                                            </a>
                                        )}
                                        <Button size="sm" variant="outline" onClick={() => checkUrl(row.id, row.url)} disabled={s?.loading}>
                                            {s?.loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Check status'}
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                        {rows.length === 0 && (
                            <div className="text-center py-16 text-gray-500">No published posts or services yet.</div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
