'use client';
import { useRef, useEffect, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

export const ServiceMarquee = ({ text: propText, scroller }: { text?: string; scroller?: string }) => {
    const firstText = useRef<HTMLDivElement>(null);
    const secondText = useRef<HTMLDivElement>(null);
    const slider = useRef<HTMLDivElement>(null);
    const [text, setText] = useState(propText || "Web Development • SEO • Digital Marketing • Cyber Security •");

    let xPercent = 0;
    let direction = -1;

    // Update state when prop changes (for live preview)
    useEffect(() => {
        if (propText) {
            setText(propText);
        }
    }, [propText]);

    useEffect(() => {
        // Only fetch if NOT in preview mode (heuristic: no propText)
        if (!propText) {
            const fetchSettings = async () => {
                const { getSiteSettings } = await import('@/lib/cms');
                const { data } = await getSiteSettings();
                if (data?.marquee_text) {
                    let marquee = data.marquee_text.trim();
                    if (!marquee.endsWith('•') && !marquee.endsWith('|')) {
                        marquee += ' •';
                    }
                    setText(marquee);
                }
            };
            fetchSettings();
        }
    }, [propText]);

    useGSAP(() => {
        // Disable GSAP animations in Visual Editor to prevent errors
        if (scroller) {
            console.log('ServiceMarquee: Skipping GSAP animations in Visual Editor context');
            return;
        }
        requestAnimationFrame(animate);
    }, []);

    const animate = () => {
        // Skip animation if in Visual Editor
        if (scroller) return;

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
        <div className="relative flex h-[250px] md:h-[350px] overflow-hidden bg-gray-50 dark:bg-dark-slate/10 items-center py-12 md:py-20">
            <div ref={slider} className="absolute whitespace-nowrap flex items-center">
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
