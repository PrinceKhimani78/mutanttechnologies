'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useRef, useState, useEffect } from 'react';

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
            for (let i = 0; i < 400; i++) {
                const angle = Math.random() * Math.PI * 2;
                const dist = Math.random() * 20; // Start close to center
                particles.push({
                    x: centerX + Math.cos(angle) * dist,
                    y: centerY + Math.sin(angle) * dist,
                    angle: angle,
                    speed: 2 + Math.random() * 15, // Varied speeds for explosion
                    size: 1 + Math.random() * 3, // Small dash-like sizes
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

        // 1. Initial State: Fade in particles briefly in center
        tl.to(particles, {
            alpha: 1,
            duration: 0.5,
            stagger: { amount: 0.2, from: "random" },
            ease: "power2.out",
            onUpdate: render
        })
            .addLabel("explode")

            // 2. The Explosion (Liftoff)
            .call(triggerHero, [], "explode+=0.1") // Trigger hero just as it explodes
            .to(particles, {
                x: (i) => particles[i].x + Math.cos(particles[i].angle) * (Math.max(width, height) * 1.5),
                y: (i) => particles[i].y + Math.sin(particles[i].angle) * (Math.max(width, height) * 1.5),
                duration: 1.8,
                ease: "power4.out",
                onUpdate: render
            }, "explode")
            .to(particles, {
                alpha: 0,
                duration: 1.0,
                ease: "power2.in",
                onUpdate: render
            }, "explode+=0.5")

            // 3. Fade out container
            .to(containerRef.current, {
                opacity: 0,
                duration: 0.8,
                ease: "power2.inOut"
            }, "explode+=0.5");


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
            {/* Logo or specialized loader could go here, centered */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 animate-pulse">
                {/* Optional central element before explosion */}
            </div>
            <canvas ref={canvasRef} className="absolute inset-0" />
        </div>
    );
};
