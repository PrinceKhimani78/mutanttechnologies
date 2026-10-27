import { Navbar } from "@/components/Navbar";
import { Services } from "@/components/Services";
import { Footer } from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import { Service } from "@/lib/types";
import { getPageContent } from "@/lib/cms";
import { getMetadata } from "@/lib/seo";
import { Metadata } from "next";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
    return await getMetadata('/services', {
        title: "Digital & IT Services in Rajkot | Mutant Technologies",
        description: "Explore our full suite of digital services: high-speed web development, mobile apps, SEO, AI automations, and white-label GoHighLevel development.",
    });
}

export default async function ServicesPage() {
    let servicesData: Service[] = [];
    let headerData: any = {};

    try {
        const { data } = await supabase
            .from('services')
            .select('*')
            .order('id');
        
        servicesData = (data || []) as Service[];

        const pageContent = await getPageContent('services');
        headerData = pageContent?.header || {};
    } catch (error) {
        console.error('Error fetching services:', error);
    }

    return (
        <main className="min-h-screen bg-background text-foreground">
            <Navbar />
            <div className="pt-20">
                <Services services={servicesData} header={headerData} isPage />
            </div>
            <Footer />
        </main>
    );
}
