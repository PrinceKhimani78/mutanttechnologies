import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import { PortfolioProject } from "@/lib/types";
import { ExternalLink } from "lucide-react";
import Image from "next/image";
import { Metadata } from "next";
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Project } from '@/lib/types';
import Link from 'next/link';
import Image from 'next/image';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ExternalLink } from "lucide-react"; // Keep ExternalLink as it's used in the project card

// Remove static revalidation - now using client-side fetching
// export const revalidate = 60;

// Remove metadata export - metadata is typically defined in server components or layout files for client components
// export const metadata: Metadata = {
//     title: "Portfolio | Mutant Technologies",
//     description: "Explore our featured projects and case studies showcasing creativity and technical excellence.",
//     alternates: {
//         canonical: '/portfolio',
//     },
// };

export default function PortfolioPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    // No explicit error state in the instruction, so we'll just log it.

    useEffect(() => {
        async function fetchProjects() {
            setLoading(true);
            const { data, error } = await supabase
                .from('projects') // Changed from 'portfolio' to 'projects' as per instruction
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching projects:', error);
                // Optionally set an error state here if you want to display it
            } else if (data) {
                setProjects(data as Project[]); // Cast data to Project[]
            }
            setLoading(false);
        }

        fetchProjects();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar />
                <div className="container mx-auto px-6 py-32 text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                    <p className="mt-4 text-gray-500">Loading projects...</p>
                </div>
                <Footer />
            </div>
        );
    }

    const pageContent = await getPageContent('portfolio');
    const header = pageContent?.header || {};

    return (
        <main className="bg-background min-h-screen text-foreground transition-colors duration-300">
            <Navbar />

            <div className="pt-40 pb-20 px-6 w-full max-w-[2400px] mx-auto">
                {/* Header Section */}
                <div className="text-center mb-24">
                    <h1 className="text-6xl md:text-8xl font-oswald font-bold uppercase mb-6 tracking-tight text-foreground">
                        {header.title ? header.title.split(' ').map((word: string, i: number) => (
                            <span key={i} className={i === 1 ? "font-serif italic text-primary font-light" : ""}>{word} </span>
                        )) : (
                            <>Our <span className="font-serif italic text-primary font-light">Work</span></>
                        )}
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-zinc-400 max-w-2xl mx-auto font-light">
                        {header.subtitle || "Featured projects and case studies."}
                    </p>
                </div>

                {/* Projects Grid */}
                {projects.length === 0 ? (
                    <div className="text-center py-20 text-gray-500">
                        No projects uploaded yet. Check back soon!
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mx-auto">
                        {projects.map((project) => (
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

            <Footer />
        </main>
    );
}
