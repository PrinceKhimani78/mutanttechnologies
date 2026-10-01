'use client';
import { useRef, useEffect } from 'react';
import gsap from 'gsap';

interface ClientLogo {
    name: string;
    logo: string;
    bgClass: string;
    imgClass?: string;
}

const defaultClients: ClientLogo[] = [
    { 
        name: "Geeks of Digital", 
        logo: "/logos/Geeks-of-Digital-Logo.webp",
        bgClass: "bg-white border-gray-200/80 shadow-xs",
        imgClass: "max-h-12 max-w-[140px]"
    },
    { 
        name: "NB", 
        logo: "/logos/NB logo.webp",
        bgClass: "bg-white border-gray-200/80 shadow-xs",
        imgClass: "max-h-12 max-w-[135px]"
    },
    { 
        name: "Sider Road", 
        logo: "/logos/Sider-Road-Logo-Without-background-1.png", 
        bgClass: "bg-zinc-950 border-zinc-800 shadow-xs",
        imgClass: "max-h-10 max-w-[145px]"
    },
    { 
        name: "CYB", 
        logo: "/logos/cyb logo.jpg",
        bgClass: "bg-white border-gray-200/80 shadow-xs",
        imgClass: "max-h-12 max-w-[140px]"
    },
    { 
        name: "EXP Realty", 
        logo: "/logos/exp realty logo.jpg",
        bgClass: "bg-[#011233] border-[#0a1e4a] shadow-xs",
        imgClass: "max-h-14 max-w-[140px]"
    },
    { 
        name: "Greenminds India", 
        logo: "/logos/greenmindsindia logo.png",
        bgClass: "bg-white border-gray-200/80 shadow-xs",
        imgClass: "max-h-11 max-w-[145px]"
    },
    { 
        name: "Indie Collaborates", 
        logo: "/logos/indiecollaborates_logo.jpeg",
        bgClass: "bg-[#fbf1ee] border-[#ecdcd7] shadow-xs",
        imgClass: "max-h-12 max-w-[135px]"
    },
    { 
        name: "LIG Legends", 
        logo: "/logos/lig legends logo.webp", 
        bgClass: "bg-zinc-950 border-zinc-800 shadow-xs",
        imgClass: "max-h-10 max-w-[140px]"
    },
    { 
        name: "Cream", 
        logo: "/logos/logo-lockup-cream (1).avif", 
        bgClass: "bg-zinc-950 border-zinc-800 shadow-xs",
        imgClass: "max-h-9 max-w-[130px]"
    },
    { 
        name: "One Dental", 
        logo: "/logos/one dental logo.svg", 
        bgClass: "bg-zinc-950 border-zinc-800 shadow-xs",
        imgClass: "max-h-11 max-w-[145px]"
    },
    { 
        name: "Rojgari India", 
        logo: "/logos/rojgariindia logo.png",
        bgClass: "bg-white border-gray-200/80 shadow-xs",
        imgClass: "max-h-11 max-w-[145px]"
    },
    { 
        name: "Rolonda", 
        logo: "/logos/rolonda logo.webp",
        bgClass: "bg-white border-gray-200/80 shadow-xs",
        imgClass: "max-h-12 max-w-[135px]"
    },
    { 
        name: "Sally", 
        logo: "/logos/sally logo.webp",
        bgClass: "bg-white border-gray-200/80 shadow-xs",
        imgClass: "max-h-12 max-w-[135px]"
    },
    { 
        name: "Slide Jewels", 
        logo: "/logos/slide jewels logo.svg", 
        bgClass: "bg-white border-gray-200/80 shadow-xs",
        imgClass: "max-h-10 max-w-[145px]"
    },
    { 
        name: "Turning Towards", 
        logo: "/logos/turning towards logo.png",
        bgClass: "bg-[#64848e] border-[#537079] shadow-xs",
        imgClass: "max-h-14 max-w-[130px]"
    },
    { 
        name: "Ultron", 
        logo: "/logos/ultron logo.jpg",
        bgClass: "bg-white border-gray-200/80 shadow-xs",
        imgClass: "max-h-12 max-w-[140px]"
    },
    { 
        name: "Web 99", 
        logo: "/logos/web 99 logo.png",
        bgClass: "bg-white border-gray-200/80 shadow-xs",
        imgClass: "max-h-11 max-w-[145px]"
    },
    { 
        name: "XCare Pro", 
        logo: "/logos/xcarelatest.png",
        bgClass: "bg-white border-gray-200/80 shadow-xs",
        imgClass: "max-h-11 max-w-[145px]"
    },
    { 
        name: "Zaikox", 
        logo: "/logos/zaikox logo.webp",
        bgClass: "bg-zinc-950 border-zinc-800 shadow-xs",
        imgClass: "max-h-10 max-w-[135px]"
    }
];

