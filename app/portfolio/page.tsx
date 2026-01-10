import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PortfolioHero } from "@/components/portfolio/PortfolioHero";
import { PortfolioProjects } from "@/components/portfolio/PortfolioProjects";
import { RenderBuilderContent } from "@/components/builder-page";

// Builder Public API Key set in .env.local
const BUILDER_PUBLIC_API_KEY = process.env.NEXT_PUBLIC_BUILDER_API_KEY || "YOUR_PUBLIC_API_KEY";

const model = "page";

export default async function Portfolio() {
    let content = undefined;

    try {
        const { builder } = await import("@builder.io/sdk");
        builder.init(BUILDER_PUBLIC_API_KEY);

        content = await builder
            .get(model, {
                userAttributes: {
                    urlPath: "/portfolio",
                },
            })
            .toPromise();
    } catch (err) {
        console.error("Builder fetch error:", err);
    }

    return (
        <main className="bg-background min-h-screen text-foreground">
            <Navbar />

            {content ? (
                <RenderBuilderContent content={content} model={model} />
            ) : (
                <>
                    <PortfolioHero />
                    <PortfolioProjects />
                </>
            )}

            <Footer />
        </main>
    );
}
