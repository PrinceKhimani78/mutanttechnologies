'use client';

import { useRef, useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import * as LucideIcons from 'lucide-react';
import {
    ArrowRight, ChevronDown
} from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Service } from '@/lib/types';
import { ProposalForm } from './ProposalForm';
import Image from 'next/image';

gsap.registerPlugin(ScrollTrigger);

interface ServiceDetailClientProps {
    service: Service;
}

const navLogos = ["NEXUS", "VORTEX", "APEX", "ECHO", "QUANTUM", "HORIZON", "PULSE"];

const genericCaseStudies = [
    { title: "Quantum Flow", category: "SaaS Platform", image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop" },
    { title: "Novus Markets", category: "Fintech App", image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop" },
    { title: "Elevate Gear", category: "E-Commerce", image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=800&auto=format&fit=crop" },
    { title: "MediCore", category: "Healthcare", image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=800&auto=format&fit=crop" }
];

export default function ServiceDetailClient({ service }: ServiceDetailClientProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [activeAccordion, setActiveAccordion] = useState<number | null>(0);

    useGSAP(() => {
        const tl = gsap.timeline();

        // 1. Hero Animations
        tl.from(".hero-content > *", {
            y: 50,
            opacity: 0,
            duration: 1,
            stagger: 0.1,
            ease: "power3.out"
        })
            .from(".hero-image", {
                x: 50,
                opacity: 0,
                duration: 1.2,
                ease: "power3.out"
            }, "-=0.8");

        // 2. Logo Marquee
        gsap.to(".marquee-content", {
            xPercent: -50,
            repeat: -1,
            duration: 20,
            ease: "linear"
        });

        // Reveal Animations
        gsap.utils.toArray('.reveal-up').forEach((elem: any) => {
            gsap.from(elem, {
                scrollTrigger: {
                    trigger: elem,
                    start: "top 85%",
                },
                y: 50,
                opacity: 0,
                duration: 0.8,
                ease: "power3.out"
            });
        });

    }, { scope: containerRef });

    if (!service) {
        return <div className="min-h-screen bg-background flex items-center justify-center text-foreground">Service Not Found</div>;
    }

    // Dynamic Icon
    // @ts-ignore
    const Icon = LucideIcons[service.icon] || LucideIcons.Monitor;

    return (
        <main ref={containerRef} className="bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans selection:bg-orange-500 selection:text-white transition-colors duration-300">
            <Navbar />

            {/* 1. HERO SECTION */}
            <section className="relative min-h-[90vh] bg-[#020617] text-white pt-24 pb-12 lg:pt-32 lg:pb-20 overflow-hidden flex items-center">

                {/* Background Glows */}
                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] lg:w-[800px] h-[400px] lg:h-[800px] rounded-full blur-[80px] lg:blur-[120px] pointer-events-none opacity-20 bg-linear-to-br ${service.bg_gradient || 'from-blue-600 to-purple-600'}`} />

                <div className="container mx-auto px-6 relative z-10">
                    <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
                        <div className="lg:w-[60%] hero-content text-center lg:text-left">

                            <div className="inline-flex items-center gap-2 mb-6 lg:mb-8 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/5">
                                <Icon className="w-4 h-4 text-orange-500" />
                                <span className="text-xs lg:text-sm font-medium uppercase tracking-wider">{service.title} Services</span>
                            </div>

                            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold leading-[1.1] mb-6 lg:mb-8 tracking-tight font-heading ">
                                {service.title} that <br />
                                <span className="text-transparent bg-clip-text bg-linear-to-r from-orange-400 to-orange-600">
                                    Drive Results
                                </span>
                            </h1>

                            <p className="text-lg lg:text-xl text-zinc-400 max-w-xl leading-relaxed mb-8 mx-auto lg:mx-0">
                                {service.description}
                            </p>

                            <div className="flex flex-col sm:flex-row flex-wrap gap-4 mt-8 lg:mt-10 justify-center lg:justify-start">
                                <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-white rounded-full h-14 px-10 text-lg transition-transform hover:scale-105 w-full sm:w-auto whitespace-nowrap" onClick={() => document.getElementById('proposal-form')?.scrollIntoView({ behavior: 'smooth' })}>
                                    Start Project
                                </Button>
                                <Button size="lg" variant="outline" className="border-zinc-700 hover:bg-white/10 text-white rounded-full h-14 px-10 text-lg flex items-center justify-center gap-2 w-full sm:w-auto whitespace-nowrap">
                                    <span className="w-5 h-5 border border-current rounded-sm flex items-center justify-center text-[10px]">P</span> View Process
                                </Button>
                            </div>
                        </div>

                        <div className="lg:w-[40%] hero-image relative w-full px-4 sm:px-0">
                            <div className="relative z-10 transform lg:rotate-[-5deg] hover:rotate-0 transition-transform duration-700 ease-out">
                                <div className="bg-zinc-900 rounded-[24px] lg:rounded-[32px] overflow-hidden border-4 lg:border-8 border-zinc-800 shadow-2xl aspect-[3/4] sm:aspect-[4/3] lg:aspect-[3/4]">
                                    <div className="h-full w-full bg-zinc-950 p-8 flex flex-col relative overflow-hidden group items-center justify-center">
                                        <div className={`absolute inset-0 bg-linear-to-br ${service.bg_gradient} opacity-20`}></div>
                                        <Icon className="w-32 h-32 text-zinc-700 relative z-10" />
                                        <div className="mt-8 text-2xl font-bold text-zinc-500 z-10">{service.title}</div>
                                        <div className="font-mono text-zinc-700 text-sm mt-2 z-10">{service.id}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. LOGO MARQUEE */}
            <section className="py-16 bg-white dark:bg-zinc-950 border-b border-zinc-100 dark:border-zinc-800">
                <p className="text-center text-zinc-500 dark:text-zinc-400 font-medium mb-10 tracking-widest text-sm">Trusted by 500+ global companies</p>
                <div className="overflow-hidden relative w-full">
                    <div className="marquee-content flex gap-16 whitespace-nowrap min-w-full items-center">
                        {[...navLogos, ...navLogos, ...navLogos].map((logo, i) => (
                            <span key={i} className="text-2xl font-bold text-zinc-300 dark:text-zinc-700 tracking-tighter">{logo}</span>
                        ))}
                    </div>
                    <div className="absolute top-0 left-0 h-full w-32 bg-linear-to-r from-white dark:from-zinc-950 to-transparent z-10"></div>
                    <div className="absolute top-0 right-0 h-full w-32 bg-linear-to-l from-white dark:from-zinc-950 to-transparent z-10"></div>
                </div>
            </section>

            {/* 3. BENEFITS (Accordion Style) */}
            <section className="py-24 bg-zinc-50 dark:bg-zinc-900/50">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col lg:flex-row gap-16">
                        {/* Left: Sticky Image Placeholder */}
                        <div className="lg:w-1/2 reveal-up">
                            <div className="sticky top-32">
                                <div className="bg-zinc-900 dark:bg-black rounded-3xl p-2 shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500">
                                    <div className="aspect-video bg-zinc-800 rounded-2xl overflow-hidden relative flex items-center justify-center">
                                        <div className={`absolute inset-0 bg-linear-to-br ${service.bg_gradient} opacity-30`}></div>
                                        <Icon className="w-24 h-24 text-white/20" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right: Accordion */}
                        <div className="lg:w-1/2 reveal-up">
                            <h2 className="text-4xl lg:text-5xl font-bold font-heading leading-tight mb-8 text-zinc-900 dark:text-white">
                                Why choose us for <span className="text-orange-600">{service.title}</span>?
                            </h2>
                            <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-12">
                                {service.content.substring(0, 150)}...
                            </p>

                            <div className="space-y-4">
                                {service.benefits && service.benefits.length > 0 ? (
                                    service.benefits.map((item: any, idx: number) => (
                                        <div
                                            key={idx}
                                            className={`bg-white dark:bg-zinc-900 rounded-xl border transition-all duration-300 overflow-hidden cursor-pointer ${activeAccordion === idx ? 'border-orange-500 shadow-lg dark:shadow-orange-900/10' : 'border-zinc-200 dark:border-zinc-800'}`}
                                            onClick={() => setActiveAccordion(idx)}
                                        >
                                            <div className="p-6 flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <span className={`font-mono text-sm ${activeAccordion === idx ? 'text-orange-600' : 'text-zinc-400 dark:text-zinc-500'}`}>0{idx + 1}</span>
                                                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white">{item.title}</h3>
                                                </div>
                                                <ChevronDown className={`w-5 h-5 transition-transform ${activeAccordion === idx ? 'rotate-180 text-orange-600' : 'text-zinc-400 dark:text-zinc-500'}`} />
                                            </div>
                                            <div
                                                className={`grid transition-all duration-300 ease-in-out ${activeAccordion === idx ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
                                            >
                                                <div className="overflow-hidden">
                                                    <p className="px-6 pb-6 pt-0 text-zinc-600 dark:text-zinc-400 ml-10">
                                                        {item.description}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-6 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
                                        No benefits listed for this service.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. CASE STUDIES GRID (Generic for now) */}
            <section className="py-24 bg-white dark:bg-zinc-950 relative">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-blue-50/50 dark:bg-blue-900/10 pointer-events-none"></div>
                <div className="container mx-auto px-6 relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold font-heading text-zinc-900 dark:text-white leading-tight">
                            Recent Work <br />
                            <span className="text-orange-600">and Impact</span>
                        </h2>
                        <Button className="mt-8 md:mt-0 rounded-full h-12 px-8 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 whitespace-nowrap">
                            View Portfolio <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {genericCaseStudies.map((study, idx) => (
                            <div key={idx} className="group reveal-up cursor-pointer">
                                <div className="rounded-3xl overflow-hidden relative aspect-[4/3] mb-6">
                                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors z-10"></div>
                                    <Image
                                        src={study.image}
                                        alt={study.title}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                </div>
                                <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">{study.title}</h3>
                                <p className="text-zinc-500 dark:text-zinc-400 font-mono text-sm tracking-wider">{study.category}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 5. DELIVERY / PROCESS BANNER */}
            <section className="py-24 bg-[#050505] text-white">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col lg:flex-row gap-16 items-center">
                        <div className="lg:w-1/2">
                            <h2 className="text-4xl md:text-5xl font-bold font-heading mb-8">
                                Efficient Process <br />
                                <span className="text-orange-500">Fast Results</span>
                            </h2>
                            <div className="space-y-8 mt-12">
                                {service.process?.slice(0, 3).map((item: any, idx: number) => (
                                    <div key={idx} className="flex gap-6 reveal-up">
                                        <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-orange-500 font-bold shrink-0">
                                            {item.step}
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-bold mb-2">{item.title}</h4>
                                            <p className="text-zinc-500">{item.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="lg:w-1/2 w-full">
                            <div className="bg-zinc-900 rounded-3xl p-8 border border-zinc-800 relative reveal-up">
                                <div className="text-orange-500 text-6xl font-serif absolute top-4 right-8 opacity-20">"</div>
                                <p className="text-xl leading-relaxed text-zinc-300 mb-8 relative z-10">
                                    "Mutant Technologies didn't just deliver a service; they transformed our entire digital infrastructure. The speed of delivery was unmatched."
                                </p>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-zinc-700"></div>
                                    <div>
                                        <div className="font-bold text-white">Michael Chen</div>
                                        <div className="text-sm text-zinc-500">CTO, Nexus Systems</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 6. WHAT'S INCLUDED (Stacked Services) */}
            <div className="bg-zinc-50 dark:bg-zinc-900/50 relative z-10">
                <div className="py-24 text-center">
                    <h2 className="text-4xl md:text-5xl font-bold font-heading text-zinc-900 dark:text-white">
                        What's included
                    </h2>
                </div>

                <div className="pinned-services-container relative w-full">
                    {service.features.map((feature: string, index: number) => {
                        const colors = [
                            { bg: "#020617", text: "#fff" }, // Dark Slate
                            { bg: "#ffffff", text: "#000" }, // White
                            { bg: "#ea580c", text: "#fff" }, // Brand Orange
                            { bg: "#000000", text: "#fff" }, // Black
                        ];
                        const theme = colors[index % colors.length];

                        return (
                            <div
                                key={index}
                                className="pinned-service-card sticky top-0 min-h-[80vh] md:min-h-screen flex items-center justify-center overflow-hidden"
                                style={{
                                    backgroundColor: theme.bg,
                                    color: theme.text,
                                    zIndex: index + 1
                                }}
                            >
                                <div className="container mx-auto px-6 h-full flex items-center">
                                    <div className="flex flex-col lg:flex-row items-center w-full gap-8 lg:gap-16 h-full justify-center py-12 lg:py-20">
                                        {/* Text Side */}
                                        <div className="w-full lg:w-1/2 flex flex-col justify-center text-center lg:text-left">
                                            <div className="w-16 h-1 bg-current mb-6 lg:mb-8 opacity-50 mx-auto lg:mx-0"></div>
                                            <h3 className="text-4xl md:text-5xl lg:text-7xl font-bold font-heading mb-6 lg:mb-8 leading-tight">{feature}</h3>
                                            <p className="text-lg md:text-xl lg:text-2xl opacity-90 mb-8 lg:mb-10 leading-relaxed font-light">
                                                Professional {service.title.toLowerCase()} solution tailored to your specific requirements.
                                            </p>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                                                {/* Fake sub-features since we don't have deep data */}
                                                {["Industry Standard", "Fully Customizable", "Expert Support"].map(f => (
                                                    <div key={f} className="flex items-start gap-3 justify-center lg:justify-start">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-current mt-2.5 shrink-0"></div>
                                                        <span className="text-lg font-medium">{f}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Visual Side */}
                                        <div className="w-full lg:w-1/2 flex justify-center lg:justify-end mt-8 lg:mt-0">
                                            <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-4">
                                                {/* Mockup Frame */}
                                                <div className="w-full h-full bg-white relative overflow-hidden rounded-2xl">
                                                    <div className="absolute inset-0 bg-gray-100 flex items-center justify-center text-zinc-300">
                                                        <div className="text-4xl font-heading opacity-20 text-center px-4">{feature}<br />Mockup</div>
                                                    </div>
                                                    {/* Decorative Overlay for visual flare */}
                                                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-black/10 to-transparent pointer-events-none"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* 7. FULL PROCESS */}
            <section className="py-24 bg-zinc-50 dark:bg-zinc-900/50">
                <div className="container mx-auto px-6">
                    <h2 className="text-center text-4xl font-bold font-heading text-zinc-900 dark:text-white mb-20">Complete Lifecycle</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/*@ts-ignore*/}
                        {service.process?.map((item: any, idx: number) => (
                            <div key={idx} className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-zinc-100 dark:border-zinc-800 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                                <div className="text-6xl font-bold text-orange-500 mb-6 transition-colors">{item.step}</div>
                                <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-4">{item.title}</h3>
                                <p className="text-zinc-500 dark:text-zinc-400">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 8. PROPOSAL FORM (Replaced simple CTA) */}
            <section id="proposal-form" className="py-24 lg:py-32 px-6 relative overflow-hidden bg-gray-100 dark:bg-zinc-900">
                <div className={`absolute top-0 left-0 w-full h-full bg-linear-to-b ${service.bg_gradient} opacity-5`}></div>
                <div className="container mx-auto relative z-10 flex flex-col lg:flex-row gap-16 items-start">
                    <div className="lg:w-1/2">
                        <h2 className="text-5xl md:text-7xl font-oswald font-bold uppercase mb-8 leading-tight text-foreground">
                            Ready to <br />
                            <span className="text-orange-600">Start?</span>
                        </h2>
                        <p className="text-xl text-gray-600 dark:text-zinc-400 font-light mb-12 max-w-md">
                            Let's discuss your ideas and build something extraordinary together. Fill out the form, and we'll be in touch within 24 hours.
                        </p>

                        <div className="space-y-8">
                            <div className="flex items-center gap-6">
                                <div className="w-12 h-12 rounded-full border border-gray-300 dark:border-zinc-700 flex items-center justify-center text-foreground">
                                    <span className="font-mono text-orange-600">01</span>
                                </div>
                                <div>
                                    <h4 className="font-bold text-foreground uppercase text-sm mb-1">Fill out the form</h4>
                                    <p className="text-gray-500 dark:text-zinc-500 text-sm">Tell us about your project.</p>
                                </div>
                            </div>
                            <div className="h-8 border-l border-gray-300 dark:border-zinc-800 ml-6"></div>
                            <div className="flex items-center gap-6">
                                <div className="w-12 h-12 rounded-full border border-gray-300 dark:border-zinc-700 flex items-center justify-center text-foreground">
                                    <span className="font-mono text-orange-600">02</span>
                                </div>
                                <div>
                                    <h4 className="font-bold text-foreground uppercase text-sm mb-1">We get in touch</h4>
                                    <p className="text-gray-500 dark:text-zinc-500 text-sm">We'll schedule a discovery call.</p>
                                </div>
                            </div>
                            <div className="h-8 border-l border-gray-300 dark:border-zinc-800 ml-6"></div>
                            <div className="flex items-center gap-6">
                                <div className="w-12 h-12 rounded-full border border-gray-300 dark:border-zinc-700 flex items-center justify-center text-foreground">
                                    <span className="font-mono text-orange-600">03</span>
                                </div>
                                <div>
                                    <h4 className="font-bold text-foreground uppercase text-sm mb-1">Kickoff</h4>
                                    <p className="text-gray-500 dark:text-zinc-500 text-sm">We start building your vision.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:w-1/2 w-full">
                        <ProposalForm />
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
