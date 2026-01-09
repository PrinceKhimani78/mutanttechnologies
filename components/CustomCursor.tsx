'use client';
import { useEffect, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

export const CustomCursor = () => {
    const cursorRef = useRef<HTMLDivElement>(null);
    const followerRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        const xTo = gsap.quickTo(cursorRef.current, "x", { duration: 0.1, ease: "power3" });
        const yTo = gsap.quickTo(cursorRef.current, "y", { duration: 0.1, ease: "power3" });
        const xToFollower = gsap.quickTo(followerRef.current, "x", { duration: 0.6, ease: "power3" });
        const yToFollower = gsap.quickTo(followerRef.current, "y", { duration: 0.6, ease: "power3" });

        const moveShape = (e: MouseEvent) => {
            xTo(e.clientX);
            yTo(e.clientY);
            xToFollower(e.clientX);
            yToFollower(e.clientY);
        };

        window.addEventListener("mousemove", moveShape);

        // Hover effects
        const viewButtons = document.querySelectorAll('button, a, .cursor-hover');
        viewButtons.forEach((el) => {
            el.addEventListener("mouseenter", () => {
                gsap.to(followerRef.current, { scale: 3, opacity: 0.5, backgroundColor: "#FC6203", duration: 0.3 });
            });
            el.addEventListener("mouseleave", () => {
                gsap.to(followerRef.current, { scale: 1, opacity: 1, backgroundColor: "transparent", duration: 0.3 });
            });
        });

        return () => window.removeEventListener("mousemove", moveShape);
    }, []);

    return (
        <>
            <div
                ref={cursorRef}
                className="fixed w-3 h-3 bg-primary rounded-full pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 hidden md:block"
            />
            <div
                ref={followerRef}
                className="fixed w-8 h-8 border border-primary/50 rounded-full pointer-events-none z-[9998] -translate-x-1/2 -translate-y-1/2 hidden md:block transition-colors"
            />
        </>
    );
};
