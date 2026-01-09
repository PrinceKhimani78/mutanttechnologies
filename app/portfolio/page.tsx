'use client';

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";

export default function Portfolio() {
    return (
        <main className="bg-black min-h-screen text-white">
            <Navbar />
            <div className="pt-32 pb-20 px-6 container mx-auto text-center">
                <h1 className="text-5xl md:text-7xl font-oswald font-bold uppercase mb-8">Our Work</h1>
                <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-12">
                    A showcase of digital experiences we've crafted for brands that dare to be different.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16 text-left">
                    {[1, 2, 3].map((item) => (
                        <div key={item} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden group">
                            <div className="aspect-video bg-zinc-800 relative overflow-hidden">
                                <div className="absolute inset-0 bg-zinc-800/50 flex items-center justify-center">
                                    <span className="text-zinc-600 font-mono">Coming Soon</span>
                                </div>
                            </div>
                            <div className="p-6">
                                <div className="text-primary text-sm font-bold uppercase mb-2">Web Development</div>
                                <h3 className="text-2xl font-oswald font-bold mb-4">Project Title {item}</h3>
                                <p className="text-zinc-400 mb-6">A brief description of the project deliverables and impact.</p>
                                <Button variant="outline" className="border-zinc-700 text-white hover:bg-zinc-800">Case Study (Coming Soon)</Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <Footer />
        </main>
    );
}
