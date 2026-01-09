'use client';
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ServiceMarquee } from "@/components/ServiceMarquee";
import { Button } from "@/components/ui/button";
import { ArrowRight } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useRef } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { services } from '@/lib/data';

interface ServiceDetailClientProps {
    slug: string;
}

export default function ServiceDetailClient({ slug }: ServiceDetailClientProps) {
    const service = services.find(s => s.slug === slug);

    if (!service) {
        return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">Service Not Found</div>;
    }

    const containerRef = useRef(null);

    useGSAP(() => {
        const tl = gsap.timeline();
        tl.from(".service-hero-text", {
            y: 50,
            opacity: 0,
            duration: 1,
            stagger: 0.1,
            ease: "power3.out"
        })
            .from(".service-feature", {
                y: 30,
                opacity: 0,
                duration: 0.8,
                stagger: 0.1,
                ease: "power2.out"
            }, "-=0.5");
    }, { scope: containerRef });

    const Icon = service.icon;

    return (
        <main ref={containerRef} className="min-h-screen bg-zinc-950 text-white selection:bg-primary selection:text-white">
            <Navbar />

            {/* Hero Section */}
            <section className="relative pt-40 pb-20 px-6 overflow-hidden">
                <div className={`absolute top-0 right-0 w-[800px] h-[800px] bg-linear-to-b ${service.bgGradient} rounded-full blur-[150px] opacity-50 pointer-events-none -translate-y-1/2 translate-x-1/2`} />

                <div className="container mx-auto relative z-10">
                    <div className="flex flex-col md:flex-row gap-12 items-start">
                        <div className="flex-1">
                            <div className="service-hero-text w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-8 text-primary">
                                <Icon className="w-8 h-8" />
                            </div>
                            <h1 className="service-hero-text text-5xl md:text-7xl font-oswald font-bold uppercase mb-6">
                                {service.title}
                            </h1>
                            <p className="service-hero-text text-xl text-gray-400 max-w-2xl leading-relaxed mb-8">
                                {service.description}
                            </p>
                            <div className="service-hero-text">
                                <Button size="lg" className="rounded-full px-8">
                                    Start Project
                                </Button>
                            </div>
                        </div>

                        {/* Decorative or Image Area */}
                        <div className="flex-1 w-full md:w-auto mt-10 md:mt-0">
                            <div className="aspect-square rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm p-10 flex items-center justify-center relative overflow-hidden group">
                                <div className={`absolute inset-0 bg-linear-to-br ${service.bgGradient} opacity-20 group-hover:opacity-30 transition-opacity`} />
                                <Icon className="w-32 h-32 text-white/20 group-hover:scale-110 transition-transform duration-700 ease-out" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <ServiceMarquee />

            {/* Details Section */}
            <section className="py-24 px-6 bg-black/50">
                <div className="container mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                        <div>
                            <h3 className="text-3xl font-oswald font-bold uppercase mb-6">Why Choose Us</h3>
                            <p className="text-gray-400 leading-relaxed text-lg mb-8">
                                {service.content}
                            </p>
                            <ul className="space-y-4">
                                {service.features.map((feature, i) => (
                                    <li key={i} className="service-feature flex items-center gap-4 text-lg font-medium">
                                        <div className="w-2 h-2 rounded-full bg-primary" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="bg-zinc-900 rounded-3xl p-10 border border-zinc-800 self-start">
                            <h3 className="text-2xl font-oswald font-bold uppercase mb-6 text-primary">Ready to scale?</h3>
                            <p className="text-gray-400 mb-8">
                                Let's discuss how our {service.title} services can help you achieve your business goals.
                            </p>
                            <Button className="w-full py-6 text-lg" variant="outline">
                                Get a Free Quote <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
