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

gsap.registerPlugin(ScrollTrigger);

/**
 * Services Component
 * 
 * Displays a horizontal scrolling list of services using GSAP ScrollTrigger.
 * Dynamically resolves Lucide icons based on string names from the database.
 */
interface ServicesProps {
    services: Service[];
    header?: {
        title?: string;
        subtitle?: string; // Although not used in current layout, good to have
    };
    scroller?: string;
}

export const Services = ({ services, header, scroller }: ServicesProps) => {
    const containerRef = useRef<HTMLElement>(null);
    const triggerRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        try {
            // Disable GSAP animations in Visual Editor to prevent errors
            if (scroller) {
                console.log('Services: Skipping GSAP animations in Visual Editor context');
                return;
            }

            console.log('Services: useGSAP', {
                hasContainer: !!containerRef.current,
                hasTrigger: !!triggerRef.current,
                scroller,
                servicesCount: services?.length
            });

            if (!triggerRef.current || !containerRef.current) return;

            const viewportWidth = containerRef.current.offsetWidth || window.innerWidth;
            const totalWidth = triggerRef.current.scrollWidth - viewportWidth;

            if (totalWidth <= 0) {
                console.warn('Services: totalWidth is <= 0', { scrollWidth: triggerRef.current.scrollWidth, viewportWidth });
                return;
            }

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
                    scroller: scroller || undefined,
                    pinType: scroller ? 'transform' : undefined,
                    anticipatePin: 1
                }
            });
        } catch (error) {
            console.error('Services: GSAP Error', error);
        }
    }, { scope: containerRef, dependencies: [services, scroller] });

    return (
        <section ref={containerRef} className="relative min-h-screen py-20 md:py-32 bg-background overflow-hidden flex flex-col justify-center">
            {/* Header Section */}
            <div className="container mx-auto px-6 mb-16 relative z-10">
                <div className="max-w-4xl">
                    <h2 className="text-foreground text-5xl md:text-6xl font-oswald uppercase font-bold tracking-tighter mb-6 leading-none">
                        {header?.title || 'Our Services'}
                    </h2>
                    <p className="text-gray-600 dark:text-zinc-400 text-xl md:text-2xl font-light max-w-2xl">
                        {header?.subtitle || 'Comprehensive solutions for your digital success in the modern era.'}
                    </p>
                </div>
            </div>

            {/* Horizontal Scroll Progress */}
            <div className="absolute top-1/2 left-0 w-full h-[1px] bg-zinc-200 dark:bg-zinc-800 opacity-30 select-none pointer-events-none" />

            {/* Horizontal Scrolling Content */}
            <div ref={triggerRef} className="flex gap-12 px-6 md:px-24 w-fit">
                {services.map((service, index) => {
                    // Dynamically get the icon component
                    const IconComponent = (LucideIcons as any)[service.icon || 'Zap'] || LucideIcons.Zap;

                    return (
                        <div
                            key={service.id || index}
                            className="w-[300px] md:w-[450px] flex-shrink-0 group relative"
                        >
                            <div className="mb-8 relative h-16 w-16 flex items-center justify-center text-primary transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12">
                                <div className="absolute inset-0 bg-primary/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                <IconComponent className="w-12 h-12 relative z-10" />
                            </div>

                            <div className="space-y-4 mb-8">
                                <h3 className="text-3xl md:text-4xl font-oswald uppercase font-bold text-foreground group-hover:text-primary transition-colors">
                                    {service.title}
                                </h3>
                                <p className="text-gray-600 dark:text-zinc-400 text-lg line-clamp-3 font-light leading-relaxed">
                                    {service.description}
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
