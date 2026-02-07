'use client';
import { useRef, useState, useEffect } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';

gsap.registerPlugin(ScrollTrigger);

// Default/Fallback projects
const defaultProjects = [
    {
        title: "Neon Horizon",
        category: "Web Application",
        description: "A futuristic dashboard for managing IoT devices in smart cities.",
        image: "/ongoing-1.jpg",
        color: "bg-cyan-500",
        year: "2024"
    },
    // ... others
];

interface OngoingProps {
    title?: string;
    description?: string;
    scroller?: string;
}

export const Ongoing = ({
    title = "Ongoing Works",
    description = "Witness the future in the making. Here are some of the cutting-edge projects currently on our workbench.",
    scroller
}: OngoingProps) => {
    const containerRef = useRef<HTMLElement>(null);
    const titleRef = useRef<HTMLHeadingElement>(null);
    const [projects, setProjects] = useState<any[]>([]);

    useEffect(() => {
        const fetchProjects = async () => {
            const { supabase } = await import('@/lib/supabase');
            const { data } = await supabase
                .from('ongoing_projects')
                .select('*')
                .order('created_at', { ascending: false });

            if (data && data.length > 0) {
                setProjects(data);
            }
        };
        fetchProjects();
    }, []);

    const items = projects.length > 0 ? projects : projects; // Wait, logic: if projects empty use default.
    // Actually the default list above was truncated in my display.
    // Let's just use the `projects` state and initialize it with defaults if we want, 
    // OR just use defaults if fetch returns empty.

    const displayProjects = projects.length > 0 ? projects : [
        {
            title: "Neon Horizon",
            category: "Web Application",
            description: "A futuristic dashboard for managing IoT devices in smart cities.",
            image: "/ongoing-1.jpg",
            color: "bg-cyan-500",
            year: "2024"
        },
        {
            title: "Vertex AI",
            category: "Machine Learning",
            description: "AI-driven analytics platform for predicting market trends.",
            image: "/ongoing-2.jpg",
            color: "bg-violet-500",
            year: "2024"
        },
        {
            title: "Cyber Shield",
            category: "Security",
            description: "Enterprise-grade firewall management and threat detection system.",
            image: "/ongoing-3.jpg",
            color: "bg-red-500",
            year: "2025"
        }
    ];

    useGSAP(() => {
        try {
            // Disable GSAP animations in Visual Editor to prevent errors
            if (scroller) {
                console.log('Ongoing: Skipping GSAP animations in Visual Editor context');
                return;
            }

            console.log('Ongoing: useGSAP', { hasContainer: !!containerRef.current, hasTitle: !!titleRef.current, scroller });
            if (!containerRef.current || !titleRef.current) return;

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top 70%",
                    toggleActions: "play none none reverse"
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
        } catch (error) {
            console.error('Ongoing: GSAP Error', error);
        }
    }, { scope: containerRef, dependencies: [projects, scroller] });

    return (
        <section ref={containerRef} className="py-12 md:py-24 bg-background relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px]"></div>
            </div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
                    <div className="max-w-2xl">
                        <h2 ref={titleRef} className="text-foreground text-5xl md:text-7xl font-oswald uppercase font-bold tracking-tight mb-6">
                            {(title || "").split(' ').map((word, i) => i === (title || "").split(' ').length - 1 ? <span key={i} className="text-primary">{word}</span> : word + ' ')}
                        </h2>
                        <p className="text-gray-600 dark:text-zinc-400 text-lg md:text-xl font-light">
                            {description}
                        </p>
                    </div>
                    <Link href="/projects" className="group flex items-center gap-2 text-dark-slate dark:text-white border border-gray-300 dark:border-zinc-700 px-6 py-3 rounded-full hover:bg-dark-slate dark:hover:bg-white hover:text-white dark:hover:text-black transition-all duration-300">
                        View All Projects
                        <ArrowUpRight className="w-5 h-5 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {displayProjects.map((project: any, idx: number) => (
                        <div key={idx} className="project-card group relative bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl overflow-hidden hover:border-gray-400 dark:hover:border-zinc-600 transition-colors duration-500 shadow-sm dark:shadow-none">
                            {/* Image Placeholder */}
                            <div className={`h-64 w-full ${project.color} relative overflow-hidden`}>
                                <div className="absolute inset-0 bg-gradient-to-t from-white/10 dark:from-zinc-900 to-transparent opacity-60"></div>
                                {/* Placeholder Text for Image */}
                                <div className="absolute inset-0 flex items-center justify-center text-white/50 font-oswald text-4xl font-bold uppercase tracking-widest rotate-[-15deg]">
                                    {project.title}
                                </div>
                            </div>

                            <div className="p-8">
                                <div className="flex justify-between items-start mb-4">
                                    <span className="text-sm font-mono text-primary px-3 py-1 bg-primary/10 rounded-full border border-primary/20">
                                        {project.category}
                                    </span>
                                    <span className="text-gray-500 dark:text-zinc-500 font-mono text-sm">{project.year}</span>
                                </div>
                                <h3 className="text-3xl font-oswald text-dark-slate dark:text-white font-bold mb-3 group-hover:text-primary transition-colors">
                                    {project.title}
                                </h3>
                                <p className="text-gray-600 dark:text-zinc-400 leading-relaxed mb-6">
                                    {project.description}
                                </p>
                                <Link href="#" className="inline-flex items-center gap-2 text-dark-slate dark:text-white font-bold tracking-wider text-sm uppercase group/link">
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
