import { Navbar } from "@/components/Navbar";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";

import { getMetadata } from "@/lib/seo";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
    return await getMetadata('/contact', {
        title: "Contact Mutant Technologies | IT & Digital Agency",
        description: "Get in touch with Mutant Technologies in Rajkot for web development, app development, SEO, and white-label digital solutions. Free consultation.",
    });
}

export default function ContactPage() {
    return (
        <main className="min-h-screen bg-background text-foreground">
            <Navbar />
            <div className="pt-20">
                <Contact isPage />
            </div>
            <Footer />
        </main>
    );
}
