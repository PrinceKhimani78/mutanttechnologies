'use client';
import { useRef, useEffect } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

export const ServiceMarquee = () => {
    const firstText = useRef<HTMLDivElement>(null);
    const secondText = useRef<HTMLDivElement>(null);
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

        gsap.set(firstText.current, { xPercent: xPercent });
        gsap.set(secondText.current, { xPercent: xPercent });

        xPercent += 0.05 * direction; // Speed
        requestAnimationFrame(animate);
    }

    return (
        <div className="relative flex h-[200px] overflow-hidden bg-gray-50 dark:bg-dark-slate/10 items-center py-10">
            <div ref={slider} className="absolute whitespace-nowrap flex">
                <p ref={firstText} className="text-[10vw] font-oswald font-bold text-dark-slate/5 dark:text-white/5 uppercase pr-8">
                    Web Development • SEO • Digital Marketing • Cyber Security •
                </p>
                <p ref={secondText} className="text-[10vw] font-oswald font-bold text-dark-slate/5 dark:text-white/5 uppercase pr-8">
                    Web Development • SEO • Digital Marketing • Cyber Security •
                </p>
            </div>
        </div>
    );
};
