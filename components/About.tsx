'use client';
import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Users, Target, Lightbulb } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const features = [
    {
        icon: Target,
        title: "Our Mission",
        desc: "To empower businesses with digital solutions that drive real, measurable growth."
    },
    {
        icon: Lightbulb,
        title: "Our Vision",
        desc: "To be the global standard for creative innovation and technical excellence."
    },
    {
        icon: Users,
        title: "Our Team",
        desc: "A collective of passionate designers, developers, and strategists."
    }
];

export const About = () => {
    const containerRef = useRef(null);

    useGSAP(() => {
        gsap.from(".about-item", {
            scrollTrigger: {
                trigger: containerRef.current,
                start: "top 70%",
            },
            y: 50,
            opacity: 0,
            stagger: 0.2,
            duration: 1,
            ease: "power2.out"
        });
    }, { scope: containerRef });

    return (
        <section ref={containerRef} className="py-24 bg-zinc-950 text-white relative">
            {/* Decorative Separator Line */}
            <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-zinc-800 to-transparent" />

            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                    <div className="space-y-8">
                        <h2 className="about-item text-4xl md:text-5xl font-bold font-oswald uppercase tracking-wide">
                            We Don't Just Follow Trends, <br />
                            <span className="text-primary">We Set Them.</span>
                        </h2>
                        <p className="about-item text-lg text-gray-400 leading-relaxed font-light">
                            At <span className="font-bold text-white">Mutant Technologies</span>, we believe in the power of mutation – the constant evolution required to stay ahead in the digital age. We aren't just a service provider; we are your strategic partner in navigating the complex digital landscape.
                        </p>

                        <div className="space-y-6 pt-4">
                            {features.map((feature, idx) => (
                                <div key={idx} className="about-item flex gap-4 items-start group">
                                    <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 text-primary flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:border-primary/50 transition-all">
                                        <feature.icon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-bold mb-1 font-oswald tracking-wide">{feature.title}</h4>
                                        <p className="text-gray-500">{feature.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="relative h-[600px] w-full hidden lg:block rounded-3xl overflow-hidden about-item">
                        {/* Abstract visual representation instead of a photo for now */}
                        <div className="absolute inset-0 bg-black flex items-center justify-center overflow-hidden border border-zinc-800 rounded-3xl">
                            <div className="absolute w-[800px] h-[800px] bg-linear-to-r from-primary/20 to-purple-900/20 rounded-full blur-[100px] animate-pulse" />
                            <div className="relative z-10 text-white text-center p-12 border border-white/5 bg-white/5 backdrop-blur-md rounded-2xl max-w-sm">
                                <h3 className="text-4xl font-bold mb-4 font-oswald uppercase">Mutant DNA</h3>
                                <div className="w-12 h-1 bg-primary mx-auto mb-6" />
                                <p className="text-gray-300 font-mono tracking-widest text-sm uppercase space-y-2">
                                    <span className="block">Creative // Core</span>
                                    <span className="block">Adaptive // Logic</span>
                                    <span className="block">Technical // Flow</span>
                                </p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};
