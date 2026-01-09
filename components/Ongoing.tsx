'use client';
import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';

gsap.registerPlugin(ScrollTrigger);

const projects = [
    {
        title: "Neon Horizon",
        category: "Web Application",
        description: "A futuristic dashboard for managing IoT devices in smart cities.",
        image: "/ongoing-1.jpg", // Placeholder path
        color: "bg-cyan-500",
        year: "2024"
    },
    {
        title: "Vertex AI",
        category: "Machine Learning",
        description: "AI-driven analytics platform for predicting market trends.",
        image: "/ongoing-2.jpg", // Placeholder path
        color: "bg-violet-500",
        year: "2024"
    },
    {
        title: "Cyber Shield",
        category: "Security",
        description: "Enterprise-grade firewall management and threat detection system.",
        image: "/ongoing-3.jpg", // Placeholder path
        color: "bg-red-500",
        year: "2025"
    }
];

export const Ongoing = () => {
    const containerRef = useRef<HTMLElement>(null);
    const titleRef = useRef<HTMLHeadingElement>(null);

    useGSAP(() => {
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: containerRef.current,
                start: "top 70%",
                toggleActions: "play none none reverse",
            }
        });

        tl.from(titleRef.current, {
            y: 50,
            opacity: 0,
            duration: 1,
            ease: "power3.out"
        })
            .from(".project-card", {
                y: 100,
                opacity: 0,
                stagger: 0.2,
                duration: 1,
                ease: "power3.out"
            }, "-=0.5");

    }, { scope: containerRef });

    return (
        <section ref={containerRef} className="py-24 bg-zinc-950 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px]"></div>
            </div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
                    <div className="max-w-2xl">
                        <h2 ref={titleRef} className="text-white text-5xl md:text-7xl font-oswald uppercase font-bold tracking-tight mb-6">
                            Ongoing <span className="text-primary">Works</span>
                        </h2>
                        <p className="text-zinc-400 text-lg md:text-xl font-light">
                            Witness the future in the making. Here are some of the cutting-edge projects currently on our workbench.
                        </p>
                    </div>
                    <Link href="/projects" className="group flex items-center gap-2 text-white border border-zinc-700 px-6 py-3 rounded-full hover:bg-white hover:text-black transition-all duration-300">
                        View All Projects
                        <ArrowUpRight className="w-5 h-5 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {projects.map((project, idx) => (
                        <div key={idx} className="project-card group relative bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-600 transition-colors duration-500">
                            {/* Image Placeholder */}
                            <div className={`h-64 w-full ${project.color} relative overflow-hidden`}>
                                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent opacity-60"></div>
                                {/* Placeholder Text for Image */}
                                <div className="absolute inset-0 flex items-center justify-center text-white/20 font-oswald text-4xl font-bold uppercase tracking-widest rotate-[-15deg]">
                                    {project.title}
                                </div>
                            </div>

                            <div className="p-8">
                                <div className="flex justify-between items-start mb-4">
                                    <span className="text-sm font-mono text-primary px-3 py-1 bg-primary/10 rounded-full border border-primary/20">
                                        {project.category}
                                    </span>
                                    <span className="text-zinc-500 font-mono text-sm">{project.year}</span>
                                </div>
                                <h3 className="text-3xl font-oswald text-white font-bold mb-3 group-hover:text-primary transition-colors">
                                    {project.title}
                                </h3>
                                <p className="text-zinc-400 leading-relaxed mb-6">
                                    {project.description}
                                </p>
                                <Link href="#" className="inline-flex items-center gap-2 text-white font-bold tracking-wider text-sm uppercase group/link">
                                    Read Case Study
                                    <ArrowUpRight className="w-4 h-4 text-primary group-hover/link:translate-x-1 group-hover/link:-translate-y-1 transition-transform" />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
