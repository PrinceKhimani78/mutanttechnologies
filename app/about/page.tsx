import { Navbar } from "@/components/Navbar";
import { About } from "@/components/About";
import { Footer } from "@/components/Footer";
import { getPageContent } from "@/lib/cms";

import { getMetadata } from "@/lib/seo";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
    return await getMetadata('/about', {
        title: "About Us | Mutant Technologies",
        description: "Learn about Mutant Technologies, our mission, vision, and the team driving digital innovation.",
    });
}

export default async function AboutPage() {
    const data = await getPageContent('about');
    const hero = data?.hero || {};
    const features = data?.features || [];

    return (
        <main className="min-h-screen bg-background text-foreground">
            <Navbar />
            <div className="pt-32 pb-10 px-6 container mx-auto text-center">
                <h1 className="text-6xl md:text-8xl font-oswald font-bold uppercase mb-4 text-foreground">
                    {hero.title ? hero.title.split(' ').map((word: string, i: number) => (
                        <span key={i} className={i === 1 ? "text-primary font-serif italic font-light" : ""}>{word} </span>
                    )) : (
                        <>About <span className="text-primary font-serif italic font-light">Mutant</span></>
                    )}
                </h1>
                <p className="max-w-2xl mx-auto text-gray-500 text-lg font-light">
                    {hero.subtitle || "Redefining the digital landscape through innovation and creativity."}
                </p>
            </div>
            {/* Pass only relevant props if features exist, otherwise component handles defaults? 
                Actually About component defaults to empty array, so we must pass what we have.
                Also passing hero content as 'content' prop for the component's internal text if needed,
                but the About component seems to repeat the title/subtitle structure internally. 
                Let's reuse 'hero' for that as well or check if 'features' section has its own title.
                The About component has a 'content' prop for its internal duplicate hero-like section.
            */}
            <About content={hero} features={features} />
            <Footer />
        </main>
    );
}
