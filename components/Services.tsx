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

interface ServicesProps {
    services: Service[];
    header?: {
        title?: string;
        subtitle?: string;
    };
    scroller?: string;
}

export const Services = ({ services, header, scroller }: ServicesProps) => {
    const containerRef = useRef<HTMLElement>(null);
    const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

    useGSAP(() => {
        if (scroller) return; // Skip in builder if needed

        // Animate cards staggered fade in from bottom
        gsap.fromTo(
            cardsRef.current,
            { y: 100, opacity: 0 },
            {
                y: 0,
                opacity: 1,
                duration: 0.8,
                stagger: 0.15,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top 80%",
                }
            }
        );
    }, { scope: containerRef, dependencies: [services, scroller] });

    return (
        <section ref={containerRef} className="relative py-20 md:py-32 bg-background overflow-hidden">
            <div className="container mx-auto px-6">
                {/* Header Section */}
                <div className="max-w-4xl mb-20 text-center md:text-left mx-auto md:mx-0">
                    <h2 className="text-foreground text-5xl md:text-6xl font-oswald uppercase font-bold tracking-tighter mb-6 leading-none">
                        {header?.title || 'Our Services'}
                    </h2>
                    <p className="text-gray-600 dark:text-zinc-400 text-xl md:text-2xl font-light max-w-2xl">
                        {header?.subtitle || 'Comprehensive solutions for your digital success in the modern era.'}
                    </p>
                </div>

                {/* Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                    {services.map((service, index) => {
                        const IconComponent = (LucideIcons as any)[service.icon || 'Zap'] || LucideIcons.Zap;

                        return (
                            <div
                                key={service.id || index}
                                ref={(el) => {
                                  if (el) cardsRef.current[index] = el;
                                }}
                                className="group relative p-8 rounded-3xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_20px_40px_-15px_rgba(255,100,0,0.1)] flex flex-col justify-between h-full"
                            >
                                {/* Premium glow effect inside the card on hover */}
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl pointer-events-none" />
                                
                                <div className="relative z-10">
                                    <div className="mb-8 relative h-16 w-16 flex items-center justify-center text-primary bg-zinc-200 dark:bg-zinc-800 rounded-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 group-hover:bg-primary/20">
                                        <IconComponent className="w-8 h-8 relative z-10" />
                                    </div>

                                    <h3 className="text-3xl font-oswald uppercase font-bold text-foreground mb-4 group-hover:text-primary transition-colors">
                                        {service.title}
                                    </h3>
                                    <p className="text-gray-600 dark:text-zinc-400 text-lg line-clamp-4 font-light leading-relaxed mb-8">
                                        {service.description}
                                    </p>
                                </div>

                                <Link
                                    href={`/services/${service.slug}`}
                                    className="inline-flex items-center gap-2 text-sm font-bold tracking-widest uppercase hover:text-primary transition-colors cursor-hover w-max relative z-10"
                                    onClick={() => trackEvent('service_view', { service_name: service.title })}
                                >
                                    Explore Service <ExternalLink className="w-4 h-4" />
                                </Link>
                            </div>
                        )
                    })}
                </div>
            </div>
        </section>
    );
};
