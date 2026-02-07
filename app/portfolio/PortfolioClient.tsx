'use client';

import { PortfolioProject } from "@/lib/types";
import { ExternalLink } from "lucide-react";
import Image from "next/image";

export default function PortfolioClient({ initialProjects }: { initialProjects: PortfolioProject[] }) {
    return (
        <div className="pt-40 pb-20 px-6 w-full max-w-[2400px] mx-auto">
            {/* Hero Section */}
            <section className="relative py-20 px-6">
                <div className="container mx-auto">
                    <div className="max-w-3xl">
                        <h1 className="text-5xl md:text-6xl font-bold mb-6">
                            Our Portfolio
                        </h1>
                        <p className="text-xl text-gray-600 dark:text-gray-400">
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mx-auto">
                    {initialProjects.map((project) => (
                        <div key={project.id} className="group relative bg-gray-50 dark:bg-zinc-900 rounded-2xl overflow-hidden border border-gray-200 dark:border-zinc-800 flex flex-col h-full">
                            {/* Image */}
                            <div className="aspect-video relative overflow-hidden bg-gray-200 dark:bg-zinc-800">
                                {project.image_url ? (
                                    <Image
                                        src={project.image_url}
                                        alt={project.title}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400 font-mono text-sm">[No Image]</div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                                    {project.project_url && (
                                        <a
                                            href={project.project_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-full text-sm font-bold uppercase tracking-wider hover:bg-orange-600 transition-colors"
                                        >
                                            View Live <ExternalLink className="w-4 h-4" />
                                        </a>
                                    )}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-8 flex-1 flex flex-col">
                                <div className="mb-4">
                                    <span className="text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full">
                                        {project.category || 'Project'}
                                    </span>
                                </div>
                                <h3 className="text-2xl font-oswald font-bold uppercase leading-tight mb-4 group-hover:text-primary transition-colors">
                                    {project.title}
                                </h3>
                                <p className="text-gray-600 dark:text-zinc-400 leading-relaxed font-light flex-1">
                                    {project.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
