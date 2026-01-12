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
        <section className="py-12 md:py-24 bg-background overflow-hidden relative">
            <div className="container mx-auto px-6 mb-16">
                <h2 className="text-4xl md:text-6xl font-oswald font-bold uppercase text-foreground mb-4">
                    Client Testimonials <span className="text-primary">That Drive Success</span>
                </h2>
                <div className="w-20 h-1 bg-gray-200 dark:bg-zinc-800"></div>
            </div>

            <div className="relative w-full overflow-hidden">
                {/* Gradient Masks */}
                <div className="absolute left-0 top-0 bottom-0 w-32 bg-linear-to-r from-gray-50 via-gray-50/50 dark:from-zinc-950 dark:via-zinc-950/50 to-transparent z-10"></div>
                <div className="absolute right-0 top-0 bottom-0 w-32 bg-linear-to-l from-gray-50 via-gray-50/50 dark:from-zinc-950 dark:via-zinc-950/50 to-transparent z-10"></div>

                <div className="flex w-fit" ref={marqueeRef}>
                    {testimonials.map((t, i) => (
                        <div key={i} className="w-[400px] shrink-0 px-6">
                            <div className="bg-white dark:bg-zinc-800/50 border border-t-[6px] border-t-primary border-x-transparent border-b-transparent p-8 rounded-2xl h-full relative group hover:-translate-y-2 transition-transform duration-300 shadow-xl dark:shadow-none">
                                <div className="flex gap-1 mb-6">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="w-5 h-5 fill-orange-500 text-orange-500" />
                                    ))}
                                </div>

                                <p className="text-gray-700 dark:text-zinc-300 text-lg leading-relaxed mb-8 flex-1">
                                    "{t.quote}"
                                </p>

                                <div className="flex items-center justify-between border-t border-gray-100 dark:border-zinc-800 pt-6">
                                    <div>
                                        <div className="text-dark-slate dark:text-white font-bold text-lg uppercase font-oswald">{t.author}</div>
                                        <div className="text-gray-500 dark:text-zinc-500 text-sm">{t.role}</div>
                                    </div>
                                    <Quote className="w-8 h-8 text-gray-300 dark:text-zinc-700 group-hover:text-primary transition-colors" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
