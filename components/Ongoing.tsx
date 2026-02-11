'use client';
import { useRef, useState, useEffect } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';

// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

gsap.registerPlugin(ScrollTrigger);

interface OngoingProps {
    title?: string;
    description?: string;
    scroller?: string;
}

export const Ongoing = ({
    title = "Projects",
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
                .from('portfolio')
                .select('*')
                .order('created_at', { ascending: false });

            if (data && data.length > 0) {
                setProjects(data);
            }
        };
        fetchProjects();
    }, []);

    const displayProjects = projects.length > 0 ? projects.map(p => ({
        ...p,
        image: p.image_url || "/ongoing-1.jpg",
        color: p.color || "bg-primary/20",
        year: p.created_at ? new Date(p.created_at).getFullYear().toString() : "2024"
    })) : [
        {
            title: "Neon Horizon",
            category: "Web Application",
            description: "A futuristic dashboard for managing IoT devices in smart cities.",
            image: "/ongoing-1.jpg",
            color: "bg-cyan-500/20",
            year: "2024"
        }
    ];

    useGSAP(() => {
        if (!containerRef.current || !titleRef.current || scroller) return;

        gsap.from(titleRef.current, {
            y: 50,
            opacity: 0,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
                trigger: titleRef.current,
                start: "top 90%",
            }
        });
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
                        <div className="relative mb-6">
                            <h2
                                ref={titleRef}
                                className="text-gray-200 dark:text-zinc-800/40 text-[12vw] md:text-[8vw] font-oswald font-black select-none uppercase z-0 leading-none tracking-tighter"
                            >
                                {title}
                            </h2>
                        </div>
                        <p className="text-gray-600 dark:text-zinc-400 text-lg md:text-xl font-light">
                            Explore our latest work and upcoming digital experiences.
                        </p>
                    </div>
                    <Link href="/portfolio" className="group flex items-center gap-2 text-dark-slate dark:text-white border border-gray-300 dark:border-zinc-700 px-6 py-3 rounded-full hover:bg-primary hover:text-white transition-all duration-300">
                        View All Projects
                        <ArrowUpRight className="w-5 h-5 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                <div className="px-2">
                    <Swiper
                        modules={[Autoplay, Navigation, Pagination]}
                        spaceBetween={30}
                        slidesPerView={1}
                        autoplay={{ delay: 5000, disableOnInteraction: false }}
                        pagination={{ clickable: true }}
                        breakpoints={{
                            640: { slidesPerView: 1 },
                            768: { slidesPerView: 2 },
                            1024: { slidesPerView: 3 },
                        }}
                        className="portfolio-swiper !pb-14"
                    >
                        {displayProjects.map((project: any, idx: number) => (
                            <SwiperSlide key={idx}>
                                <div className="group relative bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-xl shadow-black/5 h-[450px]">
                                    {/* Image Base with subtle zoom on hover */}
                                    <div className="absolute inset-0 z-0 overflow-hidden">
                                        {project.image_url ? (
                                            <Image
                                                src={project.image_url}
                                                alt={project.title}
                                                fill
                                                className="object-cover transition-transform duration-1000 group-hover:scale-110"
                                            />
                                        ) : (
                                            <div className={cn("w-full h-full flex items-center justify-center text-gray-400 bg-zinc-100 dark:bg-zinc-800")}>
                                                <span className="font-oswald text-4xl font-bold opacity-30 select-none">{project.title}</span>
                                            </div>
                                        )}
                                        {/* Subtle Dark Gradient Overlay (Bottom only) */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10"></div>
                                    </div>

                                    {/* Content that slides up on hover */}
                                    <div className="absolute inset-0 z-20 flex flex-col justify-end p-8 translate-y-24 group-hover:translate-y-0 transition-transform duration-500 ease-out">
                                        <div className="mb-3">
                                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20 backdrop-blur-md">
                                                {project.category}
                                            </span>
                                        </div>

                                        <h3 className="text-3xl font-oswald text-white font-bold leading-tight uppercase tracking-tight mb-4 group-hover:mb-2 transition-all">
                                            {project.title}
                                        </h3>

                                        {/* Hidden info revealed on hover */}
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                                            <p className="text-white/70 text-sm font-light leading-relaxed mb-6 line-clamp-3">
                                                {project.description}
                                            </p>

                                            <div className="flex flex-wrap gap-3">
                                                <Link
                                                    href="/portfolio"
                                                    className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 px-5 py-2.5 rounded-full font-bold uppercase tracking-wider text-[10px] transition-all duration-300"
                                                >
                                                    View Project
                                                </Link>
                                                {project.project_url && (
                                                    <a
                                                        href={project.project_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-2 bg-primary hover:bg-orange-600 text-white px-5 py-2.5 rounded-full font-bold uppercase tracking-wider text-[10px] transition-all duration-300 shadow-lg shadow-primary/20"
                                                    >
                                                        View Live
                                                        <ArrowUpRight className="w-3 h-3" />
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
            </div>

            {/* Swiper Custom Styles */}
            <style jsx global>{`
                .portfolio-swiper .swiper-pagination-bullet {
                    background: #ff5c00;
                    opacity: 0.3;
                    width: 8px;
                    height: 8px;
                    transition: all 0.3s;
                }
                .portfolio-swiper .swiper-pagination-bullet-active {
                    opacity: 1;
                    width: 24px;
                    border-radius: 4px;
                }
            `}</style>
        </section>
    );
};
