import { Navbar } from "@/components/Navbar";
import { About } from "@/components/About";
import { Footer } from "@/components/Footer";

export const metadata = {
    title: "About Us",
    description: "Learn about Mutant Technologies, our mission, vision, and the team driving digital innovation.",
};

export default function AboutPage() {
    return (
        <main className="min-h-screen bg-background text-foreground">
            <Navbar />
            <div className="pt-32 pb-10 px-6 container mx-auto text-center">
                <h1 className="text-6xl md:text-8xl font-oswald font-bold uppercase mb-4 text-foreground">
                    About <span className="text-primary font-serif italic font-light">Mutant</span>
                </h1>
                <p className="max-w-2xl mx-auto text-gray-500 text-lg font-light">
                    Redefining the digital landscape through innovation and creativity.
                </p>
            </div>
            <About />
            <Footer />
        </main>
    );
}
