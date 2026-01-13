'use client';

import { Service } from '@/lib/types';
import Link from 'next/link';
import Image from 'next/image';
import { trackEvent } from '@/lib/gtm';

interface FooterClientProps {
    services: Service[];
}

export const FooterClient = ({ services }: FooterClientProps) => {
    return (
        <footer className="bg-gray-100 dark:bg-zinc-950 pt-20 pb-10 relative overflow-hidden text-dark-slate dark:text-white transition-colors duration-300">
            {/* Gradient Separator */}
            <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-primary to-transparent opacity-50" />

            {/* Background Glow */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/5 dark:bg-primary/10 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-20">
                    {/* Brand Column */}
                    <div className="max-w-md">
                        <div className="mb-8 w-48 relative h-12">
                            <Image
                                src="/logo.png"
                                alt="Mutant Technologies"
                                fill
                                className="object-contain object-left dark:brightness-0 dark:invert transition-all duration-300"
                            />
                        </div>
                        <h2 className="text-4xl md:text-5xl font-oswald font-bold uppercase leading-tight mb-6">
                            Let's Build Something <br /><span className="text-primary">Extraordinary.</span>
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed font-light">
                            We blend creativity and technology to boost your digital presence. From stunning websites to smart marketing.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="flex gap-16 flex-wrap">
                        <div>
                            <h3 className="font-oswald font-bold text-lg mb-6 tracking-widest uppercase text-gray-500">Services</h3>
                            <ul className="space-y-4 text-gray-600 dark:text-gray-300">
                                {services.slice(0, 5).map((service) => (
                                    <li key={service.slug}>
                                        <Link href={`/services/${service.slug}`} className="hover:text-primary transition-colors">
                                            {service.title}
                                        </Link>
                                    </li>
                                ))}
                                <li>
                                    <Link href="/services" className="text-primary hover:underline text-sm opacity-80">View All Services &rarr;</Link>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-oswald font-bold text-lg mb-6 tracking-widest uppercase text-gray-500">Company</h3>
                            <ul className="space-y-4 text-gray-600 dark:text-gray-300">
                                <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
                                <li><Link href="/portfolio" className="hover:text-primary transition-colors">Our Work</Link></li>
                                <li><Link href="/blog" className="hover:text-primary transition-colors">Blog</Link></li>
                                <li><Link href="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-200 dark:border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
                    <p>&copy; {new Date().getFullYear()} Mutant Technologies. All rights reserved.</p>
                    <div className="flex gap-6 mt-4 md:mt-0">
                        <a
                            href="#"
                            className="hover:text-primary transition-colors"
                            onClick={(e) => {
                                e.preventDefault();
                                // Add privacy policy modal or link logic here
                            }}
                        >
                            Privacy Policy
                        </a>
                        <a
                            href="#"
                            className="hover:text-primary transition-colors"
                            onClick={(e) => {
                                e.preventDefault();
                                // Add terms logic here
                            }}
                        >
                            Terms of Service
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};
