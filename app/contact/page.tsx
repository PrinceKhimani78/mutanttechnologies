import { Navbar } from "@/components/Navbar";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";

import { getMetadata } from "@/lib/seo";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
    return await getMetadata('/contact', {
        title: "Contact Us | Mutant Technologies",
        description: "Get in touch with Mutant Technologies for your next digital project.",
    });
}

export default function ContactPage() {
    return (
        <main className="min-h-screen bg-background text-foreground">
            <Navbar />
            <div className="pt-20">
                <Contact />
            </div>
            <Footer />
        </main>
    );
}
