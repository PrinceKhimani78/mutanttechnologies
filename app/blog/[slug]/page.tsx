import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { blogs } from "@/lib/data";

export async function generateStaticParams() {
    return blogs.map((post) => ({
        slug: post.slug,
    }));
}

export default async function BlogPost(props: { params: Promise<{ slug: string }> }) {
    const params = await props.params;
    const slug = params.slug;

    return (
        <main className="bg-black min-h-screen text-white">
            <Navbar />

            {/* Hero / Title Section */}
            <article className="pt-40 pb-20">
                <div className="container mx-auto px-6 max-w-4xl text-center mb-12">
                    <span className="text-blue-500 font-bold uppercase tracking-widest text-xs mb-6 block">
                        October 12, 2024 • 5 min read
                    </span>
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-oswald font-bold uppercase leading-[1.1] mb-8">
                        {slug ? (slug as string).replace(/-/g, ' ') : "Article Title"}
                    </h1>
                </div>

                {/* Featured Image Placeholder */}
                <div className="container mx-auto px-6 max-w-5xl mb-16">
                    <div className="aspect-[21/9] bg-zinc-900 rounded-3xl overflow-hidden flex items-center justify-center border border-zinc-800">
                        <span className="text-zinc-700 font-mono">[Featured Image Placeholder]</span>
                    </div>
                </div>

                {/* Content */}
                <div className="container mx-auto px-6 max-w-3xl">
                    <div className="prose prose-invert prose-lg max-w-none">
                        {/* Styled Intro / Blockquote mimicking the blue line accent */}
                        <div className="pl-6 border-l-4 border-blue-500 mb-12">
                            <p className="text-2xl text-white font-serif italic leading-relaxed">
                                "This is a placeholder for the blog content intro. Note the distinct styling that highlights the key takeaway or summary of the article."
                            </p>
                        </div>

                        <p className="text-zinc-400 leading-loose">
                            Currently, the content for "{slug}" is being prepared by our editorial team. This layout is designed to be distraction-free, focusing entirely on readability and visual hierarchy.
                        </p>

                        <h3 className="text-white font-oswald uppercase text-2xl mt-12 mb-6">Why style matters</h3>
                        <p className="text-zinc-400 leading-loose">
                            In a real implementation, this page would fetch the markdown or HTML content associated with the slug <strong>{slug}</strong>. The typography here is set to maximize reading comfort with generous line height and optimal line length.
                        </p>
                    </div>
                </div>
            </article>
            <Footer />
        </main>
    );
}
