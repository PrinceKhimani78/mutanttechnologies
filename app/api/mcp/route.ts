import { NextResponse } from 'next/server';
import React from 'react';
import { ImageResponse } from 'next/og';
import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { marked } from 'marked';
import fs from 'fs';
import path from 'path';
import { isIndexNowConfigured, submitToIndexNow } from '@/lib/indexNow';
import { isGscConfigured, submitSitemap, inspectUrl } from '@/lib/googleSearchConsole';
import { logIndexingEvent } from '@/lib/indexingLog';

const SITE_URL = 'https://www.mutanttechnologies.com';

function getAdminSupabase() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    return createClient(supabaseUrl, serviceRoleKey);
}

function corsHeaders() {
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key, Accept, origin',
    };
}

function verifyAuth(request: Request): boolean {
    const secretKey = process.env.MUTANT_BLOG_API_KEY || process.env.BLOG_API_KEY;
    if (!secretKey) {
        // If no secret key is set yet, permit access (user can set MUTANT_BLOG_API_KEY anytime to lock it down)
        return true;
    }

    const { searchParams } = new URL(request.url);
    const queryKey = searchParams.get('key') || searchParams.get('token') || searchParams.get('api_key');
    if (queryKey === secretKey) return true;

    const authHeader = request.headers.get('Authorization') || request.headers.get('authorization') || '';
    if (authHeader.startsWith('Bearer ') && authHeader.slice(7).trim() === secretKey) return true;

    const xApiKey = request.headers.get('x-api-key') || '';
    if (xApiKey === secretKey) return true;

    return false;
}

// Generate a clean URL slug from title
function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

