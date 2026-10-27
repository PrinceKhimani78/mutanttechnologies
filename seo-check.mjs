#!/usr/bin/env node

/**
 * Technical SEO Verification Suite for Mutant Technologies
 * Usage:
 *   node seo-check.mjs                            # Checks live site
 *   node seo-check.mjs http://localhost:3000       # Checks local dev/preview
 */

import http from 'http';
import https from 'https';

const targetBase = (process.argv[2] || 'https://www.mutanttechnologies.com').replace(/\/+$/, '');
const isProduction = targetBase.includes('mutanttechnologies.com');

const PLACEHOLDER_PATTERNS = [
    /Quantum Flow/i,
    /Novus Markets/i,
    /Elevate Gear/i,
    /MediCore/i,
    /Michael Chen/i,
    /Nexus Systems/i,
    /500\+\s*global/i,
    /NEXUSVORTEX/i,
    /that\s+Drive\s+Results/i,
];

async function checkRedirect() {
    console.log(`\n🔍 Checking non-www to www redirect...`);
    return new Promise((resolve) => {
        try {
            const isTargetHttps = targetBase.startsWith('https://');
            const client = isProduction ? https : (isTargetHttps ? https : http);
            const targetUrl = new URL(isProduction ? 'https://mutanttechnologies.com/' : `${targetBase}/`);

            const req = client.request({
                hostname: targetUrl.hostname,
                port: targetUrl.port || (targetUrl.protocol === 'https:' ? 443 : 80),
                path: targetUrl.pathname || '/',
                method: 'HEAD',
                headers: {
                    host: 'mutanttechnologies.com',
                },
            }, (res) => {
                const status = res.statusCode;
                const location = res.headers['location'];

                if ((status === 301 || status === 308) && location && (location.startsWith('https://www.mutanttechnologies.com') || location === 'https://www.mutanttechnologies.com')) {
                    console.log(`  ✅ Non-www redirect passed: ${status} -> ${location}`);
                    resolve(true);
                } else {
                    console.error(`  ❌ Non-www redirect failed: status ${status}, location: ${location}`);
                    resolve(false);
                }
            });

            req.on('error', (err) => {
                console.error(`  ❌ Non-www redirect test error:`, err.message);
                resolve(false);
            });

            req.end();
        } catch (err) {
            console.error(`  ❌ Non-www redirect test error:`, err.message);
            resolve(false);
        }
    });
}

async function run() {
    console.log(`\n======================================================`);
    console.log(`🚀 Running SEO Audit against: ${targetBase}`);
    console.log(`======================================================`);

    let totalErrors = 0;

    // 1. Check Non-www redirect
    const redirectOk = await checkRedirect();
    if (!redirectOk) totalErrors++;

    // 2. Fetch sitemap
    console.log(`\n🔍 Fetching sitemap: ${targetBase}/sitemap.xml...`);
    let urls = [];
    try {
        const sitemapRes = await fetch(`${targetBase}/sitemap.xml`);
        if (!sitemapRes.ok) throw new Error(`HTTP ${sitemapRes.status}`);
        const xml = await sitemapRes.text();
        const matches = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)];
        urls = matches.map((m) => m[1]);
        console.log(`  Found ${urls.length} URLs in sitemap.`);
    } catch (err) {
        console.error(`  ❌ Failed to fetch sitemap:`, err.message);
        process.exit(1);
    }

    // 3. Audit each URL
    console.log(`\n🔍 Auditing pages...`);
    for (const rawUrl of urls) {
        // Map sitemap canonical to the target base (e.g. localhost for preview testing)
        const fetchUrl = rawUrl.replace('https://www.mutanttechnologies.com', targetBase);
        const pageErrors = [];

        try {
            const res = await fetch(fetchUrl);
            if (!res.ok) {
                console.error(`\n❌ [${fetchUrl}] HTTP ${res.status}`);
                totalErrors++;
                continue;
            }

            const html = await res.text();

            // Check Title
            const titleMatch = html.match(/<title>([^<]*)<\/title>/i);
            const title = titleMatch ? titleMatch[1].trim() : '';
            if (!title) {
                pageErrors.push('Missing <title>');
            } else {
                // Check double brand
                const brandMatches = title.match(/Mutant Technologies/gi) || [];
                if (brandMatches.length > 1) {
                    pageErrors.push(`Duplicate brand in title ("${title}")`);
                }
                // Check title length
                // Unescape HTML entities like &amp; for accurate length check
                const unescapedTitle = title.replace(/&amp;/g, '&').replace(/&quot;/g, '"');
                if (unescapedTitle.length > 65) {
                    pageErrors.push(`Title too long (${unescapedTitle.length} > 65 chars): "${unescapedTitle}"`);
                }
            }

            // Check Meta Description
            const descMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i) ||
                              html.match(/<meta\s+content=["']([^"']*)["']\s+name=["']description["']/i);
            const desc = descMatch ? descMatch[1].trim() : '';
            if (!desc) {
                pageErrors.push('Missing meta description');
            } else {
                if (desc.length < 70) {
                    pageErrors.push(`Meta description too short (${desc.length} < 70 chars)`);
                } else if (desc.length > 165) {
                    pageErrors.push(`Meta description too long (${desc.length} > 165 chars)`);
                }
            }

            // Check Canonical Tag
            const canonMatch = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']*)["']/i) ||
                               html.match(/<link\s+href=["']([^"']*)["']\s+rel=["']canonical["']/i);
            const canonical = canonMatch ? canonMatch[1].trim() : '';
            if (!canonical) {
                pageErrors.push('Missing canonical link tag');
            } else if (!canonical.startsWith('https://www.mutanttechnologies.com')) {
                pageErrors.push(`Canonical doesn't start with https://www.mutanttechnologies.com ("${canonical}")`);
            }

            // Check H1 tag
            const h1Matches = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)];
            if (h1Matches.length === 0) {
                pageErrors.push('Missing <h1>');
            } else if (h1Matches.length > 1) {
                pageErrors.push(`Found multiple (${h1Matches.length}) <h1> tags`);
            } else {
                const h1Text = h1Matches[0][1].replace(/<[^>]+>/g, '').trim();
                if (/that\s+Drive\s+Results/i.test(h1Text)) {
                    pageErrors.push(`H1 contains forbidden template string "that Drive Results": "${h1Text}"`);
                }
            }

            // Check Placeholder strings
            for (const pattern of PLACEHOLDER_PATTERNS) {
                if (pattern.test(html)) {
                    pageErrors.push(`Contains template placeholder matching ${pattern}`);
                }
            }

            if (pageErrors.length > 0) {
                console.error(`\n❌ [${rawUrl}]`);
                pageErrors.forEach((e) => console.error(`   • ${e}`));
                totalErrors += pageErrors.length;
            } else {
                process.stdout.write('.');
            }
        } catch (fetchErr) {
            console.error(`\n❌ [${fetchUrl}] Fetch error: ${fetchErr.message}`);
            totalErrors++;
        }
    }

    console.log(`\n\n======================================================`);
    if (totalErrors === 0) {
        console.log(`🎉 ALL SEO CHECKS PASSED WITH ZERO ERRORS!`);
        console.log(`======================================================\n`);
        process.exit(0);
    } else {
        console.error(`💥 SEO AUDIT FAILED: ${totalErrors} issue(s) detected.`);
        console.log(`======================================================\n`);
        process.exit(1);
    }
}

run();
