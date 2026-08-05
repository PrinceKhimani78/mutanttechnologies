// IndexNow: a real, working push API - Bing, Yandex, DuckDuckGo, Seznam, and
// Naver all consume it, so one submission notifies all five instantly.
// Google does not participate in IndexNow; there is no equivalent for it
// (see lib/googleSearchConsole.ts for why).
//
// Setup is just a key + a matching file hosted at the domain root
// (public/<key>.txt, already created) - no account or signup required.

const SITE_HOST = 'www.mutanttechnologies.com';

export function isIndexNowConfigured(): boolean {
    return !!process.env.INDEXNOW_KEY;
}

export interface IndexNowSubmission {
    ok: boolean;
    status: number;
    message: string;
}

/** Submits one or more URLs to IndexNow. All must belong to SITE_HOST. */
export async function submitToIndexNow(urls: string[]): Promise<IndexNowSubmission> {
    const key = process.env.INDEXNOW_KEY;
    if (!key) {
        throw new Error('IndexNow is not configured (missing INDEXNOW_KEY)');
    }

    const res = await fetch('https://api.indexnow.org/indexnow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({
            host: SITE_HOST,
            key,
            keyLocation: `https://${SITE_HOST}/${key}.txt`,
            urlList: urls,
        }),
    });

    // IndexNow returns 200/202 on success; 4xx means the key file, host, or
    // URL list didn't validate.
    const ok = res.status === 200 || res.status === 202;
    return {
        ok,
        status: res.status,
        message: ok ? 'Submitted to Bing, Yandex, DuckDuckGo, Seznam and Naver' : `IndexNow rejected the submission (HTTP ${res.status})`,
    };
}
