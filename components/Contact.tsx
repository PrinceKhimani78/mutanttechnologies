'use client';
import { useRef, useState, useEffect } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Button } from './ui/button';
import { Mail, Phone, MapPin } from 'lucide-react';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

interface ContactProps {
    title?: string;
    description?: string;
    phone?: string;
    email?: string;
    address?: string;
    scroller?: string;
}

export const Contact = ({
    title = "Let's Start a Conversation",
    description = "Ready to transform your digital presence? Reach out to us for a free consultation.",
    phone = "(+91) 7016228551",
    email = "contact@mutanttechnologies.com",
    address = "B-113 RK iconic Sheetal Park, Rajkot, Gujarat",
    scroller
}: ContactProps) => {
    const containerRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);

        try {
            const { sendEmail } = await import('@/app/actions/email');
            const result = await sendEmail({
                name: formData.get('name') as string,
                email: formData.get('email') as string,
                subject: formData.get('subject') as string,
                message: formData.get('message') as string,
                type: 'contact'
            });

            if (result.success) {
                setStatus('success');
            } else {
                console.error('Email send error:', result.error);
                setStatus('error');
            }
        } catch (e) {
            console.error('Contact form error:', e);
            setStatus('error');
        } finally {
            setLoading(false);
        }
    };

    const [contactInfo, setContactInfo] = useState({
        phone,
        email,
        address
    });

    useEffect(() => {
        setContactInfo({ phone, email, address });
    }, [phone, email, address]);

    useEffect(() => {
        const fetchSettings = async () => {
            const { getSiteSettings } = await import('@/lib/cms');
            const { data } = await getSiteSettings();
            if (data) {
                setContactInfo({
                    phone: data.phone_number || contactInfo.phone,
                    email: data.contact_email || contactInfo.email,
                    address: data.address || contactInfo.address
                });
            }
        };
        fetchSettings();
    }, []);

    useGSAP(() => {
        try {
            // Disable GSAP animations in Visual Editor to prevent errors
            if (scroller) {
                console.log('Contact: Skipping GSAP animations in Visual Editor context');
                return;
            }

            console.log('Contact: useGSAP', { hasContainer: !!containerRef.current, scroller });
            if (!containerRef.current) return;

            gsap.from(".contact-item", {
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top 70%"
                },
                y: 30,
                opacity: 0,
                stagger: 0.1,
                duration: 0.8,
                ease: "power2.out"
            });
        } catch (error) {
            console.error('Contact: GSAP Error', error);
        }
    }, { scope: containerRef, dependencies: [scroller] });

    return (
        <section id="contact" ref={containerRef} className="py-12 md:py-24 bg-[#111827] text-white relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">

                    <div className="space-y-8">
                        <h2 className="contact-item text-4xl md:text-5xl font-bold">
                            {title.split(' ').map((word, i) => i === title.split(' ').length - 1 ? <span key={i} className="text-primary">{word}</span> : word + ' ')}
                        </h2>
                        <p className="contact-item text-gray-400 text-lg">
                            {description}
                        </p>

                        <div className="space-y-6 pt-4">
                            <div className="contact-item flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-primary">
                                    <Phone className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold">Call Center</h4>
                                    <p className="text-gray-400">{contactInfo.phone}</p>
                                </div>
                            </div>

                            <div className="contact-item flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-primary">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold">Email Address</h4>
                                    <p className="text-gray-400">{contactInfo.email}</p>
                                </div>
                            </div>

                            <div className="contact-item flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-primary">
                                    <MapPin className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold">Office Location</h4>
                                    <p className="text-gray-400">{contactInfo.address}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="contact-item bg-white/5 backdrop-blur-sm p-8 rounded-2xl border border-white/10">
                        {status === 'success' ? (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Mail className="w-8 h-8 text-green-500" />
                                </div>
                                <h3 className="text-2xl font-bold mb-2">Message Sent!</h3>
                                <p className="text-gray-400">We'll get back to you shortly.</p>
                                <Button variant="link" className="text-primary mt-4" onClick={() => setStatus('idle')}>Send Another</Button>
                            </div>
                        ) : (
                            <>
                                <h3 className="text-2xl font-bold mb-6">Send us a message</h3>
                                <form className="space-y-6" onSubmit={handleSubmit} suppressHydrationWarning>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6" suppressHydrationWarning>
                                        <div suppressHydrationWarning>
                                            <label className="block text-sm font-medium text-gray-400 mb-2">Name</label>
                                            <input suppressHydrationWarning required name="name" type="text" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors text-white" placeholder="John Doe" />
                                        </div>
                                        <div suppressHydrationWarning>
                                            <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
                                            <input suppressHydrationWarning required name="email" type="email" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors text-white" placeholder="john@example.com" />
                                        </div>
                                    </div>

                                    <div suppressHydrationWarning>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Subject</label>
                                        <input suppressHydrationWarning required name="subject" type="text" maxLength={100} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors text-white" placeholder="Project Inquiry" />
                                    </div>

                                    <div suppressHydrationWarning>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Message</label>
                                        <textarea suppressHydrationWarning required name="message" rows={4} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors text-white" placeholder="Tell us about your project..." />
                                    </div>

                                    <Button type="submit" size="lg" className="w-full" disabled={loading}>
                                        {loading ? "Sending..." : "Send Message"}
                                    </Button>
                                </form>
                            </>
                        )}
                    </div>

                </div>
            </div>
        </section>
    );
};
