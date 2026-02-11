'use client';

import { PortfolioProject } from "@/lib/types";
import { ExternalLink, Eye, X, ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { cn } from "@/lib/utils";

export default function PortfolioClient({ initialProjects }: { initialProjects: PortfolioProject[] }) {
    const [selectedProject, setSelectedProject] = useState<PortfolioProject | null>(null);

    // Prevent scrolling when modal is open
    useEffect(() => {
        if (!selectedProject) return;

        const scrollY = window.scrollY;
        const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;

        // Fix background scrolling definitively
        const originalStyles = {
            overflow: document.documentElement.style.overflow,
            height: document.documentElement.style.height,
            bodyOverflow: document.body.style.overflow,
            bodyPosition: document.body.style.position,
            bodyTop: document.body.style.top,
            bodyWidth: document.body.style.width,
            bodyPaddingRight: document.body.style.paddingRight
        };

        document.documentElement.style.overflow = 'hidden';
        document.documentElement.style.height = '100%';
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.top = `-${scrollY}px`;
        document.body.style.width = '100%';
        document.body.style.height = '100%';
        document.body.style.paddingRight = `${scrollBarWidth}px`;

        return () => {
            document.documentElement.style.overflow = originalStyles.overflow;
            document.documentElement.style.height = originalStyles.height;
            document.body.style.overflow = originalStyles.bodyOverflow;
            document.body.style.position = originalStyles.bodyPosition;
            document.body.style.top = originalStyles.bodyTop;
            document.body.style.width = originalStyles.bodyWidth;
            document.body.style.height = '';
            document.body.style.paddingRight = originalStyles.bodyPaddingRight;
            window.scrollTo(0, scrollY);
        };
    }, [selectedProject]);

    return (
        <div className="pt-40 pb-20 px-6 w-full max-w-[2400px] mx-auto">
            {/* Hero Section */}
            <section className="relative py-20 px-6">
                <div className="container mx-auto text-center md:text-left">
                    <div className="max-w-3xl">
                        <h1 className="text-5xl md:text-7xl font-oswald font-bold mb-6 uppercase tracking-tight">
                            Our <span className="text-primary italic">Portfolio</span>
                        </h1>
                        <p className="text-xl text-gray-600 dark:text-zinc-400 font-light leading-relaxed">
                            Explore our featured projects and case studies showcasing creativity and technical excellence.
                        </p>
                    </div>
                </div>
            </section>

            {/* Projects Grid */}
            {initialProjects.length === 0 ? (
                <div className="text-center py-20 text-gray-500">
                    No projects uploaded yet. Check back soon!
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mx-auto px-4 md:px-0">
                    {initialProjects.map((project) => (
                        <div key={project.id} className="group relative bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden border border-gray-100 dark:border-zinc-800 flex flex-col h-full shadow-2xl shadow-black/5 hover:shadow-primary/5 transition-all duration-500">
                            {/* Image Container */}
                            <div className="aspect-[4/3] relative overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                                {project.image_url ? (
                                    <Image
                                        src={project.image_url}
                                        alt={project.title}
                                        fill
                                        className="object-cover transition-transform duration-1000 group-hover:scale-110"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400 font-mono text-sm uppercase opacity-30">[No Image]</div>
                                )}

                                {/* Refined Hover Overlay */}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center gap-4">
                                    <button
                                        onClick={() => setSelectedProject(project)}
                                        className="w-14 h-14 bg-white text-primary rounded-full flex items-center justify-center shadow-xl transform translate-y-10 group-hover:translate-y-0 transition-transform duration-500 delay-75 hover:scale-110 active:scale-95"
                                        title="View Details"
                                    >
                                        <Eye className="w-6 h-6" />
                                    </button>
                                    {project.project_url && (
                                        <a
                                            href={project.project_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-xl transform translate-y-10 group-hover:translate-y-0 transition-transform duration-500 delay-150 hover:scale-110 active:scale-95"
                                            title="View Live"
                                        >
                                            <ArrowUpRight className="w-6 h-6" />
                                        </a>
                                    )}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-8 flex-1 flex flex-col">
                                <div className="mb-4">
                                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20 backdrop-blur-md">
                                        {project.category || 'Project'}
                                    </span>
                                </div>
                                <h3 className="text-2xl font-oswald font-bold uppercase leading-tight mb-4 group-hover:text-primary transition-colors tracking-tight">
                                    {project.title}
                                </h3>
                                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed font-light flex-1 line-clamp-3">
                                    {project.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Project Details Modal */}
            {selectedProject && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/80 backdrop-blur-xl transition-all duration-500 touch-none"
                        onClick={() => setSelectedProject(null)}
                    ></div>

                    {/* Modal Content */}
                    <div
                        className="relative bg-white dark:bg-zinc-900 w-full max-w-xl rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col h-[85vh] md:h-[90vh] animate-in fade-in zoom-in duration-300 border border-white/5 mx-auto"
                        onClick={(e) => e.stopPropagation()}
                        onWheel={(e) => e.stopPropagation()}
                    >
                        <div className="shrink-0 border-b border-zinc-100 dark:border-zinc-800">
                            {/* Image Slider - Compact height to give more room to description */}
                            <div className="w-full h-48 md:h-56 bg-zinc-100 dark:bg-zinc-800 relative group/modal">
                                <Swiper
                                    modules={[Autoplay, Pagination, Navigation]}
                                    spaceBetween={0}
                                    slidesPerView={1}
                                    loop={true}
                                    pagination={{ clickable: true }}
                                    navigation={true}
                                    autoplay={{ delay: 3000, disableOnInteraction: false }}
                                    className="h-full w-full modal-swiper"
                                >
                                    {/* Primary Image */}
                                    <SwiperSlide className="relative h-full">
                                        <Image
                                            src={selectedProject.image_url}
                                            alt={selectedProject.title}
                                            fill
                                            className="object-cover"
                                        />
                                    </SwiperSlide>

                                    {/* Additional Images */}
                                    {selectedProject.additional_images && selectedProject.additional_images.length > 0 && selectedProject.additional_images.map((img, i) => (
                                        <SwiperSlide key={i} className="relative h-full">
                                            <Image
                                                src={img}
                                                alt={`${selectedProject.title} detail ${i + 1}`}
                                                fill
                                                className="object-cover"
                                            />
                                        </SwiperSlide>
                                    ))}
                                </Swiper>

                                {/* Close Button on Image Area */}
                                <button
                                    onClick={() => setSelectedProject(null)}
                                    className="absolute top-6 right-6 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full transition-all duration-300 z-[110] backdrop-blur-md"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Sticky Title Header */}
                            <div className="p-5 md:p-6 pb-2 bg-white dark:bg-zinc-900">
                                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-primary bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20 inline-block mb-2">
                                    {selectedProject.category}
                                </span>
                                <h2 className="text-base md:text-lg font-oswald font-bold uppercase tracking-tight leading-tight">
                                    {selectedProject.title}
                                </h2>
                            </div>
                        </div>

                        {/* Scrollable Description Area */}
                        <div className="flex-1 overflow-y-auto p-6 md:p-8 pt-4 scroll-smooth custom-scrollbar overscroll-contain">
                            <div className="space-y-4 pb-10">
                                <p className="text-primary/60 text-[10px] uppercase tracking-widest font-bold italic border-b border-primary/10 pb-2 inline-block">Project Overview</p>
                                <div className="text-zinc-600 dark:text-zinc-400 font-light leading-relaxed text-base md:text-lg whitespace-pre-wrap">
                                    {selectedProject.description || "Project details are being updated."}
                                </div>
                            </div>
                        </div>

                        {/* Sticky Footer for Action Button */}
                        {selectedProject.project_url && (
                            <div className="p-6 pt-0 md:p-8 md:pt-0 mt-auto bg-white dark:bg-zinc-900">
                                <a
                                    href={selectedProject.project_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full flex items-center justify-center gap-3 bg-primary hover:bg-orange-600 text-white py-5 rounded-2xl font-bold uppercase tracking-[0.15em] text-sm transition-all duration-300 shadow-lg shadow-primary/20 group/btn"
                                >
                                    Visit Live Website
                                    <ExternalLink className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Custom Styles for Modal Swiper */}
            <style jsx global>{`
                .modal-swiper .swiper-button-next,
                .modal-swiper .swiper-button-prev {
                    color: white;
                    background: rgba(0,0,0,0.3);
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    backdrop-filter: blur(10px);
                }
                .modal-swiper .swiper-button-next:after,
                .modal-swiper .swiper-button-prev:after {
                    font-size: 16px;
                    font-weight: bold;
                }
                .modal-swiper .swiper-pagination-bullet {
                    background: white;
                }
                .modal-swiper .swiper-pagination-bullet-active {
                    background: #ff5c00;
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(0,0,0,0.05);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #ff5c00;
                    border-radius: 10px;
                }
                .custom-scrollbar {
                    scrollbar-width: thin;
                    scrollbar-color: #ff5c00 rgba(0,0,0,0.05);
                }
            `}</style>
        </div>
    );
}
