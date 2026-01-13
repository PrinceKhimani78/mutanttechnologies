'use client';
import { useRef, useEffect, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

export const ServiceMarquee = () => {
    const firstText = useRef<HTMLDivElement>(null);
    const secondText = useRef<HTMLDivElement>(null);
    const slider = useRef<HTMLDivElement>(null);
    const [text, setText] = useState("Web Development • SEO • Digital Marketing • Cyber Security •");

    let xPercent = 0;
    let direction = -1;

    useEffect(() => {
        const fetchSettings = async () => {
            const { getSiteSettings } = await import('@/lib/cms');
            const { data } = await getSiteSettings();
            if (data?.marquee_text) {
                // Ensure text ends with a separator for seamless loop visually
                let marquee = data.marquee_text.trim();
                if (!marquee.endsWith('•') && !marquee.endsWith('|')) {
                    marquee += ' •';
                }
                setText(marquee);
            }
        };
        fetchSettings();
    }, []);

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
                    {text}
                </p>
                <p ref={secondText} className="text-[10vw] font-oswald font-bold text-dark-slate/5 dark:text-white/5 uppercase pr-8">
                    {text}
                </p>
            </div>
        </div>
    );
};
