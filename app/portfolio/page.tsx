import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import { PortfolioProject } from "@/lib/types";
import PortfolioClient from "./PortfolioClient";
import { getMetadata } from "@/lib/seo";
import { Metadata } from "next";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
    return await getMetadata('/portfolio', {
        title: "Portfolio | Mutant Technologies",
        description: "Explore our featured projects and case studies showcasing creativity and technical excellence.",
    });
}

export default async function PortfolioPage() {
    const { data, error } = await supabase
        .from('portfolio')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching projects:', error);
    }

    const projects = (data || []) as PortfolioProject[];

    return (
        <main className="bg-background min-h-screen text-foreground transition-colors duration-300">
            <Navbar />
            <PortfolioClient initialProjects={projects} />
            <Footer />
        </main>
    );
}
