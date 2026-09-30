'use client';
import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

const defaultClients = [
    { name: "Geeks of Digital", logo: "/logos/Geeks-of-Digital-Logo.webp" },
    { name: "NB", logo: "/logos/NB logo.webp" },
    { name: "Sider Road", logo: "/logos/Sider-Road-Logo-Without-background-1.png", needsDarkBg: true },
    { name: "CYB", logo: "/logos/cyb logo.jpg" },
    { name: "EXP Realty", logo: "/logos/exp realty logo.jpg" },
    { name: "Greenminds India", logo: "/logos/greenmindsindia logo.png" },
    { name: "Indie Collaborates", logo: "/logos/indiecollaborates_logo.jpeg" },
    { name: "LIG Legends", logo: "/logos/lig legends logo.webp", needsDarkBg: true },
    { name: "Cream", logo: "/logos/logo-lockup-cream (1).avif", needsDarkBg: true },
    { name: "One Dental", logo: "/logos/one dental logo.svg", needsDarkBg: true },
    { name: "Rojgari India", logo: "/logos/rojgariindia logo.png" },
    { name: "Rolonda", logo: "/logos/rolonda logo.webp" },
    { name: "Sally", logo: "/logos/sally logo.webp" },
    { name: "Slide Jewels", logo: "/logos/slide jewels logo.svg", needsDarkBg: true },
    { name: "Turning Towards", logo: "/logos/turning towards logo.png" },
    { name: "Ultron", logo: "/logos/ultron logo.jpg" },
    { name: "Web 99", logo: "/logos/web 99 logo.png" },
    { name: "XCare Pro", logo: "/logos/xcarelatest.png" },
    { name: "Zaikox", logo: "/logos/zaikox logo.webp" }
];

export const ClientSlider = () => {
    const firstTrack = useRef<HTMLDivElement>(null);
    const secondTrack = useRef<HTMLDivElement>(null);
    const slider = useRef<HTMLDivElement>(null);

    let xPercent = 0;
    let direction = -1;

    useGSAP(() => {
        requestAnimationFrame(animate);
    }, []);

    const animate = () => {
        if (xPercent <= -100) {
            xPercent = 0;
        }
        if (xPercent > 0) {
            xPercent = -100;
        }

        gsap.set(firstTrack.current, { xPercent: xPercent });
        gsap.set(secondTrack.current, { xPercent: xPercent });

        xPercent += 0.05 * direction; // Speed
        requestAnimationFrame(animate);
    }

    return (
        <section className="py-16 bg-white dark:bg-[#0a0a0a]">
            <div className="container mx-auto px-4 mb-10 text-center">
                <h2 className="text-3xl md:text-4xl font-bold font-oswald text-dark-slate dark:text-white uppercase">Clients Who Trust Us</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-2 font-inter">Partnering with amazing companies worldwide</p>
            </div>
            
            <div className="relative flex h-[160px] overflow-hidden items-center border-y border-gray-100 dark:border-white/5 py-4">
                <div ref={slider} className="absolute whitespace-nowrap flex items-center">
                    <div ref={firstTrack} className="flex items-center gap-8 px-4">
                        {defaultClients.map((client, idx) => (
                            <div key={`first-${idx}`} className={`group flex-shrink-0 w-48 h-28 flex items-center justify-center rounded-xl shadow-sm border transition-all duration-300 hover:shadow-md hover:border-primary/50 cursor-pointer p-4 overflow-hidden ${client.needsDarkBg ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
                                <img 
                                    src={client.logo} 
                                    alt={client.name} 
                                    className="w-full h-full object-contain transition-all duration-500 opacity-70 grayscale group-hover:grayscale-0 group-hover:opacity-100"
                                />
                            </div>
                        ))}
                    </div>
                    <div ref={secondTrack} className="flex items-center gap-8 px-4">
                        {defaultClients.map((client, idx) => (
                            <div key={`second-${idx}`} className={`group flex-shrink-0 w-48 h-28 flex items-center justify-center rounded-xl shadow-sm border transition-all duration-300 hover:shadow-md hover:border-primary/50 cursor-pointer p-4 overflow-hidden ${client.needsDarkBg ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
                                <img 
                                    src={client.logo} 
                                    alt={client.name} 
                                    className="w-full h-full object-contain transition-all duration-500 opacity-70 grayscale group-hover:grayscale-0 group-hover:opacity-100"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};