export const ClientSlider = () => {
    const firstTrack = useRef<HTMLDivElement>(null);
    const secondTrack = useRef<HTMLDivElement>(null);
    const slider = useRef<HTMLDivElement>(null);
    const isHovered = useRef(false);
    const xPercent = useRef(0);
    const reqId = useRef<number | null>(null);

    const direction = -1;
    // Slowed down scrolling speed for smooth, calm display
    const speed = 0.015;

    useEffect(() => {
        const animate = () => {
            if (!isHovered.current) {
                if (xPercent.current <= -100) {
                    xPercent.current = 0;
                }
                if (xPercent.current > 0) {
                    xPercent.current = -100;
                }

                if (firstTrack.current && secondTrack.current) {
                    gsap.set(firstTrack.current, { xPercent: xPercent.current });
                    gsap.set(secondTrack.current, { xPercent: xPercent.current });
                }

                xPercent.current += speed * direction;
            }
            reqId.current = requestAnimationFrame(animate);
        };

        reqId.current = requestAnimationFrame(animate);

        return () => {
            if (reqId.current) {
                cancelAnimationFrame(reqId.current);
            }
        };
    }, []);

    const handleMouseEnter = () => {
        isHovered.current = true;
    };

    const handleMouseLeave = () => {
        isHovered.current = false;
    };

    return (
        <section className="py-16 md:py-20 bg-white dark:bg-[#0a0a0a] overflow-hidden">
            <div className="container mx-auto px-4 mb-10 text-center">
                <h2 className="text-3xl md:text-4xl font-bold font-oswald text-dark-slate dark:text-white uppercase">Clients Who Trust Us</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-2 font-inter">Partnering with amazing companies worldwide</p>
            </div>
            
            <div 
                className="relative flex h-[170px] md:h-[180px] overflow-hidden items-center border-y border-gray-100 dark:border-white/5 py-4"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onTouchStart={handleMouseEnter}
                onTouchEnd={handleMouseLeave}
            >
                {/* Gradient edge masks for smooth appearance */}
                <div className="absolute left-0 top-0 bottom-0 w-20 md:w-32 bg-gradient-to-r from-white dark:from-[#0a0a0a] via-white/80 dark:via-[#0a0a0a]/80 to-transparent pointer-events-none z-10" />
                <div className="absolute right-0 top-0 bottom-0 w-20 md:w-32 bg-gradient-to-l from-white dark:from-[#0a0a0a] via-white/80 dark:via-[#0a0a0a]/80 to-transparent pointer-events-none z-10" />

                <div ref={slider} className="absolute whitespace-nowrap flex items-center">
                    <div ref={firstTrack} className="flex items-center gap-6 md:gap-8 px-3 md:px-4">
                        {defaultClients.map((client, idx) => (
                            <div 
                                key={`first-${idx}`} 
                                className={`group flex-shrink-0 w-44 md:w-52 h-24 md:h-28 flex items-center justify-center rounded-xl border transition-all duration-300 hover:scale-105 hover:shadow-lg hover:border-primary/50 cursor-pointer p-3 md:p-4 overflow-hidden ${client.bgClass}`}
                            >
                                <img 
                                    src={client.logo} 
                                    alt={client.name} 
                                    className={`w-full h-full object-contain transition-all duration-500 opacity-85 group-hover:opacity-100 group-hover:scale-105 ${client.imgClass || 'max-h-12'}`}
                                />
                            </div>
                        ))}
                    </div>
                    <div ref={secondTrack} className="flex items-center gap-6 md:gap-8 px-3 md:px-4">
                        {defaultClients.map((client, idx) => (
                            <div 
                                key={`second-${idx}`} 
                                className={`group flex-shrink-0 w-44 md:w-52 h-24 md:h-28 flex items-center justify-center rounded-xl border transition-all duration-300 hover:scale-105 hover:shadow-lg hover:border-primary/50 cursor-pointer p-3 md:p-4 overflow-hidden ${client.bgClass}`}
                            >
                                <img 
                                    src={client.logo} 
                                    alt={client.name} 
                                    className={`w-full h-full object-contain transition-all duration-500 opacity-85 group-hover:opacity-100 group-hover:scale-105 ${client.imgClass || 'max-h-12'}`}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};
