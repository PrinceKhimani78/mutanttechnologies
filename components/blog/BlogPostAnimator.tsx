'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Wraps a server-rendered blog post (header + article body) to add scroll
 * animations without moving data-fetching/SEO markup into a client component.
 * The children are still rendered to static HTML on the server - this only
 * adds a ref + GSAP on top for progressive enhancement.
 */
export function BlogPostAnimator({ children }: { children: React.ReactNode }) {
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        if (!containerRef.current) return;

        // Header block: back link, category/date, title, excerpt, cover image
        gsap.from('.post-item', {
            y: 30,
            opacity: 0,
            stagger: 0.12,
            duration: 0.8,
            ease: 'power3.out',
        });

        // Reveal each block of the article body (headings, paragraphs, lists,
        // images, blockquotes...) as the reader scrolls, instead of it all
        // just sitting there static.
        const blocks = containerRef.current.querySelectorAll('.blog-article-content > *');
        blocks.forEach((el) => {
            gsap.from(el, {
                scrollTrigger: { trigger: el, start: 'top 88%' },
                y: 24,
                opacity: 0,
                duration: 0.6,
                ease: 'power2.out',
            });
        });
    }, { scope: containerRef });

    return <div ref={containerRef}>{children}</div>;
}
