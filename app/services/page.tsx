import { Navbar } from "@/components/Navbar";
import { Services } from "@/components/Services";
import { Footer } from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import { Service } from "@/lib/types";

import { getPageContent } from "@/lib/cms";

export const metadata = {
    title: "Our Services",
    description: "Comprehensive digital solutions: Web Development, SEO, Digital Marketing, and Cyber Security.",
};

export default async function ServicesPage() {
    const { data: services } = await supabase
        .from('services')
        .select('*')
        .order('id');

    const pageContent = await getPageContent('services');
    const header = pageContent?.header || {};

    return (
        <main className="min-h-screen bg-background text-foreground">
            <Navbar />
            <div className="pt-20">
                <Services services={(services || []) as Service[]} header={header} />
            </div>
            <Footer />
        </main>
    );
}
