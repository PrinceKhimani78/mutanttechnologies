'use client';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Quote, Star } from 'lucide-react';
import { useRef } from 'react';

const testimonials = [
    {
        quote: "Mutant Technologies delivered on every promise. Their in-depth understanding of digital marketing has propelled our product to new heights.",
        author: "Issa Yattassaye",
        role: "Product Manager"
    },
    {
        quote: "From start to finish, Mutant Technologies provided stellar service and results. Their dedication and skill have made a remarkable difference for us.",
        author: "Kim Loah",
        role: "Manager"
    },
    {
        quote: "The team at Mutant Technologies transformed our online strategy with their expertise and creativity. Their commitment to our growth has been exceptional.",
        author: "Nicolas Boucher",
        role: "Head Marketing"
    },
    {
        quote: "Working with Mutant Technologies has been a game-changer. Their tailored approach and strategic insights have significantly enhanced our digital presence.",
        author: "Rohit Maharjan",
        role: "Head Marketing"
    }
];

export const Testimonials = () => {
    const marqueeRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        // Clone the list to create seamless loop
        const list = marqueeRef.current;
        if (list) {
            const content = list.innerHTML;
            list.innerHTML = content + content + content + content; // Repeat enough times

            gsap.to(list, {
                xPercent: -50,
                ease: "none",
                duration: 60,
                repeat: -1
            });
        }
    }, { scope: marqueeRef });

    return (
        <section className="py-24 bg-zinc-950 overflow-hidden relative">
            <div className="container mx-auto px-6 mb-16">
                <h2 className="text-4xl md:text-6xl font-oswald font-bold uppercase text-white mb-4">
                    Client Testimonials <span className="text-primary">That Drive Success</span>
                </h2>
                <div className="w-20 h-1 bg-zinc-800"></div>
            </div>

            <div className="relative w-full overflow-hidden">
                {/* Gradient Masks */}
                <div className="absolute left-0 top-0 bottom-0 w-32 bg-linear-to-r from-zinc-950 to-transparent z-10"></div>
                <div className="absolute right-0 top-0 bottom-0 w-32 bg-linear-to-l from-zinc-950 to-transparent z-10"></div>

                <div className="flex w-fit" ref={marqueeRef}>
                    {testimonials.map((t, i) => (
                        <div key={i} className="w-[400px] shrink-0 px-6">
                            <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-3xl h-full relative group hover:border-zinc-700 transition-colors flex flex-col">
                                <div className="flex gap-1 mb-6">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="w-5 h-5 fill-orange-500 text-orange-500" />
                                    ))}
                                </div>

                                <p className="text-zinc-300 text-lg leading-relaxed mb-8 flex-1">
                                    "{t.quote}"
                                </p>

                                <div className="flex items-center justify-between border-t border-zinc-800 pt-6">
                                    <div>
                                        <div className="text-white font-bold text-lg uppercase font-oswald">{t.author}</div>
                                        <div className="text-zinc-500 text-sm">{t.role}</div>
                                    </div>
                                    <Quote className="w-8 h-8 text-zinc-700 group-hover:text-primary transition-colors" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
