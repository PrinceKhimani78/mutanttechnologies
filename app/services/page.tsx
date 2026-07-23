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
        title: "Web Development, SEO & AI Automation Services | Mutant Technologies",
        description: "Explore our comprehensive suite of digital services including high-end web development, SEO, custom CRM setups, and white-label agency solutions.",
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
                <Services services={servicesData} header={headerData} />
            </div>
            <Footer />
        </main>
    );
}