// Helper to strip tags and generate a clean 160-char excerpt
function generateExcerpt(content: string, length = 160): string {
    const plain = content
        .replace(/<[^>]*>/g, '')
        .replace(/[#*`_~\[\]]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    if (plain.length <= length) return plain;
    return plain.slice(0, length).trim() + '...';
}

function parseKeywords(kw: any): string[] {
    if (!kw) return [];
    if (Array.isArray(kw)) return kw.map(k => String(k).trim()).filter(Boolean);
    if (typeof kw === 'string') return kw.split(',').map(k => k.trim()).filter(Boolean);
    return [];
}

async function triggerIndexing(url: string, label: string = 'MCP'): Promise<{ ok: boolean; message: string }> {
    const results: string[] = [];
    let hadError = false;

    if (isIndexNowConfigured()) {
        try {
            const indexNowRes = await submitToIndexNow([url]);
            await logIndexingEvent({
                action: 'indexnow_submit',
                url,
                status: indexNowRes.ok ? 'success' : 'error',
                message: indexNowRes.message,
                triggeredBy: label
            });
            results.push(`IndexNow: ${indexNowRes.message}`);
            if (!indexNowRes.ok) hadError = true;
        } catch (err: any) {
            console.error('IndexNow failed:', err);
            results.push(`IndexNow error: ${err.message}`);
            hadError = true;
        }
    } else {
        results.push('IndexNow: not configured');
    }

    if (isGscConfigured()) {
        try {
            await submitSitemap(`${SITE_URL}/sitemap.xml`);
            await logIndexingEvent({
                action: 'sitemap_submit',
                status: 'success',
                message: 'Sitemap resubmitted to Google',
                triggeredBy: label
            });
            results.push('Google: Sitemap ping sent');
        } catch (err: any) {
            console.error('Google sitemap submit failed:', err);
            results.push(`Google sitemap error: ${err.message}`);
        }
    } else {
        results.push('Google: GSC credentials not configured');
    }

    return {
        ok: !hadError,
        message: results.join(' | ')
    };
}

async function upsertServiceSeo(supabase: any, slug: string, seoData: {
    meta_title?: string;
    meta_description?: string;
    keywords?: any;
    og_title?: string;
    og_description?: string;
    og_image?: string;
    canonical_url?: string;
    robots?: string;
}) {
    const cleanSlug = slug.replace(/^\/+/, '');
    const pageSlugWithSlash = `/services/${cleanSlug}`;
    const pageSlugClean = `services/${cleanSlug}`;

    const { data: existing } = await supabase
        .from('page_metadata')
        .select('*')
        .or(`page_slug.eq."${pageSlugWithSlash}",page_slug.eq."${pageSlugClean}"`)
        .limit(1)
        .maybeSingle();

    const payload: any = {
        updated_at: new Date().toISOString()
    };

    if (seoData.meta_title !== undefined) payload.title = seoData.meta_title;
    if (seoData.meta_description !== undefined) payload.description = seoData.meta_description;
    if (seoData.keywords !== undefined) payload.keywords = parseKeywords(seoData.keywords);
    if (seoData.og_title !== undefined) payload.og_title = seoData.og_title;
    if (seoData.og_description !== undefined) payload.og_description = seoData.og_description;
    if (seoData.og_image !== undefined) payload.og_image = seoData.og_image;
    if (seoData.canonical_url !== undefined) payload.canonical_url = seoData.canonical_url;
    if (seoData.robots !== undefined) payload.robots = seoData.robots;

    if (existing) {
        const { data: updated, error } = await supabase
            .from('page_metadata')
            .update(payload)
            .eq('id', existing.id)
            .select()
            .single();
        if (error) throw error;
        return updated;
    } else {
        payload.page_slug = pageSlugWithSlash;
        payload.created_at = new Date().toISOString();
        if (!payload.title) payload.title = `${cleanSlug} | Mutant Technologies`;
        if (!payload.description) payload.description = '';
        if (!payload.robots) payload.robots = 'index, follow';
        if (!payload.canonical_url) payload.canonical_url = `${SITE_URL}/services/${cleanSlug}`;

        const { data: inserted, error } = await supabase
            .from('page_metadata')
            .insert([payload])
            .select()
            .single();
        if (error) throw error;
        return inserted;
    }
}

async function renderCoverImage({
    title,
    category,
    subtitle
}: {
    title: string;
    category?: string;
    subtitle?: string;
}): Promise<Buffer> {
    let logoDataUrl: string | null = null;
    try {
        let logoPath = path.join(process.cwd(), 'public', 'preloader logo.png');
        if (!fs.existsSync(logoPath)) {
            logoPath = path.join(process.cwd(), 'public', 'logo.png');
        }
        if (fs.existsSync(logoPath)) {
            const buf = fs.readFileSync(logoPath);
            logoDataUrl = `data:image/png;base64,${buf.toString('base64')}`;
        }
    } catch (e) {
        // Fallback gracefully if logo cannot be read from disk
    }

    const trimmedTitle = title.trim();
    const titleFontSize = trimmedTitle.length > 80 ? '40px' : trimmedTitle.length > 55 ? '48px' : '54px';
    const cleanCategory = (category || 'Technology').replace(/[\s·•-]+BLOG$/i, '').trim();
    const displayCategory = `${cleanCategory.toUpperCase()} · BLOG`;
    const displaySubtitle = subtitle && subtitle.trim() ? subtitle.trim() : null;

    const element = React.createElement('div', {
        style: {
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            height: '100%',
            backgroundColor: '#FFFFFF',
            backgroundImage: 'radial-gradient(circle at 100% 100%, #fff4e8 0%, rgba(255, 244, 232, 0.85) 30%, transparent 65%)',
            padding: '64px 80px 44px 80px',
            justifyContent: 'space-between',
            fontFamily: 'sans-serif',
            boxSizing: 'border-box',
            position: 'relative',
            overflow: 'hidden',
        }
    }, [
        // Faint orange ring in top right
        React.createElement('div', {
            key: 'ring',
            style: {
                position: 'absolute',
                right: '-80px',
                top: '-180px',
                width: '540px',
                height: '540px',
                borderRadius: '50%',
                border: '45px solid rgba(247, 148, 29, 0.16)',
                display: 'flex',
            }
        }),

        // Main content area
        React.createElement('div', {
            key: 'main-content',
            style: {
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
            }
        }, [
            // Orange #F7941D “<CATEGORY> · BLOG” label
            React.createElement('div', {
                key: 'category',
                style: {
                    display: 'flex',
                    color: '#F7941D',
                    fontSize: '18px',
                    fontWeight: '800',
                    letterSpacing: '2.5px',
                    textTransform: 'uppercase',
                    marginBottom: '32px',
                }
            }, displayCategory),

            // Orange vertical bar beside black Inter ExtraBold title
            React.createElement('div', {
                key: 'title-row',
                style: {
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'stretch',
                    marginBottom: '22px',
                }
            }, [
                React.createElement('div', {
                    key: 'bar',
                    style: {
                        width: '8px',
                        backgroundColor: '#F7941D',
                        borderRadius: '4px',
                        marginRight: '24px',
                        display: 'flex',
                        flexShrink: 0,
                    }
                }),
                React.createElement('h1', {
                    key: 'title',
                    style: {
                        color: '#000000',
                        fontSize: titleFontSize,
                        fontWeight: '900',
                        lineHeight: 1.15,
                        letterSpacing: '-1.5px',
                        margin: 0,
                        padding: 0,
                        display: 'flex',
                        flexWrap: 'wrap',
                        maxWidth: '1000px',
                    }
                }, trimmedTitle)
            ]),

            // Grey subtitle
            displaySubtitle ? React.createElement('p', {
                key: 'subtitle',
                style: {
                    color: '#64748B',
                    fontSize: '24px',
                    fontWeight: '400',
                    lineHeight: 1.4,
                    margin: 0,
                    maxWidth: '980px',
                    display: 'flex',
                }
            }, displaySubtitle) : null
        ]),

        // Footer section: Thin grey line with logo bottom left and mutanttechnologies.com bottom right
        React.createElement('div', {
            key: 'footer',
            style: {
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
            }
        }, [
            React.createElement('div', {
                key: 'divider',
                style: {
                    width: '100%',
                    height: '1px',
                    backgroundColor: '#E5E7EB',
                    marginBottom: '20px',
                    display: 'flex',
                }
            }),
            React.createElement('div', {
                key: 'footer-row',
                style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    width: '100%',
                }
            }, [
                logoDataUrl ? React.createElement('img', {
                    key: 'logo',
                    src: logoDataUrl,
                    height: 56,
                    style: {
                        objectFit: 'contain',
                    }
                }) : React.createElement('div', {
                    key: 'fallback-logo',
                    style: {
                        display: 'flex',
                        alignItems: 'center',
                        color: '#000000',
                        fontSize: '18px',
                        fontWeight: '800',
                        letterSpacing: '1.5px',
                    }
                }, 'MUTANT TECHNOLOGIES'),
                React.createElement('span', {
                    key: 'domain',
                    style: {
                        color: '#475569',
                        fontSize: '20px',
                        fontWeight: '500',
                        letterSpacing: '0.2px',
                    }
                }, 'mutanttechnologies.com')
            ])
        ])
    ]);

    const imageResponse = new ImageResponse(element, {
        width: 1200,
        height: 630,
    });

    const arrayBuffer = await imageResponse.arrayBuffer();
    return Buffer.from(arrayBuffer);
}

const TOOLS_DEFINITION = [
    {
        name: 'publish_blog_post',
        description: 'Create and publish a new blog post directly onto Mutant Technologies website (mutanttechnologies.com/blog). Matches all website CMS fields: Title, Rich Content (Markdown or HTML), URL Slug, Excerpt, Category, Cover Image, Publish Immediately status, and Search Engine Indexing.',
        inputSchema: {
            type: 'object',
            properties: {
                title: {
                    type: 'string',
                    description: 'The title of the blog post (e.g. "What Is White Label GoHighLevel? The Complete Guide in 2026")'
                },
                content: {
                    type: 'string',
                    description: 'The full blog post content. Accepts standard Markdown or HTML. Use headings (H2, H3), bullet lists, bold text, and links.'
                },
                slug: {
                    type: 'string',
                    description: 'Optional custom URL slug (e.g. "what-is-white-label-gohighlevel"). If omitted, it will be automatically generated from the title.'
                },
                excerpt: {
                    type: 'string',
                    description: 'Optional 1-2 sentence preview summary (150-160 characters) shown on preview cards and search engines. If omitted, will be auto-generated.'
                },
                category: {
                    type: 'string',
                    description: 'The blog category (e.g. "Technology", "Design", "SEO", "Web Development", "GoHighLevel", "AI Automations"). Defaults to "Technology".'
                },
                cover_image: {
                    type: 'string',
                    description: 'Optional URL for the cover image. If omitted, a relevant professional cover image will be assigned.'
                },
                is_published: {
                    type: 'boolean',
                    description: 'Set to true to publish live immediately on mutanttechnologies.com/blog, or false to save as a draft in admin dashboard. Defaults to true.'
                },
                update_if_exists: {
                    type: 'boolean',
                    description: 'If a post with this slug already exists, update its content instead of creating a duplicate. Defaults to true.'
                },
                submit_for_indexing: {
                    type: 'boolean',
                    description: 'Automatically submit published URL to IndexNow (Bing, DuckDuckGo, Yandex, etc.) and ping Google Search Console upon publication. Defaults to true when published.'
                }
            },
            required: ['title', 'content']
        }
    },
    {
        name: 'publish_draft',
        description: 'Flip an existing draft blog post to LIVE immediately on the website, or toggle a post between live and draft.',
        inputSchema: {
            type: 'object',
            properties: {
                slug: {
                    type: 'string',
                    description: 'The URL slug of the draft post to publish live (e.g. "5-reasons-white-label-gohighlevel-scales-agencies-faster")'
                },
                id: {
                    type: 'string',
                    description: 'Optional UUID of the post'
                },
                is_published: {
                    type: 'boolean',
                    description: 'Set to true to make it LIVE on the site (default true), or false to turn it back to a draft.'
                },
                submit_for_indexing: {
                    type: 'boolean',
                    description: 'Automatically submit URL to search engines when published live. Defaults to true.'
                }
            },
            required: ['slug']
        }
    },
    {
        name: 'update_blog_post',
        description: 'Update any fields of an existing blog post or draft (title, content, slug, excerpt, category, cover_image, is_published status). Use this to modify existing drafts or change a draft to live.',
        inputSchema: {
            type: 'object',
            properties: {
                slug: {
                    type: 'string',
                    description: 'The current URL slug of the post to update'
                },
                id: {
                    type: 'string',
                    description: 'Optional UUID of the post'
                },
                title: {
                    type: 'string',
                    description: 'New title (optional)'
                },
                content: {
                    type: 'string',
                    description: 'New content in Markdown or HTML (optional)'
                },
                new_slug: {
                    type: 'string',
                    description: 'New URL slug if you want to rename it (optional)'
                },
                excerpt: {
                    type: 'string',
                    description: 'New preview excerpt (optional)'
                },
                category: {
                    type: 'string',
                    description: 'New category (optional)'
                },
                cover_image: {
                    type: 'string',
                    description: 'New cover image URL (optional)'
                },
                is_published: {
                    type: 'boolean',
                    description: 'Set to true to publish live, or false to keep as draft (optional)'
                }
            },
            required: ['slug']
        }
    },
    {
        name: 'get_blog_post',
        description: 'Fetch the full content, metadata, and status of an existing blog post by its slug or ID.',
        inputSchema: {
            type: 'object',
            properties: {
                slug: {
                    type: 'string',
                    description: 'The slug of the post to fetch'
                },
                id: {
                    type: 'string',
                    description: 'The UUID of the post to fetch'
                }
            }
        }
    },
    {
        name: 'list_recent_posts',
        description: 'Fetch the latest published and draft blog posts from mutanttechnologies.com to review existing topics, check if a post is a DRAFT or LIVE, and get their slugs.',
        inputSchema: {
            type: 'object',
            properties: {
                limit: {
                    type: 'number',
                    description: 'Number of posts to fetch (default: 15, max: 50)'
                }
            }
        }
    },
    {
        name: 'delete_blog_post',
        description: 'Permanently delete a blog post by its slug or ID.',
        inputSchema: {
            type: 'object',
            properties: {
                slug: {
                    type: 'string',
                    description: 'The slug of the post to delete'
                },
                id: {
                    type: 'string',
                    description: 'The UUID of the post to delete'
                }
            },
            required: ['slug']
        }
    },
    {
        name: 'list_services',
        description: 'List all service pages on mutanttechnologies.com/services along with their slugs, titles, short descriptions, tools list, and SEO configuration status (meta title, keywords configured).',
        inputSchema: {
            type: 'object',
            properties: {}
        }
    },
    {
        name: 'get_service',
        description: 'Get full details of a specific service page (title, slug, content, features, tools, process, benefits, custom_data) AND its linked SEO metadata (meta title, meta description, keywords, OpenGraph).',
        inputSchema: {
            type: 'object',
            properties: {
                slug: {
                    type: 'string',
                    description: 'The URL slug of the service (e.g. "white-label-gohighlevel", "seo", "ai-automations", "web-development")'
                },
                id: {
                    type: 'string',
                    description: 'Optional UUID of the service'
                }
            },
            required: ['slug']
        }
    },
    {
        name: 'create_service',
        description: 'Create a brand new service page on mutanttechnologies.com/services. Accepts service content, stacked features, tools list, process steps, benefits, and initial SEO keywords & meta title.',
        inputSchema: {
            type: 'object',
            properties: {
                title: {
                    type: 'string',
                    description: 'The title of the service (e.g. "White Label GoHighLevel Development")'
                },
                slug: {
                    type: 'string',
                    description: 'Optional URL slug. If omitted, will be auto-generated from title.'
                },
                short_description: {
                    type: 'string',
                    description: '1-2 sentence preview summary shown on service cards'
                },
                description: {
                    type: 'string',
                    description: 'Detailed description of the service'
                },
                content: {
                    type: 'string',
                    description: 'Extended rich content / HTML / Markdown for the service page'
                },
                icon: {
                    type: 'string',
                    description: 'Lucide icon name (e.g. "Monitor", "Code", "Search", "Brain", "Shield", "Zap", "Layers"). Defaults to "Monitor".'
                },
                color: {
                    type: 'string',
                    description: 'Tailwind color class for the icon (e.g. "bg-blue-500", "bg-emerald-500")'
                },
                bg_gradient: {
                    type: 'string',
                    description: 'Tailwind gradient class (e.g. "from-blue-500 to-cyan-500")'
                },
                features: {
                    type: 'array',
                    description: 'List of feature objects [{ title, description, image }] or feature title strings'
                },
                tools: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Technologies / tools used (e.g. ["GoHighLevel", "Zapier", "Next.js", "Python"])'
                },
                process: {
                    type: 'array',
                    description: 'Workflow steps [{ step: "01", title: "Discovery", description: "..." }]'
                },
                benefits: {
                    type: 'array',
                    description: 'Key benefits list [{ title: "Scalability", description: "..." }]'
                },
                custom_data: {
                    type: 'object',
                    description: 'JSON object for custom sections (FAQ, pricing packages, comparison tables, etc.)'
                },
                hero_image: {
                    type: 'string',
                    description: 'Optional Hero background image URL'
                },
                benefits_image: {
                    type: 'string',
                    description: 'Optional benefits section image URL'
                },
                feature_mockup_image: {
                    type: 'string',
                    description: 'Optional feature mockup image URL'
                },
                meta_title: {
                    type: 'string',
                    description: 'SEO Meta Title for search engines (<title> tag, ideally 50-60 chars)'
                },
                meta_description: {
                    type: 'string',
                    description: 'SEO Meta Description snippet for search results (ideally 150-160 chars)'
                },
                keywords: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Target SEO keywords for this service page (e.g. ["white label gohighlevel", "ghl snapshots", "saas agency"])'
                },
                submit_for_indexing: {
                    type: 'boolean',
                    description: 'Automatically submit new service page to search engines upon creation (default: true)'
                }
            },
            required: ['title']
        }
    },
    {
        name: 'update_service',
        description: 'Update any fields of an existing service page (title, slug, content, features, tools, process, benefits, custom_data, media) AND/OR its SEO metadata (meta title, description, keywords). Use this to enhance services.',
        inputSchema: {
            type: 'object',
            properties: {
                slug: {
                    type: 'string',
                    description: 'Current URL slug of the service to update'
                },
                id: {
                    type: 'string',
                    description: 'Optional UUID of the service'
                },
                new_slug: {
                    type: 'string',
                    description: 'New URL slug if renaming the service'
                },
                title: {
                    type: 'string',
                    description: 'Updated title'
                },
                short_description: {
                    type: 'string',
                    description: 'Updated short description'
                },
                description: {
                    type: 'string',
                    description: 'Updated detailed description'
                },
                content: {
                    type: 'string',
                    description: 'Updated rich content (Markdown or HTML)'
                },
                icon: {
                    type: 'string',
                    description: 'Lucide icon name'
                },
                color: {
                    type: 'string',
                    description: 'Tailwind color class'
                },
                bg_gradient: {
                    type: 'string',
                    description: 'Tailwind gradient class'
                },
                features: {
                    type: 'array',
                    description: 'Updated features array'
                },
                tools: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Updated tools / tech stack array'
                },
                process: {
                    type: 'array',
                    description: 'Updated process steps array'
                },
                benefits: {
                    type: 'array',
                    description: 'Updated benefits array'
                },
                custom_data: {
                    type: 'object',
                    description: 'Updated custom JSON data'
                },
                hero_image: {
                    type: 'string',
                    description: 'Updated hero image URL'
                },
                benefits_image: {
                    type: 'string',
                    description: 'Updated benefits image URL'
                },
                feature_mockup_image: {
                    type: 'string',
                    description: 'Updated feature mockup image URL'
                },
                meta_title: {
                    type: 'string',
                    description: 'Updated SEO Meta Title'
                },
                meta_description: {
                    type: 'string',
                    description: 'Updated SEO Meta Description'
                },
                keywords: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Updated target SEO keywords array'
                },
                submit_for_indexing: {
                    type: 'boolean',
                    description: 'Submit updated service page to search engines (default: false unless keywords or title changed)'
                }
            },
            required: ['slug']
        }
    },
    {
        name: 'update_service_seo',
        description: 'Dedicated tool to quickly add or enhance target SEO keywords, meta title, meta description, and OpenGraph tags for any service page on mutanttechnologies.com.',
        inputSchema: {
            type: 'object',
            properties: {
                slug: {
                    type: 'string',
                    description: 'URL slug of the service page (e.g. "white-label-gohighlevel", "seo", "ai-automations", "web-development")'
                },
                meta_title: {
                    type: 'string',
                    description: 'Target SEO Title (<title> tag for Google / browser tab, 50-60 chars)'
                },
                meta_description: {
                    type: 'string',
                    description: 'Compelling SEO meta description snippet (150-160 chars)'
                },
                keywords: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'High-value target keywords (e.g. ["white label gohighlevel", "gohighlevel agency", "ghl development", "saas snapshot"])'
                },
                og_title: {
                    type: 'string',
                    description: 'Social share OpenGraph title (optional)'
                },
                og_description: {
                    type: 'string',
                    description: 'Social share OpenGraph description (optional)'
                },
                canonical_url: {
                    type: 'string',
                    description: 'Canonical URL (defaults to https://www.mutanttechnologies.com/services/[slug])'
                },
                robots: {
                    type: 'string',
                    description: 'Robots directive (default: "index, follow")'
                },
                submit_for_indexing: {
                    type: 'boolean',
                    description: 'Submit page to search engines immediately after updating SEO (default: true)'
                }
            },
            required: ['slug']
        }
    },
    {
        name: 'delete_service',
        description: 'Delete a service page from mutanttechnologies.com by its slug or ID.',
        inputSchema: {
            type: 'object',
            properties: {
                slug: {
                    type: 'string',
                    description: 'The slug of the service to delete'
                },
                id: {
                    type: 'string',
                    description: 'The UUID of the service to delete'
                }
            },
            required: ['slug']
        }
    },
    {
        name: 'submit_for_indexing',
        description: 'Submit any website URL or slug directly to search engines (IndexNow: Bing, DuckDuckGo, Yandex, Seznam, Naver + Google Search Console sitemap ping) so new or enhanced pages get indexed immediately.',
        inputSchema: {
            type: 'object',
            properties: {
                url: {
                    type: 'string',
                    description: 'Full URL to submit (e.g. "https://www.mutanttechnologies.com/services/white-label-gohighlevel" or "https://www.mutanttechnologies.com/blog/what-is-white-label-gohighlevel")'
                },
                slug: {
                    type: 'string',
                    description: 'Slug to submit if full URL is omitted (e.g. "white-label-gohighlevel")'
                },
                page_type: {
                    type: 'string',
                    enum: ['service', 'blog', 'static'],
                    description: 'Type of page if using slug: "service" -> /services/[slug], "blog" -> /blog/[slug], "static" -> /[slug]'
                }
            }
        }
    },
    {
        name: 'inspect_url_index_status',
        description: 'Check Google Search Console live indexing status for any URL on mutanttechnologies.com (returns verdict PASS/NEUTRAL/FAIL, coverageState e.g. "Submitted and indexed", last crawl time, and Google deep link).',
        inputSchema: {
            type: 'object',
            properties: {
                url: {
                    type: 'string',
                    description: 'Full URL to inspect on Google Search Console (e.g. "https://www.mutanttechnologies.com/services/seo")'
                }
            },
            required: ['url']
        }
    },
    {
        name: 'resubmit_sitemap',
        description: 'Ping and resubmit https://www.mutanttechnologies.com/sitemap.xml to Google Search Console to nudge Google to recrawl the site.',
        inputSchema: {
            type: 'object',
            properties: {}
        }
    },
    {
        name: 'generate_cover',
        description: 'Generate a 1200×630 branded cover image PNG on the server using next/og ImageResponse, upload it to Supabase Storage at assets/covers/<slug>.png (overwriting if it exists), and return the public URL. Perfect for blog post headers, OpenGraph social share cards, and service pages.',
        inputSchema: {
            type: 'object',
            properties: {
                title: {
                    type: 'string',
                    description: 'The title of the post or service to display prominently on the cover image (e.g. "What Is White Label GoHighLevel? The Complete Guide in 2026")'
                },
                category: {
                    type: 'string',
                    description: 'Category label displayed in an orange accent pill (e.g. "GoHighLevel", "Technology", "SEO", "Web Development", "AI Automations"). Defaults to "Technology".'
                },
                subtitle: {
                    type: 'string',
                    description: 'Optional subtitle or brief description shown below the title.'
                },
                slug: {
                    type: 'string',
                    description: 'URL slug for the filename assets/covers/<slug>.png (e.g. "what-is-white-label-gohighlevel"). If omitted, auto-generated from title.'
                }
            },
            required: ['title']
        }
    },
    {
        name: 'upload_image',
        description: 'Upload an image (PNG, JPG/JPEG, WebP, SVG, GIF) to Supabase Storage (assets bucket) and get a permanent public CDN URL. Accepts base64 image data (pure base64 or data:image/...;base64,...) and a file name. Use this to upload generated cover images, blog banners, mockups, and client graphics.',
        inputSchema: {
            type: 'object',
            properties: {
                file_name: {
                    type: 'string',
                    description: 'Target filename (e.g. "web-development-cover.png", "covers/white-label-ghl.jpg"). If extension is omitted, defaults to .png'
                },
                image_base64: {
                    type: 'string',
                    description: 'The base64 encoded image string, or a data URL (e.g. data:image/png;base64,...)'
                },
                bucket: {
                    type: 'string',
                    description: 'Target Supabase storage bucket name. Defaults to "assets" (can also use "images" or "blog-images").'
                },
                upsert: {
                    type: 'boolean',
                    description: 'Whether to overwrite an existing file with the same name. Defaults to true.'
                }
            },
            required: ['file_name', 'image_base64']
        }
    },
    {
        name: 'get_logo',
        description: 'Get the official Mutant Technologies logo (logo.png) encoded in base64, along with its data URL and public CDN URL. Use this so Claude can composite, watermark, or include the real brand logo into generated cover images and blog banners.',
        inputSchema: {
            type: 'object',
            properties: {
                format: {
                    type: 'string',
                    description: 'Format to return: "all" (default, returns public URL, data URL, and raw base64), "base64", or "data_url".'
                }
            }
        }
    },
    {
        name: 'get_asset',
        description: 'Retrieve any static website asset (e.g. "logo.png", "icon.png", "favicon.ico") as a base64 encoded string and public URL.',
        inputSchema: {
            type: 'object',
            properties: {
                asset_name: {
                    type: 'string',
                    description: 'Name of the public asset file to fetch (e.g. "logo.png"). Defaults to "logo.png".'
                }
            }
        }
    }
];

