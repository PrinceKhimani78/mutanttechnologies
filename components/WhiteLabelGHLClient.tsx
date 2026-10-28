'use client';

import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ProposalForm } from '@/components/ProposalForm';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import {
    ArrowRight, CheckCircle2, Code2, Globe, Layout,
    Zap, Building2, HeartPulse, Briefcase, Calendar, 
    MessageSquare, Clock, Lock, UserCheck, RefreshCw,
    XCircle, Check, ArrowDown, UserPlus, DollarSign, TrendingUp,
    Star, Quote, ChevronDown
} from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { cn } from '@/lib/utils';

gsap.registerPlugin(ScrollTrigger);

const partnerBenefits = [
    { title: "White-Label Delivery", icon: <CheckCircle2 className="w-5 h-5 text-orange-500" /> },
    { title: "Dedicated Slack Comm", icon: <MessageSquare className="w-5 h-5 text-orange-500" /> },
    { title: "Fixed Turnarounds", icon: <Clock className="w-5 h-5 text-orange-500" /> },
    { title: "Agency Pricing", icon: <DollarSign className="w-5 h-5 text-orange-500" /> },
    { title: "NDA Friendly", icon: <Lock className="w-5 h-5 text-orange-500" /> },
    { title: "No Client Poaching", icon: <ShieldCheckIcon className="w-5 h-5 text-orange-500" /> },
    { title: "English-Speaking PMs", icon: <UserCheck className="w-5 h-5 text-orange-500" /> },
    { title: "Daily Updates", icon: <RefreshCw className="w-5 h-5 text-orange-500" /> },
];

function ShieldCheckIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
            <path d="m9 12 2 2 4-4" />
        </svg>
    );
}

const agencyResults = [
    {
        title: "Launch a fully configured client CRM in 48 hours.",
        description: "Stop spending weeks mapping out pipelines. We configure the entire GoHighLevel CRM, custom fields, and lead routing instantly so your clients can start closing deals on day one.",
        icon: <UserPlus className="w-8 h-8 text-orange-500" />
    },
    {
        title: "Automate lead nurturing so your clients stop losing leads.",
        description: "We build advanced, multi-channel workflow automations (SMS, Email, Voice drops) that follow up with every lead automatically. You sell the result: zero leaked leads.",
        icon: <Zap className="w-8 h-8 text-orange-500" />
    },
    {
        title: "High-converting funnels your agency can resell.",
        description: "Don't just sell a template. We design, build, and launch custom sales funnels that convert traffic into appointments, delivered completely under your brand.",
        icon: <TrendingUp className="w-8 h-8 text-orange-500" />
    }
];

const processFlow = [
    { step: "1", title: "Book Call", desc: "Align on your specific agency needs and processes." },
    { step: "2", title: "Receive Quote", desc: "Get fixed white-label pricing for your project." },
    { step: "3", title: "We Build", desc: "Our team executes the GoHighLevel development." },
    { step: "4", title: "Agency Reviews", desc: "You review and request any final revisions." },
    { step: "5", title: "Launch Under Your Brand", desc: "Present the final product to your client as your own." },
];

import { Service } from '@/lib/types';
import { Navbar } from '@/components/Navbar';
import { getServiceFaqs, serviceHeroHeadlines } from '@/lib/serviceFaqs';

