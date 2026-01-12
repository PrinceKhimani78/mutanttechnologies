import { Button } from "@/components/ui/button";

export const PortfolioProjects = () => {
    return (
        <div className="container mx-auto px-6 pb-20">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
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
    );
};