export async function OPTIONS() {
    return new Response(null, {
        status: 204,
        headers: corsHeaders()
    });
}

export async function GET(request: Request) {
    if (!verifyAuth(request)) {
        return NextResponse.json({ error: 'Unauthorized: Invalid or missing API key' }, { status: 401, headers: corsHeaders() });
    }

    const acceptHeader = request.headers.get('Accept') || '';
    if (acceptHeader.includes('text/event-stream')) {
        // SSE stream support for legacy/streamable MCP clients
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            start(controller) {
                controller.enqueue(encoder.encode(`event: endpoint\ndata: /api/mcp\n\n`));
            }
        });

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
                ...corsHeaders()
            }
        });
    }

    // Standard JSON discovery for Claude / MCP inspection
    return NextResponse.json({
        status: 'active',
        name: 'mutant-blog-connector',
        description: 'Model Context Protocol (MCP) server for Mutant Technologies blog posting',
        version: '1.0.0',
        capabilities: {
            tools: TOOLS_DEFINITION
        }
    }, { headers: corsHeaders() });
}

export async function POST(request: Request) {
    if (!verifyAuth(request)) {
        return NextResponse.json({
            jsonrpc: '2.0',
            error: { code: -32000, message: 'Unauthorized: Invalid or missing API key' },
            id: null
        }, { status: 401, headers: corsHeaders() });
    }

    try {
        const body = await request.json();
        const { jsonrpc, id, method, params } = body;

        // 1. MCP Initialization handshake
        if (method === 'initialize') {
            return NextResponse.json({
                jsonrpc: '2.0',
                id: id ?? null,
                result: {
                    protocolVersion: '2024-11-05',
                    capabilities: {
                        tools: {}
                    },
                    serverInfo: {
                        name: 'mutant-blog-connector',
                        version: '1.0.0'
                    }
                }
            }, { headers: corsHeaders() });
        }

        // 2. Client initialized notification
        if (method === 'notifications/initialized') {
            return new Response(null, { status: 204, headers: corsHeaders() });
        }

        // 3. Ping
        if (method === 'ping') {
            return NextResponse.json({
                jsonrpc: '2.0',
                id: id ?? null,
                result: {}
            }, { headers: corsHeaders() });
        }

        // 4. List Tools
        if (method === 'tools/list') {
            return NextResponse.json({
                jsonrpc: '2.0',
                id: id ?? null,
                result: {
                    tools: TOOLS_DEFINITION
                }
            }, { headers: corsHeaders() });
        }

        // 5. Tool Call execution
        if (method === 'tools/call') {
            const toolName = params?.name;
            const args = params?.arguments || {};

            if (toolName === 'publish_blog_post') {
                const { title, content, slug, excerpt, category, cover_image, is_published } = args;

                if (!title || !content) {
                    return NextResponse.json({
                        jsonrpc: '2.0',
                        id: id ?? null,
                        result: {
                            isError: true,
                            content: [{ type: 'text', text: 'Error: Both title and content are required.' }]
                        }
                    }, { headers: corsHeaders() });
                }

                // If content looks like Markdown, convert to clean HTML
                const hasHtml = /<[a-z][\s\S]*>/i.test(content);
                const htmlContent = hasHtml ? content : await marked.parse(content);

                // Auto-generate slug if not provided
                let postSlug = slugify(slug || title);
                if (!postSlug) postSlug = `post-${Date.now()}`;

                // Auto-generate excerpt if not provided
                const postExcerpt = excerpt || generateExcerpt(content);

                // Default cover image if none supplied
                const defaultCover = 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop';
                const finalCover = cover_image || defaultCover;

                const supabase = getAdminSupabase();

                // Check if slug already exists
                const { data: existing } = await supabase
                    .from('posts')
                    .select('id, slug, title')
                    .eq('slug', postSlug)
                    .maybeSingle();

                if (existing && args.update_if_exists !== false) {
                    // Update existing post with this slug
                    const updateData: any = {
                        title: title.trim(),
                        excerpt: postExcerpt,
                        content: htmlContent,
                        category: (category || 'Technology').trim(),
                        cover_image: finalCover,
                        is_published: is_published !== false,
                        updated_at: new Date().toISOString()
                    };

                    const { data: updated, error: updateError } = await supabase
                        .from('posts')
                        .update(updateData)
                        .eq('id', existing.id)
                        .select()
                        .single();

                    if (updateError) {
                        return NextResponse.json({
                            jsonrpc: '2.0',
                            id: id ?? null,
                            result: {
                                isError: true,
                                content: [{ type: 'text', text: `Database error updating existing post: ${updateError.message}` }]
                            }
                        }, { headers: corsHeaders() });
                    }

                    try {
                        revalidatePath('/blog');
                        revalidatePath(`/blog/${postSlug}`);
                    } catch (e) {}

                    const liveUrl = `https://www.mutanttechnologies.com/blog/${postSlug}`;
                    const statusLabel = updated.is_published ? 'Published Live' : 'Saved as Draft';

                    return NextResponse.json({
                        jsonrpc: '2.0',
                        id: id ?? null,
                        result: {
                            content: [
                                {
                                    type: 'text',
                                    text: `🎉 Existing blog post "${updated.title}" was updated and ${statusLabel}!\n\n` +
                                          `• Live URL: ${liveUrl}\n` +
                                          `• Slug: ${updated.slug}\n` +
                                          `• Category: ${updated.category}\n` +
                                          `• Status: ${statusLabel}`
                                }
                            ]
                        }
                    }, { headers: corsHeaders() });
                } else if (existing) {
                    postSlug = `${postSlug}-${Date.now().toString().slice(-4)}`;
                }

                const postData = {
                    title: title.trim(),
                    slug: postSlug,
                    excerpt: postExcerpt,
                    content: htmlContent,
                    category: (category || 'Technology').trim(),
                    cover_image: finalCover,
                    is_published: is_published !== false,
                    author_id: 'a0dbf7e8-d53e-495b-b4a6-8a73b41fa819',
                    updated_at: new Date().toISOString()
                };

                const { data: inserted, error: insertError } = await supabase
                    .from('posts')
                    .insert([postData])
                    .select()
                    .single();

                if (insertError) {
                    console.error('Failed to insert blog post from MCP tool:', insertError);
                    return NextResponse.json({
                        jsonrpc: '2.0',
                        id: id ?? null,
                        result: {
                            isError: true,
                            content: [{ type: 'text', text: `Database error inserting post: ${insertError.message}` }]
                        }
                    }, { headers: corsHeaders() });
                }

                try {
                    revalidatePath('/blog');
                    revalidatePath(`/blog/${postSlug}`);
                } catch (revalErr) {
                    console.warn('Revalidation note:', revalErr);
                }

                const liveUrl = `https://www.mutanttechnologies.com/blog/${postSlug}`;
                const statusLabel = inserted.is_published ? 'Published Live' : 'Saved as Draft';

                let indexingInfo = '';
                if (inserted.is_published && args.submit_for_indexing !== false) {
                    const indexRes = await triggerIndexing(liveUrl, 'Claude Blog Publisher');
                    indexingInfo = `\n• Indexing: ${indexRes.message}`;
                }

                return NextResponse.json({
                    jsonrpc: '2.0',
                    id: id ?? null,
                    result: {
                        content: [
                            {
                                type: 'text',
                                text: `🎉 Blog post "${inserted.title}" was successfully ${statusLabel}!\n\n` +
                                      `• Live URL: ${liveUrl}\n` +
                                      `• Slug: ${inserted.slug}\n` +
                                      `• Category: ${inserted.category}\n` +
                                      `• Status: ${statusLabel}\n` +
                                      `• Excerpt: "${inserted.excerpt}"` +
                                      indexingInfo
                            }
                        ]
                    }
                }, { headers: corsHeaders() });
            }

            // TOOL: publish_draft (Flips an existing draft to LIVE)
            if (toolName === 'publish_draft') {
                const { slug, id: postId, is_published, submit_for_indexing } = args;
                if (!slug && !postId) {
                    return NextResponse.json({
                        jsonrpc: '2.0',
                        id: id ?? null,
                        result: {
                            isError: true,
                            content: [{ type: 'text', text: 'Error: Must provide the slug or id of the draft to publish.' }]
                        }
                    }, { headers: corsHeaders() });
                }

                const supabase = getAdminSupabase();
                const query = supabase.from('posts').select('id, title, slug, is_published');
                if (postId) query.eq('id', postId);
                else query.eq('slug', slug);

                const { data: post, error: findError } = await query.maybeSingle();

                if (findError || !post) {
                    return NextResponse.json({
                        jsonrpc: '2.0',
                        id: id ?? null,
                        result: {
                            isError: true,
                            content: [{ type: 'text', text: `Post not found with slug/id: "${slug || postId}"` }]
                        }
                    }, { headers: corsHeaders() });
                }

                const targetStatus = is_published !== false;
                const { data: updated, error: updateError } = await supabase
                    .from('posts')
                    .update({
                        is_published: targetStatus,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', post.id)
                    .select()
                    .single();

                if (updateError) {
                    return NextResponse.json({
                        jsonrpc: '2.0',
                        id: id ?? null,
                        result: {
                            isError: true,
                            content: [{ type: 'text', text: `Failed to update publish status: ${updateError.message}` }]
                        }
                    }, { headers: corsHeaders() });
                }

                try {
                    revalidatePath('/blog');
                    revalidatePath(`/blog/${post.slug}`);
                } catch (e) {}

                const liveUrl = `https://www.mutanttechnologies.com/blog/${post.slug}`;
                let indexingInfo = '';
                if (targetStatus && submit_for_indexing !== false) {
                    const indexRes = await triggerIndexing(liveUrl, 'Claude Draft Publisher');
                    indexingInfo = `\n• Indexing: ${indexRes.message}`;
                }

                const statusText = targetStatus ? 'LIVE on the website' : 'turned back to DRAFT';
                return NextResponse.json({
                    jsonrpc: '2.0',
                    id: id ?? null,
                    result: {
                        content: [
                            {
                                type: 'text',
                                text: `🎉 Success! The post "${post.title}" is now ${statusText}!\n\n` +
                                      `• Live URL: ${liveUrl}\n` +
                                      `• Status: ${targetStatus ? 'Published Live' : 'Draft'}` +
                                      indexingInfo
                            }
                        ]
                    }
                }, { headers: corsHeaders() });
            }

            // TOOL: update_blog_post
            if (toolName === 'update_blog_post') {
                const { slug, id: postId, title, content, new_slug, excerpt, category, cover_image, is_published } = args;

                if (!slug && !postId) {
                    return NextResponse.json({
                        jsonrpc: '2.0',
                        id: id ?? null,
                        result: {
                            isError: true,
                            content: [{ type: 'text', text: 'Error: Must provide the slug or id of the post to update.' }]
                        }
                    }, { headers: corsHeaders() });
                }

                const supabase = getAdminSupabase();
                const findQuery = supabase.from('posts').select('*');
                if (postId) findQuery.eq('id', postId);
                else findQuery.eq('slug', slug);

                const { data: existingPost, error: findError } = await findQuery.maybeSingle();

                if (findError || !existingPost) {
                    return NextResponse.json({
                        jsonrpc: '2.0',
                        id: id ?? null,
                        result: {
                            isError: true,
                            content: [{ type: 'text', text: `Post not found with slug/id: "${slug || postId}"` }]
                        }
                    }, { headers: corsHeaders() });
                }

                const updatePayload: any = {
                    updated_at: new Date().toISOString()
                };

                if (title) updatePayload.title = title.trim();
                if (content) {
                    const hasHtml = /<[a-z][\s\S]*>/i.test(content);
                    updatePayload.content = hasHtml ? content : await marked.parse(content);
                }
                if (new_slug) updatePayload.slug = slugify(new_slug);
                if (excerpt) updatePayload.excerpt = excerpt.trim();
                if (category) updatePayload.category = category.trim();
                if (cover_image) updatePayload.cover_image = cover_image.trim();
                if (is_published !== undefined) updatePayload.is_published = Boolean(is_published);

                const { data: updatedPost, error: updateError } = await supabase
                    .from('posts')
                    .update(updatePayload)
                    .eq('id', existingPost.id)
                    .select()
                    .single();

                if (updateError) {
                    return NextResponse.json({
                        jsonrpc: '2.0',
                        id: id ?? null,
                        result: {
                            isError: true,
                            content: [{ type: 'text', text: `Failed to update post: ${updateError.message}` }]
                        }
                    }, { headers: corsHeaders() });
                }

                try {
                    revalidatePath('/blog');
                    revalidatePath(`/blog/${existingPost.slug}`);
                    if (updatedPost.slug !== existingPost.slug) {
                        revalidatePath(`/blog/${updatedPost.slug}`);
                    }
                } catch (e) {}

                const statusLabel = updatedPost.is_published ? 'Published Live' : 'Draft';
                return NextResponse.json({
                    jsonrpc: '2.0',
                    id: id ?? null,
                    result: {
                        content: [
                            {
                                type: 'text',
                                text: `✓ Blog post "${updatedPost.title}" was successfully updated!\n\n` +
                                      `• Live URL: https://www.mutanttechnologies.com/blog/${updatedPost.slug}\n` +
                                      `• Status: ${statusLabel}\n` +
                                      `• Category: ${updatedPost.category}`
                            }
                        ]
                    }
                }, { headers: corsHeaders() });
            }

            // TOOL: get_blog_post
            if (toolName === 'get_blog_post') {
                const { slug, id: postId } = args;
                if (!slug && !postId) {
                    return NextResponse.json({
                        jsonrpc: '2.0',
                        id: id ?? null,
                        result: {
                            isError: true,
                            content: [{ type: 'text', text: 'Error: Must provide slug or id to fetch post.' }]
                        }
                    }, { headers: corsHeaders() });
                }

                const supabase = getAdminSupabase();
                const query = supabase.from('posts').select('*');
                if (postId) query.eq('id', postId);
                else query.eq('slug', slug);

                const { data: post, error } = await query.maybeSingle();

                if (error || !post) {
                    return NextResponse.json({
                        jsonrpc: '2.0',
                        id: id ?? null,
                        result: {
                            isError: true,
                            content: [{ type: 'text', text: `Post not found: ${slug || postId}` }]
                        }
                    }, { headers: corsHeaders() });
                }

                return NextResponse.json({
                    jsonrpc: '2.0',
                    id: id ?? null,
                    result: {
                        content: [
                            {
                                type: 'text',
                                text: `Post Details:\n\n` +
                                      `• Title: ${post.title}\n` +
                                      `• Slug: ${post.slug}\n` +
                                      `• Status: ${post.is_published ? 'LIVE' : 'DRAFT'}\n` +
                                      `• Category: ${post.category}\n` +
                                      `• Excerpt: ${post.excerpt}\n` +
                                      `• Cover Image: ${post.cover_image}\n` +
                                      `• Content:\n\n${post.content}`
                            }
                        ]
                    }
                }, { headers: corsHeaders() });
            }

            // TOOL: delete_blog_post
            if (toolName === 'delete_blog_post') {
                const { slug, id: postId } = args;
                if (!slug && !postId) {
                    return NextResponse.json({
                        jsonrpc: '2.0',
                        id: id ?? null,
                        result: {
                            isError: true,
                            content: [{ type: 'text', text: 'Error: Must provide slug or id of post to delete.' }]
                        }
                    }, { headers: corsHeaders() });
                }

                const supabase = getAdminSupabase();
                const query = supabase.from('posts').delete();
                if (postId) query.eq('id', postId);
                else query.eq('slug', slug);

                const { error } = await query;

                if (error) {
                    return NextResponse.json({
                        jsonrpc: '2.0',
                        id: id ?? null,
                        result: {
                            isError: true,
                            content: [{ type: 'text', text: `Failed to delete post: ${error.message}` }]
                        }
                    }, { headers: corsHeaders() });
                }

                try {
                    revalidatePath('/blog');
                    if (slug) revalidatePath(`/blog/${slug}`);
                } catch (e) {}

                return NextResponse.json({
                    jsonrpc: '2.0',
                    id: id ?? null,
                    result: {
                        content: [{ type: 'text', text: `✓ Successfully deleted post "${slug || postId}".` }]
                    }
                }, { headers: corsHeaders() });
            }

            // TOOL: list_recent_posts
            if (toolName === 'list_recent_posts') {
                const limit = Math.min(Number(args.limit) || 15, 50);
                const supabase = getAdminSupabase();
                const { data: posts, error } = await supabase
                    .from('posts')
                    .select('id, title, slug, category, is_published, created_at')
                    .order('created_at', { ascending: false })
                    .limit(limit);

                if (error) {
                    return NextResponse.json({
                        jsonrpc: '2.0',
                        id: id ?? null,
                        result: {
                            isError: true,
                            content: [{ type: 'text', text: `Failed to fetch posts: ${error.message}` }]
                        }
                    }, { headers: corsHeaders() });
                }

                const summary = (posts || []).map((p, idx) => 
                    `${idx + 1}. [${p.is_published ? 'LIVE' : 'DRAFT'}] "${p.title}"\n   Slug: ${p.slug}\n   Category: ${p.category} | Created: ${new Date(p.created_at).toLocaleDateString()}`
                ).join('\n\n');

                return NextResponse.json({
                    jsonrpc: '2.0',
                    id: id ?? null,
                    result: {
                        content: [
                            {
                                type: 'text',
                                text: `Found ${posts?.length || 0} recent blog posts on mutanttechnologies.com:\n\n${summary || 'No posts found.'}`
                            }
                        ]
                    }
                }, { headers: corsHeaders() });
            }

            // TOOL: list_services
            if (toolName === 'list_services') {
                const supabase = getAdminSupabase();
                const [servicesRes, metadataRes] = await Promise.all([
                    supabase.from('services').select('id, slug, title, short_description, tools, created_at, content, process, benefits').order('title'),
                    supabase.from('page_metadata').select('page_slug, title, keywords, description')
                ]);

                if (servicesRes.error) {
                    return NextResponse.json({
                        jsonrpc: '2.0',
                        id: id ?? null,
                        result: {
                            isError: true,
                            content: [{ type: 'text', text: `Failed to fetch services: ${servicesRes.error.message}` }]
                        }
                    }, { headers: corsHeaders() });
                }

                const metadataMap = new Map();
                (metadataRes.data || []).forEach(m => {
                    const clean = (m.page_slug || '').replace(/^\/+/, '').replace(/^services\//, '');
                    metadataMap.set(clean, m);
                    metadataMap.set(m.page_slug, m);
                });

                const services = servicesRes.data || [];
                const formatted = services.map((s, idx) => {
                    const meta = metadataMap.get(s.slug) || metadataMap.get(`/services/${s.slug}`) || metadataMap.get(`services/${s.slug}`);
                    const kwCount = meta?.keywords ? (Array.isArray(meta.keywords) ? meta.keywords.length : 1) : 0;
                    const kwText = kwCount > 0 ? (Array.isArray(meta.keywords) ? meta.keywords.join(', ') : meta.keywords) : 'None';
                    const metaTitle = meta?.title ? `"${meta.title}"` : 'Default';
                    const contentLength = s.content ? s.content.length : 0;
                    const processCount = Array.isArray(s.process) ? s.process.length : 0;
                    const benefitsCount = Array.isArray(s.benefits) ? s.benefits.length : 0;

                    return `${idx + 1}. ${s.title}\n` +
                           `   • Slug: ${s.slug} (https://www.mutanttechnologies.com/services/${s.slug})\n` +
                           `   • Main Text: ${contentLength > 0 ? `${contentLength} chars (saved in full)` : 'Empty'}\n` +
                           `   • Process Steps: ${processCount} | Benefits: ${benefitsCount}\n` +
                           `   • Summary: ${s.short_description || 'No summary set'}\n` +
                           `   • Tools/Tech: ${s.tools?.join(', ') || 'None listed'}\n` +
                           `   • SEO Meta Title: ${metaTitle}\n` +
                           `   • SEO Keywords (${kwCount}): ${kwText}`;
                }).join('\n\n');

                return NextResponse.json({
                    jsonrpc: '2.0',
                    id: id ?? null,
                    result: {
                        content: [
                            {
                                type: 'text',
                                text: `Found ${services.length} services on mutanttechnologies.com:\n\n${formatted || 'No services found.'}`
                            }
                        ]
                    }
                }, { headers: corsHeaders() });
            }

            // TOOL: get_service
            if (toolName === 'get_service') {
                const { slug, id: serviceId } = args;
                if (!slug && !serviceId) {
                    return NextResponse.json({
                        jsonrpc: '2.0',
                        id: id ?? null,
                        result: {
                            isError: true,
                            content: [{ type: 'text', text: 'Error: Must provide the slug or id of the service to fetch.' }]
                        }
                    }, { headers: corsHeaders() });
                }

                const supabase = getAdminSupabase();
                const query = supabase.from('services').select('*');
                if (serviceId) query.eq('id', serviceId);
                else query.eq('slug', slug);

                const { data: service, error } = await query.maybeSingle();

                if (error || !service) {
                    return NextResponse.json({
                        jsonrpc: '2.0',
                        id: id ?? null,
                        result: {
                            isError: true,
                            content: [{ type: 'text', text: `Service not found: "${slug || serviceId}"` }]
                        }
                    }, { headers: corsHeaders() });
                }

                const cleanSlug = service.slug.replace(/^\/+/, '');
                const { data: seoData } = await supabase
                    .from('page_metadata')
                    .select('*')
                    .or(`page_slug.eq."/services/${cleanSlug}",page_slug.eq."services/${cleanSlug}"`)
                    .limit(1)
                    .maybeSingle();

                const kwList = seoData?.keywords ? (Array.isArray(seoData.keywords) ? seoData.keywords : [seoData.keywords]) : [];

                return NextResponse.json({
                    jsonrpc: '2.0',
                    id: id ?? null,
                    result: {
                        content: [
                            {
                                type: 'text',
                                text: `Service Details for "${service.title}":\n\n` +
                                      `• URL: https://www.mutanttechnologies.com/services/${service.slug}\n` +
                                      `• Title: ${service.title}\n` +
                                      `• Slug: ${service.slug}\n` +
                                      `• Icon: ${service.icon || 'Monitor'}\n` +
                                      `• Short Description: ${service.short_description || 'None'}\n` +
                                      `• Full Description: ${service.description || 'None'}\n` +
                                      `• Tools/Stack: ${service.tools?.join(', ') || 'None'}\n` +
                                      `• Media: Hero=${service.hero_image || 'None'}, Benefits=${service.benefits_image || 'None'}, Mockup=${service.feature_mockup_image || 'None'}\n` +
                                      `• Has Custom Data: ${service.custom_data && Object.keys(service.custom_data).length > 0 ? 'Yes' : 'No'}\n\n` +
                                      `--- SEO METADATA ---\n` +
                                      `• Meta Title: ${seoData?.title || 'Default'}\n` +
                                      `• Meta Description: ${seoData?.description || 'Default'}\n` +
                                      `• Target Keywords: ${kwList.length > 0 ? kwList.join(', ') : 'None configured'}\n` +
                                      `• Canonical URL: ${seoData?.canonical_url || `https://www.mutanttechnologies.com/services/${service.slug}`}\n` +
                                      `• OpenGraph Title: ${seoData?.og_title || 'Same as title'}\n` +
                                      `• Robots: ${seoData?.robots || 'index, follow'}\n\n` +
                                      `--- FULL MAIN TEXT / PAGE CONTENT (${service.content?.length || 0} characters) ---\n` +
                                      `${service.content || 'No content written yet.'}\n\n` +
                                      `--- PROCESS WORKFLOW (${service.process?.length || 0} steps) ---\n` +
                                      `${JSON.stringify(service.process || [], null, 2)}\n\n` +
                                      `--- BENEFITS (${service.benefits?.length || 0} items) ---\n` +
                                      `${JSON.stringify(service.benefits || [], null, 2)}\n\n` +
                                      `--- FEATURES (${service.features?.length || 0} items) ---\n` +
                                      `${JSON.stringify(service.features || [], null, 2)}\n\n` +
                                      `--- CUSTOM DATA ---\n` +
                                      `${JSON.stringify(service.custom_data || {}, null, 2)}\n\n` +
                                      `--- COMPLETE RAW BACKUP (JSON) ---\n` +
                                      `${JSON.stringify(service, null, 2)}`
                            }
                        ]
                    }
                }, { headers: corsHeaders() });
            }

            // TOOL: create_service
            if (toolName === 'create_service') {
                const {
                    title,
                    slug,
                    short_description,
                    description,
                    content,
                    icon,
                    color,
                    bg_gradient,
                    features,
                    tools,
                    process,
                    benefits,
                    custom_data,
                    hero_image,
                    benefits_image,
                    feature_mockup_image,
                    meta_title,
                    meta_description,
                    keywords,
                    submit_for_indexing
                } = args;

                if (!title) {
                    return NextResponse.json({
                        jsonrpc: '2.0',
                        id: id ?? null,
                        result: {
                            isError: true,
                            content: [{ type: 'text', text: 'Error: Service title is required.' }]
                        }
                    }, { headers: corsHeaders() });
                }

                const serviceSlug = slug ? slugify(slug) : slugify(title);
                const supabase = getAdminSupabase();

                const servicePayload: any = {
                    title: title.trim(),
                    slug: serviceSlug,
                    short_description: short_description || '',
                    description: description || '',
                    content: content || '',
                    icon: icon || 'Monitor',
                    color: color || 'bg-blue-500',
                    bg_gradient: bg_gradient || 'from-blue-500 to-cyan-500',
                    features: features || [],
                    tools: tools || [],
                    process: process || [],
                    benefits: benefits || [],
                    custom_data: custom_data || {},
                    created_at: new Date().toISOString()
                };

                if (hero_image) servicePayload.hero_image = hero_image.trim();
                if (benefits_image) servicePayload.benefits_image = benefits_image.trim();
                if (feature_mockup_image) servicePayload.feature_mockup_image = feature_mockup_image.trim();

                const { data: inserted, error: insertError } = await supabase
                    .from('services')
                    .insert([servicePayload])
                    .select()
                    .single();

                if (insertError) {
                    return NextResponse.json({
                        jsonrpc: '2.0',
                        id: id ?? null,
                        result: {
                            isError: true,
                            content: [{ type: 'text', text: `Failed to create service: ${insertError.message}` }]
                        }
                    }, { headers: corsHeaders() });
                }

                let seoSummary = '';
                if (meta_title || meta_description || keywords) {
                    try {
                        const seoRes = await upsertServiceSeo(supabase, serviceSlug, {
                            meta_title,
                            meta_description,
                            keywords
                        });
                        seoSummary = `\n• SEO Meta Title: ${seoRes.title}\n• Target Keywords: ${(seoRes.keywords || []).join(', ')}`;
                    } catch (seoErr: any) {
                        console.warn('SEO upsert note:', seoErr);
                    }
                }

                try {
                    revalidatePath('/services');
                    revalidatePath(`/services/${serviceSlug}`);
                } catch (e) {}

                const liveUrl = `https://www.mutanttechnologies.com/services/${serviceSlug}`;
                let indexingSummary = '';
                if (submit_for_indexing !== false) {
                    const indexRes = await triggerIndexing(liveUrl, 'Claude Service Creator');
                    indexingSummary = `\n• Indexing: ${indexRes.message}`;
                }

                return NextResponse.json({
                    jsonrpc: '2.0',
                    id: id ?? null,
                    result: {
                        content: [
                            {
                                type: 'text',
                                text: `🎉 Service "${inserted.title}" was successfully created!\n\n` +
                                      `• Live URL: ${liveUrl}\n` +
                                      `• Slug: ${inserted.slug}\n` +
                                      `• Summary: ${inserted.short_description || 'None'}\n` +
                                      `• Tools/Tech: ${inserted.tools?.join(', ') || 'None'}` +
                                      seoSummary + indexingSummary
                            }
                        ]
                    }
                }, { headers: corsHeaders() });
            }

            // TOOL: update_service
            if (toolName === 'update_service') {
                const {
                    slug,
                    id: serviceId,
                    new_slug,
                    title,
                    short_description,
                    description,
                    content,
                    icon,
                    color,
                    bg_gradient,
                    features,
                    tools,
                    process,
                    benefits,
                    custom_data,
                    hero_image,
                    benefits_image,
                    feature_mockup_image,
                    meta_title,
                    meta_description,
                    keywords,
                    submit_for_indexing
                } = args;

                if (!slug && !serviceId) {
                    return NextResponse.json({
                        jsonrpc: '2.0',
                        id: id ?? null,
                        result: {
                            isError: true,
                            content: [{ type: 'text', text: 'Error: Must provide the slug or id of the service to update.' }]
                        }
                    }, { headers: corsHeaders() });
                }

                const supabase = getAdminSupabase();
                const findQuery = supabase.from('services').select('*');
                if (serviceId) findQuery.eq('id', serviceId);
                else findQuery.eq('slug', slug);

                const { data: existing, error: findError } = await findQuery.maybeSingle();

                if (findError || !existing) {
                    return NextResponse.json({
                        jsonrpc: '2.0',
                        id: id ?? null,
                        result: {
                            isError: true,
                            content: [{ type: 'text', text: `Service not found: "${slug || serviceId}"` }]
                        }
                    }, { headers: corsHeaders() });
                }

                const updatePayload: any = {};
                if (title !== undefined) updatePayload.title = title.trim();
                if (new_slug !== undefined) updatePayload.slug = slugify(new_slug);
                if (short_description !== undefined) updatePayload.short_description = short_description;
                if (description !== undefined) updatePayload.description = description;
                if (content !== undefined) updatePayload.content = content;
                if (icon !== undefined) updatePayload.icon = icon;
                if (color !== undefined) updatePayload.color = color;
                if (bg_gradient !== undefined) updatePayload.bg_gradient = bg_gradient;
                if (features !== undefined) updatePayload.features = features;
                if (tools !== undefined) updatePayload.tools = tools;
                if (process !== undefined) updatePayload.process = process;
                if (benefits !== undefined) updatePayload.benefits = benefits;
                if (custom_data !== undefined) updatePayload.custom_data = custom_data;
                if (hero_image !== undefined) updatePayload.hero_image = hero_image;
                if (benefits_image !== undefined) updatePayload.benefits_image = benefits_image;
                if (feature_mockup_image !== undefined) updatePayload.feature_mockup_image = feature_mockup_image;

                let updatedService = existing;
                if (Object.keys(updatePayload).length > 0) {
                    const { data: updated, error: updateError } = await supabase
                        .from('services')
                        .update(updatePayload)
                        .eq('id', existing.id)
                        .select()
                        .single();

                    if (updateError) {
                        return NextResponse.json({
                            jsonrpc: '2.0',
                            id: id ?? null,
                            result: {
                                isError: true,
                                content: [{ type: 'text', text: `Failed to update service: ${updateError.message}` }]
                            }
                        }, { headers: corsHeaders() });
                    }
                    updatedService = updated;
                }

                const targetSlug = updatedService.slug;
                let seoSummary = '';
                if (meta_title !== undefined || meta_description !== undefined || keywords !== undefined) {
                    try {
                        const seoRes = await upsertServiceSeo(supabase, targetSlug, {
                            meta_title,
                            meta_description,
                            keywords
                        });
                        seoSummary = `\n• SEO Meta Title: ${seoRes.title}\n• Target Keywords: ${(seoRes.keywords || []).join(', ')}`;
                    } catch (seoErr: any) {
                        console.warn('SEO upsert note:', seoErr);
                    }
                }

                try {
                    revalidatePath('/services');
                    revalidatePath(`/services/${existing.slug}`);
                    if (targetSlug !== existing.slug) {
                        revalidatePath(`/services/${targetSlug}`);
                    }
                } catch (e) {}

                const liveUrl = `https://www.mutanttechnologies.com/services/${targetSlug}`;
                let indexingSummary = '';
                if (submit_for_indexing === true) {
                    const indexRes = await triggerIndexing(liveUrl, 'Claude Service Update');
                    indexingSummary = `\n• Indexing: ${indexRes.message}`;
                }

                return NextResponse.json({
                    jsonrpc: '2.0',
                    id: id ?? null,
                    result: {
                        content: [
                            {
                                type: 'text',
                                text: `✓ Service "${updatedService.title}" was successfully updated!\n\n` +
                                      `• Live URL: ${liveUrl}\n` +
                                      `• Slug: ${updatedService.slug}\n` +
                                      `• Updated Fields: ${Object.keys(updatePayload).join(', ') || 'SEO metadata only'}` +
                                      seoSummary + indexingSummary
                            }
                        ]
                    }
                }, { headers: corsHeaders() });
            }

            // TOOL: update_service_seo
            if (toolName === 'update_service_seo') {
                const {
                    slug,
                    meta_title,
                    meta_description,
                    keywords,
                    og_title,
                    og_description,
                    canonical_url,
                    robots,
                    submit_for_indexing
                } = args;

                if (!slug) {
                    return NextResponse.json({
                        jsonrpc: '2.0',
                        id: id ?? null,
                        result: {
                            isError: true,
                            content: [{ type: 'text', text: 'Error: Must provide the service slug (e.g. "white-label-gohighlevel", "seo").' }]
                        }
                    }, { headers: corsHeaders() });
                }

                const supabase = getAdminSupabase();
                const cleanSlug = slug.replace(/^\/+/, '').replace(/^services\//, '');

                try {
                    const updatedSeo = await upsertServiceSeo(supabase, cleanSlug, {
                        meta_title,
                        meta_description,
                        keywords,
                        og_title,
                        og_description,
                        canonical_url,
                        robots
                    });

                    try {
                        revalidatePath(`/services/${cleanSlug}`);
                    } catch (e) {}

                    const liveUrl = `https://www.mutanttechnologies.com/services/${cleanSlug}`;
                    let indexingMsg = '';
                    if (submit_for_indexing !== false) {
                        const indexRes = await triggerIndexing(liveUrl, 'Claude Service SEO');
                        indexingMsg = `\n• Indexing: ${indexRes.message}`;
                    }

                    return NextResponse.json({
                        jsonrpc: '2.0',
                        id: id ?? null,
                        result: {
                            content: [
                                {
                                    type: 'text',
                                    text: `🎯 SEO metadata for "/services/${cleanSlug}" was successfully updated!\n\n` +
                                          `• Live Page: ${liveUrl}\n` +
                                          `• Meta Title: "${updatedSeo.title}"\n` +
                                          `• Meta Description: "${updatedSeo.description || 'None'}"\n` +
                                          `• Target Keywords (${updatedSeo.keywords?.length || 0}): ${(updatedSeo.keywords || []).join(', ') || 'None'}\n` +
                                          `• Canonical URL: ${updatedSeo.canonical_url || liveUrl}` +
                                          indexingMsg
                                }
                            ]
                        }
                    }, { headers: corsHeaders() });
                } catch (err: any) {
                    return NextResponse.json({
                        jsonrpc: '2.0',
                        id: id ?? null,
                        result: {
                            isError: true,
                            content: [{ type: 'text', text: `Failed to update service SEO: ${err.message}` }]
                        }
                    }, { headers: corsHeaders() });
                }
            }

            // TOOL: delete_service
            if (toolName === 'delete_service') {
                const { slug, id: serviceId } = args;
                if (!slug && !serviceId) {
                    return NextResponse.json({
                        jsonrpc: '2.0',
                        id: id ?? null,
                        result: {
                            isError: true,
                            content: [{ type: 'text', text: 'Error: Must provide slug or id of service to delete.' }]
                        }
                    }, { headers: corsHeaders() });
                }

                const supabase = getAdminSupabase();
                const query = supabase.from('services').delete();
                if (serviceId) query.eq('id', serviceId);
                else query.eq('slug', slug);

                const { error } = await query;

                if (error) {
                    return NextResponse.json({
                        jsonrpc: '2.0',
                        id: id ?? null,
                        result: {
                            isError: true,
                            content: [{ type: 'text', text: `Failed to delete service: ${error.message}` }]
                        }
                    }, { headers: corsHeaders() });
                }

                try {
                    revalidatePath('/services');
                    if (slug) revalidatePath(`/services/${slug}`);
                } catch (e) {}

                return NextResponse.json({
                    jsonrpc: '2.0',
                    id: id ?? null,
                    result: {
                        content: [{ type: 'text', text: `✓ Successfully deleted service "${slug || serviceId}".` }]
                    }
                }, { headers: corsHeaders() });
            }

            // TOOL: submit_for_indexing
            if (toolName === 'submit_for_indexing') {
                const { url, slug, page_type } = args;
                let targetUrl = url;

                if (!targetUrl && slug) {
                    const clean = slug.replace(/^\/+/, '');
                    if (page_type === 'service') targetUrl = `${SITE_URL}/services/${clean}`;
                    else if (page_type === 'static') targetUrl = `${SITE_URL}/${clean}`;
                    else targetUrl = `${SITE_URL}/blog/${clean}`;
                }

                if (!targetUrl) {
                    return NextResponse.json({
                        jsonrpc: '2.0',
                        id: id ?? null,
                        result: {
                            isError: true,
                            content: [{ type: 'text', text: 'Error: Must provide full url or slug to submit for indexing.' }]
                        }
                    }, { headers: corsHeaders() });
                }

                const indexResult = await triggerIndexing(targetUrl, 'Claude Indexing Tool');

                return NextResponse.json({
                    jsonrpc: '2.0',
                    id: id ?? null,
                    result: {
                        content: [
                            {
                                type: 'text',
                                text: `🚀 Search Engine Indexing Submission:\n\n` +
                                      `• URL: ${targetUrl}\n` +
                                      `• Status: ${indexResult.ok ? 'SUCCESS' : 'COMPLETED WITH WARNINGS'}\n` +
                                      `• Details: ${indexResult.message}`
                            }
                        ]
                    }
                }, { headers: corsHeaders() });
            }

            // TOOL: inspect_url_index_status
            if (toolName === 'inspect_url_index_status') {
                const { url } = args;
                if (!url) {
                    return NextResponse.json({
                        jsonrpc: '2.0',
                        id: id ?? null,
                        result: {
                            isError: true,
                            content: [{ type: 'text', text: 'Error: Must provide full url to inspect on Google Search Console.' }]
                        }
                    }, { headers: corsHeaders() });
                }

                if (!isGscConfigured()) {
                    return NextResponse.json({
                        jsonrpc: '2.0',
                        id: id ?? null,
                        result: {
                            content: [
                                {
                                    type: 'text',
                                    text: 'Google Search Console credentials are not fully configured in environment variables (requires service account email and private key).'
                                }
                            ]
                        }
                    }, { headers: corsHeaders() });
                }

                try {
                    const inspection = await inspectUrl(url);
                    await logIndexingEvent({
                        action: 'inspect',
                        url,
                        status: 'success',
                        message: `Verdict: ${inspection.verdict} | Coverage: ${inspection.coverageState || 'n/a'}`,
                        triggeredBy: 'Claude Inspection Tool'
                    });

                    return NextResponse.json({
                        jsonrpc: '2.0',
                        id: id ?? null,
                        result: {
                            content: [
                                {
                                    type: 'text',
                                    text: `Google Search Console Inspection for "${url}":\n\n` +
                                          `• Verdict: ${inspection.verdict}\n` +
                                          `• Coverage State: ${inspection.coverageState || 'Unknown'}\n` +
                                          `• Last Crawl Time: ${inspection.lastCrawlTime || 'Not crawled yet'}\n` +
                                          `• Page Fetch State: ${inspection.pageFetchState || 'Unknown'}\n` +
                                          `• Robots.txt State: ${inspection.robotsTxtState || 'Unknown'}\n` +
                                          `• Search Console UI Link: ${inspection.inspectionResultLink || 'N/A'}`
                                }
                            ]
                        }
                    }, { headers: corsHeaders() });
                } catch (inspErr: any) {
                    return NextResponse.json({
                        jsonrpc: '2.0',
                        id: id ?? null,
                        result: {
                            isError: true,
                            content: [{ type: 'text', text: `Google URL inspection error: ${inspErr.message}` }]
                        }
                    }, { headers: corsHeaders() });
                }
            }

            // TOOL: resubmit_sitemap
            if (toolName === 'resubmit_sitemap') {
                if (!isGscConfigured()) {
                    return NextResponse.json({
                        jsonrpc: '2.0',
                        id: id ?? null,
                        result: {
                            content: [{ type: 'text', text: 'Google Search Console is not configured.' }]
                        }
                    }, { headers: corsHeaders() });
                }

                try {
                    await submitSitemap(`${SITE_URL}/sitemap.xml`);
                    await logIndexingEvent({
                        action: 'sitemap_submit',
                        status: 'success',
                        message: 'Sitemap resubmitted to Google',
                        triggeredBy: 'Claude Sitemap Tool'
                    });

                    return NextResponse.json({
                        jsonrpc: '2.0',
                        id: id ?? null,
                        result: {
                            content: [
                                {
                                    type: 'text',
                                    text: `✓ Successfully resubmitted https://www.mutanttechnologies.com/sitemap.xml to Google Search Console at ${new Date().toISOString()}. Google has been notified to recrawl the site.`
                                }
                            ]
                        }
                    }, { headers: corsHeaders() });
                } catch (sitemapErr: any) {
                    return NextResponse.json({
                        jsonrpc: '2.0',
                        id: id ?? null,
                        result: {
                            isError: true,
                            content: [{ type: 'text', text: `Failed to resubmit sitemap: ${sitemapErr.message}` }]
                        }
                    }, { headers: corsHeaders() });
                }
            }

            // TOOL: generate_cover
            if (toolName === 'generate_cover') {
                const { title, category, subtitle, slug } = args;

                if (!title || typeof title !== 'string' || !title.trim()) {
                    return NextResponse.json({
                        jsonrpc: '2.0',
                        id: id ?? null,
                        result: {
                            isError: true,
                            content: [{ type: 'text', text: 'Error: "title" is required to generate a cover image.' }]
                        }
                    }, { headers: corsHeaders() });
                }

                // Clean and resolve the slug
                const rawSlug = (slug || title || `cover-${Date.now()}`)
                    .toString()
                    .trim()
                    .replace(/^covers\//i, '')
                    .replace(/\.png$/i, '');
                const cleanSlug = slugify(rawSlug) || `cover-${Date.now()}`;
                const storagePath = `covers/${cleanSlug}.png`;

                try {
                    // 1. Render 1200x630 PNG with next/og ImageResponse
                    const buffer = await renderCoverImage({
                        title: title.trim(),
                        category: category ? String(category) : undefined,
                        subtitle: subtitle ? String(subtitle) : undefined,
                    });

                    // 2. Upload to Supabase Storage (assets bucket, overwriting if exists)
                    const supabase = getAdminSupabase();
                    const { error: uploadError } = await supabase.storage
                        .from('assets')
                        .upload(storagePath, buffer, {
                            contentType: 'image/png',
                            upsert: true,
                            cacheControl: '3600',
                        });

                    if (uploadError) {
                        console.error('Supabase cover upload error:', uploadError);
                        return NextResponse.json({
                            jsonrpc: '2.0',
                            id: id ?? null,
                            result: {
                                isError: true,
                                content: [{ type: 'text', text: `Failed to upload cover image to Supabase (assets/${storagePath}): ${uploadError.message}` }]
                            }
                        }, { headers: corsHeaders() });
                    }

                    // 3. Obtain public URL
                    const { data: { publicUrl } } = supabase.storage
                        .from('assets')
                        .getPublicUrl(storagePath);

                    return NextResponse.json({
                        jsonrpc: '2.0',
                        id: id ?? null,
                        result: {
                            content: [
                                {
                                    type: 'text',
                                    text: `🎉 Cover image successfully generated and uploaded!\n\n` +
                                          `• Public URL: ${publicUrl}\n` +
                                          `• Storage Path: assets/${storagePath}\n` +
                                          `• Slug: ${cleanSlug}\n` +
                                          `• Title: ${title.trim()}\n` +
                                          `• Category: ${category || 'Technology'}\n` +
                                          `• Subtitle: ${subtitle || 'None'}\n` +
                                          `• Dimensions: 1200×630 PNG\n` +
                                          `• Size: ${(buffer.length / 1024).toFixed(1)} KB\n\n` +
                                          `Markdown embed:\n![${title.trim()}](${publicUrl})`
                                }
                            ],
                            public_url: publicUrl,
                            url: publicUrl,
                            storage_path: storagePath,
                            slug: cleanSlug
                        }
                    }, { headers: corsHeaders() });

                } catch (err: any) {
                    console.error('Cover generation error:', err);
                    return NextResponse.json({
                        jsonrpc: '2.0',
                        id: id ?? null,
                        result: {
                            isError: true,
                            content: [{ type: 'text', text: `Failed to generate cover image: ${err.message}` }]
                        }
                    }, { headers: corsHeaders() });
                }
            }

            // TOOL: upload_image
            if (toolName === 'upload_image') {
                const fileName = args.file_name || args.filename || args.name || `image-${Date.now()}.png`;
                const rawBase64 = args.image_base64 || args.base64 || args.image || args.content || '';
                const bucket = args.bucket || 'assets';
                const upsert = args.upsert !== false;

                if (!rawBase64) {
                    return NextResponse.json({
                        jsonrpc: '2.0',
                        id: id ?? null,
                        result: {
                            isError: true,
                            content: [{ type: 'text', text: 'Error: Must provide "image_base64" (base64 string or data:image/...;base64,... data URL).' }]
                        }
                    }, { headers: corsHeaders() });
                }

                try {
                    let cleanBase64 = rawBase64;
                    let mimeType = 'image/png';

                    const dataUrlMatch = rawBase64.match(/^data:([^;]+);base64,(.+)$/);
                    if (dataUrlMatch) {
                        mimeType = dataUrlMatch[1].trim();
                        cleanBase64 = dataUrlMatch[2].trim();
                    } else {
                        const ext = path.extname(fileName).toLowerCase();
                        if (ext === '.jpg' || ext === '.jpeg') mimeType = 'image/jpeg';
                        else if (ext === '.png') mimeType = 'image/png';
                        else if (ext === '.webp') mimeType = 'image/webp';
                        else if (ext === '.svg') mimeType = 'image/svg+xml';
                        else if (ext === '.gif') mimeType = 'image/gif';
                    }

                    cleanBase64 = cleanBase64.replace(/\s+/g, '');
                    const buffer = Buffer.from(cleanBase64, 'base64');

                    if (!buffer || buffer.length === 0) {
                        return NextResponse.json({
                            jsonrpc: '2.0',
                            id: id ?? null,
                            result: {
                                isError: true,
                                content: [{ type: 'text', text: 'Error: Failed to decode base64 string into a valid image buffer.' }]
                            }
                        }, { headers: corsHeaders() });
                    }

                    const cleanFileName = fileName.replace(/^\/+/, '');
                    const supabase = getAdminSupabase();

                    const { data: uploadData, error: uploadError } = await supabase.storage
                        .from(bucket)
                        .upload(cleanFileName, buffer, {
                            contentType: mimeType,
                            upsert,
                            cacheControl: '3600'
                        });

                    if (uploadError) {
                        return NextResponse.json({
                            jsonrpc: '2.0',
                            id: id ?? null,
                            result: {
                                isError: true,
                                content: [{ type: 'text', text: `Failed to upload image to bucket "${bucket}": ${uploadError.message}` }]
                            }
                        }, { headers: corsHeaders() });
                    }

                    const { data: { publicUrl } } = supabase.storage
                        .from(bucket)
                        .getPublicUrl(cleanFileName);

                    return NextResponse.json({
                        jsonrpc: '2.0',
                        id: id ?? null,
                        result: {
                            content: [
                                {
                                    type: 'text',
                                    text: `✓ Image successfully uploaded to Supabase Storage!\n\n` +
                                          `• Public URL: ${publicUrl}\n` +
                                          `• Bucket: ${bucket}\n` +
                                          `• File: ${cleanFileName}\n` +
                                          `• Size: ${(buffer.length / 1024).toFixed(1)} KB\n` +
                                          `• MIME Type: ${mimeType}\n\n` +
                                          `Markdown embed:\n![${cleanFileName}](${publicUrl})`
                                }
                            ]
                        }
                    }, { headers: corsHeaders() });
                } catch (err: any) {
                    return NextResponse.json({
                        jsonrpc: '2.0',
                        id: id ?? null,
                        result: {
                            isError: true,
                            content: [{ type: 'text', text: `Upload error: ${err.message}` }]
                        }
                    }, { headers: corsHeaders() });
                }
            }

            // TOOL: get_logo
            if (toolName === 'get_logo') {
                try {
                    const logoPath = path.join(process.cwd(), 'public', 'logo.png');
                    if (!fs.existsSync(logoPath)) {
                        return NextResponse.json({
                            jsonrpc: '2.0',
                            id: id ?? null,
                            result: {
                                isError: true,
                                content: [{ type: 'text', text: 'Error: public/logo.png not found on server.' }]
                            }
                        }, { headers: corsHeaders() });
                    }

                    const logoBuffer = fs.readFileSync(logoPath);
                    const base64 = logoBuffer.toString('base64');
                    const dataUrl = `data:image/png;base64,${base64}`;
                    const publicUrl = `${SITE_URL}/logo.png`;
                    const format = (args.format || 'all').toLowerCase();

                    let textResponse = '';
                    if (format === 'base64') {
                        textResponse = base64;
                    } else if (format === 'data_url') {
                        textResponse = dataUrl;
                    } else {
                        textResponse = `Mutant Technologies Logo (logo.png):\n\n` +
                                       `• Public URL: ${publicUrl}\n` +
                                       `• MIME Type: image/png\n` +
                                       `• File Size: ${(logoBuffer.length / 1024).toFixed(1)} KB\n` +
                                       `• Usage: Real brand logo for compositing onto cover images, headers, and social graphics\n\n` +
                                       `--- DATA URL (data:image/png;base64,...) ---\n${dataUrl}\n\n` +
                                       `--- RAW BASE64 STRING ---\n${base64}`;
                    }

                    return NextResponse.json({
                        jsonrpc: '2.0',
                        id: id ?? null,
                        result: {
                            content: [
                                {
                                    type: 'text',
                                    text: textResponse
                                }
                            ]
                        }
                    }, { headers: corsHeaders() });
                } catch (err: any) {
                    return NextResponse.json({
                        jsonrpc: '2.0',
                        id: id ?? null,
                        result: {
                            isError: true,
                            content: [{ type: 'text', text: `Failed to read logo: ${err.message}` }]
                        }
                    }, { headers: corsHeaders() });
                }
            }

            // TOOL: get_asset
            if (toolName === 'get_asset') {
                const assetName = (args.asset_name || args.file_name || args.name || 'logo.png').replace(/^[\/\\]+/, '');
                const safeName = path.basename(assetName);
                const assetPath = path.join(process.cwd(), 'public', safeName);

                if (!fs.existsSync(assetPath)) {
                    return NextResponse.json({
                        jsonrpc: '2.0',
                        id: id ?? null,
                        result: {
                            isError: true,
                            content: [{ type: 'text', text: `Error: public/${safeName} does not exist.` }]
                        }
                    }, { headers: corsHeaders() });
                }

                try {
                    const assetBuffer = fs.readFileSync(assetPath);
                    const ext = path.extname(safeName).toLowerCase();
                    let mimeType = 'application/octet-stream';
                    if (ext === '.png') mimeType = 'image/png';
                    else if (ext === '.jpg' || ext === '.jpeg') mimeType = 'image/jpeg';
                    else if (ext === '.svg') mimeType = 'image/svg+xml';
                    else if (ext === '.ico') mimeType = 'image/x-icon';
                    else if (ext === '.webp') mimeType = 'image/webp';

                    const base64 = assetBuffer.toString('base64');
                    const dataUrl = `data:${mimeType};base64,${base64}`;
                    const publicUrl = `${SITE_URL}/${safeName}`;

                    return NextResponse.json({
                        jsonrpc: '2.0',
                        id: id ?? null,
                        result: {
                            content: [
                                {
                                    type: 'text',
                                    text: `Asset "${safeName}":\n\n` +
                                          `• Public URL: ${publicUrl}\n` +
                                          `• MIME Type: ${mimeType}\n` +
                                          `• File Size: ${(assetBuffer.length / 1024).toFixed(1)} KB\n\n` +
                                          `--- DATA URL ---\n${dataUrl}\n\n` +
                                          `--- RAW BASE64 STRING ---\n${base64}`
                                }
                            ]
                        }
                    }, { headers: corsHeaders() });
                } catch (err: any) {
                    return NextResponse.json({
                        jsonrpc: '2.0',
                        id: id ?? null,
                        result: {
                            isError: true,
                            content: [{ type: 'text', text: `Failed to read asset "${safeName}": ${err.message}` }]
                        }
                    }, { headers: corsHeaders() });
                }
            }

            return NextResponse.json({
                jsonrpc: '2.0',
                id: id ?? null,
                error: { code: -32601, message: `Method or tool "${toolName}" not found` }
            }, { headers: corsHeaders() });
        }

        // If unknown JSON-RPC method
        return NextResponse.json({
            jsonrpc: '2.0',
            id: id ?? null,
            error: { code: -32601, message: `Procedure not found: ${method}` }
        }, { headers: corsHeaders() });

    } catch (err: any) {
        console.error('MCP Server error:', err);
        return NextResponse.json({
            jsonrpc: '2.0',
            id: null,
            error: { code: -32603, message: err.message || 'Internal error' }
        }, { status: 500, headers: corsHeaders() });
    }
}
