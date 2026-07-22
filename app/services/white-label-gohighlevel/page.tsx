import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import WhiteLabelGHLClient from "@/components/WhiteLabelGHLClient";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "White Label GoHighLevel Development | Mutant Technologies",
    description: "Expert GoHighLevel development for digital agencies. White label services including full funnels, websites, CRM setup, and automations.",
    openGraph: {
        title: "White Label GoHighLevel Development | Mutant Technologies",
        description: "Scale your agency with our expert GoHighLevel developers. We handle the builds so you can focus on closing deals.",
    }
};

export default function WhiteLabelGHLPage() {
    return (
        <main className="min-h-screen bg-background text-foreground">
            <Navbar />
            <WhiteLabelGHLClient />
            <Footer />
        </main>
    );
}
