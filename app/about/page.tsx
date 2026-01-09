import { Navbar } from "@/components/Navbar";
import { About } from "@/components/About";
import { Footer } from "@/components/Footer";

export const metadata = {
    title: "About Us",
    description: "Learn about Mutant Technologies, our mission, vision, and the team driving digital innovation.",
};

export default function AboutPage() {
    return (
        <main className="min-h-screen bg-white text-dark-slate">
            <Navbar />
            <div className="pt-20">
                <About />
            </div>
            <Footer />
        </main>
    );
}
