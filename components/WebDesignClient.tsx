'use client';

import { useRef, useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import {
    ArrowRight, CheckCircle2, Code2, Globe, Layout,
    Smartphone, Zap, ChevronDown, Plus, ExternalLink,
    Shield, BarChart, MousePointer2, Layers, Repeat,
    Landmark, ShoppingBag, Building2, HeartPulse, Briefcase
} from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { cn } from '@/lib/utils';
import Image from 'next/image';

gsap.registerPlugin(ScrollTrigger);

const industries = [
    { name: "Fintech & Banking", image: "https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?q=80&w=800&auto=format&fit=crop" },
    { name: "E-Commerce", image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=800&auto=format&fit=crop" },
    { name: "SaaS Platforms", image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop" },
    { name: "Healthcare", image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=800&auto=format&fit=crop" },
    { name: "Real Estate", image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=800&auto=format&fit=crop" },
    { name: "Education", image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=800&auto=format&fit=crop" }
];

const caseStudies = [
    { title: "Quantum Flow", category: "SaaS Platform", image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop" },
    { title: "Novus Markets", category: "Fintech App", image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop" },
    { title: "Elevate Gear", category: "E-Commerce", image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=800&auto=format&fit=crop" },
    { title: "MediCore", category: "Healthcare", image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=800&auto=format&fit=crop" }
];

export default function WebDesignClient() {
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

        // 6. Stacked Services (Pinning) - REMOVED TO ALLOW CSS STICKY TO WORK

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

    return (
        <main ref={containerRef} className="bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans selection:bg-orange-500 selection:text-white transition-colors duration-300">
            <Navbar />

            {/* 1. HERO SECTION */}
            <section className="relative min-h-[90vh] bg-[#020617] text-white pt-24 pb-12 lg:pt-32 lg:pb-20 overflow-hidden flex items-center">

                {/* Background Glows */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] lg:w-[800px] h-[400px] lg:h-[800px] bg-blue-900/20 rounded-full blur-[80px] lg:blur-[120px] pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-[300px] lg:w-[600px] h-[300px] lg:h-[600px] bg-orange-900/10 rounded-full blur-[60px] lg:blur-[100px] pointer-events-none" />

                <div className="container mx-auto px-6 relative z-10">
                    <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
                        <div className="lg:w-[60%] hero-content text-center lg:text-left">
                            {/* Rating Badge */}
                            <div className="inline-flex items-center gap-2 mb-6 lg:mb-8 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/5">
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <div key={i} className="w-3 h-3 lg:w-4 lg:h-4 text-orange-500 fill-orange-500">★</div>
                                    ))}
                                </div>
                                <span className="text-xs lg:text-sm font-medium">5.0 Clutch rating</span>
                            </div>

                            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold leading-[1.1] mb-6 lg:mb-8 tracking-tight font-heading ">
                                Top web design <br />
                                <span className="text-transparent bg-clip-text bg-linear-to-r from-orange-400 to-orange-600">
                                    & development
                                </span> services
                            </h1>

                            <p className="text-lg lg:text-xl text-zinc-400 max-w-xl leading-relaxed mb-8 mx-auto lg:mx-0">
                                Want a design that’s simple to use and built to perform? We build enterprise-grade websites that drive real business growth.
                            </p>

                            <blockquote className="border-l-4 border-orange-500 pl-6 my-8 italic text-zinc-300 text-lg text-left hidden sm:block">
                                "75% of users judge a brand’s credibility based solely on its website design."
                            </blockquote>

                            <div className="flex flex-col sm:flex-row flex-wrap gap-4 mt-8 lg:mt-10 justify-center lg:justify-start">
                                <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-white rounded-full h-14 px-10 text-lg transition-transform hover:scale-105 w-full sm:w-auto whitespace-nowrap">
                                    Launch your website
                                </Button>
                                <Button size="lg" variant="outline" className="border-zinc-700 hover:bg-white/10 text-white rounded-full h-14 px-10 text-lg flex items-center justify-center gap-2 w-full sm:w-auto whitespace-nowrap">
                                    <span className="w-5 h-5 border border-current rounded-sm flex items-center justify-center text-[10px]">P</span> View work
                                </Button>
                            </div>
                        </div>

                        <div className="lg:w-[40%] hero-image relative w-full px-4 sm:px-0">
                            <div className="relative z-10 transform lg:rotate-[-5deg] hover:rotate-0 transition-transform duration-700 ease-out">
                                <div className="bg-zinc-900 rounded-[24px] lg:rounded-[32px] overflow-hidden border-4 lg:border-8 border-zinc-800 shadow-2xl aspect-[3/4] sm:aspect-[4/3] lg:aspect-[3/4]">
                                    {/* Mockup Content */}
                                    <div className="h-full w-full bg-zinc-950 p-4 lg:p-6 flex flex-col relative overflow-hidden group">
                                        <div className="absolute inset-x-0 top-0 h-32 bg-linear-to-b from-orange-500/10 to-transparent pointer-events-none"></div>
                                        <div className="w-full flex justify-between items-center mb-6 lg:mb-8">
                                            <div className="w-20 lg:w-24 h-5 lg:h-6 bg-zinc-800 rounded-md"></div>
                                            <div className="space-x-2 flex">
                                                <div className="w-6 h-6 lg:w-8 lg:h-8 rounded-full bg-zinc-800"></div>
                                                <div className="w-6 h-6 lg:w-8 lg:h-8 rounded-full bg-orange-500"></div>
                                            </div>
                                        </div>
                                        <div className="space-y-4 flex-1">
                                            <div className="h-32 lg:h-40 w-full bg-zinc-800/50 rounded-2xl border border-zinc-700/50"></div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="h-24 lg:h-32 bg-zinc-800/30 rounded-2xl"></div>
                                                <div className="h-24 lg:h-32 bg-zinc-800/30 rounded-2xl"></div>
                                            </div>
                                        </div>
                                        <div className="mt-6 flex justify-center">
                                            <div className="bg-orange-600 text-white px-5 py-2 lg:px-6 lg:py-3 rounded-xl font-bold text-sm lg:text-base whitespace-nowrap">Get started</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Decorative Elements behind mockup */}
                            <div className="absolute -top-10 -right-10 w-24 h-24 lg:w-32 lg:h-32 bg-blue-600 rounded-full blur-[40px] lg:blur-[50px] opacity-50"></div>
                            <div className="absolute -bottom-10 -left-10 w-32 h-32 lg:w-40 lg:h-40 bg-orange-600 rounded-full blur-[50px] lg:blur-[60px] opacity-40"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. LOGO MARQUEE */}
            <section className="py-16 bg-white dark:bg-zinc-950 border-b border-zinc-100 dark:border-zinc-800">
                <p className="text-center text-zinc-500 dark:text-zinc-400 font-medium mb-10 tracking-widest text-sm">Trusted by 500+ global companies</p>
                <div className="overflow-hidden relative w-full">
                    <div className="marquee-content flex gap-16 whitespace-nowrap min-w-full items-center">
                        {/* Duplicated list for seamless loop */}
                        {[...navLogos, ...navLogos, ...navLogos].map((logo, i) => (
                            <span key={i} className="text-2xl font-bold text-zinc-300 dark:text-zinc-700 tracking-tighter">{logo}</span>
                        ))}
                    </div>
                    {/* Fade Edges */}
                    <div className="absolute top-0 left-0 h-full w-32 bg-linear-to-r from-white dark:from-zinc-950 to-transparent z-10"></div>
                    <div className="absolute top-0 right-0 h-full w-32 bg-linear-to-l from-white dark:from-zinc-950 to-transparent z-10"></div>
                </div>
            </section>

            {/* 3. WHY FOUNDERS TRUST US (SPLIT) */}
            <section className="py-24 bg-zinc-50 dark:bg-zinc-900/50">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col lg:flex-row gap-16">
                        {/* Left: Image */}
                        <div className="lg:w-1/2 reveal-up">
                            <div className="sticky top-32">
                                <div className="bg-zinc-900 dark:bg-black rounded-3xl p-2 shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500">
                                    <div className="aspect-video bg-zinc-800 rounded-2xl overflow-hidden relative">
                                        {/* Abstract Dashboard UI */}
                                        <div className="absolute inset-0 bg-[#0f0f0f] p-8">
                                            <div className="flex gap-4 mb-8">
                                                <div className="w-1/4 h-32 bg-zinc-800 rounded-lg animate-pulse"></div>
                                                <div className="w-1/4 h-32 bg-zinc-800 rounded-lg animate-pulse delay-100"></div>
                                                <div className="w-2/4 h-32 bg-zinc-800 rounded-lg animate-pulse delay-200"></div>
                                            </div>
                                            <div className="h-64 w-full bg-zinc-800/50 rounded-lg border border-zinc-700"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right: Accordion */}
                        <div className="lg:w-1/2 reveal-up">
                            <h2 className="text-4xl lg:text-5xl font-bold font-heading leading-tight mb-8 text-zinc-900 dark:text-white">
                                Why founders trust us to <span className="text-orange-600">design</span> their website
                            </h2>
                            <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-12">
                                Confusing navigation and poor design kill conversions. We solve this by building user-first experiences that guide visitors to action.
                            </p>

                            <div className="space-y-4">
                                {[
                                    { title: "No more guesswork", desc: "Data-driven decisions, not just 'gut feelings'." },
                                    { title: "Launch without delays", desc: "Our agile process ensures we hit deadlines every time." },
                                    { title: "Design that speaks product", desc: "We understand SaaS and tech products deeply." },
                                    { title: "Handoff that’s dev-ready", desc: "Clean code and Figma files your engineers will love." },
                                    { title: "Support that doesn’t disappear", desc: "We are here for the long haul to help you scale." }
                                ].map((item, idx) => (
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
                                                    {item.desc}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. CASE STUDIES GRID */}
            <section className="py-24 bg-white dark:bg-zinc-950 relative">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-blue-50/50 dark:bg-blue-900/10 pointer-events-none"></div>
                <div className="container mx-auto px-6 relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold font-heading text-zinc-900 dark:text-white leading-tight">
                            Turn your ideas into <br />
                            <span className="text-orange-600">impactful solutions</span>
                        </h2>
                        <Button className="mt-8 md:mt-0 rounded-full h-12 px-8 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 whitespace-nowrap">
                            View all projects <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {caseStudies.map((study, idx) => (
                            <div key={idx} className="group reveal-up cursor-pointer">
                                <div className="rounded-3xl overflow-hidden relative aspect-[4/3] mb-6">
                                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors z-10"></div>
                                    <Image
                                        src={study.image}
                                        alt={study.title}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                    <div className="absolute top-6 right-6 z-20 w-12 h-12 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-xl">
                                        <ArrowRight className="w-5 h-5 text-orange-600" />
                                    </div>
                                </div>
                                <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">{study.title}</h3>
                                <p className="text-zinc-500 dark:text-zinc-400 font-mono text-sm tracking-wider">{study.category}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 5. DELIVERY BANNER (DARK) */}
            <section className="py-24 bg-[#050505] text-white">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col lg:flex-row gap-16 items-center">
                        <div className="lg:w-1/2">
                            <h2 className="text-4xl md:text-5xl font-bold font-heading mb-8">
                                We deliver on time, in <br />
                                <span className="text-orange-500">days and weeks</span> <br />
                                — Not months.
                            </h2>
                            <div className="space-y-8 mt-12">
                                {[
                                    { title: "Onboard in < 24 Hours", desc: "Immediate start upon agreement signature." },
                                    { title: "Weekly Sprints", desc: "Constant updates and iterative feedback loops." },
                                    { title: "Launch in 4-6 Weeks", desc: "From concept to live production rapidly." }
                                ].map((item, idx) => (
                                    <div key={idx} className="flex gap-6 reveal-up">
                                        <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-orange-500 font-bold shrink-0">
                                            0{idx + 1}
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-bold mb-2">{item.title}</h4>
                                            <p className="text-zinc-500">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="lg:w-1/2 w-full">
                            <div className="bg-zinc-900 rounded-3xl p-8 border border-zinc-800 relative reveal-up">
                                <div className="text-orange-500 text-6xl font-serif absolute top-4 right-8 opacity-20">"</div>
                                <p className="text-xl leading-relaxed text-zinc-300 mb-8 relative z-10">
                                    "Mutant Technologies didn't just build a website; they transformed our entire digital infrastructure. The speed of delivery was unmatched."
                                </p>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-zinc-700"></div>
                                    <div>
                                        <div className="font-bold text-white">Michael Chen</div>
                                        <div className="text-sm text-zinc-500">CTO, Nexus Systems</div>
                                    </div>
                                    <Button size="sm" className="ml-auto bg-white text-black hover:bg-zinc-200 rounded-full whitespace-nowrap">
                                        Read case study
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 6. EXTENDED SERVICES (Fixed Stacking) - (Already updated title) */}
            {/* ... servicesList container ... */}
            <div className="bg-zinc-50 dark:bg-zinc-900/50 relative z-10">
                <div className="py-24 text-center">
                    <h2 className="text-4xl md:text-5xl font-bold font-heading text-zinc-900 dark:text-white">
                        What's included
                    </h2>
                </div>

                <div className="pinned-services-container relative w-full">
                    {servicesList.map((service, index) => (
                        <div
                            key={index}
                            className="pinned-service-card sticky top-0 min-h-[80vh] md:min-h-screen flex items-center justify-center overflow-hidden"
                            style={{
                                backgroundColor: service.bg,
                                color: service.text,
                                zIndex: index + 1
                            }}
                        >
                            <div className="container mx-auto px-6 h-full flex items-center">
                                <div className="flex flex-col lg:flex-row items-center w-full gap-8 lg:gap-16 h-full justify-center py-12 lg:py-20">
                                    {/* Text Side */}
                                    <div className="w-full lg:w-1/2 flex flex-col justify-center text-center lg:text-left">
                                        <div className="w-16 h-1 bg-current mb-6 lg:mb-8 opacity-50 mx-auto lg:mx-0"></div>
                                        <h3 className="text-4xl md:text-5xl lg:text-7xl font-bold font-heading mb-6 lg:mb-8 leading-tight">{service.title}</h3>
                                        <p className="text-lg md:text-xl lg:text-2xl opacity-90 mb-8 lg:mb-10 leading-relaxed font-light">{service.desc}</p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                                            {service.features.map(f => (
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
                                                    {service.graphic ? service.graphic : <div className="text-4xl font-heading opacity-20">{service.title} Mockup</div>}
                                                </div>
                                                {/* Decorative Overlay for visual flare */}
                                                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-black/10 to-transparent pointer-events-none"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 7. INDUSTRY FOCUS (Vertical Cards) */}
            <section className="py-32 bg-white dark:bg-zinc-950">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16">
                        <h2 className="text-5xl md:text-7xl font-bold font-heading text-zinc-900 dark:text-white leading-tight">
                            Web design for <br />
                            <span className="text-gray-400 dark:text-zinc-600">your industry</span>
                        </h2>
                        <Button className="mt-8 md:mt-0 rounded-full h-14 px-8 bg-blue-600 text-white hover:bg-blue-700 text-lg whitespace-nowrap">
                            Start your project <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            { title: "SaaS & Tech", desc: "Convert demos into paying users.", icon: <Layers className="w-8 h-8" /> },
                            { title: "Fintech", desc: "Build trust with secure, professional design.", icon: <Landmark className="w-8 h-8" /> },
                            { title: "E-commerce", desc: "High-converting stores that drive sales.", icon: <ShoppingBag className="w-8 h-8" /> },
                            { title: "Real Estate", desc: "Showcase properties with stunning visuals.", icon: <Building2 className="w-8 h-8" /> },
                            { title: "Healthcare", desc: "Patient-first digital experiences.", icon: <HeartPulse className="w-8 h-8" /> },
                            { title: "Agency", desc: "Portfolios that win big clients.", icon: <Briefcase className="w-8 h-8" /> }
                        ].map((item, idx) => (
                            <div key={idx} className="group p-8 rounded-3xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-orange-500/30 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
                                <div className="mb-6 inline-flex p-3 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 group-hover:border-orange-200 group-hover:bg-orange-50 dark:group-hover:bg-orange-900/20 text-zinc-900 dark:text-zinc-100 group-hover:text-orange-600 transition-colors shadow-sm">
                                    {item.icon}
                                </div>
                                <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-3 group-hover:text-orange-600 transition-colors">{item.title}</h3>
                                <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed group-hover:text-zinc-600 dark:group-hover:text-zinc-300">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 8. STATS ROW */}
            <section className="py-24 bg-zinc-900 text-white">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        <div>
                            <div className="text-4xl md:text-5xl font-bold text-white mb-2">$50M+</div>
                            <div className="text-zinc-500">Client Revenue Raised</div>
                        </div>
                        <div>
                            <div className="text-4xl md:text-5xl font-bold text-white mb-2">100+</div>
                            <div className="text-zinc-500">Projects Launched</div>
                        </div>
                        <div>
                            <div className="text-4xl md:text-5xl font-bold text-white mb-2">4.9/5</div>
                            <div className="text-zinc-500">Client Satisfaction</div>
                        </div>
                        <div>
                            <div className="text-4xl md:text-5xl font-bold text-white mb-2">24h</div>
                            <div className="text-zinc-500">Support Response</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 9. PROCESS WORKFLOW (Update Numbers) */}
            <section className="py-24 bg-zinc-50 dark:bg-zinc-900/50">
                <div className="container mx-auto px-6">
                    <h2 className="text-center text-4xl font-bold font-heading text-zinc-900 dark:text-white mb-20">Our process</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            { step: "01", title: "Discovery", desc: "Workshops to align on goals and requirements." },
                            { step: "02", title: "Research", desc: "User analysis and competitive benchmarking." },
                            { step: "03", title: "Wireframing", desc: "Structural layout and user flow planning." },
                            { step: "04", title: "Visual design", desc: "High-fidelity UI crafting with your brand." },
                            { step: "05", title: "Development", desc: "Pixel-perfect implementation in Next.js." },
                            { step: "06", title: "Launch", desc: "QA testing, deployment, and post-launch care." }
                        ].map((item, idx) => (
                            <div key={idx} className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-zinc-100 dark:border-zinc-800 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                                <div className="text-6xl font-bold text-orange-500 mb-6 transition-colors">{item.step}</div>
                                <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-4">{item.title}</h3>
                                <p className="text-zinc-500 dark:text-zinc-400">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 10. BIG TESTIMONIAL - Skipping changes as none requested specifically here */}
            <section className="py-32 bg-[#020617] text-white text-center relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-600/10 blur-[100px] rounded-full pointer-events-none"></div>
                <div className="container mx-auto px-6 relative z-10 max-w-4xl">
                    <div className="w-24 h-24 mx-auto bg-zinc-800 rounded-full mb-8 overflow-hidden border-2 border-orange-500">
                        {/* Placeholder Avatar */}
                        <div className="w-full h-full bg-zinc-700 flex items-center justify-center text-2xl">👨🏻‍💻</div>
                    </div>
                    <h2 className="text-3xl md:text-5xl font-medium leading-tight mb-10 text-zinc-200">
                        "The team at Mutant completely revolutionized our online presence. We saw a <span className="text-orange-500">200% increase</span> in qualified leads within the first month of launch."
                    </h2>
                    <div className="font-heading tracking-widest text-zinc-500">Christopher Fox, CEO @ Raft</div>
                </div>
            </section>

            {/* 11. FAQ - Skipping */}
            <section className="py-24 bg-white dark:bg-zinc-950">
                <div className="container mx-auto px-6 max-w-5xl">
                    <div className="flex flex-col md:flex-row gap-16">
                        <div className="md:w-1/3">
                            <h2 className="text-4xl font-bold font-heading mb-6 text-zinc-900 dark:text-white">Frequently <br /> asked <br />questions</h2>
                            <p className="text-zinc-500 dark:text-zinc-400">Everything you need to know about working with us.</p>
                        </div>
                        <div className="md:w-2/3 space-y-4">
                            {[
                                { q: "How much does a website cost?", a: "Every project is unique. Typical engagements range from $3k for simple sites to $20k+ for complex web apps." },
                                { q: "How long does it take?", a: "Standard timeline is 4-6 weeks. Expedited options are available." },
                                { q: "Do you use templates?", a: "Never. Every pixel is custom designed for your brand." },
                                { q: "Will I be able to update it?", a: "Yes, we integrate user-friendly CMS solutions like Sanity or Strapi." }
                            ].map((item, idx) => (
                                <div key={idx} className="border-b border-zinc-200 dark:border-zinc-800 py-6">
                                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">{item.q}</h3>
                                    <p className="text-zinc-600 dark:text-zinc-400">{item.a}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* 12. BOTTOM CTA */}
            <section className="py-24 px-6 bg-[#020617] relative overflow-hidden">
                <div className="absolute inset-0 bg-linear-to-br from-orange-900/20 to-blue-900/20 pointer-events-none"></div>
                <div className="container mx-auto text-center relative z-10 max-w-3xl">
                    <h2 className="text-5xl md:text-7xl font-heading font-bold text-white mb-8">
                        Build a website that <br /> <span className="text-transparent bg-clip-text bg-linear-to-r from-orange-400 to-orange-600">sets you apart</span>
                    </h2>
                    <p className="text-xl text-zinc-400 mb-12">
                        Stop losing customers to bad design. Let's create something extraordinary.
                    </p>
                    <Button size="lg" className="rounded-full h-16 px-12 text-xl bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-900/20 transition-transform hover:scale-105 whitespace-nowrap">
                        Book a 1:1 strategy call
                    </Button>
                </div>
            </section>
        </main>
    );
}

// Data for Stacked Services
const servicesList = [
    { title: "Strategy & UX", desc: "We map out the user journey and information architecture to ensure your site converts.", features: ["Site mapping", "User personas", "Wireframing"], bg: "#020617", text: "#fff", graphic: <Layout className="w-32 h-32 text-blue-600" /> }, // Dark Slate
    { title: "UI design", desc: "Visual storytelling that aligns with your brand identity and captivates your audience.", features: ["Design systems", "Hi-fi prototyping", "Motion design"], bg: "#ffffff", text: "#000", graphic: <MousePointer2 className="w-32 h-32 text-orange-600" /> }, // White
    { title: "Development", desc: "Clean, performant code ensuring your site is fast, secure, and SEO-ready.", features: ["Next.js/React", "Headless CMS", "API integration"], bg: "#ea580c", text: "#fff", graphic: <Code2 className="w-32 h-32 text-blue-600" /> }, // Brand Orange
    { title: "Responsive", desc: "Flawless experiences across all devices, from 4k monitors to mobile phones.", features: ["Mobile first", "Cross-browser testing", "Touch optimization"], bg: "#000000", text: "#fff", graphic: <Smartphone className="w-32 h-32 text-zinc-200" /> }, // Black
    { title: "Launch & growth", desc: "We don't just launch; we help you grow with data-driven optimization.", features: ["Analytics setup", "SEO basics", "Heatmaps"], bg: "#ea580c", text: "#fff", graphic: <BarChart className="w-32 h-32 text-white" /> } // Orange
];

const navLogos = ["NEXUS", "VORTEX", "APEX", "ECHO", "QUANTUM", "HORIZON", "PULSE"];

const getIndustryColor = (idx: number) => {
    const colors = ['#3b82f6', '#ec4899', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];
    return colors[idx % colors.length];
};

