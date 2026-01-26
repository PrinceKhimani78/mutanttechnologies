import { ArrowRight, CheckCircle, PlayCircle } from 'lucide-react';

export default function FunnelHero() {
    return (
        <section className="relative pt-32 pb-20 px-4 overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_10%,rgba(112,77,244,0.15),transparent_70%)] pointer-events-none"></div>

            <div className="max-w-7xl mx-auto text-center relative z-10">
                <div className="inline-block mb-6 px-4 py-1.5 rounded-full bg-[#704df4]/10 border border-[#704df4]/20 text-[#a38cff] font-medium text-sm animate-fade-in-up">
                    SPECIAL OFFER: For Agencies & SaaS Owners
                </div>

                <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-8 leading-[1.1] animate-fade-in-up delay-100">
                    WE BUILD YOUR <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#704df4] to-[#c084fc]">
                        AUTOMATION EMPIRE
                    </span>
                </h1>

                <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-10 leading-relaxed font-light animate-fade-in-up delay-200">
                    Stop wondering where your leads went. We implement the <span className="text-white font-semibold">exact GHL systems</span> used by 7-figure agencies to scale without chaos.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-in-up delay-300">
                    <a
                        href="#value-stack"
                        className="w-full sm:w-auto bg-[#704df4] hover:bg-[#5b3dc9] text-white px-8 py-5 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-[0_0_50px_-10px_rgba(112,77,244,0.5)] flex items-center justify-center gap-2"
                    >
                        YES! Build My Funnel <ArrowRight className="w-5 h-5" />
                    </a>
                    <a
                        href="#case-studies"
                        className="w-full sm:w-auto px-8 py-5 rounded-xl font-bold text-lg text-white border border-white/10 hover:bg-white/5 transition-all flex items-center justify-center gap-2"
                    >
                        <PlayCircle className="w-5 h-5" /> See It In Action
                    </a>
                </div>

                {/* Social Proof Strip */}
                <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                    {/* Add actual client logos here or generic "Trusted By" text */}
                    <div className="flex items-center gap-2 text-sm md:text-base font-mono text-gray-500">
                        <CheckCircle className="w-4 h-4 text-[#704df4]" /> 500+ Snapshots Installed
                    </div>
                    <div className="flex items-center gap-2 text-sm md:text-base font-mono text-gray-500">
                        <CheckCircle className="w-4 h-4 text-[#704df4]" /> $10M+ Revenue Processed
                    </div>
                    <div className="flex items-center gap-2 text-sm md:text-base font-mono text-gray-500">
                        <CheckCircle className="w-4 h-4 text-[#704df4]" /> Certified GHL Experts
                    </div>
                </div>
            </div>
        </section>
    );
}
