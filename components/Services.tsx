'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { trackEvent } from '@/lib/gtm';
import * as LucideIcons from 'lucide-react';
import { Service } from '@/lib/types';

/**
 * Services Component
 * 
 * Displays a horizontal scrolling list of services using GSAP ScrollTrigger.
 * Dynamically resolves Lucide icons based on string names from the database.
 */
interface ServicesProps {
    services: Service[];
}

export const Services = ({ services }: ServicesProps) => {
    const containerRef = useRef<HTMLElement>(null);
    const triggerRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        if (!triggerRef.current) return;
        const totalWidth = triggerRef.current.scrollWidth - window.innerWidth;

        // Horizontal scroll animation tied to vertical scroll
        gsap.to(triggerRef.current, {
            x: -totalWidth,
            ease: "none",
            scrollTrigger: {
                trigger: containerRef.current,
                start: "top top",
                end: `+=${totalWidth}`,
                pin: true,
                scrub: 1,
                invalidateOnRefresh: true,
            }
        });
    }, { scope: containerRef, dependencies: [services] });

    return (
        <section ref={containerRef} className="relative min-h-screen md:h-screen py-20 md:py-0 bg-background overflow-hidden flex flex-col justify-center">
            {/* Background Noise */}
            <div className="absolute inset-0 opacity-20 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-100 contrast-150 mix-blend-overlay"></div>

            <div className="container mx-auto px-6 mb-8 relative z-10">
                <h2 className="text-foreground text-5xl md:text-7xl font-oswald uppercase font-bold tracking-tight">
                    What We <span className="text-primary">Do</span>
                </h2>
            </div>

            <div ref={triggerRef} className="flex gap-12 px-6 md:px-24 w-fit">
                {services.map((service, idx) => {
                    // Dynamically resolve icon component, fallback to Monitor if not found
                    // @ts-ignore
                    const Icon = LucideIcons[service.icon] || LucideIcons.Monitor;

                    return (
                        <div
                            key={service.slug}
                            className="w-[85vw] md:w-[600px] h-[60vh] md:h-[500px] bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl p-10 flex flex-col justify-between group hover:border-primary/50 transition-colors relative overflow-hidden shadow-sm dark:shadow-none"
                        >
                            {/* Hover Gradient */}
                            <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500", service.color)} />

                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-8">
                                    <div className={cn("w-16 h-16 rounded-full flex items-center justify-center text-white", service.color)}>
                                        <Icon className="w-8 h-8" />
                                    </div>
                                    <span className="text-6xl font-oswald font-bold text-zinc-100 dark:text-zinc-800 group-hover:text-dark-slate dark:group-hover:text-white transition-colors">
                                        0{idx + 1}
                                    </span>
                                </div>

                                <h3 className="text-4xl font-oswald font-bold text-dark-slate dark:text-white mb-6 uppercase">
                                    {service.title}
                                </h3>
                                <p className="text-gray-600 dark:text-zinc-400 text-lg leading-relaxed group-hover:text-gray-800 dark:group-hover:text-zinc-300 transition-colors">
                                    {service.short_description || service.description}
                                </p>
                            </div>

                            <Link
                                href={`/services/${service.slug}`}
                                className="inline-flex items-center gap-2 text-dark-slate dark:text-white font-bold tracking-widest uppercase hover:text-primary transition-colors cursor-hover"
                                onClick={() => trackEvent('service_view', { service_name: service.title })}
                            >
                                Explore Service <ExternalLink className="w-4 h-4" />
                            </Link>
                        </div>
                    )
                })}
            </div>
        </section>
    );
};
