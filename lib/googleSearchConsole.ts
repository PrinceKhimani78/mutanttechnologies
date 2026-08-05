import { JWT } from 'google-auth-library';

// Server-only. Google has no public "index this page" API for ordinary web
// pages (the Indexing API is restricted by policy to JobPosting/BroadcastEvent
// pages), so this covers the two legitimate levers site owners actually have:
//   1. Resubmitting the sitemap, which nudges Google to recrawl it sooner.
//   2. Reading real index status per URL via the URL Inspection API.
// Both require a Google Cloud service account added as a user on the Search
// Console property - see docs/google-search-console-setup.md.

const SCOPES = ['https://www.googleapis.com/auth/webmasters'];

export function isGscConfigured(): boolean {
    return !!(
        process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
        process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY &&
        process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL
    );
}

function getClient(): JWT {
    const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    // Private keys are stored with literal \n escapes in env vars; restore real newlines.
    const key = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!email || !key) {
        throw new Error('Google Search Console is not configured (missing service account credentials)');
    }

    return new JWT({ email, key, scopes: SCOPES });
}

function getSiteUrl(): string {
    const siteUrl = process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL;
    if (!siteUrl) {
        throw new Error('Google Search Console is not configured (missing GOOGLE_SEARCH_CONSOLE_SITE_URL)');
    }
    return siteUrl;
}

/** Resubmits the sitemap so Google knows to recrawl it soon, rather than waiting for its own schedule. */
export async function submitSitemap(sitemapUrl: string): Promise<void> {
    const client = getClient();
    const siteUrl = getSiteUrl();

    const endpoint = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/sitemaps/${encodeURIComponent(sitemapUrl)}`;

    const res = await client.request({
        url: endpoint,
        method: 'PUT',
    });

    if (res.status >= 300) {
        throw new Error(`Sitemap submission failed with status ${res.status}`);
    }
}

export interface IndexInspectionResult {
    verdict: string; // e.g. "PASS", "NEUTRAL", "FAIL"
    coverageState?: string; // e.g. "Submitted and indexed", "Crawled - currently not indexed"
    lastCrawlTime?: string;
    pageFetchState?: string;
    robotsTxtState?: string;
    indexingState?: string;
    sitemap?: string[];
    referringUrls?: string[];
    /** Google-provided deep link straight to this result in the Search Console UI. */
    inspectionResultLink?: string;
}

/** Reads Google's real index status for a URL - the same data the "URL Inspection" tool in Search Console shows. */
export async function inspectUrl(inspectionUrl: string): Promise<IndexInspectionResult> {
    const client = getClient();
    const siteUrl = getSiteUrl();

    const res = await client.request<{
        inspectionResult?: {
            inspectionResultLink?: string;
            indexStatusResult?: {
                verdict?: string;
                coverageState?: string;
                lastCrawlTime?: string;
                pageFetchState?: string;
                robotsTxtState?: string;
                indexingState?: string;
                sitemap?: string[];
                referringUrls?: string[];
            };
        };
    }>({
        url: 'https://searchconsole.googleapis.com/v1/urlInspection/index:inspect',
        method: 'POST',
        data: { inspectionUrl, siteUrl },
    });

    const result = res.data.inspectionResult?.indexStatusResult;
    if (!result) {
        throw new Error('No inspection result returned');
    }

    return {
        verdict: result.verdict || 'UNKNOWN',
        coverageState: result.coverageState,
        lastCrawlTime: result.lastCrawlTime,
        pageFetchState: result.pageFetchState,
        robotsTxtState: result.robotsTxtState,
        indexingState: result.indexingState,
        sitemap: result.sitemap,
        referringUrls: result.referringUrls,
        // Google hands back the exact, correct deep link for this result - use
        // it as-is instead of hand-building a search.google.com URL, which
        // drifts out of sync with whatever route Search Console's SPA expects.
        inspectionResultLink: res.data.inspectionResult?.inspectionResultLink,
    };
}
