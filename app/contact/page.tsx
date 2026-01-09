import { Navbar } from "@/components/Navbar";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";

export const metadata = {
    title: "Contact Us",
    description: "Get in touch with Mutant Technologies for your next digital project.",
};

export default function ContactPage() {
    return (
        <main className="min-h-screen bg-white text-dark-slate">
            <Navbar />
            <div className="pt-20">
                <Contact />
            </div>
            <Footer />
        </main>
    );
}
