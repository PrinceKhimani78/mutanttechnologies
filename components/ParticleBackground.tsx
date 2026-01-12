'use client';

import { useEffect, useRef } from 'react';

export const ParticleBackground = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;
        let centerX = width / 2;
        let centerY = height / 2;

        const particles: Particle[] = [];
        const particleCount = 150; // Increased density for circular effect
        const mouse = { x: -1000, y: -1000 };
        const repulsionRadius = 200;

        class Particle {
            // Orbital Physics
            angle: number;
            baseRadius: number; // The target radius in the orbit
            currentRadius: number; // For entrance animation
            speed: number;

            // Visuals
            size: number;
            color: string;

            // Interaction (Elastic Offset)
            interactX: number;
            interactY: number;

            constructor() {
                this.angle = Math.random() * Math.PI * 2;

                // Distribute particles to fill the screen, clustering slightly near center
                // Random radius from 50px up to corner distance
                const maxDist = Math.sqrt(Math.pow(width / 2, 2) + Math.pow(height / 2, 2));
                this.baseRadius = 50 + Math.random() * maxDist;

                // Start OUTSIDE the screen for entrance effect
                this.currentRadius = maxDist + 200 + Math.random() * 500;

                // Rotation speed depends on radius (outer particles move slower for parallax feel)
                this.speed = (0.002 + Math.random() * 0.003) * (Math.random() < 0.5 ? 1 : -1);

                this.size = Math.random() * 2 + 1;
                this.color = `rgba(252, 98, 3, ${Math.random() * 0.5 + 0.3})`;

                this.interactX = 0;
                this.interactY = 0;
            }

            draw(x: number, y: number) {
                if (!ctx) return;
                ctx.beginPath();
                ctx.arc(x, y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.fill();
            }

            update() {
                // 1. Orbital Movement
                this.angle += this.speed;

                // 2. Entrance Animation (Smooth lerp from outer radius to base radius)
                // "Ease out" effect
                this.currentRadius += (this.baseRadius - this.currentRadius) * 0.03;

                // Calculate base position from orbit
                const orbitX = centerX + Math.cos(this.angle) * this.currentRadius;
                const orbitY = centerY + Math.sin(this.angle) * this.currentRadius;

                // 3. Mouse Interaction (Elastic Repulsion)
                const dx = mouse.x - orbitX;
                const dy = mouse.y - orbitY;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < repulsionRadius) {
                    const force = (repulsionRadius - distance) / repulsionRadius;
                    const angleToMouse = Math.atan2(dy, dx);

                    // Push away from mouse
                    // We target a position away from the mouse
                    const repelStrength = 50 * force;

                    // Add force to interaction offset (pushing opposite to angleToMouse)
                    this.interactX -= Math.cos(angleToMouse) * repelStrength * 0.5;
                    this.interactY -= Math.sin(angleToMouse) * repelStrength * 0.5;
                }

                // Elastic Return (Dampening) with spring physics approximation
                // Simply lerping back to 0 gives a "spring back" feel
                this.interactX *= 0.92; // Friction 
                this.interactY *= 0.92;

                // 4. Final Position
                const x = orbitX + this.interactX;
                const y = orbitY + this.interactY;

                this.draw(x, y);
            }
        }

        const init = () => {
            particles.length = 0;
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle());
            }
        };

        const animate = () => {
            if (!ctx) return;
            // Trail effect (optional, using clearRect for clean look requested)
            ctx.clearRect(0, 0, width, height);

            particles.forEach(p => p.update());
            requestAnimationFrame(animate);
        };

        init();
        animate();

        // Event Listeners
        const handleResize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            centerX = width / 2;
            centerY = height / 2;
            init(); // Re-init to handle new dimensions properly
        };

        const handleMouseMove = (e: MouseEvent) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        };

        const handleMouseLeave = () => {
            mouse.x = -1000;
            mouse.y = -1000;
        }

        window.addEventListener('resize', handleResize);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseout', handleMouseLeave);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseout', handleMouseLeave);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 pointer-events-none z-0"
            style={{ opacity: 0.8 }}
        />
    );
};
