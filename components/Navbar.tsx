'use client';
import { useState, useRef, useEffect } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, ArrowRight, ChevronDown } from 'lucide-react';
import { Button } from './ui/button';
import { ThemeToggle } from './ThemeToggle';
import { cn } from '@/lib/utils';
import { trackEvent } from '@/lib/gtm';

const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Services', href: '/services' },
    { name: 'Portfolio', href: '/portfolio' },
    { name: 'Blog', href: '/blog' },
];

const servicesLinks = [
    { name: "Web Development", href: "/services/web-development" },
    { name: "App Development", href: "/services/app-development" },
    { name: "Digital Marketing", href: "/services/digital-marketing" },
    { name: "Graphic Design", href: "/services/graphic-design" },
    { name: "SEO Optimization", href: "/services/seo" },
    { name: "GEO", href: "/services/geo" },
    { name: "Brand Identity", href: "/services/brand-identity" },
    { name: "Cyber Security", href: "/services/cyber-security" },
    { name: "AI Automations", href: "/services/ai-automations" },
];

export const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isServicesOpen, setIsServicesOpen] = useState(false);
    const navRef = useRef(null);
    const menuRef = useRef(null);
    const tlRef = useRef<gsap.core.Timeline | null>(null);

    // Animate navbar on load
    useGSAP(() => {
        gsap.from(navRef.current, {
            y: -100,
            opacity: 0,
            duration: 1,
            ease: 'power4.out',
        });
    }, []);

    const [contactEmail, setContactEmail] = useState('hello@mutant.tech');
    useEffect(() => {
        const fetchSettings = async () => {
            const { data } = await import('@/lib/cms').then(mod => mod.getSiteSettings());
            if (data?.contact_email) {
                setContactEmail(data.contact_email);
            }
        };
        fetchSettings();
    }, []);

    // Mobile Menu Animation
    useGSAP(() => {
        if (!menuRef.current) return;

        tlRef.current = gsap.timeline({ paused: true })
            .to(menuRef.current, {
                x: '0%',
                duration: 0.6,
                ease: 'power3.inOut',
            })
            .from('.mobile-nav-link', {
                y: 50,
                opacity: 0,
                duration: 0.5,
                stagger: 0.1,
                ease: 'power3.out',
            }, '-=0.3')
            .from('.mobile-nav-footer', {
                y: 20,
                opacity: 0,
                duration: 0.4,
                ease: 'power3.out',
            }, '-=0.2');

    }, { scope: menuRef });

    useEffect(() => {
        if (tlRef.current) {
            if (isOpen) {
                tlRef.current.play();
                document.body.style.overflow = 'hidden'; // Prevent scrolling
            } else {
                tlRef.current.reverse();
                document.body.style.overflow = '';
            }
        }
    }, [isOpen]);


    return (
        <>
            <nav
                ref={navRef}
                className={cn(
                    "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
                    "bg-background/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 py-4"
                )}
            >
                <div className="w-full max-w-[2400px] mx-auto px-6 flex justify-between items-center">
                    {/* Logo */}
                    <Link href="/" className="relative z-50 w-48 h-12 flex items-center" onClick={() => setIsOpen(false)}>
                        <Image
                            src="/logo.png"
                            alt="Mutant Technologies"
                            fill
                            className="object-contain object-left transition-all duration-300 dark:brightness-[2]"
                            priority
                        />
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-16">
                        {navLinks.map((link) => {
                            if (link.name === "Services") {
                                return (
                                    <div key={link.name} className="relative group perspective">
                                        <button className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1">
                                            {link.name} <span className="text-[10px] opacity-50">▼</span>
                                        </button>

                                        {/* Dropdown */}
                                        <div className="absolute top-full text-left left-1/2 -translate-x-1/2 mt-2 w-64 bg-background border border-gray-100 dark:border-gray-800 shadow-xl rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top group-hover:translate-y-0 translate-y-2 p-2">
                                            <div className="flex flex-col gap-1">
                                                {servicesLinks.map((subItem) => (
                                                    <Link
                                                        key={subItem.name}
                                                        href={subItem.href}
                                                        className="px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-primary rounded-lg transition-colors font-medium"
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
                        <ThemeToggle />
                        <Button
                            href="/contact"
                            size="sm"
                            onClick={() => trackEvent('cta_click', { location: 'navbar', label: 'Get Started' })}
                        >
                            Get Started
                        </Button>
                    </div>

                    {/* Mobile Toggle */}
                    <div className="md:hidden flex items-center gap-4 relative z-50">
                        <ThemeToggle />
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-zinc-800 text-foreground hover:bg-primary hover:text-white transition-all duration-300"
                        >
                            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            <div
                ref={menuRef}
                className="fixed inset-0 z-40 bg-background/95 backdrop-blur-3xl translate-x-full"
            >
                <div className="h-full flex flex-col justify-center px-8 sm:px-12 pt-32">
                    <div className="flex flex-col gap-5">
                        {navLinks.map((link) => (
                            <div key={link.name} className="mobile-nav-link">
                                {link.name === "Services" ? (
                                    <div className="flex flex-col">
                                        <button
                                            onClick={() => setIsServicesOpen(!isServicesOpen)}
                                            className="flex items-center justify-between text-2xl sm:text-4xl font-oswald font-bold uppercase text-foreground hover:text-primary transition-colors w-full"
                                        >
                                            {link.name}
                                            <ChevronDown className={cn("w-5 h-5 transition-transform duration-300", isServicesOpen ? "rotate-180" : "")} />
                                        </button>

                                        <div className={cn(
                                            "grid transition-all duration-300 ease-in-out overflow-hidden",
                                            isServicesOpen ? "grid-rows-[1fr] mt-6 mb-2" : "grid-rows-[0fr]"
                                        )}>
                                            <div className="min-h-0 flex flex-col gap-3 pl-4 border-l-2 border-primary/20">
                                                {servicesLinks.map((subItem) => (
                                                    <Link
                                                        key={subItem.name}
                                                        href={subItem.href}
                                                        onClick={() => setIsOpen(false)}
                                                        className="text-lg text-gray-500 dark:text-zinc-400 hover:text-primary transition-colors font-medium flex items-center gap-2"
                                                    >
                                                        <span className="w-1.5 h-1.5 rounded-full bg-primary/50"></span>
                                                        {subItem.name}
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <Link
                                        href={link.href}
                                        onClick={() => setIsOpen(false)}
                                        className="text-2xl sm:text-4xl font-oswald font-bold uppercase text-foreground hover:text-primary transition-colors block"
                                    >
                                        {link.name}
                                    </Link>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="mobile-nav-footer mt-auto pb-12 border-t border-gray-200 dark:border-zinc-800 pt-8 flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
                        <div className="flex flex-col gap-2">
                            <span className="text-sm text-gray-500 dark:text-zinc-500 uppercase tracking-widest font-mono">Get in touch</span>
                            <a
                                href={`mailto:${contactEmail}`}
                                className="text-xl font-bold text-foreground hover:text-primary transition-colors"
                                onClick={() => trackEvent('contact_click', { type: 'email', value: contactEmail })}
                            >
                                {contactEmail}
                            </a>
                        </div>
                        <Button href="/contact" withIcon={true} className="w-auto text-sm sm:text-base px-6 py-3">
                            Start Project
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
};
