'use client';

import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ProposalForm } from '@/components/ProposalForm';
import {
    ArrowRight, CheckCircle2, Code2, Globe, Layout,
    Zap, Building2, HeartPulse, Briefcase, Calendar, ShieldCheck
} from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { cn } from '@/lib/utils';
import Image from 'next/image';

gsap.registerPlugin(ScrollTrigger);

const services = [
    {
        title: "Design, Build, and Launch",
        description: "Funnels, landing pages, membership areas, and full client acquisition systems delivered by GoHighLevel experts.",
        icon: <Layout className="w-6 h-6 text-orange-500" />
    },
    {
        title: "Custom GHL Development",
        description: "Workflow automations, booking integrations, trigger sequences, and SaaS Mode configurations built with expertise.",
        icon: <Code2 className="w-6 h-6 text-orange-500" />
    },
    {
        title: "Ongoing Care",
        description: "Your clients' funnels, templates, and automations keep running smoothly with reliable white-label support.",
        icon: <Zap className="w-6 h-6 text-orange-500" />
    }
];

const features = [
    {
        category: "HighLevel Website & Funnel Development",
        items: [
            "Full GHL website builder setup and custom builds",
            "Landing page design and funnel development",
            "Sales funnel setup, optimization, and conversions",
            "Template-based website builds for fast deployment"
        ]
    },
    {
        category: "CRM & AI Automation",
        items: [
            "CRM setup and pipeline configuration",
            "Advanced workflow automation and trigger sequences",
            "Email, SMS, and campaign automation setup",
            "Calendar, booking, and appointment systems"
        ]
    },
    {
        category: "GHL Integrations & Enhancements",
        items: [
            "Google Analytics Integration With GHL SEO",
            "Google Business Profile Connection",
            "Meta (FB & IG), TikTok, and LinkedIn Integration",
            "Zapier and Third-Party app Connections"
        ]
    }
];

