'use client';
import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

import { services } from '@/lib/data';

export const Services = () => {
    const containerRef = useRef<HTMLElement>(null);
    const triggerRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        const totalWidth = triggerRef.current!.scrollWidth - window.innerWidth;

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
    }, { scope: containerRef });

    return (
        <section ref={containerRef} className="relative h-screen bg-black overflow-hidden flex flex-col justify-center">
            {/* Background Noise */}
            <div className="absolute inset-0 opacity-20 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-100 contrast-150 mix-blend-overlay"></div>

            <div className="container mx-auto px-6 mb-8 relative z-10">
                <h2 className="text-white text-5xl md:text-7xl font-oswald uppercase font-bold tracking-tight">
                    What We <span className="text-primary">Do</span>
                </h2>
            </div>

            <div ref={triggerRef} className="flex gap-12 px-6 md:px-24 w-fit">
                {services.map((service, idx) => (
                    <div
                        key={idx}
                        className="w-[85vw] md:w-[600px] h-[60vh] md:h-[500px] bg-zinc-900 border border-zinc-800 rounded-3xl p-10 flex flex-col justify-between group hover:border-primary/50 transition-colors relative overflow-hidden"
                    >
                        {/* Hover Gradient */}
                        <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500", service.color)} />

                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-8">
                                <div className={cn("w-16 h-16 rounded-full flex items-center justify-center text-white", service.color)}>
                                    <service.icon className="w-8 h-8" />
                                </div>
                                <span className="text-6xl font-oswald font-bold text-zinc-800 group-hover:text-white transition-colors">
                                    {service.id}
                                </span>
                            </div>

                            <h3 className="text-4xl font-oswald font-bold text-white mb-6 uppercase">
                                {service.title}
                            </h3>
                            {service.shortDescription}
                        </div>

                        <Link href={`/services/${service.slug}`} className="inline-flex items-center gap-2 text-white font-bold tracking-widest uppercase hover:text-primary transition-colors cursor-hover">
                            Explore Service <ExternalLink className="w-4 h-4" />
                        </Link>
                    </div>
                ))}
            </div>
        </section>
    );
};
