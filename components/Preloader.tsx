'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useRef, useState, useEffect } from 'react';
import Image from 'next/image';

export const Preloader = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        // Prevent scrolling while loading
        document.body.style.overflow = 'hidden';

        // Dispatch event for Hero listener when complete
        const triggerHero = () => {
            const event = new CustomEvent('preloader-complete');
            window.dispatchEvent(event);
        };

        // Canvas setup
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;

        // Particle System
        const particles: { x: number, y: number, angle: number, speed: number, size: number, color: string, alpha: number }[] = [];
        const colors = ['#4285F4', '#EA4335', '#FBBC04', '#34A853', '#FFFFFF', '#888888']; // Google colors + white/grey

        const createParticles = () => {
            const centerX = width / 2;
            const centerY = height / 2;

            // Create particles in a radial pattern
            for (let i = 0; i < 1200; i++) {
                const angle = Math.random() * Math.PI * 2;
                const dist = Math.random() * 20; // Start close to center
                particles.push({
                    x: centerX + Math.cos(angle) * dist,
                    y: centerY + Math.sin(angle) * dist,
                    angle: angle,
                    speed: 4 + Math.random() * 25, // Faster, bigger explosion
                    size: 1 + Math.random() * 4, // Slightly varied sizes
                    color: colors[Math.floor(Math.random() * colors.length)],
                    alpha: 0
                });
            }
        };

        createParticles();

        const render = () => {
            if (!ctx) return;
            ctx.clearRect(0, 0, width, height);

            particles.forEach(p => {
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.angle);
                ctx.fillStyle = p.color;
                ctx.globalAlpha = p.alpha;
                ctx.fillRect(0, 0, p.size * 3, p.size); // Rectangular dash
                ctx.restore();
            });
        };

        // GSAP Animation Sequence
        const tl = gsap.timeline({
            onComplete: () => {
                setIsComplete(true);
                document.body.style.overflow = '';
            }
        });

        // Initial setup
        gsap.set(".preloader-logo", { opacity: 0, scale: 0.8 });

        tl
            // 1. Logo Fades In & Scales Up
            .to(".preloader-logo", {
                opacity: 1,
                scale: 1,
                duration: 1.0,
                ease: "power2.out"
            })
            // 2. Anticipation (Breath in)
            .to(".preloader-logo", {
                scale: 0.9,
                duration: 0.4,
                ease: "power2.in"
            })
            .addLabel("explode")

            // 3. The Explosion (Particles + Logo Disappears)
            // Fade in particles instantly at center
            .to(particles, {
                alpha: 1,
                duration: 0.1,
                stagger: { amount: 0.1, from: "random" },
            }, "explode")

            // Move particles (Explosion)
            .to(particles, {
                x: (i) => particles[i].x + Math.cos(particles[i].angle) * (Math.max(width, height) * 1.5),
                y: (i) => particles[i].y + Math.sin(particles[i].angle) * (Math.max(width, height) * 1.5),
                duration: 1.8,
                ease: "power4.out",
                onUpdate: render
            }, "explode")

            // Logo vanishes into the explosion (Zoom out + Fade)
            .to(".preloader-logo", {
                scale: 1.5,
                opacity: 0,
                filter: 'blur(10px)',
                duration: 0.4,
                ease: "power2.out"
            }, "explode")

            // Trigger Hero animation slightly after explosion starts
            .call(triggerHero, [], "explode+=0.2")

            // Fade out particles
            .to(particles, {
                alpha: 0,
                duration: 1.0,
                ease: "power2.in",
                onUpdate: render
            }, "explode+=0.5")

            // 4. Fade out container
            .to(containerRef.current, {
                opacity: 0,
                duration: 0.8,
                ease: "power2.inOut"
            }, "explode+=0.8");


        // Resize handler
        const handleResize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            render();
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            tl.kill();
        };
    }, []);

    if (isComplete) return null;

    return (
        <div ref={containerRef} className="fixed inset-0 z-[100] bg-white dark:bg-black flex items-center justify-center pointer-events-none">
            {/* Logo */}
            <div className="preloader-logo relative z-20 w-32 h-32 md:w-40 md:h-40 flex items-center justify-center">
                <Image
                    src="/logoAnimation.jpg"
                    alt="Logo"
                    fill
                    className="object-contain drop-shadow-[0_0_15px_rgba(0,0,0,0.3)] dark:drop-shadow-[0_0_15px_rgba(255,255,255,0.5)] mix-blend-multiply dark:mix-blend-screen"
                    priority
                />
            </div>
            <canvas ref={canvasRef} className="absolute inset-0 z-10" />
        </div>
    );
};