export default function WhiteLabelGHLClient() {
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        const tl = gsap.timeline();

        // Hero Animations
        tl.from(".hero-content > *", {
            y: 50,
            opacity: 0,
            duration: 1,
            stagger: 0.1,
            ease: "power3.out"
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

    return (
        <div ref={containerRef} className="bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans selection:bg-orange-500 selection:text-white transition-colors duration-300">
            
            {/* HERO SECTION */}
            <section className="relative min-h-[90vh] bg-[#020617] text-white pt-24 pb-12 lg:pt-32 lg:pb-20 overflow-hidden flex items-center">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] lg:w-[800px] h-[400px] lg:h-[800px] bg-blue-900/20 rounded-full blur-[80px] lg:blur-[120px] pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-[300px] lg:w-[600px] h-[300px] lg:h-[600px] bg-orange-900/10 rounded-full blur-[60px] lg:blur-[100px] pointer-events-none" />

                <div className="container mx-auto px-6 relative z-10 text-center">
                    <div className="max-w-4xl mx-auto hero-content">
                        <div className="inline-flex items-center gap-2 mb-6 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/5">
                            <span className="text-sm font-medium tracking-wide">White Label Services</span>
                        </div>
                        <h1 className="text-5xl lg:text-7xl font-oswald font-bold uppercase leading-[1.1] tracking-tight mb-8">
                            White Label <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">GoHighLevel</span> Development
                        </h1>
                        <p className="text-xl text-zinc-400 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
                            Mutant Technologies is your white label GoHighLevel implementation partner for full-funnel builds, websites, landing pages, and advanced GHL development. Deliver faster, smarter, and at scale, under your brand.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-8 font-semibold w-full sm:w-auto group" href="https://calendly.com/prince-mutanttechnologies/30min">
                                Talk With a Growth Partner
                                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* STATS SECTION */}
            <section className="py-12 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center reveal-up">
                        <div>
                            <p className="text-4xl lg:text-5xl font-oswald font-bold text-orange-500 mb-2">4+</p>
                            <p className="text-sm font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Agencies Using Us</p>
                        </div>
                        <div>
                            <p className="text-4xl lg:text-5xl font-oswald font-bold text-orange-500 mb-2">5+</p>
                            <p className="text-sm font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Years Experience</p>
                        </div>
                        <div>
                            <p className="text-4xl lg:text-5xl font-oswald font-bold text-orange-500 mb-2">15+</p>
                            <p className="text-sm font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Countries Served</p>
                        </div>
                        <div>
                            <p className="text-4xl lg:text-5xl font-oswald font-bold text-orange-500 mb-2"><ShieldCheck className="w-10 h-10 mx-auto" /></p>
                            <p className="text-sm font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">HIPAA Compliant</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* SERVICES PREVIEW GRID */}
            <section className="py-24 bg-white dark:bg-zinc-950">
                <div className="container mx-auto px-6">
                    <div className="text-center max-w-3xl mx-auto mb-16 reveal-up">
                        <h2 className="text-4xl font-oswald font-bold uppercase mb-6">Our White Label GoHighLevel Services</h2>
                        <p className="text-lg text-zinc-600 dark:text-zinc-400">
                            From full Highlevel website builds to CRM configuration and automation workflows, we work as an extension of your team, delivering reliable, on-time execution.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {services.map((service, idx) => (
                            <div key={idx} className="p-8 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 reveal-up hover:border-orange-500/50 transition-colors">
                                <div className="w-12 h-12 bg-orange-500/10 rounded-full flex items-center justify-center mb-6">
                                    {service.icon}
                                </div>
                                <h3 className="text-xl font-oswald font-bold mb-4">{service.title}</h3>
                                <p className="text-zinc-600 dark:text-zinc-400 font-light">{service.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* DETAILED CAPABILITIES */}
            <section className="py-24 bg-zinc-50 dark:bg-zinc-900 border-y border-zinc-200 dark:border-zinc-800 overflow-hidden relative">
                <div className="container mx-auto px-6 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div className="reveal-up">
                            <h2 className="text-4xl font-oswald font-bold uppercase mb-8">What We Deliver</h2>
                            <div className="space-y-8">
                                {features.map((feature, idx) => (
                                    <div key={idx} className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                                        <h3 className="text-xl font-oswald font-bold mb-4 text-orange-500">{feature.category}</h3>
                                        <ul className="space-y-3">
                                            {feature.items.map((item, i) => (
                                                <li key={i} className="flex items-start gap-3">
                                                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                                                    <span className="text-zinc-700 dark:text-zinc-300">{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="reveal-up relative">
                            <div className="aspect-square rounded-full bg-gradient-to-tr from-orange-500/20 to-blue-500/20 absolute -inset-4 blur-3xl" />
                            <div className="bg-[#020617] p-8 rounded-3xl border border-white/10 shadow-2xl relative text-white">
                                <h3 className="text-2xl font-oswald font-bold mb-2">Industries We Serve</h3>
                                <p className="text-zinc-400 font-light mb-6">We deliver solutions for all types of businesses, including:</p>
                                <div className="grid grid-cols-2 gap-6 mb-6">
                                    <div className="flex flex-col items-center text-center p-6 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
                                        <Building2 className="w-8 h-8 text-orange-400 mb-3" />
                                        <span className="font-medium font-oswald tracking-wide">Real Estate</span>
                                    </div>
                                    <div className="flex flex-col items-center text-center p-6 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
                                        <HeartPulse className="w-8 h-8 text-orange-400 mb-3" />
                                        <span className="font-medium font-oswald tracking-wide">Healthcare</span>
                                    </div>
                                    <div className="flex flex-col items-center text-center p-6 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
                                        <Globe className="w-8 h-8 text-orange-400 mb-3" />
                                        <span className="font-medium font-oswald tracking-wide">Spa & Wellness</span>
                                    </div>
                                    <div className="flex flex-col items-center text-center p-6 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
                                        <Briefcase className="w-8 h-8 text-orange-400 mb-3" />
                                        <span className="font-medium font-oswald tracking-wide">Fitness & Gym</span>
                                    </div>
                                </div>
                                <div className="text-center">
                                    <p className="text-orange-400 font-medium italic">...And Many More</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* BLACK LABEL / WHY CHOOSE US */}
            <section className="py-24 bg-white dark:bg-zinc-950">
                <div className="container mx-auto px-6">
                    <div className="text-center max-w-3xl mx-auto mb-16 reveal-up">
                        <h2 className="text-4xl font-oswald font-bold uppercase mb-6">The Mutant Standard</h2>
                        <p className="text-lg text-zinc-600 dark:text-zinc-400">
                            Most white label partners treat you like a transaction. We are your dedicated technical arm, providing consistent, premium, and rock-solid reliable execution.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8 text-center reveal-up">
                        <div className="p-8">
                            <div className="w-12 h-12 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-orange-500 font-oswald font-bold text-xl">
                                1
                            </div>
                            <h3 className="text-xl font-oswald font-bold mb-4">High Standards</h3>
                            <p className="text-zinc-600 dark:text-zinc-400 font-light">Your team learns your standards and brand preferences, sticking to them systematically.</p>
                        </div>
                        <div className="p-8">
                            <div className="w-12 h-12 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-orange-500 font-oswald font-bold text-xl">
                                2
                            </div>
                            <h3 className="text-xl font-oswald font-bold mb-4">Strategic Thinking</h3>
                            <p className="text-zinc-600 dark:text-zinc-400 font-light">We create recommendations that help you deliver better results for clients, not just ticking boxes.</p>
                        </div>
                        <div className="p-8">
                            <div className="w-12 h-12 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-orange-500 font-oswald font-bold text-xl">
                                3
                            </div>
                            <h3 className="text-xl font-oswald font-bold mb-4">Your Tools, Your Way</h3>
                            <p className="text-zinc-600 dark:text-zinc-400 font-light">We adapt to whatever platform, software, and processes you use for seamless integration.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA SECTION */}
            <section id="contact" className="py-24 bg-[#020617] text-white">
                <div className="container mx-auto px-6">
                    <div className="grid lg:grid-cols-2 gap-16">
                        <div className="reveal-up">
                            <h2 className="text-5xl font-oswald font-bold uppercase mb-6">Ready to scale?</h2>
                            <p className="text-xl text-zinc-400 mb-8 font-light">
                                Let's talk about your GoHighLevel needs. Expand your service offerings instantly without worrying about platform complexity.
                            </p>
                            
                            <div className="space-y-6 mb-8">
                                <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                                    <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center shrink-0">
                                        <Calendar className="w-6 h-6 text-orange-400" />
                                    </div>
                                    <div>
                                        <h4 className="font-oswald font-bold text-lg">Schedule a Meeting</h4>
                                        <p className="text-sm text-zinc-400 font-light">Pick a time that works best for you.</p>
                                    </div>
                                    <Button variant="outline" className="ml-auto border-white/20 hover:bg-white/10 text-zinc-900 dark:text-zinc-100" href="https://calendly.com/prince-mutanttechnologies/30min">
                                        Book Time
                                    </Button>
                                </div>
                            </div>
                        </div>
                        <div className="reveal-up">
                            <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl text-zinc-900 dark:text-zinc-100">
                                <h3 className="text-2xl font-oswald font-bold mb-6">Or Send a Request</h3>
                                <ProposalForm />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
