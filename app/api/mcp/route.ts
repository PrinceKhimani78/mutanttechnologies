import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { marked } from 'marked';

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

const TOOLS_DEFINITION = [
    {
        name: 'publish_blog_post',
        description: 'Create and publish a new blog post directly onto Mutant Technologies website (mutanttechnologies.com/blog). Matches all website CMS fields: Title, Rich Content (Markdown or HTML), URL Slug, Excerpt, Category, Cover Image, and Publish Immediately status.',
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
                                      `• Excerpt: "${inserted.excerpt}"`
                            }
                        ]
                    }
                }, { headers: corsHeaders() });
            }

            // TOOL: publish_draft (Flips an existing draft to LIVE)
            if (toolName === 'publish_draft') {
                const { slug, id: postId, is_published } = args;
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

                const statusText = targetStatus ? 'LIVE on the website' : 'turned back to DRAFT';
                return NextResponse.json({
                    jsonrpc: '2.0',
                    id: id ?? null,
                    result: {
                        content: [
                            {
                                type: 'text',
                                text: `🎉 Success! The post "${post.title}" is now ${statusText}!\n\n` +
                                      `• Live URL: https://www.mutanttechnologies.com/blog/${post.slug}\n` +
                                      `• Status: ${targetStatus ? 'Published Live' : 'Draft'}`
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
