import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

/**
 * On-Demand Revalidation API Route
 * 
 * Call this endpoint to immediately revalidate pages after making changes in the admin panel.
 * 
 * Usage:
 * POST /api/revalidate
 * Body: { "secret": "your-secret-token", "path": "/portfolio" }
 * 
 * Or revalidate all paths:
 * Body: { "secret": "your-secret-token", "paths": ["/", "/portfolio", "/blog"] }
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { secret, path, paths } = body;

        // Check for secret to confirm this is a valid request
        const revalidateSecret = process.env.REVALIDATE_SECRET || 'mutant-revalidate-secret-2024';

        if (secret !== revalidateSecret) {
            return NextResponse.json(
                { message: 'Invalid secret' },
                { status: 401 }
            );
        }

        // Revalidate single path
        if (path) {
            revalidatePath(path);
            return NextResponse.json({
                revalidated: true,
                path,
                message: `Revalidated ${path}`
            });
        }

        // Revalidate multiple paths
        if (paths && Array.isArray(paths)) {
            paths.forEach((p) => revalidatePath(p));
            return NextResponse.json({
                revalidated: true,
                paths,
                message: `Revalidated ${paths.length} paths`
            });
        }

        // Default: revalidate common paths
        const defaultPaths = ['/', '/portfolio', '/blog', '/about', '/services'];
        defaultPaths.forEach((p) => revalidatePath(p));

        return NextResponse.json({
            revalidated: true,
            paths: defaultPaths,
            message: 'Revalidated default paths'
        });

    } catch (error) {
        console.error('Revalidation error:', error);
        return NextResponse.json(
            { message: 'Error revalidating', error: String(error) },
            { status: 500 }
        );
    }
}

// Also support GET for quick testing
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const secret = searchParams.get('secret');
    const path = searchParams.get('path');

    const revalidateSecret = process.env.REVALIDATE_SECRET || 'mutant-revalidate-secret-2024';

    if (secret !== revalidateSecret) {
        return NextResponse.json(
            { message: 'Invalid secret' },
            { status: 401 }
        );
    }

    if (path) {
        revalidatePath(path);
        return NextResponse.json({
            revalidated: true,
            path,
            message: `Revalidated ${path}`
        });
    }

    // Default paths
    const defaultPaths = ['/', '/portfolio', '/blog', '/about', '/services'];
    defaultPaths.forEach((p) => revalidatePath(p));

    return NextResponse.json({
        revalidated: true,
        paths: defaultPaths,
        message: 'Revalidated default paths'
    });
}
