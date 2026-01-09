'use client';
import { useParams, notFound } from 'next/navigation';
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ServiceMarquee } from "@/components/ServiceMarquee";
import { Button } from "@/components/ui/button";
import { Monitor, Search, BarChart, Shield, Layout, ArrowRight } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useRef } from 'react';

// Service Data
const servicesData: Record<string, {
    title: string;
    description: string;
    icon: any;
    features: string[];
    bgGradient: string;
    content: string;
}> = {
    "web-development": {
        title: "Web Development",
        description: "We build scalable, high-performance websites using the latest technologies like Next.js, React, and Node.js.",
        icon: Monitor,
        features: ["Custom Web Apps", "E-commerce Solutions", "CMS Integration", "API Development"],
        bgGradient: "from-blue-600/20 to-purple-600/20",
        content: "Your website is your digital storefront. We don't just write code; we engineer experiences. Our web development team focuses on performance, accessibility, and scalability to ensure your business creates a lasting impression."
    },
    "seo": {
        title: "SEO Optimization",
        description: "Rank higher on search engines and drive organic traffic with our data-driven SEO strategies.",
        icon: Search,
        features: ["Keyword Research", "On-Page Optimization", "Technical SEO Audits", "Link Building"],
        bgGradient: "from-orange-600/20 to-red-600/20",
        content: "Visibility is key in the digital age. Our SEO experts analyze search trends and algorithms to put your brand in front of the right audience at the right time. We focus on sustainable, long-term growth."
    },
    "digital-marketing": {
        title: "Digital Marketing",
        description: "Comprehensive marketing campaigns that convert visitors into loyal customers.",
        icon: BarChart,
        features: ["Social Media Marketing", "PPC Campaigns", "Email Marketing", "Content Strategy"],
        bgGradient: "from-purple-600/20 to-pink-600/20",
        content: "Marketing is more than just ads; it's about storytelling. We help you craft a compelling narrative that resonates with your audience and drives conversions across all digital channels."
    },
    "cyber-security": {
        title: "Cyber Security",
        description: "Protect your digital assets with our robust security audits and solutions.",
        icon: Shield,
        features: ["Vulnerability Assessment", "Penetration Testing", "Security Audits", "Compliance"],
        bgGradient: "from-red-600/20 to-orange-600/20",
        content: "In an interconnected world, security is non-negotiable. We identify vulnerabilities before they can be exploited, ensuring your data and your customers' trust remain intact."
    },
    "ui-ux-design": {
        title: "UI/UX Design",
        description: "User-centric designs that provide intuitive and engaging digital experiences.",
        icon: Layout,
        features: ["User Research", "Wireframing", "Prototyping", "Visual Design"],
        bgGradient: "from-emerald-600/20 to-teal-600/20",
        content: "Design is how it works, not just how it looks. We apply design thinking to solve complex problems, creating interfaces that are intuitive, accessible, and delightful to use."
    }
};

export default function ServiceDetail() {
    const params = useParams();
    const slug = params.slug as string;
    const service = servicesData[slug];

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
