'use client';
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ServiceMarquee } from "@/components/ServiceMarquee";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, ChevronDown, Plus } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useRef, useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { services } from '@/lib/data';

interface ServiceDetailClientProps {
    slug: string;
}

export default function ServiceDetailClient({ slug }: ServiceDetailClientProps) {
    const service = services.find(s => s.slug === slug);
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    if (!service) {
        return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">Service Not Found</div>;
    }

    const containerRef = useRef(null);

    useGSAP(() => {
        const tl = gsap.timeline();
        tl.from(".hero-text", {
            y: 50,
            opacity: 0,
            duration: 1,
            stagger: 0.1,
            ease: "power3.out"
        })
            .from(".hero-image", {
                x: 50,
                opacity: 0,
                duration: 1,
                ease: "power3.out"
            }, "-=0.8");
    }, { scope: containerRef });

    const Icon = service.icon;

    return (
        <main ref={containerRef} className="min-h-screen bg-zinc-950 text-white selection:bg-primary selection:text-white font-sans">
            <Navbar />

            {/* 1. Hero Section - Clean, Left Aligned */}
            <section className="relative pt-40 pb-20 px-6 border-b border-zinc-800">
                <div className="container mx-auto">
                    <div className="flex flex-col md:flex-row gap-16 items-center">
                        <div className="flex-1 max-w-3xl">
                            <div className="hero-text inline-flex items-center gap-2 px-4 py-2 rounded-full border border-zinc-700 bg-zinc-900/50 text-primary text-sm font-mono mb-8">
                                <Icon className="w-4 h-4" />
                                <span>{service.title} Services</span>
                            </div>
                            <h1 className="hero-text text-5xl md:text-7xl font-oswald font-bold uppercase leading-tight mb-8">
                                <span className="text-zinc-500">Transform your</span><br />
                                <span className="text-white">Digital Presence</span>
                            </h1>
                            <p className="hero-text text-xl text-zinc-400 max-w-xl leading-relaxed mb-10">
                                {service.description}
                            </p>
                            <div className="hero-text flex flex-wrap gap-4">
                                <Button size="lg" className="rounded-full px-8 text-lg h-14 bg-white text-black hover:bg-zinc-200">
                                    Request Proposal
                                </Button>
                                <Button size="lg" variant="outline" className="rounded-full px-8 text-lg h-14 border-zinc-700 hover:bg-zinc-800 hover:text-white">
                                    Explore Benefits
                                </Button>
                            </div>
                        </div>

                        {/* Abstract Hero Graphic */}
                        <div className="hero-image flex-1 w-full flex justify-center md:justify-end">
                            <div className={`relative w-full max-w-md aspect-square rounded-3xl overflow-hidden bg-linear-to-br ${service.bgGradient} p-1`}>
                                <div className="absolute inset-0 bg-black/20 backdrop-blur-3xl"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Icon className="w-48 h-48 text-white/10" />
                                </div>
                                <div className="relative z-10 w-full h-full bg-zinc-950/80 rounded-[22px] flex flex-col justify-between p-8 border border-white/10">
                                    <div className="text-6xl font-oswald font-bold text-white/5">{service.id}</div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-white mb-2">{service.title}</h3>
                                        <div className="h-1 w-12 bg-primary rounded-full"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. Benefits Grid (Perks) */}
            <section className="py-24 px-6 bg-zinc-900/50">
                <div className="container mx-auto">
                    <div className="mb-16">
                        <h2 className="text-3xl md:text-4xl font-oswald font-bold uppercase mb-4">Why Partner With Us?</h2>
                        <div className="h-1 w-24 bg-primary rounded-full"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {service.benefits?.map((benefit: any, idx: number) => (
                            <div key={idx} className="bg-zinc-950 p-8 rounded-2xl border border-zinc-800 hover:border-primary/50 transition-colors group">
                                <div className="w-12 h-12 rounded-full bg-zinc-900 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                                    <CheckCircle2 className="w-6 h-6 text-primary" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3">{benefit.title}</h3>
                                <p className="text-zinc-400 leading-relaxed">
                                    {benefit.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 3. Tools Strip */}
            <section className="py-12 border-y border-zinc-800 bg-black">
                <div className="container mx-auto px-6">
                    <p className="text-center text-zinc-500 text-sm font-mono mb-8 uppercase tracking-widest">Powered by Industry Leading Tech</p>
                    <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                        {service.tools?.map((tool: string, idx: number) => (
                            <span key={idx} className="text-2xl font-oswald font-bold text-zinc-300 select-none">
                                {tool}
                            </span>
                        ))}
                    </div>
                </div>
            </section>

            {/* 4. Sub-Services / Features (The Grid) */}
            <section className="py-24 px-6">
                <div className="container mx-auto">
                    <div className="flex flex-col md:flex-row gap-12">
                        <div className="md:w-1/3">
                            <h2 className="text-4xl md:text-5xl font-oswald font-bold uppercase leading-tight mb-6">
                                We Cover Every <br />
                                <span className="text-primary">Angle</span>
                            </h2>
                            <p className="text-zinc-400 text-lg leading-relaxed">
                                {service.content}
                            </p>
                        </div>
                        <div className="md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {service.features.map((feature: string, i: number) => (
                                <div key={i} className="flex items-center gap-4 p-6 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition-colors">
                                    <div className="w-2 h-12 bg-primary rounded-full"></div>
                                    <span className="text-xl font-bold">{feature}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* 5. FAQ Accordion */}
            <section className="py-24 px-6 bg-zinc-900">
                <div className="container mx-auto max-w-4xl">
                    <h2 className="text-center text-3xl md:text-4xl font-oswald font-bold uppercase mb-16">Frequently Asked Questions</h2>

                    <div className="space-y-4">
                        {service.faqs?.map((faq: any, idx: number) => (
                            <div key={idx} className="bg-zinc-950 rounded-2xl border border-zinc-800 overflow-hidden">
                                <button
                                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                                    className="w-full flex items-center justify-between p-6 text-left hover:bg-zinc-900/50 transition-colors"
                                >
                                    <span className="text-lg font-bold">{faq.question}</span>
                                    <Plus className={cn("w-6 h-6 text-zinc-500 transition-transform duration-300", openFaq === idx && "rotate-45 text-primary")} />
                                </button>
                                <div className={cn("grid transition-all duration-300 ease-in-out", openFaq === idx ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")}>
                                    <div className="overflow-hidden">
                                        <div className="p-6 pt-0 text-zinc-400 leading-relaxed border-t border-zinc-800/50">
                                            {faq.answer}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 6. Bottom CTA (Form Placeholder) */}
            <section className="py-24 px-6 relative overflow-hidden">
                <div className={`absolute inset-0 bg-linear-to-r ${service.bgGradient} opacity-10 pointer-events-none`}></div>
                <div className="container mx-auto text-center relative z-10">
                    <h2 className="text-5xl md:text-7xl font-oswald font-bold uppercase mb-8">
                        Ready to <span className="text-primary">Start?</span>
                    </h2>
                    <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-12">
                        Let's verify your idea and build something extraordinary together.
                    </p>
                    <Button size="lg" className="h-16 px-12 text-xl rounded-full bg-white text-black hover:bg-zinc-200 font-bold">
                        Get Your Free Quote
                    </Button>
                </div>
            </section>

            <Footer />
        </main>
    );
}
