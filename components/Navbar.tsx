'use client';
import { useState, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Services', href: '/services' },
    { name: 'Portfolio', href: '/portfolio' },
    { name: 'Blog', href: '/blog' },
];

export const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const navRef = useRef(null);

    // Animate navbar on load
    useGSAP(() => {
        gsap.from(navRef.current, {
            y: -100,
            opacity: 0,
            duration: 1,
            ease: 'power4.out',
        });
    }, []);

    return (
        <nav
            ref={navRef}
            className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
                "bg-white/80 backdrop-blur-md border-b border-gray-100 py-4"
            )}
        >
            <div className="container mx-auto px-6 flex justify-between items-center">
                {/* Logo */}
                <Link href="/" className="relative z-10 w-48 h-12 flex items-center">
                    <img src="/logo.png" alt="Mutant Technologies" className="w-full h-full object-contain object-left" />
                </Link>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => {
                        if (link.name === "Services") {
                            return (
                                <div key={link.name} className="relative group perspective">
                                    <button className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1">
                                        {link.name} <span className="text-[10px] opacity-50">▼</span>
                                    </button>

                                    {/* Dropdown */}
                                    <div className="absolute top-full text-left left-1/2 -translate-x-1/2 mt-2 w-64 bg-white border border-gray-100 shadow-xl rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top group-hover:translate-y-0 translate-y-2 p-2">
                                        <div className="flex flex-col gap-1">
                                            {[
                                                { name: "Web Development", href: "/services/web-development" },
                                                { name: "SEO Optimization", href: "/services/seo" },
                                                { name: "Digital Marketing", href: "/services/digital-marketing" },
                                                { name: "Cyber Security", href: "/services/cyber-security" },
                                                { name: "UI/UX Design", href: "/services/ui-ux-design" },
                                            ].map((subItem) => (
                                                <Link
                                                    key={subItem.name}
                                                    href={subItem.href}
                                                    className="px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary rounded-lg transition-colors font-medium"
                                                >
                                                    {subItem.name}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            );
                        }
                        return (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="text-sm font-medium hover:text-primary transition-colors relative group"
                            >
                                {link.name}
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
                            </Link>
                        );
                    })}
                    <Button href="/contact" size="sm">Get Started</Button>
                </div>

                {/* Mobile Toggle */}
                <button
                    className="md:hidden"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-gray-100 shadow-xl py-8 px-6 flex flex-col gap-4 overflow-y-auto max-h-[80vh]">
                    {navLinks.map((link) => (
                        <div key={link.name} className="flex flex-col">
                            {link.name === "Services" ? (
                                <div className="space-y-3">
                                    <div className="text-lg font-medium text-dark-slate opacity-50">Services</div>
                                    <div className="pl-4 border-l-2 border-primary/20 flex flex-col gap-3">
                                        {[
                                            { name: "Web Development", href: "/services/web-development" },
                                            { name: "SEO Optimization", href: "/services/seo" },
                                            { name: "Digital Marketing", href: "/services/digital-marketing" },
                                            { name: "Cyber Security", href: "/services/cyber-security" },
                                            { name: "UI/UX Design", href: "/services/ui-ux-design" },
                                        ].map((subItem) => (
                                            <Link
                                                key={subItem.name}
                                                href={subItem.href}
                                                onClick={() => setIsOpen(false)}
                                                className="text-base text-gray-600 hover:text-primary"
                                            >
                                                {subItem.name}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <Link
                                    href={link.href}
                                    onClick={() => setIsOpen(false)}
                                    className="text-lg font-medium text-dark-slate hover:text-primary"
                                >
                                    {link.name}
                                </Link>
                            )}
                        </div>
                    ))}
                    <Button href="/contact" className="w-full mt-4">Get Started</Button>
                </div>
            )}
        </nav>
    );
};
