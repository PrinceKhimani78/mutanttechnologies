'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface CTAProps {
    title?: string;
    description?: string;
    button_text?: string;
    button_link?: string;
}

export function CTA({
    title = "Ready to Mutate Your Business?",
    description = "Let's discuss your next big project and transform your digital presence.",
    button_text = "Get Started Today",
    button_link = "/contact"
}: CTAProps) {
    return (
        <section className="relative py-32 overflow-hidden bg-gradient-to-br from-zinc-900 via-zinc-950 to-black">
            {/* Animated Background */}
            <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/30 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
            </div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="max-w-4xl mx-auto text-center space-y-8">
                    {/* Title */}
                    <h2 className="font-oswald text-5xl md:text-7xl font-bold text-white leading-tight">
                        {title}
                    </h2>

                    {/* Description */}
                    <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto">
                        {description}
                    </p>

                    {/* CTA Button */}
                    <div className="pt-4">
                        <Link href={button_link}>
                            <Button
                                size="lg"
                                className="group bg-primary hover:bg-primary/90 text-white px-8 py-6 text-lg font-bold rounded-xl shadow-2xl shadow-primary/30 hover:shadow-primary/50 transition-all duration-300 hover:scale-105 flex items-center gap-2"
                            >
                                {button_text}
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </Link>
                    </div>

                    {/* Decorative Elements */}
                    <div className="flex items-center justify-center gap-4 pt-8 opacity-50">
                        <div className="h-px w-16 bg-gradient-to-r from-transparent to-white" />
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        <div className="h-px w-16 bg-gradient-to-l from-transparent to-white" />
                    </div>
                </div>
            </div>

            {/* Bottom Gradient */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/50 to-transparent" />
        </section>
    );
}