export default function WhiteLabelGHLClient({ service, contentHtml }: { service?: Service; contentHtml?: string | null }) {
    const containerRef = useRef<HTMLDivElement>(null);

    const heroData = serviceHeroHeadlines['white-label-gohighlevel'] || {
        headline: "White Label GoHighLevel",
        highlight: "Agency",
        subtitle: "Deliver GHL Funnels, Automations & Snapshots at Scale — 100% white-label fulfillment under your agency's brand.",
    };
    const heroTitle = "White Label GoHighLevel Agency";
    const heroDesc = heroData.subtitle || service?.short_description || service?.description || "Mutant Technologies is your white label GoHighLevel implementation partner for full-funnel builds, websites, landing pages, and advanced GHL development. Deliver faster, smarter, and at scale, under your brand.";
    
    // Map process, benefits, features from DB if available
    const displayBenefits = service?.benefits?.length ? service.benefits.map((b: any) => ({
        title: b.title,
        icon: <CheckCircle2 className="w-5 h-5 text-orange-500" />
    })) : partnerBenefits;

    const displayResults = service?.features?.length ? service.features.map((f: any) => ({
        title: typeof f === 'string' ? f : f.title,
        description: typeof f === 'string' ? '' : f.description,
        icon: <CheckCircle2 className="w-8 h-8 text-orange-500" />
    })) : agencyResults;

    const displayProcess = service?.process?.length ? service.process : processFlow;

    // Use custom_data for highly specific sections if available
    const customStats = service?.custom_data?.stats || [
        { value: "100+", label: "Funnels Built" },
        { value: "250+", label: "Automations Active" },
        { value: "50+", label: "CRM Setups" },
        { value: "15+", label: "Countries Served" }
    ];
    const customTrustText = service?.custom_data?.trustText || "Trusted by agencies across 15+ countries for reliable GoHighLevel fulfillment.";
    const displayComparison = service?.custom_data?.comparison || {
        inHouse: [
            "$4,000+/month fixed salary",
            "Recruitment & interviewing hassle",
            "Training overhead & onboarding time",
            "Constant management & QA required",
            "High risk if the pipeline dries up"
        ],
        mutant: [
            "Use us ONLY when projects come",
            "Zero fixed overhead or salaries",
            "Instant access to senior GHL experts",
            "We manage the QA & delivery",
            "Zero risk. High margins."
        ]
    };

    const isPlaceholderCaseStudy = (cs: any) => {
        if (!cs) return true;
        const text = JSON.stringify(cs);
        return /agency\s*x/i.test(text);
    };

    const isPlaceholderTestimonial = (t: any) => {
        if (!t) return true;
        const text = JSON.stringify(t);
        return /agency\s*owner/i.test(text) || /web\s*design\s*agency,\s*canada/i.test(text) || /marketing\s*agency,\s*usa/i.test(text) || /digital\s*agency,\s*australia/i.test(text);
    };

    const rawCaseStudy = service?.custom_data?.caseStudy;
    const displayCaseStudy = isPlaceholderCaseStudy(rawCaseStudy) ? null : rawCaseStudy;

    const rawTestimonials = Array.isArray(service?.custom_data?.testimonials) ? service.custom_data.testimonials : [];
    const displayTestimonials = rawTestimonials.filter((t: any) => !isPlaceholderTestimonial(t));

    const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
    const ghlFaqs = getServiceFaqs(service);

    useGSAP(() => {
        const tl = gsap.timeline();
        tl.from(".hero-content > *", {
            y: 50, opacity: 0, duration: 1, stagger: 0.1, ease: "power3.out"
        });
        gsap.utils.toArray('.reveal-up').forEach((elem: any) => {
            gsap.from(elem, {
                scrollTrigger: { trigger: elem, start: "top 85%" },
                y: 50, opacity: 0, duration: 0.8, ease: "power3.out"
            });
        });
    }, { scope: containerRef });

    return (
        <div ref={containerRef} className="bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans selection:bg-orange-500 selection:text-white transition-colors duration-300">
            <Navbar />
            
            {/* HERO SECTION */}
            <section className="relative min-h-[90vh] bg-[#020617] text-white pt-24 pb-12 lg:pt-32 lg:pb-20 overflow-hidden flex items-center">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] lg:w-[800px] h-[400px] lg:h-[800px] bg-blue-900/20 rounded-full blur-[80px] lg:blur-[120px] pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-[300px] lg:w-[600px] h-[300px] lg:h-[600px] bg-orange-900/10 rounded-full blur-[60px] lg:blur-[100px] pointer-events-none" />

                <div className="container mx-auto px-6 relative z-10 text-center">
                    <div className="max-w-4xl mx-auto hero-content">
                        <div className="mb-4 flex justify-center">
                            <Breadcrumbs
                                items={[
                                    { label: 'Services', href: '/services' },
                                    { label: 'White Label GoHighLevel' }
                                ]}
                                theme="dark"
                            />
                        </div>
                        <div className="inline-flex items-center gap-2 mb-6 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/5">
                            <span className="text-sm font-medium tracking-wide">White Label Services</span>
                        </div>
                        <h1 className="text-5xl lg:text-7xl font-oswald font-bold uppercase leading-[1.1] tracking-tight mb-8">
                            White Label <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">GoHighLevel</span> Agency
                        </h1>
                        <p className="text-xl text-zinc-400 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
                            {heroDesc}
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-8 font-semibold w-full sm:w-auto group" href="https://calendly.com/prince-mutanttechnologies/30min">
                                Book a White Label Consultation
                                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* STATS SECTION */}
            <section className="py-12 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center reveal-up mb-8">
                        {customStats.map((stat: any, idx: number) => (
                            <div key={idx}>
                                <p className="text-4xl lg:text-5xl font-oswald font-bold text-orange-500 mb-2">{stat.value}</p>
                                <p className="text-sm font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                    <div className="text-center reveal-up">
                        <p className="text-zinc-500 dark:text-zinc-400 font-medium italic">
                            {customTrustText}
                        </p>
                    </div>
                </div>
            </section>

            {/* FULL SERVICE CONTENT / IN-DEPTH GUIDE */}
            {contentHtml && (
                <section id="service-overview" className="py-20 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800">
                    <div className="container mx-auto px-6 max-w-4xl">
                        <div
                            className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-oswald prose-headings:font-bold prose-h2:text-3xl sm:prose-h2:text-4xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:text-zinc-900 dark:prose-h2:text-white prose-h3:text-xl sm:prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4 prose-h3:text-orange-600 dark:prose-h3:text-orange-500 prose-p:text-zinc-600 dark:prose-p:text-zinc-300 prose-p:leading-relaxed prose-p:mb-6 prose-li:text-zinc-600 dark:prose-li:text-zinc-300 prose-li:my-2 prose-strong:text-zinc-900 dark:prose-strong:text-white prose-a:text-orange-600 hover:prose-a:text-orange-500 prose-table:my-8 prose-th:p-3 prose-th:bg-zinc-100 dark:prose-th:bg-zinc-900 prose-td:p-3 prose-td:border-b prose-td:border-zinc-200 dark:prose-td:border-zinc-800"
                            dangerouslySetInnerHTML={{ __html: contentHtml }}
                        />
                    </div>
                </section>
            )}

            {/* WHY AGENCIES PARTNER WITH MUTANT */}
            <section className="py-24 bg-white dark:bg-zinc-950">
                <div className="container mx-auto px-6">
                    <div className="text-center max-w-3xl mx-auto mb-16 reveal-up">
                        <h2 className="text-4xl font-oswald font-bold uppercase mb-6">Why Agencies Partner With Mutant</h2>
                        <p className="text-lg text-zinc-600 dark:text-zinc-400 font-light">
                            We act as a seamless extension of your agency, ensuring your reputation stays protected while your margins grow.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto reveal-up">
                        {displayBenefits.map((benefit: any, idx: number) => (
                            <div key={idx} className="flex items-center gap-3 p-4 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
                                {benefit.icon || <CheckCircle2 className="w-5 h-5 text-orange-500" />}
                                <span className="font-oswald font-bold text-zinc-800 dark:text-zinc-200 tracking-wide">{benefit.title}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* RESULTS DRIVEN SERVICES (REPLACING FEATURES) */}
            <section className="py-24 bg-zinc-50 dark:bg-zinc-900 border-y border-zinc-200 dark:border-zinc-800">
                <div className="container mx-auto px-6">
                    <div className="text-center max-w-3xl mx-auto mb-16 reveal-up">
                        <h2 className="text-4xl font-oswald font-bold uppercase mb-6">Sell Results. We Handle the Workflows.</h2>
                        <p className="text-lg text-zinc-600 dark:text-zinc-400 font-light">
                            Agency owners buy results, not workflows. You close the deal on the value you provide, and our GHL experts execute the technical heavy lifting behind the scenes.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 reveal-up">
                        {displayResults.map((result: any, idx: number) => (
                            <div key={idx} className="p-8 bg-white dark:bg-zinc-950 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:border-orange-500/50 transition-colors">
                                <div className="mb-6">{result.icon || <CheckCircle2 className="w-8 h-8 text-orange-500" />}</div>
                                <h3 className="text-xl font-oswald font-bold mb-4 leading-tight">{result.title}</h3>
                                <p className="text-zinc-600 dark:text-zinc-400 font-light leading-relaxed">{result.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* IN-HOUSE VS MUTANT COMPARISON */}
            <section className="py-24 bg-white dark:bg-zinc-950">
                <div className="container mx-auto px-6">
                    <div className="text-center max-w-3xl mx-auto mb-16 reveal-up">
                        <h2 className="text-4xl font-oswald font-bold uppercase mb-6">Why Not Hire Internally?</h2>
                        <p className="text-lg text-zinc-600 dark:text-zinc-400 font-light">
                            It's the question every agency owner asks. Here is the reality of scaling your GoHighLevel fulfillment.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto reveal-up">
                        {/* In-House Card */}
                        <div className="p-8 rounded-3xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                            <h3 className="text-2xl font-oswald font-bold mb-6 text-red-500 text-center uppercase tracking-wide">Hiring In-House</h3>
                            <ul className="space-y-4">
                                {displayComparison.inHouse.map((item: string, i: number) => (
                                    <li key={i} className="flex items-center gap-3"><XCircle className="w-5 h-5 text-red-500 shrink-0" /><span className="font-light">{item}</span></li>
                                ))}
                            </ul>
                        </div>
                        {/* Mutant Card */}
                        <div className="p-8 rounded-3xl bg-[#020617] text-white border border-orange-500/30 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10"><Zap className="w-32 h-32" /></div>
                            <h3 className="text-2xl font-oswald font-bold mb-6 text-orange-400 text-center uppercase tracking-wide relative z-10">Partner with Mutant</h3>
                            <ul className="space-y-4 relative z-10">
                                {displayComparison.mutant.map((item: string, i: number) => (
                                    <li key={i} className="flex items-center gap-3"><Check className="w-5 h-5 text-green-400 shrink-0" /><span className="font-light">{item}</span></li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* WHITE LABEL PROCESS */}
            <section className="py-24 bg-zinc-50 dark:bg-zinc-900 border-y border-zinc-200 dark:border-zinc-800">
                <div className="container mx-auto px-6">
                    <div className="text-center max-w-3xl mx-auto mb-16 reveal-up">
                        <h2 className="text-4xl font-oswald font-bold uppercase mb-6">Our White Label Process</h2>
                        <p className="text-lg text-zinc-600 dark:text-zinc-400 font-light">
                            A seamless, predictable flow designed specifically for agency fulfillment.
                        </p>
                    </div>
                    
                    <div className="flex flex-col md:flex-row justify-center items-start gap-4 max-w-6xl mx-auto reveal-up">
                        {displayProcess.map((proc: any, idx: number) => (
                            <div key={idx} className="flex-1 flex flex-col items-center text-center relative w-full">
                                <div className="w-16 h-16 rounded-full bg-orange-500 text-white flex items-center justify-center text-2xl font-oswald font-bold mb-4 z-10 shadow-lg">
                                    {proc.step || (idx + 1).toString()}
                                </div>
                                <h3 className="font-oswald font-bold text-lg mb-2">{proc.title}</h3>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400 font-light px-2">{proc.description || proc.desc}</p>
                                
                                {/* Connector line for desktop */}
                                {idx < displayProcess.length - 1 && (
                                    <div className="hidden md:block absolute top-8 left-[60%] w-full h-[2px] bg-orange-500/20 z-0" />
                                )}
                                {/* Arrow for mobile */}
                                {idx < displayProcess.length - 1 && (
                                    <ArrowDown className="block md:hidden w-6 h-6 text-orange-500/40 my-4" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* AGENCY CASE STUDY & TESTIMONIALS */}
            {(displayCaseStudy || (displayTestimonials && displayTestimonials.length > 0)) && (
                <section className="py-24 bg-white dark:bg-zinc-950">
                    <div className="container mx-auto px-6">
                        <div className={cn("grid gap-16 items-center", displayCaseStudy && displayTestimonials.length > 0 ? "lg:grid-cols-2" : "max-w-3xl mx-auto")}>
                            {/* Case Study */}
                            {displayCaseStudy && (
                                <div className="reveal-up">
                                    <h2 className="text-4xl font-oswald font-bold uppercase mb-8">Agency Success Profile</h2>
                                    <div className="bg-[#020617] p-8 rounded-3xl border border-white/10 text-white">
                                        <h3 className="text-xl font-oswald font-bold text-orange-400 mb-6 flex items-center gap-2">
                                            <Briefcase className="w-5 h-5" /> The Situation
                                        </h3>
                                        <ul className="space-y-6">
                                            <li className="flex gap-4">
                                                <div className="w-2 h-2 rounded-full bg-orange-500 mt-2 shrink-0" />
                                                <p className="font-light"><strong className="font-bold text-white">{displayCaseStudy.agency}</strong> {displayCaseStudy.situation}</p>
                                            </li>
                                            <li className="flex gap-4">
                                                <div className="w-2 h-2 rounded-full bg-orange-500 mt-2 shrink-0" />
                                                <p className="font-light"><strong className="font-bold text-white">We Delivered</strong> {displayCaseStudy.delivered}</p>
                                            </li>
                                            <li className="flex gap-4">
                                                <div className="w-2 h-2 rounded-full bg-green-400 mt-2 shrink-0" />
                                                <p className="font-light"><strong className="font-bold text-white">The Result:</strong> {displayCaseStudy.result}</p>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            )}

                            {/* Testimonials */}
                            {displayTestimonials && displayTestimonials.length > 0 && (
                                <div className="reveal-up space-y-6">
                                    <h2 className="text-3xl font-oswald font-bold uppercase mb-2">What Agency Owners Say</h2>
                                    <p className="text-zinc-500 font-light mb-8">Don't just take our word for it.</p>
                                    
                                    {displayTestimonials.map((test: any, idx: number) => (
                                        <div key={idx} className="p-6 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                                            <Quote className="w-8 h-8 text-orange-500/20 mb-4" />
                                            <p className="text-lg italic font-light text-zinc-700 dark:text-zinc-300 mb-4">"{test.quote}"</p>
                                            <div>
                                                <p className="font-bold font-oswald text-zinc-900 dark:text-zinc-100">{test.author}</p>
                                                <p className="text-sm text-zinc-500 uppercase tracking-wide">{test.company}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            )}

            {/* FREQUENTLY ASKED QUESTIONS */}
            <section id="faq" className="py-24 bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800">
                <div className="container mx-auto px-6 max-w-4xl">
                    <div className="text-center mb-16">
                        <span className="text-orange-500 font-mono text-xs uppercase tracking-widest font-semibold mb-3 block">
                            Agency FAQ
                        </span>
                        <h2 className="text-4xl lg:text-5xl font-oswald font-bold uppercase mb-4 text-zinc-900 dark:text-white">
                            Frequently Asked Questions
                        </h2>
                        <p className="text-zinc-600 dark:text-zinc-400 text-lg max-w-2xl mx-auto font-light">
                            Clear answers on our white-label agency partnerships, fulfillment workflows, and non-disclosure terms.
                        </p>
                    </div>

                    <div className="space-y-4">
                        {ghlFaqs.map((faq, idx) => {
                            const isOpen = openFaqIndex === idx;
                            return (
                                <div
                                    key={idx}
                                    className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden shadow-xs transition-colors"
                                >
                                    <button
                                        onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                                        className="w-full text-left p-6 sm:p-7 flex items-center justify-between gap-4 focus:outline-hidden cursor-pointer"
                                        aria-expanded={isOpen}
                                    >
                                        <span className="text-lg sm:text-xl font-bold font-oswald text-zinc-900 dark:text-zinc-100 pr-2">
                                            {faq.question}
                                        </span>
                                        <div
                                            className={cn(
                                                "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border transition-transform duration-300",
                                                isOpen
                                                    ? "bg-orange-500 border-orange-500 text-white rotate-180"
                                                    : "border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400"
                                            )}
                                        >
                                            <ChevronDown className="w-4 h-4" />
                                        </div>
                                    </button>
                                    {isOpen && (
                                        <div className="px-6 pb-6 sm:px-7 sm:pb-7 text-zinc-600 dark:text-zinc-300 text-base sm:text-lg leading-relaxed pt-0 border-t border-zinc-100 dark:border-zinc-800 mt-1">
                                            <p className="pt-4 font-light">{faq.answer}</p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
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
                                Let's talk about your GoHighLevel needs. Expand your service offerings instantly without worrying about fulfillment or hiring delays.
                            </p>
                            
                            <div className="space-y-6 mb-8">
                                <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                                    <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center shrink-0">
                                        <Calendar className="w-6 h-6 text-orange-400" />
                                    </div>
                                    <div>
                                        <h4 className="font-oswald font-bold text-lg">Book a White Label Consultation</h4>
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
