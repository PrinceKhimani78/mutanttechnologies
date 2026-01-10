'use client';
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, LayoutGrid, Layers, Code2, Zap } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRef, useState } from 'react';
import { services } from '@/lib/data';
import { ProposalForm } from './ProposalForm';

interface ServiceDetailClientProps {
    slug: string;
}


export default function ServiceDetailClient({ slug }: ServiceDetailClientProps) {
    const service = services.find(s => s.slug === slug);
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    // Refs for animations
    const containerRef = useRef(null);
    const benefitsRef = useRef(null);
    const featuresRef = useRef(null);
    const faqRef = useRef(null);

    if (!service) {
        return <div className="min-h-screen bg-background flex items-center justify-center text-foreground">Service Not Found</div>;
    }

    useGSAP(() => {
        gsap.registerPlugin(ScrollTrigger);

        const tl = gsap.timeline();

        // Hero Animation (Immediate)
        tl.from(".hero-element", {
            y: 50,
            opacity: 0,
            duration: 1,
            stagger: 0.15,
            ease: "power4.out"
        })
            .from(".hero-image-reveal", {
                scale: 0.9,
                opacity: 0,
                duration: 1.2,
                ease: "power3.out"
            }, "-=0.8");

        // Benefits Animation
        gsap.from(".benefit-card", {
            scrollTrigger: {
                trigger: benefitsRef.current,
                start: "top 85%", // Trigger earlier
                toggleActions: "play none none reverse" // Re-play on scroll up? No, keep simple
            },
            y: 50,
            opacity: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: "power2.out"
        });

        // Features Animation
        gsap.from(".feature-item", {
            scrollTrigger: {
                trigger: featuresRef.current,
                start: "top 80%",
            },
            x: -20,
            opacity: 0,
            duration: 0.5,
            stagger: 0.05,
            ease: "power2.out"
        });

        // FAQ Animation
        gsap.from(".faq-item", {
            scrollTrigger: {
                trigger: faqRef.current,
                start: "top 85%",
            },
            y: 20,
            opacity: 0,
            duration: 0.5,
            stagger: 0.1,
            ease: "power2.out"
        });

    }, { scope: containerRef });

    const Icon = service.icon;

    return (
        <main ref={containerRef} className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-white font-sans overflow-x-hidden transition-colors duration-300">
            <Navbar />

            {/* 1. Hero Section */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6 border-b border-gray-200 dark:border-zinc-800/50">
                <div className="container mx-auto">
                    <div className="flex flex-col lg:flex-row gap-16 md:gap-24 items-center">
                        <div className="flex-1 max-w-3xl">
                            <div className="hero-element inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 dark:border-zinc-800 bg-gray-100/50 dark:bg-zinc-900/50 text-primary text-sm font-mono uppercase tracking-wider mb-8">
                                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                                <span>{service.title} Services</span>
                            </div>
                            <h1 className="hero-element text-5xl md:text-7xl lg:text-8xl font-oswald font-bold uppercase leading-[0.9] mb-8 tracking-tight text-foreground">
                                <span className="text-gray-500 dark:text-zinc-600 block mb-2">Transform Your</span>
                                <span className="text-foreground bg-clip-text text-transparent bg-linear-to-r from-gray-900 to-gray-500 dark:from-white dark:to-zinc-400">Digital Presence</span>
                            </h1>
                            <p className="hero-element text-xl text-gray-600 dark:text-zinc-300 max-w-xl leading-relaxed mb-10 font-light">
                                {service.description}
                            </p>
                            <div className="hero-element flex flex-wrap gap-4">
                                <Button
                                    size="lg"
                                    className="rounded-full px-8 text-lg h-16 bg-foreground text-background hover:bg-zinc-700 hover:scale-105 transition-all duration-300"
                                    onClick={() => document.getElementById('proposal-form')?.scrollIntoView({ behavior: 'smooth' })}
                                >
                                    Start Your Project
                                </Button>
                                <Button size="lg" variant="ghost" className="rounded-full px-8 text-lg h-16 text-gray-500 dark:text-zinc-400 hover:text-foreground hover:bg-gray-100 dark:hover:bg-zinc-900 border border-transparent hover:border-gray-200 dark:hover:border-zinc-800">
                                    Learn More <ArrowRight className="w-5 h-5 ml-2" />
                                </Button>
                            </div>
                        </div>

                        {/* Hero Image / Visualization */}
                        <div className="hero-image-reveal flex-1 w-full flex justify-center lg:justify-end">
                            <div className={`relative w-full max-w-lg aspect-[4/5] rounded-[2rem] overflow-hidden bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-2xl group`}>
                                {/* Abstract Background Pattern */}
                                <div className={`absolute inset-0 bg-linear-to-br ${service.bgGradient} opacity-20 group-hover:opacity-30 transition-duration-700`}></div>
                                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>

                                {/* Placeholder Content Visualization */}
                                <div className="absolute inset-0 p-8 flex flex-col pt-24">
                                    <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-auto border border-white/10 shadow-lg">
                                        <Icon className="w-8 h-8 text-dark-slate dark:text-white" />
                                    </div>

                                    <div className="space-y-4">
                                        <div className="h-2 w-full bg-white/10 dark:bg-white/5 rounded-full overflow-hidden">
                                            <div className="h-full bg-primary w-2/3"></div>
                                        </div>
                                        <div className="h-2 w-full bg-white/10 dark:bg-white/5 rounded-full overflow-hidden">
                                            <div className="h-full bg-primary w-1/2 delay-100"></div>
                                        </div>
                                        <div className="h-2 w-full bg-white/10 dark:bg-white/5 rounded-full overflow-hidden">
                                            <div className="h-full bg-primary w-3/4 delay-200"></div>
                                        </div>
                                    </div>

                                    <div className="mt-8 pt-8 border-t border-white/10 dark:border-white/5 flex justify-between items-end">
                                        <div>
                                            <div className="text-gray-500 dark:text-zinc-500 text-sm font-mono mb-1">PROJECT ID</div>
                                            <div className="text-3xl font-oswald font-bold text-dark-slate dark:text-white tracking-widest">{service.id}</div>
                                        </div>
                                        <div className="text-8xl font-oswald font-bold text-black/5 dark:text-white/5 absolute bottom-4 right-4">{service.id}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. Tools Strip */}
            <section className="py-12 border-b border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-black/50 backdrop-blur-xs">
                <div className="container mx-auto px-6">
                    <p className="text-center text-gray-500 dark:text-zinc-500 text-xs font-mono mb-8 uppercase tracking-[0.2em]">Powered by Industry Leading Tech</p>
                    <div className="flex flex-wrap justify-center gap-x-12 gap-y-8 opacity-60 dark:opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
                        {service.tools?.map((tool: string, idx: number) => (
                            <span key={idx} className="text-xl md:text-2xl font-oswald font-bold text-gray-400 dark:text-zinc-300 select-none cursor-default hover:text-black dark:hover:text-white transition-colors">
                                {tool}
                            </span>
                        ))}
                    </div>
                </div>
            </section>

            {/* 3. Benefits Grid */}
            <section ref={benefitsRef} className="py-24 lg:py-32 px-6">
                <div className="container mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
                        <div className="max-w-2xl">
                            <h2 className="text-4xl md:text-5xl font-oswald font-bold uppercase mb-6 leading-tight text-foreground">
                                Why Partner <span className="text-primary">With Us?</span>
                            </h2>
                            <p className="text-gray-600 dark:text-zinc-400 text-lg font-light">
                                We don't just deliver services; we deliver measurable results and sustainable growth for your business.
                            </p>
                        </div>
                        <div className="h-px bg-gray-200 dark:bg-zinc-800 flex-1 hidden md:block mb-8"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                        {service.benefits?.map((benefit: any, idx: number) => (
                            <div key={idx} className="benefit-card bg-white dark:bg-zinc-900/30 p-8 rounded-3xl border border-gray-200 dark:border-zinc-800/50 hover:border-primary/30 dark:hover:bg-zinc-900 shadow-sm dark:shadow-none transition-all duration-500 group">
                                <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-zinc-800 flex items-center justify-center mb-8 group-hover:bg-primary group-hover:scale-110 transition-all duration-500 text-primary dark:text-white group-hover:text-white">
                                    <CheckCircle2 className="w-7 h-7" />
                                </div>
                                <h3 className="text-2xl font-oswald font-bold text-foreground mb-4 group-hover:text-primary transition-colors">{benefit.title}</h3>
                                <p className="text-gray-600 dark:text-zinc-400 leading-relaxed text-lg">
                                    {benefit.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 4. Sub-Services / Features */}
            <section ref={featuresRef} className="py-24 px-6 bg-gray-50 dark:bg-zinc-900 border-y border-gray-200 dark:border-zinc-800">
                <div className="container mx-auto">
                    <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
                        <div className="lg:w-1/3">
                            <div className="sticky top-32">
                                <h2 className="text-4xl md:text-6xl font-oswald font-bold uppercase leading-tight mb-8 text-foreground">
                                    We Cover Every <br />
                                    <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-purple-500">Angle</span>
                                </h2>
                                <p className="text-gray-600 dark:text-zinc-400 text-lg leading-relaxed mb-8">
                                    {service.content}
                                </p>
                                <Button variant="outline" className="rounded-full border-gray-300 dark:border-zinc-700 text-foreground hover:bg-foreground hover:text-background w-full md:w-auto">
                                    View Full Process
                                </Button>

                                {/* Placeholder Image for Spacing */}
                                <div className="mt-12 aspect-video rounded-2xl bg-white dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700/50 hidden lg:flex items-center justify-center overflow-hidden relative shadow-sm dark:shadow-none">
                                    <div className={`absolute inset-0 bg-linear-to-br ${service.bgGradient} opacity-10`}></div>
                                    <div className="text-gray-500 dark:text-zinc-600 font-mono text-sm uppercase tracking-widest flex items-center gap-2">
                                        <Layers className="w-4 h-4" /> Feature Preview
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-4">
                            {service.features.map((feature: string, i: number) => (
                                <div key={i} className="feature-item flex items-start gap-6 p-8 rounded-3xl bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 hover:border-primary/50 dark:hover:border-zinc-600 hover:bg-white dark:hover:bg-zinc-900 transition-all group min-h-[160px] shadow-sm dark:shadow-none">
                                    <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 flex items-center justify-center shrink-0 group-hover:bg-primary/20 group-hover:border-primary/50 transition-colors">
                                        {/* Dynamic Icon based on index for variety */}
                                        {i % 4 === 0 && <Code2 className="w-6 h-6 text-gray-400 dark:text-zinc-400 group-hover:text-primary transition-colors" />}
                                        {i % 4 === 1 && <LayoutGrid className="w-6 h-6 text-gray-400 dark:text-zinc-400 group-hover:text-primary transition-colors" />}
                                        {i % 4 === 2 && <Zap className="w-6 h-6 text-gray-400 dark:text-zinc-400 group-hover:text-primary transition-colors" />}
                                        {i % 4 === 3 && <Layers className="w-6 h-6 text-gray-400 dark:text-zinc-400 group-hover:text-primary transition-colors" />}
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-bold mb-2 group-hover:text-foreground transition-colors text-foreground">{feature}</h4>
                                        <p className="text-gray-500 dark:text-zinc-500 text-sm leading-relaxed">
                                            Comprehensive solution tailored to your needs. We ensure high quality and scalability.
                                        </p>
                                    </div>
                                </div>
                            ))}
                            {/* Filling empty space with a CTA card if needed */}
                            <div className="feature-item flex flex-col items-center justify-center text-center gap-4 p-8 rounded-3xl bg-gray-50 dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800 border-dashed min-h-[160px]">
                                <p className="text-gray-500 dark:text-zinc-500 font-medium">Need something simpler?</p>
                                <Button size="sm" variant="link" className="text-primary hover:text-foreground">Contact Us</Button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 5. Process / Timeline */}
            <section ref={faqRef} className="py-24 px-6 relative overflow-hidden bg-white/50 dark:bg-black/50">
                {/* Background Blob */}
                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-linear-to-r ${service.bgGradient} opacity-5 blur-[100px] rounded-full pointer-events-none`}></div>

                <div className="container mx-auto">
                    <div className="text-center mb-16 relative z-10">
                        <h2 className="text-4xl md:text-6xl font-oswald font-bold uppercase mb-4 text-foreground">Our Process</h2>
                        <p className="text-gray-500 dark:text-zinc-500">How we make it happen.</p>
                    </div>

                    <div className="max-w-4xl mx-auto space-y-12">
                        {/*@ts-ignore*/}
                        {service.process?.map((step: any, idx: number) => (
                            <div key={idx} className="faq-item flex flex-col md:flex-row gap-8 md:items-center group">
                                <div className="hidden md:flex flex-col items-center">
                                    <div className="w-px h-full bg-gray-200 dark:bg-zinc-800 group-last:hidden min-h-[50px]"></div>
                                    <div className="w-12 h-12 rounded-full border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 group-hover:border-primary group-hover:bg-primary group-hover:text-white dark:group-hover:text-black transition-all flex items-center justify-center font-bold font-mono text-foreground">
                                        {step.step}
                                    </div>
                                    <div className="w-px h-full bg-gray-200 dark:bg-zinc-800 group-last:hidden min-h-[50px]"></div>
                                </div>

                                <div className="flex-1 bg-white dark:bg-zinc-900/30 border border-gray-200 dark:border-zinc-800 p-8 rounded-3xl hover:border-primary/50 dark:hover:bg-zinc-900 transition-colors shadow-sm dark:shadow-none">
                                    <div className="flex items-center gap-4 md:hidden mb-4">
                                        <span className="font-mono text-primary font-bold">{step.step}</span>
                                        <div className="h-px bg-gray-200 dark:bg-zinc-800 flex-1"></div>
                                    </div>
                                    <h4 className="text-2xl font-oswald font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                                        {step.title}
                                    </h4>
                                    <p className="text-gray-600 dark:text-zinc-400 text-lg leading-relaxed">
                                        {step.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 6. Proposal Form Section */}
            <section id="proposal-form" className="py-24 lg:py-32 px-6 relative overflow-hidden bg-gray-100 dark:bg-zinc-900">
                <div className={`absolute top-0 left-0 w-full h-full bg-linear-to-b ${service.bgGradient} opacity-5`}></div>
                <div className="container mx-auto relative z-10 flex flex-col lg:flex-row gap-16 items-start">
                    <div className="lg:w-1/2">
                        <h2 className="text-5xl md:text-7xl font-oswald font-bold uppercase mb-8 leading-tight text-foreground">
                            Ready to <br />
                            <span className="text-primary">Start?</span>
                        </h2>
                        <p className="text-xl text-gray-600 dark:text-zinc-400 font-light mb-12 max-w-md">
                            Let's discuss your ideas and build something extraordinary together. Fill out the form, and we'll be in touch within 24 hours.
                        </p>

                        <div className="space-y-8">
                            <div className="flex items-center gap-6">
                                <div className="w-12 h-12 rounded-full border border-gray-300 dark:border-zinc-700 flex items-center justify-center text-foreground">
                                    <span className="font-mono text-primary">01</span>
                                </div>
                                <div>
                                    <h4 className="font-bold text-foreground uppercase text-sm mb-1">Fill out the form</h4>
                                    <p className="text-gray-500 dark:text-zinc-500 text-sm">Tell us about your project.</p>
                                </div>
                            </div>
                            <div className="h-8 border-l border-gray-300 dark:border-zinc-800 ml-6"></div>
                            <div className="flex items-center gap-6">
                                <div className="w-12 h-12 rounded-full border border-gray-300 dark:border-zinc-700 flex items-center justify-center text-foreground">
                                    <span className="font-mono text-primary">02</span>
                                </div>
                                <div>
                                    <h4 className="font-bold text-foreground uppercase text-sm mb-1">We get in touch</h4>
                                    <p className="text-gray-500 dark:text-zinc-500 text-sm">We'll schedule a discovery call.</p>
                                </div>
                            </div>
                            <div className="h-8 border-l border-gray-300 dark:border-zinc-800 ml-6"></div>
                            <div className="flex items-center gap-6">
                                <div className="w-12 h-12 rounded-full border border-gray-300 dark:border-zinc-700 flex items-center justify-center text-foreground">
                                    <span className="font-mono text-primary">03</span>
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
