'use client';

import { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import {
    ArrowRight,
    CheckCircle2,
    Calendar,
    Clock,
    ShieldCheck,
    Zap,
    XCircle,
    Check,
    ChevronDown,
    ExternalLink,
    Maximize2,
    Sparkles,
    Send,
    Loader2,
    MessageSquare,
    AlertCircle,
    FileCheck2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SegmentConfig {
    key: string;
    label: string;
    eyebrow: string;
    headlineWord: string;
    heroSubhead: string;
    problemExample: string;
}

const SEGMENT_CONFIGS: Record<string, SegmentConfig> = {
    medspa: {
        key: 'medspa',
        label: 'Medspas',
        eyebrow: 'For medspas & aesthetic practices',
        headlineWord: 'medspas',
        heroSubhead: 'We build the landing page, the booking form and the text and email follow-up for your Botox, lip filler, and laser promos—so every lead who fills in your form hears back right away. A2P text registration is included.',
        problemExample: 'You run a Botox, filler, lip or laser promo and people fill in the form. Then the form sits in an inbox, or the text never arrives because carriers block unregistered numbers. We build the part between the click and the booked consult.'
    },
    wellness: {
        key: 'wellness',
        label: 'Wellness Clinics',
        eyebrow: 'For weight-loss, hormone & IV therapy clinics',
        headlineWord: 'wellness clinics',
        heroSubhead: 'We build the landing page, the booking form and the text and email follow-up, so every lead who fills in your form hears back right away. A2P text registration is included.',
        problemExample: 'You run a Semaglutide, hormone or IV therapy promo and people fill in the form. Then the form sits in an inbox, or the text never arrives because carriers block unregistered numbers. We build the part between the click and the booked consult.'
    },
    surgery: {
        key: 'surgery',
        label: 'Plastic Surgery',
        eyebrow: 'For plastic and cosmetic surgery practices',
        headlineWord: 'plastic surgery',
        heroSubhead: 'We build the landing page, the booking form and the text and email follow-up, so every lead who fills in your form hears back right away. A2P text registration is included.',
        problemExample: 'You run a surgical consult or aesthetic promo and people fill in the form. Then the form sits in an inbox, or the text never arrives because carriers block unregistered numbers. We build the part between the click and the booked consult.'
    },
    default: {
        key: 'default',
        label: 'Clinics',
        eyebrow: 'For medspas, wellness clinics and aesthetic practices',
        headlineWord: 'clinics',
        heroSubhead: 'We build the landing page, the booking form and the text and email follow-up, so every lead who fills in your form hears back right away. A2P text registration is included.',
        problemExample: 'You run a Botox, filler or weight-loss promo and people fill in the form. Then the form sits in an inbox, or the text never arrives because carriers block unregistered numbers. We build the part between the click and the booked consult.'
    }
};

const packagesData = [
    {
        name: 'Launch',
        badge: 'Single Promo Build',
        setup: '$400',
        monthly: '$150',
        popular: false,
        funnels: '1 promo funnel',
        revisions: '1 round',
        adCreatives: 'No ad creatives',
        adManagement: 'Build only (No ad management)',
        report: 'No weekly report',
        strategy: 'No monthly strategy call',
        features: [
            '1 GoHighLevel promo funnel',
            'Text & email follow-up',
            'Full A2P 10DLC registration',
            '1 revision round',
            'Hosting, support & small edits'
        ]
    },
    {
        name: 'Growth',
        badge: 'Most Popular',
        setup: '$600',
        monthly: '$400',
        popular: true,
        funnels: '2 per month',
        revisions: '1 round per funnel',
        adCreatives: '4 per month',
        adManagement: 'Meta (Facebook & Instagram)',
        report: 'Weekly lead-to-booking report',
        strategy: 'Email support & review',
        features: [
            '2 promo funnels per month',
            'Text & email follow-up',
            'Full A2P 10DLC registration',
            '1 revision round per funnel',
            '4 Meta ad creatives per month',
            'Meta ad management',
            'Weekly lead-to-booking report'
        ]
    },
    {
        name: 'Scale',
        badge: 'Full Clinic Engine',
        setup: '$900',
        monthly: '$900',
        popular: false,
        funnels: '2 per month',
        revisions: '1 round per funnel',
        adCreatives: '8 per month (with UGC or video)',
        adManagement: 'Meta and Google Ads',
        report: 'Weekly lead-to-booking report',
        strategy: 'Monthly strategy call included',
        features: [
            '2 promo funnels per month',
            'Text & email follow-up',
            'Full A2P 10DLC registration',
            '1 revision round per funnel',
            '8 ad creatives (with UGC or video)',
            'Meta and Google ad management',
            'Weekly lead-to-booking report',
            'Monthly strategy call'
        ]
    }
];

const exampleFunnels = [
    {
        id: 'skinovatio-iv',
        src: '/images/clinic-funnels/skinovatio-iv.png',
        title: 'IV therapy offer',
        badge: 'Lead Example',
        description: 'Hero section and consult booking form for an IV therapy promo.',
        treatment: 'IV Hydration & Wellness Therapy'
    },
    {
        id: 'lumae-tox',
        src: '/images/clinic-funnels/lumae-tox.png',
        title: 'Botox offer with split SMS consent',
        badge: 'A2P Compliant',
        description: 'Neurotoxin promo page with dual SMS consent checkboxes for A2P 10DLC compliance.',
        treatment: 'Neurotoxin / Botox & Dysport Promo'
    },
    {
        id: 'skinovatio-liprehab',
        src: '/images/clinic-funnels/skinovatio-liprehab.png',
        title: 'Lip treatment promo',
        badge: 'Treatment Offer',
        description: 'Hero section and appointment request form for a lip treatment offer.',
        treatment: 'Lip Filler & Hydration Promo'
    },
    {
        id: 'lyev-unlimitedtox',
        src: '/images/clinic-funnels/lyev-unlimitedtox.png',
        title: 'Non-Surgical Lower Facelift offer',
        badge: 'Consultation Flow',
        description: 'Consultation landing page for a non-surgical lower facelift offer with patient intake form.',
        treatment: 'Facial Rejuvenation & Lower Facelift'
    }
];

const faqs = [
    {
        question: 'What is A2P and do I need it?',
        answer: 'Carriers require US businesses to register before sending marketing texts. Without it, your messages can be blocked. We handle it.'
    },
    {
        question: 'Do you manage my ads?',
        answer: 'In Growth and Scale, yes. Launch is the build only.'
    },
    {
        question: 'Who pays for ads?',
        answer: 'You, directly to Meta or Google from your own card. We never touch it.'
    },
    {
        question: 'Can I cancel?',
        answer: "Yes. Monthly plans need 30 days' notice. Setup fees are not refundable once the work has started."
    },
    {
        question: 'What counts as a revision?',
        answer: "A round of changes to copy, images or layout on a funnel we've built. A new promo is a new funnel."
    },
    {
        question: 'Do you promise results?',
        answer: 'No. We build and run the system, and the results depend on your offer, ads and clinic.'
    },
    {
        question: 'Do you need patient information?',
        answer: "No. We don't ask for it, and we don't need medical records to build a funnel."
    }
];

export default function ClinicFunnelsClient({
    initialSegment = '',
    initialClinic = ''
}: {
    initialSegment?: string;
    initialClinic?: string;
}) {
    const searchParams = useSearchParams();
    const containerRef = useRef<HTMLDivElement>(null);

    // Segment resolution purely in the background via ?s=
    const paramSegment = searchParams.get('s') || initialSegment || '';
    const segmentKey = ['medspa', 'wellness', 'surgery'].includes(paramSegment.toLowerCase())
        ? paramSegment.toLowerCase()
        : 'default';
    const segment = SEGMENT_CONFIGS[segmentKey] || SEGMENT_CONFIGS.default;

    // Clinic code tracking purely in the background via ?c=
    const clinicCode = searchParams.get('c') || initialClinic || '';

    // Lightbox / modal for screenshots
    const [selectedImage, setSelectedImage] = useState<typeof exampleFunnels[0] | null>(null);

    // Accordion state
    const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

    // Direct inquiry form state
    const [formLoading, setFormLoading] = useState(false);
    const [formStatus, setFormStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [formPackage, setFormPackage] = useState<string>('Growth ($600 setup + $400/mo)');

    // Active booking tab: 'calendar' or 'form'
    const [bookingTab, setBookingTab] = useState<'calendar' | 'form'>('calendar');

    // Fire tracking event for clinic outreach code silently on mount once
    useEffect(() => {
        if (typeof window !== 'undefined') {
            try {
                const anonId = localStorage.getItem('mutant_pixel_anon_id') || `anon_${Math.random().toString(36).substring(2)}`;
                fetch('/api/pixel/track', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        client_id: 'bdcbd54a-51b9-499f-8598-34c79124f9a4',
                        anonymous_id: anonId,
                        url: window.location.href,
                        referrer: document.referrer || '',
                        event_type: 'clinic_funnel_view',
                        metadata: {
                            clinic_code: clinicCode || 'none',
                            segment: segmentKey,
                            page_path: '/clinic-funnels'
                        }
                    }),
                    keepalive: true
                }).catch(() => {});
            } catch (e) {
                // Silently ignore
            }
        }
    }, []); // Run strictly once on mount

    // Handle form submit: writes to Supabase pixel_events AND sends email via Resend
    const handleInquirySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setFormLoading(true);
        const form = e.currentTarget;
        const formData = new FormData(form);

        const clinicName = (formData.get('clinicName') as string) || '';
        const contactName = (formData.get('name') as string) || '';
        const email = (formData.get('email') as string) || '';
        const phone = (formData.get('phone') as string) || '';
        const selectedPlan = (formData.get('plan') as string) || formPackage;
        const promoDetails = (formData.get('message') as string) || '';

        const fullMessage = `
Clinic Name: ${clinicName}
Contact: ${contactName}
Phone: ${phone}
Tracking Code (?c=): ${clinicCode || 'None'}
Segment (?s=): ${segmentKey}
Selected Package: ${selectedPlan}

Promo / Offer Details:
${promoDetails}
        `.trim();

        try {
            // 1. Log lead directly into Supabase pixel backend so data is never lost
            const anonId = typeof window !== 'undefined'
                ? localStorage.getItem('mutant_pixel_anon_id') || `anon_${Math.random().toString(36).substring(2)}`
                : 'anon_server';

            fetch('/api/pixel/track', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    client_id: 'bdcbd54a-51b9-499f-8598-34c79124f9a4',
                    anonymous_id: anonId,
                    email: email,
                    url: window.location.href,
                    referrer: document.referrer || '',
                    event_type: 'identity',
                    metadata: {
                        clinic_name: clinicName,
                        contact_name: contactName,
                        phone: phone,
                        clinic_code: clinicCode || 'none',
                        segment: segmentKey,
                        package: selectedPlan,
                        promo_details: promoDetails
                    }
                }),
                keepalive: true
            }).catch(() => {});

            // 2. Dispatch email notification
            const { sendEmail } = await import('@/app/actions/email');
            const result = await sendEmail({
                name: contactName || clinicName || 'Clinic Owner',
                email: email,
                subject: `Clinic Funnel Request: ${clinicName || contactName} (${selectedPlan})`,
                service: `Clinic Funnel - ${selectedPlan}`,
                message: fullMessage,
                type: 'proposal'
            });

            if (result.success) {
                setFormStatus('success');
            } else {
                console.error('Email send error:', result.error);
                setFormStatus('error');
            }
        } catch (err) {
            console.error('Inquiry submission error:', err);
            setFormStatus('error');
        } finally {
            setFormLoading(false);
        }
    };

    // Calendly 30-min booking URL with clinic tracking
    const calendlyUrl = `https://calendly.com/prince-mutanttechnologies/30min${
        clinicCode ? `?a1=${encodeURIComponent(clinicCode)}` : ''
    }`;

    const scrollToBooking = (planName?: string) => {
        if (planName) setFormPackage(planName);
        const el = document.getElementById('booking-section');
        if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div
            ref={containerRef}
            className="w-full bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans selection:bg-orange-500 selection:text-white transition-colors duration-300 overflow-x-hidden"
        >
            <Navbar />

            {/* HERO SECTION */}
            <section className="relative w-full min-h-[88vh] bg-[#020617] text-white pt-24 pb-14 sm:pt-28 sm:pb-16 lg:pt-36 lg:pb-24 overflow-hidden flex items-center">
                {/* Background ambient lighting */}
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[600px] lg:w-[900px] h-[350px] sm:h-[600px] lg:h-[900px] bg-orange-600/15 rounded-full blur-[90px] lg:blur-[140px] pointer-events-none" />

                <div className="w-full mx-auto px-4 sm:px-6 max-w-5xl relative z-10">
                    <div className="max-w-4xl mx-auto text-center">
                        {/* Eyebrow badge (clean, no demo switcher, no visible tracking ref) */}
                        <div className="inline-flex items-center gap-2 mb-6 bg-white/5 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 max-w-full">
                            <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0" />
                            <span className="text-xs uppercase tracking-wider text-orange-400 font-medium truncate">
                                {segment.eyebrow}
                            </span>
                        </div>

                        {/* Dynamic Headline */}
                        <h1 className="text-3xl sm:text-5xl lg:text-7xl font-oswald font-bold uppercase leading-[1.1] tracking-tight mb-6 sm:mb-8 text-balance">
                            Promo funnels for{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-500 to-amber-300">
                                {segment.headlineWord}
                            </span>
                            , live in 48 hours.
                        </h1>

                        {/* Subhead */}
                        <p className="text-base sm:text-lg lg:text-xl text-zinc-300 mb-8 sm:mb-10 max-w-2xl mx-auto font-light leading-relaxed px-2">
                            {segment.heroSubhead}
                        </p>

                        {/* Action buttons - Mobile full-width stacked, sm: inline */}
                        <div className="w-full max-w-md sm:max-w-none mx-auto flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 mb-6">
                            <Button
                                size="lg"
                                onClick={() => scrollToBooking()}
                                className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white rounded-full px-7 py-5 text-sm sm:text-base font-semibold shadow-lg shadow-orange-500/25 group cursor-pointer justify-center"
                            >
                                Book a 30-minute call
                                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform shrink-0" />
                            </Button>

                            <a
                                href="#packages-section"
                                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 text-sm font-medium text-zinc-300 hover:text-white rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                            >
                                View Packages & Pricing
                            </a>
                        </div>

                        {/* Micro-copy under CTA */}
                        <p className="text-xs sm:text-sm text-zinc-400 font-mono tracking-wide px-2">
                            Fixed prices. No long-term contracts. Every price is on this page.
                        </p>

                        {/* Key Stats Strip */}
                        <div className="mt-12 sm:mt-14 pt-8 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 text-center">
                            <div className="p-2">
                                <p className="text-2xl sm:text-4xl font-oswald font-bold text-orange-400">200+</p>
                                <p className="text-[11px] sm:text-xs uppercase tracking-wider text-zinc-400 mt-1">Funnels Built</p>
                            </div>
                            <div className="p-2">
                                <p className="text-2xl sm:text-4xl font-oswald font-bold text-orange-400">48 Hours</p>
                                <p className="text-[11px] sm:text-xs uppercase tracking-wider text-zinc-400 mt-1">Launch Turnaround</p>
                            </div>
                            <div className="p-2">
                                <p className="text-2xl sm:text-4xl font-oswald font-bold text-orange-400">Included</p>
                                <p className="text-[11px] sm:text-xs uppercase tracking-wider text-zinc-400 mt-1">A2P registration included</p>
                            </div>
                            <div className="p-2">
                                <p className="text-2xl sm:text-4xl font-oswald font-bold text-orange-400">0</p>
                                <p className="text-[11px] sm:text-xs uppercase tracking-wider text-zinc-400 mt-1">Long-Term Contracts</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* THE PROBLEM SECTION */}
            <section className="py-16 sm:py-24 bg-zinc-50 dark:bg-zinc-900/60 border-b border-zinc-200 dark:border-zinc-800">
                <div className="w-full mx-auto px-4 sm:px-6 max-w-5xl">
                    <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                        <div className="lg:col-span-5">
                            <span className="text-orange-500 font-mono text-xs uppercase tracking-widest font-semibold block mb-2 sm:mb-3">
                                The Bottleneck
                            </span>
                            <h2 className="text-2xl sm:text-4xl font-oswald font-bold uppercase leading-tight mb-4 text-zinc-900 dark:text-white">
                                Leads go cold in the first hour.
                            </h2>
                            <p className="text-zinc-600 dark:text-zinc-400 font-light text-sm sm:text-base leading-relaxed">
                                Paid ads generate interest, but typical clinic follow-up fails at the transition point.
                            </p>
                        </div>

                        <div className="lg:col-span-7">
                            <div className="bg-white dark:bg-zinc-950 p-6 sm:p-10 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xs relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-2 h-full bg-orange-500" />
                                <p className="text-base sm:text-lg lg:text-xl text-zinc-800 dark:text-zinc-200 font-light leading-relaxed mb-6">
                                    {segment.problemExample}
                                </p>
                                <div className="flex items-center gap-3 pt-6 border-t border-zinc-100 dark:border-zinc-800/80 text-xs sm:text-sm font-medium text-orange-600 dark:text-orange-400">
                                    <Sparkles className="w-5 h-5 shrink-0" />
                                    <span>We build the part between the click and the booked consult.</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* WHAT WE BUILD SECTION (3 CARDS) */}
            <section className="py-16 sm:py-24 bg-white dark:bg-zinc-950">
                <div className="w-full mx-auto px-4 sm:px-6 max-w-6xl">
                    <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
                        <span className="text-orange-500 font-mono text-xs uppercase tracking-widest font-semibold block mb-2 sm:mb-3">
                            The Complete Stack
                        </span>
                        <h2 className="text-3xl sm:text-5xl font-oswald font-bold uppercase mb-3 sm:mb-4 text-zinc-900 dark:text-white">
                            What We Build
                        </h2>
                        <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 font-light">
                            Everything needed to launch a clinic promo without hiring internal developers.
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                        {/* Card 1: Funnel */}
                        <div className="p-6 sm:p-8 lg:p-10 bg-zinc-50 dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between hover:border-orange-500/40 transition-colors shadow-xs group">
                            <div>
                                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center text-lg sm:text-xl font-oswald font-bold mb-6 group-hover:scale-105 transition-transform">
                                    01
                                </div>
                                <h3 className="text-xl sm:text-2xl font-oswald font-bold uppercase mb-3 text-zinc-900 dark:text-white">
                                    Funnel
                                </h3>
                                <p className="text-zinc-600 dark:text-zinc-400 font-light text-sm sm:text-base leading-relaxed mb-6">
                                    A landing page for one promo, with a booking or opt-in form, built in GoHighLevel.
                                </p>
                            </div>
                            <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 text-xs font-mono text-orange-600 dark:text-orange-400 uppercase tracking-wider font-semibold">
                                Landing Page + Booking Form
                            </div>
                        </div>

                        {/* Card 2: Follow-up */}
                        <div className="p-6 sm:p-8 lg:p-10 bg-zinc-50 dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between hover:border-orange-500/40 transition-colors shadow-xs group">
                            <div>
                                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center text-lg sm:text-xl font-oswald font-bold mb-6 group-hover:scale-105 transition-transform">
                                    02
                                </div>
                                <h3 className="text-xl sm:text-2xl font-oswald font-bold uppercase mb-3 text-zinc-900 dark:text-white">
                                    Follow-up
                                </h3>
                                <p className="text-zinc-600 dark:text-zinc-400 font-light text-sm sm:text-base leading-relaxed mb-6">
                                    Automatic text and email to every new lead, with reminders before the consult.
                                </p>
                            </div>
                            <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 text-xs font-mono text-orange-600 dark:text-orange-400 uppercase tracking-wider font-semibold">
                                Instant SMS & Email Sequences
                            </div>
                        </div>

                        {/* Card 3: Compliance */}
                        <div className="p-6 sm:p-8 lg:p-10 bg-zinc-50 dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between hover:border-orange-500/40 transition-colors shadow-xs group sm:col-span-2 lg:col-span-1">
                            <div>
                                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center text-lg sm:text-xl font-oswald font-bold mb-6 group-hover:scale-105 transition-transform">
                                    03
                                </div>
                                <h3 className="text-xl sm:text-2xl font-oswald font-bold uppercase mb-3 text-zinc-900 dark:text-white">
                                    Compliance
                                </h3>
                                <p className="text-zinc-600 dark:text-zinc-400 font-light text-sm sm:text-base leading-relaxed mb-6">
                                    A2P 10DLC registration done for you, so your texts get delivered.
                                </p>
                            </div>
                            <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 text-xs font-mono text-orange-600 dark:text-orange-400 uppercase tracking-wider font-semibold">
                                Carrier 10DLC Verification
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* HOW IT WORKS (3 STEPS) */}
            <section className="py-16 sm:py-24 bg-zinc-50 dark:bg-zinc-900/60 border-y border-zinc-200 dark:border-zinc-800">
                <div className="w-full mx-auto px-4 sm:px-6 max-w-5xl">
                    <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
                        <span className="text-orange-500 font-mono text-xs uppercase tracking-widest font-semibold block mb-2 sm:mb-3">
                            Fast Turnaround
                        </span>
                        <h2 className="text-3xl sm:text-5xl font-oswald font-bold uppercase mb-3 sm:mb-4 text-zinc-900 dark:text-white">
                            How It Works
                        </h2>
                        <p className="text-zinc-600 dark:text-zinc-400 font-light text-sm sm:text-base">
                            Three simple steps from initial call to live promo.
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-3 gap-6 sm:gap-8">
                        <div className="bg-white dark:bg-zinc-950 p-6 sm:p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 text-center shadow-xs">
                            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-orange-500 text-white flex items-center justify-center text-xl sm:text-2xl font-oswald font-bold mx-auto mb-5 shadow-md shadow-orange-500/20">
                                1
                            </div>
                            <h3 className="font-oswald font-bold text-lg sm:text-xl uppercase mb-2 text-zinc-900 dark:text-white">
                                Book a Call
                            </h3>
                            <p className="text-zinc-600 dark:text-zinc-400 font-light text-xs sm:text-sm leading-relaxed">
                                Book a 30-minute call and tell us the promo.
                            </p>
                        </div>

                        <div className="bg-white dark:bg-zinc-950 p-6 sm:p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 text-center shadow-xs">
                            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-orange-500 text-white flex items-center justify-center text-xl sm:text-2xl font-oswald font-bold mx-auto mb-5 shadow-md shadow-orange-500/20">
                                2
                            </div>
                            <h3 className="font-oswald font-bold text-lg sm:text-xl uppercase mb-2 text-zinc-900 dark:text-white">
                                We Build & Preview
                            </h3>
                            <p className="text-zinc-600 dark:text-zinc-400 font-light text-xs sm:text-sm leading-relaxed">
                                We build it and send you a preview.
                            </p>
                        </div>

                        <div className="bg-white dark:bg-zinc-950 p-6 sm:p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 text-center shadow-xs">
                            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-orange-500 text-white flex items-center justify-center text-xl sm:text-2xl font-oswald font-bold mx-auto mb-5 shadow-md shadow-orange-500/20">
                                3
                            </div>
                            <h3 className="font-oswald font-bold text-lg sm:text-xl uppercase mb-2 text-zinc-900 dark:text-white">
                                Live in 48 Hours
                            </h3>
                            <p className="text-zinc-600 dark:text-zinc-400 font-light text-xs sm:text-sm leading-relaxed">
                                Approve it, and it goes live within 48 hours.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* EXAMPLE FUNNELS SECTION */}
            <section className="py-16 sm:py-24 bg-white dark:bg-zinc-950">
                <div className="w-full mx-auto px-4 sm:px-6 max-w-6xl">
                    <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
                        <span className="text-orange-500 font-mono text-xs uppercase tracking-widest font-semibold block mb-2 sm:mb-3">
                            Production Work
                        </span>
                        <h2 className="text-3xl sm:text-5xl font-oswald font-bold uppercase mb-3 sm:mb-4 text-zinc-900 dark:text-white">
                            Example Funnels
                        </h2>
                        <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 font-light">
                            Production funnels built for clinics, medspas, and aesthetic practices.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
                        {exampleFunnels.map((funnel) => (
                            <div
                                key={funnel.id}
                                className="bg-zinc-50 dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xs hover:border-orange-500/40 transition-all flex flex-col group"
                            >
                                {/* Screenshot Preview with Lightbox trigger */}
                                <div
                                    className="relative h-60 sm:h-72 w-full bg-zinc-950 overflow-hidden cursor-pointer"
                                    onClick={() => setSelectedImage(funnel)}
                                >
                                    <Image
                                        src={funnel.src}
                                        alt={funnel.title}
                                        fill
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                        className="object-cover object-top group-hover:scale-102 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <span className="bg-orange-500 text-white text-xs font-semibold px-4 py-2 rounded-full inline-flex items-center gap-2 shadow-lg">
                                            <Maximize2 className="w-3.5 h-3.5" /> View Full Funnel
                                        </span>
                                    </div>
                                    <span className="absolute top-4 left-4 bg-[#020617]/85 backdrop-blur-md text-orange-400 text-xs font-mono font-semibold px-3 py-1 rounded-full border border-orange-500/30">
                                        {funnel.badge}
                                    </span>
                                </div>

                                {/* Plain Content Caption: treatment and page contents */}
                                <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between">
                                    <div>
                                        <p className="text-xs uppercase tracking-wider text-orange-500 font-mono font-semibold mb-1">
                                            {funnel.treatment}
                                        </p>
                                        <h3 className="text-xl sm:text-2xl font-oswald font-bold uppercase mb-2 text-zinc-900 dark:text-white">
                                            {funnel.title}
                                        </h3>
                                        <p className="text-sm text-zinc-600 dark:text-zinc-400 font-light leading-relaxed">
                                            {funnel.description}
                                        </p>
                                    </div>

                                    <button
                                        onClick={() => setSelectedImage(funnel)}
                                        className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-orange-600 dark:text-orange-400 hover:text-orange-500 transition-colors cursor-pointer"
                                    >
                                        Inspect Preview <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* LIGHTBOX MODAL */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-8"
                    onClick={() => setSelectedImage(null)}
                >
                    <div
                        className="relative max-w-4xl max-h-[90vh] w-full bg-zinc-900 rounded-3xl border border-zinc-800 overflow-hidden flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-4 sm:p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-950">
                            <div>
                                <span className="text-xs font-mono text-orange-400 uppercase tracking-wider">
                                    {selectedImage.badge}
                                </span>
                                <h4 className="text-lg sm:text-xl font-oswald font-bold text-white uppercase">
                                    {selectedImage.title}
                                </h4>
                            </div>
                            <button
                                onClick={() => setSelectedImage(null)}
                                className="w-9 h-9 rounded-full bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700 flex items-center justify-center transition-colors cursor-pointer"
                            >
                                <XCircle className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="relative flex-1 overflow-auto max-h-[75vh] p-2 sm:p-4 bg-[#0a0a0c]">
                            <img
                                src={selectedImage.src}
                                alt={selectedImage.title}
                                className="w-full h-auto rounded-xl shadow-2xl"
                            />
                        </div>
                        <div className="p-3 bg-zinc-950 border-t border-zinc-800 text-center text-xs text-zinc-400 font-mono">
                            Press anywhere outside or the close icon to exit.
                        </div>
                    </div>
                </div>
            )}

            {/* PACKAGES TABLE SECTION */}
            <section id="packages-section" className="py-16 sm:py-24 bg-zinc-50 dark:bg-zinc-900/60 border-y border-zinc-200 dark:border-zinc-800">
                <div className="w-full mx-auto px-4 sm:px-6 max-w-6xl">
                    <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
                        <span className="text-orange-500 font-mono text-xs uppercase tracking-widest font-semibold block mb-2 sm:mb-3">
                            Packages
                        </span>
                        <h2 className="text-3xl sm:text-5xl font-oswald font-bold uppercase mb-3 sm:mb-4 text-zinc-900 dark:text-white">
                            Packages
                        </h2>
                        <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 font-light">
                            Setup is paid once, monthly is recurring. No long-term lock-in contracts.
                        </p>
                    </div>

                    {/* Desktop Comparison Table (Hidden on mobile) */}
                    <div className="hidden lg:block overflow-hidden rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm mb-8">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                                    <th className="p-6 text-sm font-mono uppercase tracking-wider text-zinc-500 font-semibold w-1/4">
                                        Features & Deliverables
                                    </th>
                                    {packagesData.map((pkg) => (
                                        <th
                                            key={pkg.name}
                                            className={cn(
                                                'p-6 w-1/4 text-center',
                                                pkg.popular && 'bg-orange-500/5 dark:bg-orange-500/10 border-x border-orange-500/20'
                                            )}
                                        >
                                            <div className="inline-block px-3 py-1 rounded-full text-xs font-mono uppercase font-bold tracking-wider mb-2 bg-orange-500/10 text-orange-500">
                                                {pkg.badge}
                                            </div>
                                            <h3 className="text-2xl font-oswald font-bold uppercase text-zinc-900 dark:text-white">
                                                {pkg.name}
                                            </h3>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-sm">
                                <tr>
                                    <td className="p-5 font-semibold text-zinc-900 dark:text-white">Setup (one time)</td>
                                    {packagesData.map((pkg) => (
                                        <td
                                            key={pkg.name}
                                            className={cn(
                                                'p-5 text-center font-oswald font-bold text-2xl text-orange-500',
                                                pkg.popular && 'bg-orange-500/5 dark:bg-orange-500/10 border-x border-orange-500/20'
                                            )}
                                        >
                                            {pkg.setup}
                                        </td>
                                    ))}
                                </tr>
                                <tr>
                                    <td className="p-5 font-semibold text-zinc-900 dark:text-white">Monthly</td>
                                    {packagesData.map((pkg) => (
                                        <td
                                            key={pkg.name}
                                            className={cn(
                                                'p-5 text-center font-oswald font-bold text-2xl text-zinc-900 dark:text-white',
                                                pkg.popular && 'bg-orange-500/5 dark:bg-orange-500/10 border-x border-orange-500/20'
                                            )}
                                        >
                                            {pkg.monthly}
                                            <span className="text-xs font-normal text-zinc-500 dark:text-zinc-400 block font-sans">
                                                / month
                                            </span>
                                        </td>
                                    ))}
                                </tr>
                                <tr>
                                    <td className="p-5 font-medium text-zinc-700 dark:text-zinc-300">Promo funnels</td>
                                    {packagesData.map((pkg) => (
                                        <td
                                            key={pkg.name}
                                            className={cn(
                                                'p-5 text-center font-medium',
                                                pkg.popular && 'bg-orange-500/5 dark:bg-orange-500/10 border-x border-orange-500/20'
                                            )}
                                        >
                                            {pkg.funnels}
                                        </td>
                                    ))}
                                </tr>
                                <tr>
                                    <td className="p-5 font-medium text-zinc-700 dark:text-zinc-300">Text and email follow-up</td>
                                    {packagesData.map((pkg) => (
                                        <td
                                            key={pkg.name}
                                            className={cn(
                                                'p-5 text-center',
                                                pkg.popular && 'bg-orange-500/5 dark:bg-orange-500/10 border-x border-orange-500/20'
                                            )}
                                        >
                                            <Check className="w-5 h-5 text-green-500 mx-auto" />
                                        </td>
                                    ))}
                                </tr>
                                <tr>
                                    <td className="p-5 font-medium text-zinc-700 dark:text-zinc-300">A2P registration</td>
                                    {packagesData.map((pkg) => (
                                        <td
                                            key={pkg.name}
                                            className={cn(
                                                'p-5 text-center',
                                                pkg.popular && 'bg-orange-500/5 dark:bg-orange-500/10 border-x border-orange-500/20'
                                            )}
                                        >
                                            <Check className="w-5 h-5 text-green-500 mx-auto" />
                                        </td>
                                    ))}
                                </tr>
                                <tr>
                                    <td className="p-5 font-medium text-zinc-700 dark:text-zinc-300">Revisions</td>
                                    {packagesData.map((pkg) => (
                                        <td
                                            key={pkg.name}
                                            className={cn(
                                                'p-5 text-center font-medium',
                                                pkg.popular && 'bg-orange-500/5 dark:bg-orange-500/10 border-x border-orange-500/20'
                                            )}
                                        >
                                            {pkg.revisions}
                                        </td>
                                    ))}
                                </tr>
                                <tr>
                                    <td className="p-5 font-medium text-zinc-700 dark:text-zinc-300">Ad creatives</td>
                                    {packagesData.map((pkg) => (
                                        <td
                                            key={pkg.name}
                                            className={cn(
                                                'p-5 text-center font-medium',
                                                pkg.popular && 'bg-orange-500/5 dark:bg-orange-500/10 border-x border-orange-500/20'
                                            )}
                                        >
                                            {pkg.adCreatives}
                                        </td>
                                    ))}
                                </tr>
                                <tr>
                                    <td className="p-5 font-medium text-zinc-700 dark:text-zinc-300">Ad management</td>
                                    {packagesData.map((pkg) => (
                                        <td
                                            key={pkg.name}
                                            className={cn(
                                                'p-5 text-center font-medium',
                                                pkg.popular && 'bg-orange-500/5 dark:bg-orange-500/10 border-x border-orange-500/20'
                                            )}
                                        >
                                            {pkg.adManagement}
                                        </td>
                                    ))}
                                </tr>
                                <tr>
                                    <td className="p-5 font-medium text-zinc-700 dark:text-zinc-300">Weekly lead-to-booking report</td>
                                    {packagesData.map((pkg) => (
                                        <td
                                            key={pkg.name}
                                            className={cn(
                                                'p-5 text-center font-medium',
                                                pkg.popular && 'bg-orange-500/5 dark:bg-orange-500/10 border-x border-orange-500/20'
                                            )}
                                        >
                                            {pkg.report === 'No weekly report' ? (
                                                <span className="text-zinc-400">No</span>
                                            ) : (
                                                <span className="text-green-500 font-semibold">Yes</span>
                                            )}
                                        </td>
                                    ))}
                                </tr>
                                <tr>
                                    <td className="p-5 font-medium text-zinc-700 dark:text-zinc-300">Monthly strategy call</td>
                                    {packagesData.map((pkg) => (
                                        <td
                                            key={pkg.name}
                                            className={cn(
                                                'p-5 text-center font-medium',
                                                pkg.popular && 'bg-orange-500/5 dark:bg-orange-500/10 border-x border-orange-500/20'
                                            )}
                                        >
                                            {pkg.strategy === 'No monthly strategy call' ? (
                                                <span className="text-zinc-400">No</span>
                                            ) : (
                                                <span className="text-green-500 font-semibold">Yes</span>
                                            )}
                                        </td>
                                    ))}
                                </tr>
                                <tr>
                                    <td className="p-6"></td>
                                    {packagesData.map((pkg) => (
                                        <td
                                            key={pkg.name}
                                            className={cn(
                                                'p-6 text-center',
                                                pkg.popular && 'bg-orange-500/5 dark:bg-orange-500/10 border-x border-orange-500/20'
                                            )}
                                        >
                                            <Button
                                                onClick={() =>
                                                    scrollToBooking(`${pkg.name} (${pkg.setup} setup + ${pkg.monthly}/mo)`)
                                                }
                                                className={cn(
                                                    'w-full rounded-full font-semibold cursor-pointer transition-all',
                                                    pkg.popular
                                                        ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-500/20'
                                                        : 'bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-800 dark:hover:bg-zinc-700'
                                                )}
                                            >
                                                Select {pkg.name}
                                            </Button>
                                        </td>
                                    ))}
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Package Cards (Clean responsive grid) */}
                    <div className="grid lg:hidden gap-6 sm:gap-8 mb-8 sm:grid-cols-2">
                        {packagesData.map((pkg) => (
                            <div
                                key={pkg.name}
                                className={cn(
                                    'rounded-3xl p-6 sm:p-8 border bg-white dark:bg-zinc-950 flex flex-col justify-between relative shadow-xs',
                                    pkg.popular
                                        ? 'border-orange-500 shadow-xl shadow-orange-500/10'
                                        : 'border-zinc-200 dark:border-zinc-800'
                                )}
                            >
                                {pkg.popular && (
                                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-xs font-mono font-bold uppercase tracking-wider px-3.5 py-1 rounded-full shadow-md">
                                        Most Popular
                                    </span>
                                )}
                                <div>
                                    <h3 className="text-xl sm:text-2xl font-oswald font-bold uppercase mb-2 text-zinc-900 dark:text-white">
                                        {pkg.name}
                                    </h3>
                                    <div className="mb-5 sm:mb-6">
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-3xl sm:text-4xl font-oswald font-bold text-orange-500">{pkg.monthly}</span>
                                            <span className="text-xs sm:text-sm text-zinc-500">/ month</span>
                                        </div>
                                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 font-mono">
                                            + {pkg.setup} one-time setup
                                        </p>
                                    </div>

                                    <ul className="space-y-3 pt-5 border-t border-zinc-100 dark:border-zinc-800 text-xs sm:text-sm mb-6">
                                        {pkg.features.map((f, i) => (
                                            <li key={i} className="flex items-start gap-2.5">
                                                <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                                                <span className="text-zinc-700 dark:text-zinc-300 font-light">{f}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <Button
                                    onClick={() =>
                                        scrollToBooking(`${pkg.name} (${pkg.setup} setup + ${pkg.monthly}/mo)`)
                                    }
                                    className={cn(
                                        'w-full rounded-full font-semibold cursor-pointer justify-center text-sm sm:text-base py-5',
                                        pkg.popular
                                            ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-500/25'
                                            : 'bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-800 dark:hover:bg-zinc-700'
                                    )}
                                >
                                    Select {pkg.name}
                                </Button>
                            </div>
                        ))}
                    </div>

                    {/* Explanatory footnote */}
                    <div className="text-center px-4">
                        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-medium italic">
                            * Launch monthly covers hosting, support and small edits.
                        </p>
                    </div>
                </div>
            </section>

            {/* NO HIDDEN FEES SECTION */}
            <section className="py-16 sm:py-24 bg-white dark:bg-zinc-950">
                <div className="w-full mx-auto px-4 sm:px-6 max-w-5xl">
                    <div className="bg-[#020617] text-white p-6 sm:p-12 lg:p-16 rounded-3xl border border-orange-500/30 relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none hidden sm:block">
                            <ShieldCheck className="w-64 h-64 text-orange-400" />
                        </div>

                        <div className="relative z-10 max-w-3xl">
                            <span className="text-orange-400 font-mono text-xs uppercase tracking-widest font-semibold block mb-2 sm:mb-3">
                                Total Billing Clarity
                            </span>
                            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-oswald font-bold uppercase leading-tight mb-6 sm:mb-8">
                                No Hidden Fees
                            </h2>

                            <div className="space-y-5 sm:space-y-6">
                                <div className="flex items-start gap-3 sm:gap-4">
                                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0 mt-1">
                                        <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                    </div>
                                    <div>
                                        <h4 className="text-base sm:text-lg font-oswald font-bold uppercase text-white mb-1">
                                            Every price is on this page
                                        </h4>
                                        <p className="text-zinc-400 font-light text-xs sm:text-sm lg:text-base leading-relaxed">
                                            Extra work is quoted before we start.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 sm:gap-4">
                                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0 mt-1">
                                        <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                    </div>
                                    <div>
                                        <h4 className="text-base sm:text-lg font-oswald font-bold uppercase text-white mb-1">
                                            Direct ad spend control
                                        </h4>
                                        <p className="text-zinc-400 font-light text-xs sm:text-sm lg:text-base leading-relaxed">
                                            Ad spend goes straight to Meta and Google from your own card. We never touch it.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 sm:gap-4">
                                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0 mt-1">
                                        <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                    </div>
                                    <div>
                                        <h4 className="text-base sm:text-lg font-oswald font-bold uppercase text-white mb-1">
                                            Carrier pass-through at cost
                                        </h4>
                                        <p className="text-zinc-400 font-light text-xs sm:text-sm lg:text-base leading-relaxed">
                                            Carrier text fees are passed through at cost and listed on your invoice.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* WHY US (4 PILLARS - 48 HOURS THROUGHOUT) */}
            <section className="py-16 sm:py-24 bg-zinc-50 dark:bg-zinc-900/60 border-t border-zinc-200 dark:border-zinc-800">
                <div className="w-full mx-auto px-4 sm:px-6 max-w-5xl">
                    <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
                        <span className="text-orange-500 font-mono text-xs uppercase tracking-widest font-semibold block mb-2 sm:mb-3">
                            Direct Experience
                        </span>
                        <h2 className="text-3xl sm:text-5xl font-oswald font-bold uppercase mb-3 sm:mb-4 text-zinc-900 dark:text-white">
                            Why Us
                        </h2>
                        <p className="text-zinc-600 dark:text-zinc-400 font-light text-sm sm:text-base">
                            Facts from the 200+ funnels we have built.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                        <div className="p-5 sm:p-6 bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs text-center">
                            <p className="text-3xl sm:text-4xl font-oswald font-bold text-orange-500 mb-2">200+</p>
                            <h4 className="font-oswald font-bold uppercase text-sm sm:text-base text-zinc-900 dark:text-white mb-1">
                                Funnels Built
                            </h4>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-light">
                                Layouts used across our client work.
                            </p>
                        </div>

                        <div className="p-5 sm:p-6 bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs text-center">
                            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center mx-auto mb-2">
                                <FileCheck2 className="w-5 h-5" />
                            </div>
                            <h4 className="font-oswald font-bold uppercase text-sm sm:text-base text-zinc-900 dark:text-white mb-1">
                                A2P 10DLC Done
                            </h4>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-light">
                                Registration done for partner agencies.
                            </p>
                        </div>

                        <div className="p-5 sm:p-6 bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs text-center">
                            <p className="text-3xl sm:text-4xl font-oswald font-bold text-orange-500 mb-2">48 Hours</p>
                            <h4 className="font-oswald font-bold uppercase text-sm sm:text-base text-zinc-900 dark:text-white mb-1">
                                Turnaround
                            </h4>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-light">
                                Rapid build so your promo goes live fast.
                            </p>
                        </div>

                        <div className="p-5 sm:p-6 bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs text-center">
                            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center mx-auto mb-2">
                                <CheckCircle2 className="w-5 h-5" />
                            </div>
                            <h4 className="font-oswald font-bold uppercase text-sm sm:text-base text-zinc-900 dark:text-white mb-1">
                                Dedicated Person
                            </h4>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-light">
                                A dedicated person on your builds.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ ACCORDION SECTION */}
            <section id="faq-section" className="py-16 sm:py-24 bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800">
                <div className="w-full mx-auto px-4 sm:px-6 max-w-4xl">
                    <div className="text-center mb-12 sm:mb-16">
                        <span className="text-orange-500 font-mono text-xs uppercase tracking-widest font-semibold mb-2 sm:mb-3 block">
                            Direct Answers
                        </span>
                        <h2 className="text-3xl sm:text-5xl font-oswald font-bold uppercase mb-3 sm:mb-4 text-zinc-900 dark:text-white">
                            Frequently Asked Questions
                        </h2>
                        <p className="text-zinc-600 dark:text-zinc-400 text-base sm:text-lg max-w-2xl mx-auto font-light">
                            Clear answers regarding delivery, ads, cancelation, and compliance.
                        </p>
                    </div>

                    <div className="space-y-3 sm:space-y-4">
                        {faqs.map((faq, idx) => {
                            const isOpen = openFaqIndex === idx;
                            return (
                                <div
                                    key={idx}
                                    className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 overflow-hidden transition-colors"
                                >
                                    <button
                                        onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                                        className="w-full text-left p-5 sm:p-7 flex items-center justify-between gap-4 focus:outline-hidden cursor-pointer"
                                        aria-expanded={isOpen}
                                    >
                                        <span className="text-base sm:text-xl font-bold font-oswald text-zinc-900 dark:text-zinc-100 pr-2">
                                            {faq.question}
                                        </span>
                                        <div
                                            className={cn(
                                                'w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 border transition-transform duration-300',
                                                isOpen
                                                    ? 'bg-orange-500 border-orange-500 text-white rotate-180'
                                                    : 'border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400'
                                            )}
                                        >
                                            <ChevronDown className="w-4 h-4" />
                                        </div>
                                    </button>
                                    {isOpen && (
                                        <div className="px-5 pb-5 sm:px-7 sm:pb-7 text-zinc-600 dark:text-zinc-300 text-sm sm:text-base leading-relaxed pt-0 border-t border-zinc-200/50 dark:border-zinc-800/80 mt-1">
                                            <p className="pt-3 sm:pt-4 font-light">{faq.answer}</p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* FINAL CALL TO ACTION / BOOKING EMBED SECTION */}
            <section id="booking-section" className="py-16 sm:py-24 bg-[#020617] text-white relative overflow-hidden">
                <div className="absolute top-1/2 right-1/4 w-[350px] h-[350px] bg-orange-500/10 rounded-full blur-[100px] pointer-events-none" />

                <div className="w-full mx-auto px-4 sm:px-6 max-w-5xl relative z-10">
                    <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
                        <span className="text-orange-400 font-mono text-xs uppercase tracking-widest font-semibold block mb-2 sm:mb-3">
                            Start Your Build
                        </span>
                        <h2 className="text-3xl sm:text-6xl font-oswald font-bold uppercase mb-3 sm:mb-4 leading-tight">
                            Have a promo coming up?
                        </h2>
                        <p className="text-sm sm:text-lg text-zinc-400 font-light max-w-xl mx-auto px-2">
                            Pick a 30-minute slot on the calendar or send your promo details directly below.
                        </p>

                        {/* Booking Mode Switcher */}
                        <div className="inline-flex p-1 rounded-full bg-white/10 backdrop-blur-md mt-6 border border-white/10 max-w-full">
                            <button
                                onClick={() => setBookingTab('calendar')}
                                className={cn(
                                    'px-4 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer',
                                    bookingTab === 'calendar'
                                        ? 'bg-orange-500 text-white shadow-md'
                                        : 'text-zinc-400 hover:text-white'
                                )}
                            >
                                Calendar Booking
                            </button>
                            <button
                                onClick={() => setBookingTab('form')}
                                className={cn(
                                    'px-4 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer',
                                    bookingTab === 'form'
                                        ? 'bg-orange-500 text-white shadow-md'
                                        : 'text-zinc-400 hover:text-white'
                                )}
                            >
                                Send Promo Details
                            </button>
                        </div>
                    </div>

                    {/* Booking container */}
                    <div className="bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-4 sm:p-8 lg:p-10">
                        {bookingTab === 'calendar' ? (
                            <div>
                                <div className="text-center mb-6">
                                    <h3 className="text-xl sm:text-2xl font-oswald font-bold uppercase mb-1">
                                        Book a 30-minute call
                                    </h3>
                                    <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-light">
                                        Pick a time that works best for you. No deck, just your funnel and technical requirements.
                                    </p>
                                </div>

                                {/* Calendly 30-min embed */}
                                <div className="w-full rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white">
                                    <iframe
                                        src={calendlyUrl}
                                        width="100%"
                                        height="680"
                                        frameBorder="0"
                                        title="Book a 30-minute call"
                                        className="w-full min-h-[620px] sm:min-h-[680px]"
                                    />
                                </div>

                                <div className="mt-4 text-center">
                                    <a
                                        href={calendlyUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 text-xs text-orange-600 dark:text-orange-400 hover:underline font-mono"
                                    >
                                        Open Calendly in a new tab <ExternalLink className="w-3.5 h-3.5" />
                                    </a>
                                </div>
                            </div>
                        ) : (
                            <div className="max-w-2xl mx-auto py-2">
                                <div className="text-center mb-6">
                                    <h3 className="text-xl sm:text-2xl font-oswald font-bold uppercase mb-1">
                                        Send Your Promo Details
                                    </h3>
                                    <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-light">
                                        Tell us what you want to promote. Your request is directly stored in our database and reviewed by our technical lead.
                                    </p>
                                </div>

                                {formStatus === 'success' ? (
                                    <div className="p-6 sm:p-8 text-center rounded-2xl bg-green-500/10 border border-green-500/20">
                                        <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
                                        <h4 className="text-xl sm:text-2xl font-oswald font-bold text-zinc-900 dark:text-white uppercase mb-2">
                                            Promo Details Received!
                                        </h4>
                                        <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-md mx-auto mb-6">
                                            Your request has been logged in our system. If you want to lock in a discussion immediately, you can also select a time on our calendar.
                                        </p>
                                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                                            <Button
                                                onClick={() => setBookingTab('calendar')}
                                                className="bg-orange-500 hover:bg-orange-600 text-white rounded-full text-xs sm:text-sm py-4 w-full sm:w-auto"
                                            >
                                                Book on Calendar Now
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={() => setFormStatus('idle')}
                                                className="rounded-full text-xs sm:text-sm py-4 w-full sm:w-auto"
                                            >
                                                Submit another inquiry
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <form onSubmit={handleInquirySubmit} className="space-y-4">
                                        <div className="grid sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-mono uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5 font-medium">
                                                    Clinic Name *
                                                </label>
                                                <input
                                                    type="text"
                                                    name="clinicName"
                                                    required
                                                    placeholder="e.g. Skinovatio Clinic"
                                                    className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm focus:outline-hidden focus:border-orange-500 transition-colors"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-mono uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5 font-medium">
                                                    Your Name *
                                                </label>
                                                <input
                                                    type="text"
                                                    name="name"
                                                    required
                                                    placeholder="e.g. Dr. Sarah Jenkins"
                                                    className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm focus:outline-hidden focus:border-orange-500 transition-colors"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-mono uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5 font-medium">
                                                    Email Address *
                                                </label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    required
                                                    placeholder="doctor@clinic.com"
                                                    className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm focus:outline-hidden focus:border-orange-500 transition-colors"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-mono uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5 font-medium">
                                                    Phone / WhatsApp
                                                </label>
                                                <input
                                                    type="tel"
                                                    name="phone"
                                                    placeholder="+1 (555) 000-0000"
                                                    className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm focus:outline-hidden focus:border-orange-500 transition-colors"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-mono uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5 font-medium">
                                                Package of Interest
                                            </label>
                                            <select
                                                name="plan"
                                                value={formPackage}
                                                onChange={(e) => setFormPackage(e.target.value)}
                                                className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm focus:outline-hidden focus:border-orange-500 transition-colors"
                                            >
                                                <option value="Launch ($400 setup + $150/mo)">Launch — $400 setup + $150/mo (1 promo)</option>
                                                <option value="Growth ($600 setup + $400/mo)">Growth — $600 setup + $400/mo (2 funnels/mo + Meta Ads)</option>
                                                <option value="Scale ($900 setup + $900/mo)">Scale — $900 setup + $900/mo (2 funnels/mo + Meta & Google Ads)</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-mono uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5 font-medium">
                                                Tell us about your upcoming promo or procedure
                                            </label>
                                            <textarea
                                                name="message"
                                                rows={4}
                                                placeholder="e.g. Planning a Botox promo for next month or launching a new Semaglutide program..."
                                                className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm focus:outline-hidden focus:border-orange-500 transition-colors resize-none"
                                            />
                                        </div>

                                        {formStatus === 'error' && (
                                            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs">
                                                <AlertCircle className="w-4 h-4 shrink-0" />
                                                <span>There was an error sending your request. Please select a time on our calendar directly.</span>
                                            </div>
                                        )}

                                        <Button
                                            type="submit"
                                            disabled={formLoading}
                                            className="w-full py-5 sm:py-6 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-semibold cursor-pointer shadow-lg shadow-orange-500/25 justify-center"
                                        >
                                            {formLoading ? (
                                                <span className="inline-flex items-center gap-2">
                                                    <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-2">
                                                    Send Promo Request <Send className="w-4 h-4" />
                                                </span>
                                            )}
                                        </Button>
                                    </form>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
