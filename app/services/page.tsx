import { Navbar } from "@/components/Navbar";
import { Services } from "@/components/Services";
import { Footer } from "@/components/Footer";

export const metadata = {
    title: "Our Services",
    description: "Comprehensive digital solutions: Web Development, SEO, Digital Marketing, and Cyber Security.",
};

export default function ServicesPage() {
    return (
        <main className="min-h-screen bg-white text-dark-slate">
            <Navbar />
            <div className="pt-20">
                <Services />
            </div>
            <Footer />
        </main>
    );
}
