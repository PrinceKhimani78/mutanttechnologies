import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[];
    className?: string;
    showHomeIcon?: boolean;
    theme?: 'light' | 'dark' | 'auto';
}

export function Breadcrumbs({
    items,
    className,
    showHomeIcon = true,
    theme = 'dark',
}: BreadcrumbsProps) {
    // Generate BreadcrumbList JSON-LD schema
    const baseUrl = 'https://www.mutanttechnologies.com';
    const breadcrumbLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: baseUrl,
            },
            ...items.map((item, index) => ({
                '@type': 'ListItem',
                position: index + 2,
                name: item.label,
                ...(item.href ? { item: `${baseUrl}${item.href.startsWith('/') ? item.href : `/${item.href}`}` } : {}),
            })),
        ],
    };

    const isDark = theme === 'dark';

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
            />
            <nav
                aria-label="Breadcrumb"
                className={cn('inline-flex items-center py-2 px-1 max-w-full overflow-hidden', className)}
            >
                <ol className="flex items-center flex-wrap gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium tracking-wide">
                    {/* Home Link */}
                    <li className="inline-flex items-center">
                        <Link
                            href="/"
                            className={cn(
                                'inline-flex items-center gap-1.5 transition-colors duration-200',
                                isDark
                                    ? 'text-zinc-400 hover:text-orange-400'
                                    : 'text-zinc-500 hover:text-orange-600 dark:text-zinc-400 dark:hover:text-orange-400'
                            )}
                        >
                            {showHomeIcon && <Home className="w-3.5 h-3.5 shrink-0 mb-0.5" />}
                            <span>Home</span>
                        </Link>
                    </li>

                    {items.map((item, index) => {
                        const isLast = index === items.length - 1;

                        return (
                            <li key={index} className="inline-flex items-center gap-1.5 sm:gap-2 min-w-0">
                                <ChevronRight
                                    className={cn(
                                        'w-3.5 h-3.5 shrink-0',
                                        isDark ? 'text-zinc-500' : 'text-zinc-400 dark:text-zinc-600'
                                    )}
                                    aria-hidden="true"
                                />
                                {item.href && !isLast ? (
                                    <Link
                                        href={item.href}
                                        className={cn(
                                            'truncate transition-colors duration-200',
                                            isDark
                                                ? 'text-zinc-400 hover:text-orange-400'
                                                : 'text-zinc-500 hover:text-orange-600 dark:text-zinc-400 dark:hover:text-orange-400'
                                        )}
                                    >
                                        {item.label}
                                    </Link>
                                ) : (
                                    <span
                                        className={cn(
                                            'truncate max-w-[160px] sm:max-w-[320px] md:max-w-md font-semibold',
                                            isDark
                                                ? 'text-zinc-100'
                                                : 'text-zinc-900 dark:text-zinc-100'
                                        )}
                                        aria-current={isLast ? 'page' : undefined}
                                        title={item.label}
                                    >
                                        {item.label}
                                    </span>
                                )}
                            </li>
                        );
                    })}
                </ol>
            </nav>
        </>
    );
}
