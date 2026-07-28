import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import { Career } from "@/lib/types";
import { getMetadata } from "@/lib/seo";
import { Metadata } from "next";
import { CareersClient } from "./CareersClient";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
    return await getMetadata('/careers', {
        title: "Careers at Mutant Technologies | Join Our Team",
        description: "Join Mutant Technologies and help us build the future of digital experiences. Explore our open roles in engineering, design, and marketing.",
    });
}

export default async function CareersPage() {
    let careersData: Career[] = [];

    try {
        const { data, error } = await supabase
            .from('careers')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error('Error fetching careers:', error);
        } else {
            careersData = (data || []) as Career[];
        }
    } catch (error) {
        console.error('Error fetching careers:', error);
    }

    return (
        <main className="min-h-screen bg-background text-foreground">
            <Navbar />
            <div className="pt-20">
                <CareersClient careers={careersData} />
            </div>
            <Footer />
        </main>
    );
}
