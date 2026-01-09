'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useRef, useState } from 'react';

export const Preloader = () => {
    const containerRef = useRef(null);
    const progressRef = useRef(null);
    const [isComplete, setIsComplete] = useState(false);

    useGSAP(() => {
        const tl = gsap.timeline({
            onComplete: () => setIsComplete(true)
        });

        // Initial state
        gsap.set(progressRef.current, { scaleX: 0, transformOrigin: "left center" });

        // Animate Progress Bar
        tl.to(progressRef.current, {
            scaleX: 1,
            duration: 1.5,
            ease: "power2.inOut"
        })
            .to(containerRef.current, {
                yPercent: -100,
                duration: 0.8,
                ease: "power4.inOut"
            });

    }, { scope: containerRef });

    if (isComplete) return null;

    return (
        <div ref={containerRef} className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center">
            {/* Logo */}
            <div className="w-48 mb-12">
                <img src="/logo.png" alt="Mutant Technologies" className="w-full h-auto object-contain invert hue-rotate-180 brightness-110" />
            </div>

            {/* Progress Bar Container */}
            <div className="w-64 h-[2px] bg-zinc-800 rounded-full overflow-hidden relative">
                {/* Progress Fill */}
                <div ref={progressRef} className="absolute top-0 left-0 w-full h-full bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.8)]"></div>
            </div>
        </div>
    );
};
