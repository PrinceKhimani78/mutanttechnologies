'use client';
import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Button } from './ui/button';

interface HeroProps {
    title1?: string;
    title2?: string;
    subtitle?: string;
    buttonText?: string;
}

export const Hero = ({
    title1 = "SHINE",
    title2 = "BRIGHT",
    subtitle = "We blend creativity and technology to boost your digital presence.",
    buttonText = "Start Project"
}: HeroProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const titleRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        const tl = gsap.timeline();

        // Text Reveal Animation
        gsap.set(".hero-char", { opacity: 1 });

        tl.from(".hero-char", {
            y: 100,
            opacity: 0,
            stagger: 0.05,
            duration: 1,
            ease: "power4.out",
            clearProps: "all"
        })
            .from(".hero-sub", {
                y: 20,
                opacity: 0,
                duration: 0.8,
                ease: "power2.out"
            }, "-=0.5")
            .from(".hero-btn", {
                scale: 0.8,
                opacity: 0,
                duration: 0.5,
                ease: "back.out(1.7)"
            }, "-=0.2");

    }, { scope: containerRef });

    return (
        <section
            ref={containerRef}
            className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background cursor-none"
        >
            {/* Dynamic Background */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(252,98,3,0.05),transparent_70%)]" />
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px] mix-blend-multiply dark:mix-blend-screen animate-pulse" />

            <div className="container mx-auto px-6 text-center relative z-10">
                <div ref={titleRef} className="overflow-hidden mb-6">
                    <h1 className="font-oswald text-[12vw] leading-[0.9] font-bold uppercase text-dark-slate tracking-tighter pb-4">
                        <span className="inline-block">
                            {title1.split("").map((char, i) => (
                                <span key={i} className="hero-char inline-block">{char}</span>
                            ))}
                        </span>
                        <br />
                        <span className="inline-block text-transparent bg-clip-text bg-linear-to-r from-primary to-orange-500 pb-2 relative">
                            {title2.split("").map((char, i) => (
                                <span key={i} className="hero-char inline-block">{char}</span>
                            ))}
                        </span>
                    </h1>
                </div>

                <p className="hero-sub text-xl md:text-2xl text-gray-500 max-w-2xl mx-auto font-light mb-10">
                    {subtitle}
                </p>

                <div className="hero-btn flex justify-center gap-6">
                    <Button href="/#contact" className="rounded-full px-8 py-3 md:px-10 md:py-6 text-base md:text-xl hover:scale-110 transition-transform cursor-hover">
                        {buttonText}
                    </Button>
                </div>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-10 left-10 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center animate-spin-slow">
                    <span className="material-symbols-outlined text-xs">↓</span>
                </div>
                <span className="text-xs uppercase tracking-widest text-gray-400">Scroll to Explore</span>
            </div>
        </section>
    );
};
